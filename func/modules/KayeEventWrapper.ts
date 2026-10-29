import EventEmitter from "events";
import Stream from "stream";

export class KayeBotEvent implements KayeBotEvent.RawEvent {
  adapters: EventEmitter<KayeBotEvent.ImplementationEvents>;

  args: KayeBotEvent.RawEvent["args"];
  body: KayeBotEvent.RawEvent["body"];
  messageID: KayeBotEvent.RawEvent["messageID"];
  reaction: KayeBotEvent.RawEvent["reaction"];
  senderID: KayeBotEvent.RawEvent["senderID"];
  threadID: KayeBotEvent.RawEvent["threadID"];
  type: KayeBotEvent.RawEvent["type"];

  #threadIDCustom: KayeBotEvent["threadID"];
  #messageIDCustom: KayeBotEvent["messageID"];

  constructor(
    data: Partial<KayeBotEvent.RawEvent>,
    handlers?: KayeBotEvent["adapters"]
  ) {
    this.adapters = handlers ?? new EventEmitter();

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

  setThread(thread: null | KayeBotEvent["threadID"] = null) {
    this.#threadIDCustom = thread === null ? this.threadID : thread;
  }

  getThread() {
    return this.#threadIDCustom;
  }

  setReplyTo(replyTo: null | KayeBotEvent["messageID"] = null) {
    this.#messageIDCustom = replyTo === null ? this.messageID : replyTo;
  }

  getReplyTo() {
    return this.#messageIDCustom;
  }

  dispatch(form: KayeBotEvent.DispatchForm): KayeBotEvent.Dispatched;
  dispatch(
    body: string,
    form: KayeBotEvent.DispatchFormNoBody
  ): KayeBotEvent.Dispatched;

  dispatch(
    formOrBody: KayeBotEvent.DispatchForm,
    form2?: KayeBotEvent.DispatchFormNoBody
  ): KayeBotEvent.Dispatched {
    const form: KayeBotEvent.DispatchFormStrict =
      typeof formOrBody === "string"
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
      } else if (form.bodyMode === "line-break") {
        finalBody = finalBody.join("\n");
      } else {
        finalBody = "[Invalid Body Mode]";
      }
    }
    finalBody ??= "";
    const finalForm: KayeBotEvent.SuppliedDispatchForm = {
      ...form,
      finalBody,
      thread: form.thread ?? this.#threadIDCustom,
      replyTo: form.replyTo ?? this.#messageIDCustom,
    };
    if (this.hasAnyAdapter("dsptchFull") && !form.forceAsText) {
      this.adapters.emit("dsptchFull", finalForm, result);
    } else if (this.hasAnyAdapter("dsptchTxt")) {
      this.adapters.emit("dsptchTxt", finalForm, result);
    } else {
      throw new KayeBotEvent.KayeBotErr(
        `No adapters set for dsptchFull and dsptchTxt.`
      );
    }
    return result;
  }

  reply(
    form: KayeBotEvent.DispatchForm,
    replyTo = this.#messageIDCustom,
    thread = this.#threadIDCustom
  ): KayeBotEvent.Dispatched {
    const normal = KayeBotEvent.normalizeForm(form);
    const result = this.dispatch({
      ...normal,
      replyTo: replyTo ?? normal.replyTo,
      thread: thread ?? normal.thread,
    });
    return result;
  }

  send(
    form: Omit<KayeBotEvent.DispatchForm, "replyTo">,
    thread = this.#threadIDCustom
  ): KayeBotEvent.Dispatched {
    const normal = KayeBotEvent.normalizeForm(form);
    const result = this.dispatch({
      ...normal,
      replyTo: null,
      thread: thread ?? normal.thread,
    });
    return result;
  }

  getOneAdapter<K extends keyof KayeBotEvent.ImplementationEvents>(key: K) {
    const list = this.adapters.listeners(key);
    return KayeBotEvent.randArr(list);
  }

  getAdapterCount<K extends keyof KayeBotEvent.ImplementationEvents>(
    key: K
  ): number {
    return this.adapters.listenerCount(key);
  }

  hasAnyAdapter<K extends keyof KayeBotEvent.ImplementationEvents>(
    key: K
  ): boolean {
    return this.getAdapterCount(key) >= 1;
  }

  unsend(messageID: string) {
    if (this.hasAnyAdapter("unsendMID")) {
      const def = new KayeBotEvent.Deferred<boolean>(null);
      this.adapters.emit("unsendMID", messageID, def);
      return def;
    } else {
      throw new KayeBotEvent.KayeBotErr("No adapters set for unsendMID.");
    }
  }
}

