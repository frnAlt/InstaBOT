"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BackgroundTaskFB = void 0;
const cassidy_styler_1 = require("cassidy-styler");
const OutputClass_1 = __importDefault(require("./OutputClass"));
class BackgroundTaskFB {
    skips;
    currentSkips;
    state;
    taskID;
    onStart;
    constructor(config) {
        this.taskID = String(config.taskID ?? "Unnamed");
        this.bgTask = config.onTask;
        this.bgTaskCondition = config.condition ?? (async () => true);
        this.onStart = config.onStart;
        this.changeInterval(config.intervalMS);
        this.currentSkips = 0;
        Object.defineProperty(this, "state", { value: {} });
    }
    changeInterval(interval) {
        const floored = Math.floor(interval / BackgroundTaskFB.POLL_INTERVAL);
        this.skips = floored;
    }
    bgTask;
    bgTaskCondition;
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
exports.BackgroundTaskFB = BackgroundTaskFB;
(function (BackgroundTaskFB) {
    function loadTasksFromCommands() {
        for (const cmd of Cassidy.multiCommands
            .toUnique((i) => i.meta?.name)
            .values()) {
            const tasks = cassidy_styler_1.Datum.toUniqueArray((Array.isArray(cmd.bgTasks) ? [...cmd.bgTasks] : []).filter((t) => t instanceof BackgroundTaskFB), (i) => i.taskID);
            Cassidy.bgTasks.push(...tasks);
            if (tasks.length > 0) {
                logger(`${tasks.length} Background tasks loaded!`, `${cmd.fileName}`);
            }
        }
    }
    BackgroundTaskFB.loadTasksFromCommands = loadTasksFromCommands;
    BackgroundTaskFB.POLL_INTERVAL = 5000;
    async function startPoll(api) {
        const handler = async () => {
            const output = OutputClass_1.default.createWithoutEvent(api);
            const ctx = output.getNoEventContext();
            const done = [];
            for (const task of Cassidy.bgTasks) {
                if (done.includes(task))
                    continue;
                try {
                    task.updateSkip();
                    output.clearStyle();
                    const will = await task.bgTaskCondition(ctx, task);
                    if (!will || task.willSkip()) {
                        continue;
                    }
                    await task.bgTask(ctx, task);
                }
                catch (err) {
                    console.error(err);
                }
                finally {
                    done.push(task);
                }
            }
        };
        const done = [];
        for (const task of Cassidy.bgTasks) {
            if (done.includes(task))
                continue;
            try {
                task.onStart(task);
            }
            catch (err) {
                console.error(err);
            }
            finally {
                done.push(task);
            }
        }
        const id = setInterval(handler, BackgroundTaskFB.POLL_INTERVAL);
        logger(`${Cassidy.bgTasks.length} Background tasks started!`, "Tasks");
        return {
            handler,
            id,
            stop() {
                clearInterval(id);
            },
        };
    }
    BackgroundTaskFB.startPoll = startPoll;
})(BackgroundTaskFB || (exports.BackgroundTaskFB = BackgroundTaskFB = {}));
