import { Datum } from "cassidy-styler";
import OutputClass, { NoEventCMDContext } from "./OutputClass";

export class BackgroundTaskFB<State = any> {
  skips: number;
  currentSkips: number;

  state: State;
  taskID: string;

  onStart: BackgroundTaskFB.CreateConfig<State>["onStart"];

  constructor(config: BackgroundTaskFB.CreateConfig<State>);

  constructor(config: BackgroundTaskFB.CreateConfig<State>) {
    this.taskID = String(config.taskID ?? "Unnamed");
    this.bgTask = config.onTask;
    this.bgTaskCondition = config.condition ?? (async () => true);
    this.onStart = config.onStart;
    this.changeInterval(config.intervalMS);
    this.currentSkips = 0;
    Object.defineProperty(this, "state", { value: {} });
  }

  changeInterval(interval: number) {
    const floored = Math.floor(interval / BackgroundTaskFB.POLL_INTERVAL);
    this.skips = floored;
  }

  bgTask: (
    ctx: NoEventCMDContext,
    task: BackgroundTaskFB<State>
  ) => Promise<any>;
  bgTaskCondition: (
    ctx: NoEventCMDContext,
    task: BackgroundTaskFB<State>
  ) => Promise<boolean>;

  static get tasks() {
    return Cassidy.bgTasks;
  }

  updateSkip() {
    this.currentSkips++;
    if (this.currentSkips > this.skips) {
      this.currentSkips = 0;
    }
  }

  willSkip() {
    return this.currentSkips > 0;
  }
}

export namespace BackgroundTaskFB {
  export interface CreateConfig<State> {
    onTask: BackgroundTaskFB<State>["bgTask"];
    condition?: BackgroundTaskFB<State>["bgTaskCondition"];
    intervalMS: number;
    onStart?: (task: BackgroundTaskFB<State>) => void;
    taskID: string;
  }
  export function loadTasksFromCommands() {
    for (const cmd of Cassidy.multiCommands
      .toUnique((i) => i.meta?.name)
      .values()) {
      const tasks = Datum.toUniqueArray(
        (Array.isArray(cmd.bgTasks) ? [...cmd.bgTasks] : []).filter(
          (t) => t instanceof BackgroundTaskFB
        ),
        (i) => i.taskID
      );
      Cassidy.bgTasks.push(...tasks);
      if (tasks.length > 0) {
        logger(`${tasks.length} Background tasks loaded!`, `${cmd.fileName}`);
      }
    }
  }

  export const POLL_INTERVAL = 5000;

  export async function startPoll(api: CommandContext["api"]) {
    const handler = async () => {
      const output = OutputClass.createWithoutEvent(api);
      const ctx = output.getNoEventContext();
      const done: BackgroundTaskFB[] = [];
      for (const task of Cassidy.bgTasks) {
        if (done.includes(task)) continue;
        try {
          task.updateSkip();
          output.clearStyle();
          const will = await task.bgTaskCondition(ctx, task);
          if (!will || task.willSkip()) {
            continue;
          }
          await task.bgTask(ctx, task);
        } catch (err) {
          console.error(err);
        } finally {
          done.push(task);
        }
      }
    };
    const done: BackgroundTaskFB[] = [];

    for (const task of Cassidy.bgTasks) {
      if (done.includes(task)) continue;
      try {
        task.onStart(task);
      } catch (err) {
        console.error(err);
      } finally {
        done.push(task);
      }
    }
    const id = setInterval(handler, POLL_INTERVAL);
    logger(`${Cassidy.bgTasks.length} Background tasks started!`, "Tasks");
    return {
      handler,
      id,
      stop() {
        clearInterval(id);
      },
    };
  }
}