export namespace KayeBotEvent {
  export function randArr<T>(arr: T[]): T | undefined {
    return arr.at(Math.floor(Math.random() * arr.length));
  }
  export interface BotEvents {
    reply: [KayeBotEvent, string];
    reaction: [KayeBotEvent, string];
    listen_replies: [];
    listen_reactions: [];
    stop_listen_replies: [];
    stop_listen_reactions: [];
    ready: [Dispatched];
  }
  export interface ImplementationEvents {
    dsptchTxt: [SuppliedDispatchForm, Dispatched];
    dsptchFull: [SuppliedDispatchForm, Dispatched];
    unsendMID: [string, Deferred<boolean>];
  }

  export interface RawEvent {
    body: string;
    senderID: string;
    threadID: string;
    messageID: string;
    args: string[];
    reaction: string;
    type: "message" | "message_reply" | "message_reaction";
  }

  export type DispatchForm = string | DispatchFormStrict;

  export interface DispatchFormStrict {
    body?: string | string[];
    bodyMode?: "random" | "line-break";
    attachments?: Stream | Stream[];
    forceAsText?: boolean;
    destination?: string;
    thread?: string;
    replyTo?: string;
  }

  export interface SuppliedDispatchForm extends DispatchFormStrict {
    finalBody: string;
    thread: string;
    replyTo: string;
  }

  export type DispatchFormNoBody = Omit<DispatchFormStrict, "body">;

  export class Dispatched
    extends EventEmitter<BotEvents>
    implements PromiseLike<Dispatched>
  {
    private promiseInternal: Promise<Dispatched>;

    constructor() {
      super();
      let res: Dispatched["resolveInternal"], rej: Dispatched["rejectInternal"];
      const promise = new Promise<Dispatched>((resolve, reject) => {
        res = resolve;
        rej = reject;
      });
      this.promiseInternal = promise;
      this.resolveInternal = res;
      this.rejectInternal = rej;
      this.#ready = false;
      this.error = null;
    }

    error: null | any;

    #ready: boolean;

    isReady() {
      return this.#ready;
    }

    then<TResult1 = Dispatched, TResult2 = never>(
      onfulfilled?:
        | ((value: Dispatched) => TResult1 | PromiseLike<TResult1>)
        | undefined
        | null,
      onrejected?:
        | ((reason: any) => TResult2 | PromiseLike<TResult2>)
        | undefined
        | null
    ): PromiseLike<TResult1 | TResult2> {
      return this.promiseInternal.then(onfulfilled, onrejected);
    }

    private resolveInternal(_value: Dispatched | PromiseLike<Dispatched>) {}
    private rejectInternal(_reason?: any) {}

    resolveResponse(info: DispatchedInfo | null, err?: any) {
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

    messageID: DispatchedInfo["messageID"];
    timestamp: DispatchedInfo["timestamp"];
    threadID: DispatchedInfo["threadID"];

    async listenReplies({ timeout = Infinity }: { timeout?: number } = {}) {
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

    async listenReactions({ timeout = Infinity }: { timeout?: number } = {}) {
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

  export interface DispatchedInfo {
    messageID: string;
    timestamp: number;
    threadID: string;
  }

  export class KayeBotErr extends Error {
    constructor(message?: string, options?: ErrorOptions) {
      super(message, options);
      this.name = KayeBotErr.name;
    }

    toString() {
      return this.stack ?? this.message;
    }
  }

  export function normalizeForm(form: DispatchForm): DispatchFormStrict {
    if (typeof form === "string") {
      return { body: form };
    }
    return { ...form };
  }

  export class Deferred<Res, Rej = unknown> {
    internalPromise: Promise<Res>;
    constructor(initialValue?: Res) {
      let res: Deferred<Res>["resolve"];
      let rej: Deferred<Res>["reject"];
      this.internalPromise = new Promise((res_cb, rej_cb) => {
        res = res_cb;
        rej = rej_cb;
      });
      this.resolve = (value) => {
        if (this.status !== "pending") return;
        this.value = value;
        this.status = "fulfilled";
        res(value);
      };
      this.reject = (reason) => {
        if (this.status !== "pending") return;
        this.rejectReason = reason;
        this.status = "rejected";
        rej(reason);
      };
      this.value = initialValue ?? null;
      this.status = "pending";
    }

    status: "pending" | "fulfilled" | "rejected";

    value: Res | null;

    rejectReason?: Rej | null;

    resolve: (value: Res) => void;
    reject: (reason?: Rej) => void;

    get then() {
      return this.internalPromise.then.bind(this.internalPromise);
    }
  }
}


export function example(ev: KayeBotEvent) {
  const res = ev.send("The earth is flat.");
  res.listenReplies({ timeout: 5 * 60 * 1000 });

  res.on("reply", (ev2) => {
    ev2.reply(`"${ev2.body}" ☝️🤓`);
  });
}
