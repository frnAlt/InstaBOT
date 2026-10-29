"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KayeBotEvent = void 0;
exports.example = example;
const events_1 = __importDefault(require("events"));
class KayeBotEvent {
    adapters;
    args;
    body;
    messageID;
    reaction;
    senderID;
    threadID;
    type;
    #threadIDCustom;
    #messageIDCustom;
    constructor(data, handlers) {
        this.adapters = handlers ?? new events_1.default();
        this.body = data.body ?? "";
        this.messageID = data.messageID ?? "";
        this.reaction = data.reaction ?? "";
        this.type = data.type ?? "message";
        this.threadID = data.threadID ?? "";
        this.senderID = data.senderID ??= "";
        this.args = data.args ??= this.body.split(" ").filter(Boolean);
        this.setThread();
        this.setReplyTo();
    }
    setThread(thread = null) {
        this.#threadIDCustom = thread === null ? this.threadID : thread;
    }
    getThread() {
        return this.#threadIDCustom;
    }
    setReplyTo(replyTo = null) {
        this.#messageIDCustom = replyTo === null ? this.messageID : replyTo;
    }
    getReplyTo() {
        return this.#messageIDCustom;
    }
    dispatch(formOrBody, form2) {
        const form = typeof formOrBody === "string"
            ? {
                body: formOrBody,
                ...(typeof form2 === "object" && form2 ? form2 : {}),
            }
            : { ...formOrBody };
        const result = new KayeBotEvent.Dispatched();
        let finalBody = form.body;
        form.bodyMode ??= "random";
        if (Array.isArray(finalBody)) {
            if (form.bodyMode === "random") {
                finalBody = KayeBotEvent.randArr(finalBody);
            }
            else if (form.bodyMode === "line-break") {
                finalBody = finalBody.join("\n");
            }
            else {
                finalBody = "[Invalid Body Mode]";
            }
        }
        finalBody ??= "";
        const finalForm = {
            ...form,
            finalBody,
            thread: form.thread ?? this.#threadIDCustom,
            replyTo: form.replyTo ?? this.#messageIDCustom,
        };
        if (this.hasAnyAdapter("dsptchFull") && !form.forceAsText) {
            this.adapters.emit("dsptchFull", finalForm, result);
        }
        else if (this.hasAnyAdapter("dsptchTxt")) {
            this.adapters.emit("dsptchTxt", finalForm, result);
        }
        else {
            throw new KayeBotEvent.KayeBotErr(`No adapters set for dsptchFull and dsptchTxt.`);
        }
        return result;
    }
    reply(form, replyTo = this.#messageIDCustom, thread = this.#threadIDCustom) {
        const normal = KayeBotEvent.normalizeForm(form);
        const result = this.dispatch({
            ...normal,
            replyTo: replyTo ?? normal.replyTo,
            thread: thread ?? normal.thread,
        });
        return result;
    }
    send(form, thread = this.#threadIDCustom) {
        const normal = KayeBotEvent.normalizeForm(form);
        const result = this.dispatch({
            ...normal,
            replyTo: null,
            thread: thread ?? normal.thread,
        });
        return result;
    }
    getOneAdapter(key) {
        const list = this.adapters.listeners(key);
        return KayeBotEvent.randArr(list);
    }
    getAdapterCount(key) {
        return this.adapters.listenerCount(key);
    }
    hasAnyAdapter(key) {
        return this.getAdapterCount(key) >= 1;
    }
    unsend(messageID) {
        if (this.hasAnyAdapter("unsendMID")) {
            const def = new KayeBotEvent.Deferred(null);
            this.adapters.emit("unsendMID", messageID, def);
            return def;
        }
        else {
            throw new KayeBotEvent.KayeBotErr("No adapters set for unsendMID.");
        }
    }
}
exports.KayeBotEvent = KayeBotEvent;
(function (KayeBotEvent) {
    function randArr(arr) {
        return arr.at(Math.floor(Math.random() * arr.length));
    }
    KayeBotEvent.randArr = randArr;
    class Dispatched extends events_1.default {
        promiseInternal;
        constructor() {
            super();
            let res, rej;
            const promise = new Promise((resolve, reject) => {
                res = resolve;
                rej = reject;
            });
            this.promiseInternal = promise;
            this.resolveInternal = res;
            this.rejectInternal = rej;
            this.#ready = false;
            this.error = null;
        }
        error;
        #ready;
        isReady() {
            return this.#ready;
        }
        then(onfulfilled, onrejected) {
            return this.promiseInternal.then(onfulfilled, onrejected);
        }
        resolveInternal(_value) { }
        rejectInternal(_reason) { }
        resolveResponse(info, err) {
            if (this.isReady()) {
                throw new KayeBotErr("Already resolved.");
            }
            if (err) {
                this.error = err;
                this.rejectInternal(err);
                return;
            }
            this.#ready = true;
            this.messageID = info.messageID;
            this.timestamp = info.timestamp;
            this.threadID = info.threadID;
            this.resolveInternal(this);
            this.emit("ready", this);
        }
        messageID;
        timestamp;
        threadID;
        async listenReplies({ timeout = Infinity } = {}) {
            await this;
            this.emit("listen_replies");
            if (isFinite(timeout)) {
                return setTimeout(() => {
                    this.stopListenReplies();
                }, timeout);
            }
            return null;
        }
        stopListenReplies() {
            this.then(() => {
                this.emit("stop_listen_replies");
            });
        }
        async listenReactions({ timeout = Infinity } = {}) {
            await this;
            this.emit("listen_reactions");
            if (isFinite(timeout)) {
                return setTimeout(() => {
                    this.stopListenReactions();
                }, timeout);
            }
            return null;
        }
        stopListenReactions() {
            this.then(() => {
                this.emit("stop_listen_reactions");
            });
        }
    }
    KayeBotEvent.Dispatched = Dispatched;
    class KayeBotErr extends Error {
        constructor(message, options) {
            super(message, options);
            this.name = KayeBotErr.name;
        }
        toString() {
            return this.stack ?? this.message;
        }
    }
    KayeBotEvent.KayeBotErr = KayeBotErr;
    function normalizeForm(form) {
        if (typeof form === "string") {
            return { body: form };
        }
        return { ...form };
    }
    KayeBotEvent.normalizeForm = normalizeForm;
    class Deferred {
        internalPromise;
        constructor(initialValue) {
            let res;
            let rej;
            this.internalPromise = new Promise((res_cb, rej_cb) => {
                res = res_cb;
                rej = rej_cb;
            });
            this.resolve = (value) => {
                if (this.status !== "pending")
                    return;
                this.value = value;
                this.status = "fulfilled";
                res(value);
            };
            this.reject = (reason) => {
                if (this.status !== "pending")
                    return;
                this.rejectReason = reason;
                this.status = "rejected";
                rej(reason);
            };
            this.value = initialValue ?? null;
            this.status = "pending";
        }
        status;
        value;
        rejectReason;
        resolve;
        reject;
        get then() {
            return this.internalPromise.then.bind(this.internalPromise);
        }
    }
    KayeBotEvent.Deferred = Deferred;
})(KayeBotEvent || (exports.KayeBotEvent = KayeBotEvent = {}));
function example(ev) {
    const res = ev.send("The earth is flat.");
    res.listenReplies({ timeout: 5 * 60 * 1000 });
    res.on("reply", (ev2) => {
        ev2.reply(`"${ev2.body}" ☝️🤓`);
    });
}
