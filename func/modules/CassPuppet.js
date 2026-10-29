"use strict";
/**
 * CassPuppet is a CassidyRedux Helper Library created by lianecagara and itzcyrilirene (JenicaDev)
 * @lianecagara
 * @itzcyrilirene
 *
 * @license MIT
 *
 * Thanks to Prettier Formatter! (Shift + Alt + F)
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CassPuppetNS = exports.CassPuppet = void 0;
const events_1 = __importDefault(require("events"));
const loadCommand_js_1 = require("../../handlers/loaders/loadCommand.js");
class CassPuppet extends events_1.default {
    config;
    constructor(config) {
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
        if (this.config.outputChannel !== "pipe" &&
            this.config.outputChannel !== "original") {
            throw new CassPuppetNS.CassPuppetError({
                message: "Output Channel must be either pipe or original.",
            });
        }
        this.config.sandboxMoney ??= false;
    }
    executeCommand(config = {}) {
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
    static dummy(key, emitter) {
        return new Proxy({}, {
            get(_, prop) {
                if (typeof prop === "string") {
                    const hook = function (...args) {
                        emitter.emit(`call:${key}`, ...args);
                    };
                    emitter.emit(`access:${key}`, hook);
                    return hook;
                }
            },
        });
    }
    static dummyAsync(key, emitter) {
        return new Proxy({}, {
            get(_, prop) {
                if (typeof prop === "string") {
                    const hook = function (...args) {
                        const promise = new Promise((resolve, reject) => {
                            emitter.emit(`call-async:${key}`, resolve, reject, ...args);
                        });
                        return promise;
                    };
                    emitter.emit(`access:${key}`, hook);
                    return hook;
                }
            },
        });
    }
}
exports.CassPuppet = CassPuppet;
var CassPuppetNS;
(function (CassPuppetNS) {
    CassPuppetNS.Core = CassPuppet;
    class Execution extends events_1.default {
        config;
        puppetConfig;
        constructor({ commandName = "", args = [], extraInput = {}, extraContext = {}, } = {}, puppetConfig) {
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
        async execute() {
            try {
                const { commands, multiCommands } = global.Cassidy;
                const target = commands[this.config.commandName] ||
                    multiCommands.getOne(this.config.commandName);
                if (typeof target.entry === "function") {
                    // @ts-ignore
                    if (typeof target.entry.hooklet === "function") {
                        // @ts-ignore
                        const entry = target.entry.hooklet([...loadCommand_js_1.SymLock.values()].find((i) => {
                            try {
                                // @ts-ignore
                                return typeof target.entry.hooklet(i) === "function";
                            }
                            catch (error) { }
                        }));
                        const execution = this;
                        const { context } = this.puppetConfig;
                        const dangerousContext = {
                            ...context,
                            output: this.puppetConfig.outputChannel === "pipe"
                                ? CassPuppet.dummyAsync("output", execution)
                                : context.output,
                            input: {
                                ...context.input,
                                ...CassPuppet.dummyEvent(`${this.config.commandName} ${(this.config.args ?? []).join(" ")}`),
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
                            const r = await entry(dangerousContext);
                            execution.emit("entry:finish", r);
                        }
                        catch (error) {
                            execution.emit("entry:error", error);
                        }
                    }
                }
            }
            catch (error) {
                this.emit("error", error);
            }
        }
    }
    CassPuppetNS.Execution = Execution;
    class CassPuppetError extends Error {
        constructor({ ...properties }) {
            super(properties.message);
            Object.assign(this, properties);
            this.name = properties.name ?? CassPuppetError.name;
        }
    }
    CassPuppetNS.CassPuppetError = CassPuppetError;
})(CassPuppetNS || (exports.CassPuppetNS = CassPuppetNS = {}));
