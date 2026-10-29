/**
 * CassPuppet is a CassidyRedux Helper Library created by lianecagara and itzcyrilirene (JenicaDev)
 * @lianecagara
 * @itzcyrilirene
 *
 * @license MIT
 *
 * Thanks to Prettier Formatter! (Shift + Alt + F)
 */

import EventEmitter from "events";

import { SymLock } from "../../handlers/loaders/loadCommand.js";
import InputClass from "./InputClass";

export namespace CassPuppetNS {
  export type OutputChannels = "pipe" | "original";
  export interface BaseConfig {
    outputChannel: OutputChannels | undefined;
    sandboxMoney: boolean | undefined;
    context: CommandContext;
  }

  export interface PipeConfig extends BaseConfig {
    outputChannel: "pipe";
    fullyBuffer: boolean | undefined;
  }

  export interface OriginalOutput extends BaseConfig {
    outputChannel: "original";
  }

  export type Config = PipeConfig | OriginalOutput;
}
export class CassPuppet extends EventEmitter {
  public config: CassPuppetNS.Config;

  constructor(config: CassPuppetNS.Config) {
    super();
    this.config = config;
    if (!config.context) {
      throw new CassPuppetNS.CassPuppetError({
        message: "Missing command context.",
      });
    }
    this.config.outputChannel ??= "pipe";
    if (this.config.outputChannel === "pipe") {
      this.config.fullyBuffer ??= false;
    }
    if (
      this.config.outputChannel !== "pipe" &&
      this.config.outputChannel !== "original"
    ) {
      throw new CassPuppetNS.CassPuppetError({
        message: "Output Channel must be either pipe or original.",
      });
    }
    this.config.sandboxMoney ??= false;
  }

  executeCommand(config: CassPuppetNS.ExecConfig = {}): CassPuppetNS.Execution {
    return new CassPuppetNS.Execution(config, this.config);
  }

  static dummyEvent(body = "") {
    return {
      body,
      messageReply: null,
      type: "message",
      senderID: "casspuppet",
      threadID: "",
      timestamp: Date.now(),
      attachments: [],
      messageID: `wss-mid_${Date.now()}_iivt1`,
      isGroup: true,
      propertyArray: [],
      property: {},
      originalBody: body,
      participantIDs: "Hidden",
      arguments: body.split(" ").slice(1),
      argPipe: body.split("|"),
      argPipeArgs: [],
      argArrowArgs: [],
      argArrow: body.split("=>"),
      wordCount: body.split(" ").length,
      charCount: body.length,
      words: body.split(" "),
      allCharCount: 24,
      links: null,
      text: body,
      mentionNames: null,
      numbers: null,
      sid: "casspuppet",
      tid: "",
      replier: null,
      hasMentions: false,
      firstMention: null,
      isThread: true,
    };
  }

  static dummy(key: string, emitter: EventEmitter) {
    return new Proxy(
      {},
      {
        get(_, prop) {
          if (typeof prop === "string") {
            const hook = function (...args: string[]) {
              emitter.emit(`call:${key}`, ...args);
            };
            emitter.emit(`access:${key}`, hook);
            return hook;
          }
        },
      }
    );
  }
  static dummyAsync(key: string, emitter: EventEmitter) {
    return new Proxy(
      {},
      {
        get(_, prop) {
          if (typeof prop === "string") {
            const hook = function (...args: string[]) {
              const promise = new Promise((resolve, reject) => {
                emitter.emit(`call-async:${key}`, resolve, reject, ...args);
              });
              return promise;
            };
            emitter.emit(`access:${key}`, hook);
            return hook;
          }
        },
      }
    );
  }
}

export namespace CassPuppetNS {
  export interface ExecConfig {
    commandName?: string;
    args?: string[];
    extraInput?: Partial<InputClass>;
    extraContext?: Partial<CommandContext>;
  }
  export const Core = CassPuppet;

  export class Execution extends EventEmitter {
    public config: ExecConfig;
    public puppetConfig: CassPuppetNS.Config;

    constructor(
      {
        commandName = "",
        args = [],
        extraInput = {},
        extraContext = {},
      }: ExecConfig = {},
      puppetConfig: CassPuppetNS.Config
    ) {
      super();
      this.config = {
        commandName,
        args,
        extraInput,
        extraContext,
      };
      this.puppetConfig = puppetConfig;
      this.execute();
    }

    private async execute() {
      try {
        const { commands, multiCommands } = global.Cassidy;
        const target =
          commands[this.config.commandName] ||
          multiCommands.getOne(this.config.commandName);
        if (typeof target.entry === "function") {
          // @ts-ignore
          if (typeof target.entry.hooklet === "function") {
            // @ts-ignore
            const entry: CommandEntry = target.entry.hooklet(
              [...SymLock.values()].find((i) => {
                try {
                  // @ts-ignore
                  return typeof target.entry.hooklet(i) === "function";
                } catch (error) {}
              })
            );
            const execution = this;

            const { context } = this.puppetConfig;

            const dangerousContext = {
              ...context,
              output:
                this.puppetConfig.outputChannel === "pipe"
                  ? CassPuppet.dummyAsync("output", execution)
                  : context.output,
              input: {
                ...context.input,
                ...CassPuppet.dummyEvent(
                  `${this.config.commandName} ${(this.config.args ?? []).join(
                    " "
                  )}`
                ),
                args: this.config.args,
                money: !this.puppetConfig.sandboxMoney
                  ? context.money
                  : CassPuppet.dummyAsync("money", execution),
                ...this.config.extraInput,
              },

              ...this.config.extraContext,
            };
            execution.emit("entry:context", dangerousContext);
            try {
              const r = await entry(dangerousContext as CommandContext);
              execution.emit("entry:finish", r);
            } catch (error) {
              execution.emit("entry:error", error);
            }
          }
        }
      } catch (error) {
        this.emit("error", error);
      }
    }
  }

  export class CassPuppetError extends Error {
    constructor({
      ...properties
    }: {
      name?: string;
      message: string;
      stack?: string;
      cause?: unknown;
      [key: string]: any;
    }) {
      super(properties.message);
      Object.assign(this, properties);
      this.name = properties.name ?? CassPuppetError.name;
    }
  }
}
