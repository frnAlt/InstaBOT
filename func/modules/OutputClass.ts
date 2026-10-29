import OutputProps, {
  OutputForm,
  OutputResultInf,
  PromiseStandardReplyArg,
  StrictOutputForm,
} from "output-cassidy";
import { Readable } from "stream";
import { BriefcaseAPI } from "@cass-modules/BriefcaseAPI";
import axios, { AxiosRequestConfig } from "axios";
import { translate, UNIRedux, UNISpectra } from "./unisym";
import { PagePayload } from "./PageButton";
import { TempFile } from "@root/handlers/page/sendMessage";
import { base64ToStream, streamToBase64 } from "@root/webSystem";
import { CassEXP } from "./cassEXP";
import { inspect } from "util";
import { CassidyResponseStylerControl } from "@cassidy/styler";
import { FontSystem } from "cassidy-styler";
import InputClass from "./InputClass";

export interface NoEventCMDContext {
  api: CommandContext["api"];
  commands: CommandContext["commands"];
  multiCommands: CommandContext["multiCommands"];
  Cassidy: CommandContext["Cassidy"];
  invTime: CommandContext["invTime"];
  usersDB: CommandContext["usersDB"];
  money: CommandContext["usersDB"];
  threadsDB: CommandContext["threadsDB"];
  globalDB: CommandContext["globalDB"];
  FontSystem: CommandContext["FontSystem"];
  fonts: CommandContext["fonts"];
  userStat: CommandContext["userStat"];
  icon: CommandContext["icon"];
  allPlugins: CommandContext["allPlugins"];
  allObj: NoEventCMDContext;
  ctx: NoEventCMDContext;
  output: CommandContext["output"];
  input: CommandContext["input"];
  styler: CommandContext["styler"];
  event: CommandContext["event"];
  prefix: CommandContext["prefix"];
  stylerDummy: CommandContext["stylerDummy"];
}

export class OutputClass implements OutputProps {
  #ctx: CommandContext | NoEventCMDContext;
  NO_EVENT_MODE: boolean;

  /**
   * @deprecated
   */
  Styled: OutputProps["Styled"];

  get api() {
    return this.#ctx.api;
  }

  static createWithoutEvent(api: CommandContext["api"]) {
    const ctx: NoEventCMDContext = {
      api,
      commands: Cassidy.commands,
      multiCommands: Cassidy.multiCommands,
      Cassidy,
      invTime: Date.now(),
      usersDB: Cassidy.databases.usersDB,
      money: Cassidy.databases.usersDB,
      threadsDB: Cassidy.databases.threadsDB,
      globalDB: Cassidy.databases.globalDB,
      FontSystem: FontSystem,
      fonts: FontSystem.fonts,
      userStat: Cassidy.databases.usersDB,
      icon: Cassidy.logo,
      allPlugins: Cassidy.plugins,
      output: null,
      allObj: null,
      ctx: null,
      input: null,
      styler: null,
      event: {
        body: "",
        args: [],
        attachments: [],
        isGroup: false,
        isUnread: false,
        mentions: {},
        messageID: "",
        participantIDs: [],
        senderID: "",
        threadID: "",
        type: "message",
      },
      stylerDummy: new CassidyResponseStylerControl({}),
      prefix: Cassidy.config.PREFIX,
    };
    ctx.ctx = ctx;
    ctx.allObj = ctx;
    ctx.input = new InputClass(ctx as CommandContext);
    const styler = new CassidyResponseStylerControl({});
    ctx.styler = styler;
    ctx.stylerDummy = styler;
    const output = new OutputClass(ctx);
    output.NO_EVENT_MODE = true;
    return output;
  }

  canWorkWithEvent(
    _ctx: CommandContext | NoEventCMDContext,
  ): _ctx is CommandContext {
    return !this.NO_EVENT_MODE;
  }

  getNoEventContext(): NoEventCMDContext {
    return !this.canWorkWithEvent(this.#ctx) ? this.#ctx : null;
  }

  constructor(ctx: CommandContext | NoEventCMDContext) {
    this.NO_EVENT_MODE = false;
    this.#ctx = ctx;
    this.#prepend = "";
    this.#append = "";
    this.STYLE = null;
    this.LASTID = "";
    this.UIName = null;
    // @ts-ignore
    this.selectItem = BriefcaseAPI.selectItem.bind(ctx);
    const self = this;

    this.Styled = class OutputStyled {
      /**
       * Creates a new styled message instance.
       * @param style - The style to apply to the messages.
       */
      constructor(style: CassidySpectra.CommandStyle) {
        this.style = style;
      }
      /**
       * The style applied to the messages.
       */
      style: CassidySpectra.CommandStyle;

      /**
       * The ID of the last message sent.
       */
      lastID: string | null;

      /**
       * Sends a reply with the specified body.
       * @param body - The content of the reply.
       * @returns A promise resolving to the result of the reply.
       */
      reply(body: OutputForm): Promise<OutputSent> {
        return self.replyStyled(body, this.style);
      }

      /**
       * Sends a message with the specified body.
       * @param body - The content of the message.
       * @returns A promise resolving to the result of the message.
       */
      send(body: OutputForm): Promise<OutputSent> {
        return self.sendStyled(body, this.style);
      }

      /**
       * Edits a message with the specified body and message ID.
       * @param body - The new content of the message.
       * @param messageID - The ID of the message to edit.
       * @param delay - Optional delay before editing the message.
       * @returns A promise resolving when the operation is complete.
       */
      edit(body: string, messageID: string, delay?: number): Promise<boolean> {
        return self.edit(body, messageID, delay);
      }
    };
    this.#ctx.output = this;
  }

  UIName: string;

  STYLE: CommandStyle;
  LASTID: string;

  #prepend: string;
  #append: string;

  /**
   * A flexible wrapper for making HTTP requests using Axios, supporting both
   * method shorthands and full Axios config objects.
   *
   * Features:
   * - Supports both `"@method:url"` shorthand and explicit method in config
   * - Automatically assigns params to `params` (GET) or `data` (POST-like)
   * - Catches and formats errors to always return an `Error` object
   *
   *
   * @param url - The endpoint URL or a special format like "@METHOD:url"
   *                       (e.g., "@post:/api/user") to define the HTTP method inline.
   *
   * @param [params={}] - Key-value pairs to be sent:
   *        - As query parameters (for GET, DELETE, etc.)
   *        - As request body (for POST, PUT, PATCH)
   *
   * @param [configOrMethod="GET"] - Either:
   *        - A string representing the HTTP method (e.g., "GET", "POST")
   *        - An AxiosRequestConfig object (preferred for complex setups)
   *
   * @returns The response data from the server
   *
   * @throws {Error} If the request fails, throws a formatted error with message
   */

  async req(
    url: string,
    params?: Record<string, any>,
    configOrMethod: AxiosRequestConfig["method"] | AxiosRequestConfig = "GET",
  ): Promise<any> {
    let finalUrl = url;

    let finalConfig: AxiosRequestConfig =
      typeof configOrMethod !== "string"
        ? configOrMethod
        : { method: String(configOrMethod).toUpperCase() };

    if (finalUrl.startsWith("@")) {
      let [method, ...uurl] = finalUrl.slice(1).split(":");
      finalUrl = uurl.join(":");
      finalConfig.method = String(method).toUpperCase();
    }
    if (finalConfig.method === "POST") {
      finalConfig.data = params;
    } else {
      finalConfig.params = params;
    }
    try {
      const res = await axios(finalUrl, finalConfig);
      return res.data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : String(error));
    }
  }
  /**
   * Sends a reply with the specified body and an optional callback.
   * @param body - The content of the reply.
   * @param callback - Optional callback to handle the result of the reply.
   * @returns A promise resolving to the result of the reply.
   */
  reply(
    body: OutputForm,
    callback?: (info: OutputSent) => void,
  ): Promise<OutputSent>;

  /**
   * Registers a reply listener to handle replies asynchronously.
   * @param replyListener - A function to handle the reply context.
   * @returns A promise resolving to the generic type `T`.
   */
  reply<T>(
    replyListener: (
      ctx: CommandContext & {
        repObj: PromiseStandardReplyArg<T>;
      },
    ) => any | Promise<any>,
  ): Promise<T>;

  async reply<T>(
    bodyOrListener:
      | OutputForm
      | ((
          ctx: CommandContext & {
            repObj: PromiseStandardReplyArg<T>;
          },
        ) => any | Promise<any>),
    callbackRep: (info: OutputSent) => void = (_info) => {},
  ): Promise<OutputSent | T> {
    if (typeof bodyOrListener === "function") {
      const listener = bodyOrListener;
      if (!this.LASTID) {
        throw new Error("No last output to attach to.");
      }
      return this.addReplyListener(this.LASTID, listener);
    }
    return this.dispatch(bodyOrListener, {
      callback: callbackRep,
      isReply: true,
    });
  }

  /**
   * Changes the current recognized style in a single output instance. Only same events were affected.
   * @param style - Style object.
   */
  setStyle(style: CassidySpectra.CommandStyle): void {
    this.STYLE = style;
  }

  /**
   * Clears the current recognized style in a single output instance. Only same events were affected.
   */
  clearStyle(): void {
    this.STYLE = null;
  }

  /**
   * Sets the UI name for the output.
   * @param name - The name to set for the UI.
   * @deprecated
   */
  setUIName(name: string): void {
    this.UIName = `${name}`;
  }

  /**
   * Sends a contact message with optional ID and destination.
   * @param text - The contact message text.
   * @param id - Optional ID for the contact.
   * @param destination - Optional destination for the contact.
   * @returns A promise resolving to a boolean indicating success.
   */
  contact(
    text: string,
    id?: string,
    destination?: string,
  ): Promise<OutputSent> {
    return this.dispatch({
      body: text,
      contactID: id,
      threadID: destination,
    });
  }

  /**
   * Handles an error by sending it with an optional callback.
   * @param err - The error to handle.
   * @param callback - Optional callback to handle additional information.
   * @returns A promise resolving to any result.
   */
  error(
    err: unknown | string | Error,
    callback: (info: any) => void = (_info) => {},
  ): Promise<OutputSent> {
    let error = err;
    if (typeof error !== "object" && typeof error !== "string") {
      throw new Error(
        `The first argument must be an Error instance or a string.`,
      );
    }
    if (typeof error === "string") {
      error = new Error(`${error}`);
    }
    const errMsg = this.formatError(error);
    return this.dispatch(errMsg, { callback, isReply: true });
  }

  /**
   * Sends a message with the specified body, optional ID, and callback.
   * @param body - The content of the message.
   * @param id - Optional ID for the message.
   * @param callback - Optional callback to handle the result.
   * @returns A promise resolving to the result of the message.
   */
  send(
    body: OutputForm,
    id?: string,
    callback: (info: OutputSent) => void = (_info) => {},
  ): Promise<OutputSent> {
    return this.dispatch(body, { callback, threadID: id });
  }

  /**
   * Adds a user to a thread.
   * @param user - The user to add.
   * @param thread - Optional thread to add the user to.
   * @returns A promise resolving when the operation is complete.
   */
  add(user: string, thread: string = this.#ctx.input?.threadID): Promise<void> {
    return this.api.addUserToGroup(user, thread, (_err) => {});
  }

  /**
   * Removes a user from a thread.
   * @param user - The user to remove.
   * @param thread - Optional thread to remove the user from.
   * @returns A promise resolving when the operation is complete.
   */
  kick(
    user: string,
    thread: string = this.#ctx.input?.threadID,
  ): Promise<void> {
    return this.api.removeUserFromGroup(user, thread, (_err) => {});
  }

  /**
   * Un-sends a message by its ID.
   * @param mid - The ID of the message to un-send.
   * @returns A promise resolving when the operation is complete.
   */
  unsend(mid: string): Promise<void> {
    return this.api.unsendMessage(mid, (_err) => {});
  }

  /**
   * Reacts to a message with the specified emoji.
   * @param emoji - The emoji to react with.
   * @param mid - Optional ID of the message to react to.
   * @returns A promise resolving when the operation is complete.
   */
  reaction(emoji: string, mid?: string): Promise<void>;

  /**
   * Registers a reaction listener to handle reactions asynchronously.
   * @param reactListener - A function to handle the reaction context.
   * @returns A promise resolving to the generic type `T`.
   */
  reaction<T>(
    reactListener: (
      ctx: CommandContext & {
        repObj: PromiseStandardReplyArg<T>;
      },
    ) => any | Promise<any>,
  ): Promise<T>;

  reaction<T>(
    emojiOrListener:
      | string
      | ((
          ctx: CommandContext & {
            repObj: PromiseStandardReplyArg<T>;
          },
        ) => any | Promise<any>),
    mid: string = this.#ctx.input?.messageID,
  ) {
    if (typeof emojiOrListener === "function") {
      if (!this.LASTID) {
        throw new Error("No last output to attach to.");
      }
      return this.addReactionListener(this.LASTID, emojiOrListener);
    }
    this.api.setMessageReaction(emojiOrListener, mid, (_err) => {}, true);
  }

  /**
   * A string to prepend to messages.
   * @deprecated
   */
  get prepend() {
    return this.#prepend;
  }

  /**
   * A string to append to messages.
   * @deprecated
   */
  get append() {
    return this.#append;
  }

  set prepend(s) {
    this.#prepend = s;
  }

  set append(s) {
    this.#append = s;
  }

  /**
   * Sends a styled reply with the specified form, style, and optional thread.
   * @param form - The content of the reply.
   * @param style - The style to apply to the reply.
   * @param thread - Optional thread to send the reply to.
   * @returns A promise resolving to the result of the reply.
   */
  replyStyled(
    form: OutputForm,
    style: CassidySpectra.CommandStyle,
    thread?: string,
  ): Promise<OutputSent> {
    return this.dispatch(form, {
      threadID: thread,
      style: style || {},
      isReply: true,
    });
  }

  /**
   * Sends a styled message with the specified form, style, and optional thread.
   * @param form - The content of the message.
   * @param style - The style to apply to the message.
   * @param thread - Optional thread to send the message to.
   * @returns A promise resolving to the result of the message.
   */
  sendStyled(
    form: OutputForm,
    style: CassidySpectra.CommandStyle,
    thread?: string,
  ): Promise<OutputSent> {
    return this.dispatch(form, {
      threadID: thread,
      style: style || {},
    });
  }

  /**
   * Attaches a stream to a message with optional style.
   * @param form - The content of the message.
   * @param stream - The stream to attach.
   * @param style - Optional style to apply to the message.
   * @returns A promise resolving to the result of the message.
   */
  async attach(
    form: OutputForm,
    stream: string | Readable[] | Readable | any,
    style?: CassidySpectra.CommandStyle,
  ): Promise<OutputSent> {
    const body = form;
    try {
      const awaited =
        typeof stream === "string"
          ? await global.utils.getStreamFromUrl(stream)
          : stream;
      let form1 = typeof body === "string" ? { body } : { ...body };
      let form = {
        ...form1,
        attachment: awaited,
      };
      if (style) {
        return this.replyStyled(form, style);
      }
      return this.reply(form);
    } catch (error) {
      console.error(error);
      if (style) {
        return this.replyStyled(body, style);
      }
      return this.reply(body);
    }
  }

  /**
   * Handles a generic error scenario.
   * @returns A promise resolving to the result of the operation.
   */
  wentWrong(): Promise<OutputSent> {
    return this.dispatch(
      "❌ Sorry, something went wrong. This message indicates that an **unexpected issue has occurred**, which may lead to potential problems if not addressed. **It is uncommon to see this message**, as it is primarily used for rapid edge case handling and debugging. Better error messages will be added in the **future**. Please **report** this to the administrator or developer for further investigation.",
      { isReply: true },
    );
  }

  /**
   * Handles a syntax error in a command.
   * @param commandX - Optional command context or details.
   * @deprecated
   * @returns A promise resolving to the result of the operation.
   */
  syntaxError(commandX?: any): Promise<OutputSent> {
    if (!this.canWorkWithEvent(this.#ctx)) {
      throw new Error("Needs event.");
    }
    const obj = this.#ctx;
    let cmdName = null;
    if (obj.command || commandX) {
      const { metadata = {} } = obj.command || commandX;
      cmdName = metadata.name;
    }
    return this.reply(
      `❌ The command syntax you are using is invalid, please use ${
        cmdName ? `${obj.prefix}help ${cmdName}` : `the help command`
      } to see how it works.`,
    );
  }

  /**
   * Edits a message with the specified text, message ID, and optional delay and style.
   * @param text - The new content of the message.
   * @param mid - The ID of the message to edit.
   * @param delay - Optional delay before editing the message.
   * @param style - Optional style to apply to the message.
   * @returns A promise resolving to a boolean indicating success.
   */
  async edit(
    text: string,
    mid: string,
    delay?: number,
    style?: any,
    options?: StrictOutputForm,
  ): Promise<boolean> {
    options ??= {};
    const obj = this.#ctx;
    const { input } = obj;
    const { append, prepend } = this;
    const { styler } = obj;
    const stylerShallow = styler.shallowMake({}, style);

    let result = prepend + "\n" + text + "\n" + append;
    result = result.trim();

    if (global.Cassidy.config.censorOutput && result) {
      result = obj.input.censor(result);
    }

    result = await this.#processOutput({ ...options, body: result });

    result = input.isWss
      ? stylerShallow.html(result)
      : stylerShallow.text(result);
    await utils.delay(delay);
    return new Promise((res) => {
      const aa = this.api.editMessage(result, mid, () => res(true));
      if (aa instanceof Promise) {
        // @ts-ignore
        aa.then(res);
      } else {
        res(false);
      }
    });
  }

  async #processOutput({ ...options }: StrictOutputForm) {
    const obj = this.#ctx;
    const { input } = obj;
    const cmd = this.canWorkWithEvent(this.#ctx) ? this.#ctx.command : null;
    // @ts-ignore
    const { UserStatsLocal, money, CassEncoder } = obj;
    const command = cmd;
    if (
      command?.meta?.noRibbonUI !== true &&
      global.Cassidy.config.noRibbonUI !== true &&
      obj.money &&
      options.noRibbonUI !== true
    ) {
      let hasS = Boolean(input.senderID);
      const { name } = await obj.money.getCache(
        options.threadID ?? input.senderID,
      );
      const finalName = this.UIName || name;
      let isOther = finalName !== name;

      if (options.body && !options.body.trim().startsWith("👤")) {
        options.body =
          hasS && finalName && finalName !== "Unregistered"
            ? `👤 **${finalName}**${
                cmd && !isOther ? ` (${obj.input.words[0]})` : ""
              }\n\n${options.body}`
            : `🍃 Register with **${obj.prefix}id-setname** now!\n\n${options.body}`;
      }
    }

    if (
      command?.meta?.noLevelUI !== true &&
      global.Cassidy.config.noLevelUI !== true &&
      obj.money &&
      options.noLevelUI !== true
    ) {
      let hasS = Boolean(input.senderID);
      const { cassEXP, name } = await obj.money.getCache(
        options.threadID ?? input.senderID,
      );
      const inst = new CassEXP(cassEXP);
      const finalName = this.UIName || name;

      options.body =
        hasS && finalName
          ? `${options.body}\n${UNIRedux.standardLine}\n${
              UNIRedux.arrow
            } ***Level*** ${UNISpectra.nextArrow} ${inst.level} [${
              inst.exp
            } / ${inst.getNextEXP()}]`
          : options.body;
    }

    return options.body;
  }

  async dispatch(
    body: OutputForm,
    options: StrictOutputForm = { body: "" },
  ): Promise<OutputSent> {
    const text = body;
    const obj = this.#ctx;
    const append = this.#append;
    const prepend = this.#prepend;
    const { STYLE } = this;
    const { input, input: event } = obj;
    const styler = obj.input.isCommand ? obj.styler : obj.stylerDummy;
    const newMid = `web:mid-${Date.now()}`;
    if (typeof text === "object") {
      Object.assign(options, text);
    } else if (typeof text === "string") {
      Object.assign(options, {
        body: text,
      });
    } else if (!text) {
      Object.assign(options, {
        body: "",
      });
    }
    let resultInfo: Partial<OutputResultInf> = {};
    let isStr = (str: unknown) => typeof str === "string";
    if (!isStr(options)) {
      options.body ??= "";
      resultInfo.originalOptionsBody = options.body;
      if (Cassidy.config.autoGoogleTranslate) {
        try {
          options.body = (
            await translate(options.body, Cassidy.config.autoGoogleTranslate)
          )?.text;
        } catch (error) {
          console.error(error);
        }
      }
      if (PagePayload.isPageButton(options.attachment) && !obj.input.isPage) {
        // @ts-ignore
        const buttons = PagePayload.fromPayload(options.attachment);
        options.body = buttons.toString();
      }
      if (PagePayload.isPageButton(options.attachment)) {
        delete options.body;
      }
      if (global.Cassidy.config.censorOutput && options.body) {
        options.body = input.censor(options.body);
      }

      options.body = `${prepend}\n${options.body}\n${append}`;
      options.body = options.body.trim();

      const stylerShallow = STYLE
        ? obj.stylerDummy.shallowMake(
            Object.assign({}, options.defStyle ?? {}, input.defStyle ?? {}),
            Object.assign(
              {},
              options.style ?? {},
              input.style ?? {},
              STYLE ?? {},
            ),
          )
        : styler.shallowMake(
            Object.assign({}, options.defStyle ?? {}, input.defStyle ?? {}),
            Object.assign({}, options.style ?? {}, input.style ?? {}),
          );

      if (options.body) {
        options.body = await this.#processOutput(options);
      }

      if (!options.noStyle && options.body) {
        options.body = UNISpectra.standardizeLines(options.body);

        options.body = input.isWss
          ? stylerShallow.html(resultInfo.originalOptionsBody) +
            "==========>" +
            stylerShallow.text(resultInfo.originalOptionsBody)
          : stylerShallow.text(options.body);
        resultInfo.html = stylerShallow.html(resultInfo.originalOptionsBody);
        resultInfo.styleFields = styler.getFields();
      } else {
        resultInfo.html = options.body;
      }
      if (options.noStyle) {
        delete options.noStyle;
      }
      if (options.body && global.Cassidy.config.standardSpectra) {
        options.body = UNISpectra.standardizeLines(options.body);
      }

      options.body = options.body.trim();
      const optionsCopy = { ...options };
      for (const key in options) {
        if (
          ![
            "attachment",
            "attachments",
            "body",
            "location",
            "mentions",
          ].includes(key)
        ) {
          resultInfo[key] = options[key];
          delete options[key];
        }
      }
      if (
        !options.body ||
        options.body === "" ||
        String(options.body).trim() === "" ||
        options.body === "undefined"
      ) {
        delete options.body;
      }

      if (options.rawBody) {
        options.body = resultInfo.originalOptionsBody;
      }

      if (options.referenceQ === input.webQ) {
      }
      if (input.isWeb) {
        let url = null;
        if (
          typeof options.attachment === "object" &&
          options.attachment &&
          "_readableState" in options.attachment
        ) {
          const temp = new TempFile();
          const { fileTypeFromBuffer } = await global.fileTypePromise;
          const base64_ = await streamToBase64(options.attachment);
          const buffer = Buffer.from(base64_, "base64");
          const type = await fileTypeFromBuffer(buffer);
          let format = type?.ext;
          const newStream = base64ToStream(base64_);

          temp.filename = temp.filename.replace("tmp", format);
          await temp.save(newStream);
          // url = `${
          //   global.Cassidy.config.knownURL
          // }/api/temp?id=${encodeURIComponent(temp.getFilename())}`;
          url = `/api/temp?id=${encodeURIComponent(temp.getFilename())}`;
        }

        const toR = new OutputSent(obj, {
          ...options,
          ...resultInfo,
          messageID: newMid,
          timestamp: Date.now(),
          senderID: this.api.getCurrentUserID(),
          threadID: options.threadID || event.threadID,
          attachment: url ?? null,
        });

        for (const kk of [input.webQ]) {
          if (!kk || !global.webQuery[kk]) {
            continue;
          }
          let modifiedData = null;

          global.webQuery[kk].resolve({
            status: "success",
            result: { ...toR },
            newMid,
            modifiedData,
          });
          //console.log(`Resolved message to ${input.webQ} with mid: ${newMid}`);
        }
        // console.log("WEB Res", toR);
        return new Promise((r) => {
          this.LASTID = toR.messageID;
          r(toR);
        });
      }
      const api =
        optionsCopy.useWebMode || optionsCopy.threadID === "webpanel"
          ? globalThis.wssAPI
          : this.api;
      return new Promise(async (res) => {
        if (optionsCopy.contactID && input.isFacebook) {
          this.api.shareContact(
            options.body,
            optionsCopy.contactID,
            optionsCopy.threadID || event.threadID,
          );
          res(
            // @ts-ignore
            new OutputSent(obj, {
              ...options,
              ...resultInfo,
              messageID: newMid,
              senderID: this.api.getCurrentUserID(),
              body: options.body,
            }),
          );
          return;
        }

        const cbb = async (
          err: any,
          info: { messageID: string; threadID: string; timestamp: number },
        ) => {
          if (typeof optionsCopy.callback === "function") {
            // @ts-ignore

            await optionsCopy.callback(info);
          }

          if (err) {
            console.log(err);
          }

          const resu = new OutputSent(obj, {
            ...options,
            ...info,
            ...resultInfo,
            senderID: api.getCurrentUserID() || "",
            body: options.body,
          });
          this.LASTID = resu.messageID;
          res(resu);
        };
        if (api.sendMessage?.length === 5) {
          api.sendMessage(
            // @ts-ignore

            options,
            optionsCopy.threadID || event.threadID,
            cbb,
            optionsCopy.messageID ||
              (optionsCopy.isReply ? event.messageID : null),
          );
        } else {
          const res = await api.sendMessage(
            // @ts-ignore

            options,
            optionsCopy.threadID || event.threadID,
            optionsCopy.messageID ||
              (optionsCopy.isReply ? event.messageID : null),
          );
          cbb(null, res);
        }
      });
    } else {
      throw new Error("Something is wrong.");
    }
  }

  /**
   * Creates frames from the specified arguments.
   * @param args - The arguments to create frames from.
   * @deprecated
   * @returns A promise resolving to the result of the operation.
   */
  async frames(...args: (string | number)[]): Promise<any> {
    let texts = [];
    let mss = [];
    args.forEach((item, index) => {
      if (index % 2 === 0) {
        texts.push(item);
      } else {
        mss.push(item);
      }
    });
    const output = this;
    const i = await output.reply(texts[0]);
    texts.shift();
    for (const index in texts) {
      const text = texts[index];
      await utils.delay(mss[index] || 1000);
      await output.edit(text, i.messageID);
    }
    return i;
  }

  /**
   * Alias for the `reaction` method.
   * @deprecated
   */
  get react() {
    return this.reaction;
  }

  /**
   * Formats an error into a string representation.
   * @param err - The error to format.
   * @returns A string representation of the error.
   * @deprecated
   */
  formatError(err: string | any): string;

  formatError(error: any) {
    let errorMessage = "❌ | An error has occurred:\n";

    if (error instanceof Error) {
      const { name, message, stack, ...rest } = error;

      if (stack) errorMessage += `${stack}\n`;

      for (const key in rest) {
        if (Object.prototype.hasOwnProperty.call(rest, key)) {
          errorMessage += `${key}: ${rest[key]}\n`;
        }
      }
    } else {
      errorMessage += inspect(error, { depth: null, showHidden: true });
    }

    return errorMessage;
  }

  /**
   * Sends a confirmation message and waits for a response.
   * @param body - The content of the confirmation message.
   * @param done - Optional callback to handle the confirmation context.
   * @returns A promise resolving to the confirmation context.
   */
  async confirm(
    body: string,
    done?: (
      ctx: CommandContext & { yes: boolean; no: boolean },
    ) => any | Promise<any>,
    extraStyle?: CommandStyle,
  ): Promise<CommandContext & { yes: boolean; no: boolean }> {
    const text = `⚠️ ${body}\n${UNIRedux.standardLine}\n**Yes** | **No**`;
    const info = extraStyle
      ? await this.replyStyled(text, extraStyle)
      : await this.reply(text);
    const { input } = this.#ctx;

    return new Promise((resolve, _reject) => {
      input.setReply(info.messageID, {
        author: input.senderID,
        callback(repCtx) {
          if (repCtx.input.senderID !== input.senderID) {
            return;
          }
          const newCtx = {
            ...repCtx,
            yes: repCtx.input.body.toLowerCase() === "yes",
            no: repCtx.input.body.toLowerCase() === "no",
          };
          if (!newCtx.yes && !newCtx.no) {
            return repCtx.output.reply(
              `❌ Invalid response, please go back and reply either **yes** or **no**.`,
            );
          }
          done?.(newCtx);
          resolve(newCtx);
          input.delReply(info.messageID);
        },
      });
    });
  }

  /**
   * Adds a reply listener for a specific message ID.
   * @param mid - The ID of the message to listen for replies.
   * @param callback - Optional callback to handle the reply context.
   * @returns A promise resolving to the generic type `T`.
   * @deprecated
   */
  addReplyListener?: <T>(
    mid: string,
    callback?: (
      ctx: CommandContext & {
        repObj: PromiseStandardReplyArg<T>;
      },
    ) => any | Promise<any>,
  ) => Promise<T>;

  /**
   * Adds a reaction listener for a specific message ID.
   * @param mid - The ID of the message to listen for reactions.
   * @param callback - Optional callback to handle the reaction context.
   * @deprecated
   * @returns A promise resolving to the generic type `T`.
   */
  addReactionListener?: <T>(
    mid: string,
    callback?: (
      ctx: CommandContext & {
        repObj: PromiseStandardReplyArg<T>;
      },
    ) => any | Promise<any>,
  ) => Promise<T>;

  /**
   * Waits for a reply to a specific message.
   * @param body - The content of the message to wait for a reply to.
   * @param callback - Optional callback to handle the reply context.
   * @returns A promise resolving to the input of the command context.
   * @deprecated
   */
  waitForReply?: <T>(
    body: string,
    callback?:
      | ((
          ctx: CommandContext & {
            repObj: PromiseStandardReplyArg<T>;
          },
        ) => any | Promise<any>)
      | undefined,
  ) => Promise<CommandContext["input"]>;

  /**
   * Waits for a reaction to a specific message.
   * @param body - The content of the message to wait for a reaction to.
   * @param callback - Optional callback to handle the reaction context.
   * @returns A promise resolving to the input of the command context.
   * @deprecated
   */
  waitForReaction?: <T>(
    body: string,
    callback?:
      | ((
          ctx: CommandContext & {
            reObj: PromiseStandardReplyArg<T>;
          },
        ) => any | Promise<any>)
      | undefined,
  ) => Promise<CommandContext["input"]>;

  /**
   * Waits for a quick reaction with specific options.
   * @param body - The content of the message to wait for a reaction to.
   * @param options - Options for the quick reaction.
   * @returns A promise resolving to the input of the command context.
   * @deprecated
   */
  quickWaitReact?: (
    body: string,
    options: {
      authorOnly?: boolean;
      author?: string;
      edit?: string;
      emoji?: string;
    },
  ) => Promise<CommandContext["input"]>;

  selectItem: BriefcaseAPI.BoundSelectItem;
}

export class OutputSent implements OutputResultInf {
  #ctx: CommandContext | NoEventCMDContext;

  result: OutputResultInf;
  messageID: string;
  body: string;
  attachment: any;
  callback: (info: OutputSent) => void | Promise<void>;
  defStyle: Record<string, any>;
  html: string;
  isReply: boolean;
  location: { latitude: number; longitude: number };
  mentions: { tag: string; id: string }[];
  noLevelUI: boolean;
  noStyle: boolean;
  originalOptionsBody: string;
  referenceQ: string;
  senderID: string;
  style: Record<string, any>;
  styleFields: Record<string, any>;
  threadID: string;
  timestamp: number;

  constructor(
    ctx: CommandContext | NoEventCMDContext,
    result: OutputResultInf,
  ) {
    Object.assign(this, result);

    this.#ctx = ctx;
    this.result = result;
    this.messageID = this.result.messageID;
    this.body = this.result.body;
    this.attachment = this.result.attachment;
    this.callback = this.result.callback;
    this.defStyle = this.result.defStyle;
    this.html = this.result.html;
    this.isReply = this.result.isReply;
    this.location = this.result.location;
    this.mentions = this.result.mentions;
    this.messageID = this.result.messageID;
    this.noLevelUI = this.result.noLevelUI;
    this.noStyle = this.result.noStyle;
    this.originalOptionsBody = this.result.originalOptionsBody;
    this.referenceQ = this.result.referenceQ;
    this.senderID = this.result.senderID;
    this.style = this.result.style;
    this.styleFields = this.result.styleFields;
    this.threadID = this.result.threadID;
    this.timestamp = this.result.timestamp;
  }

  atReply(callback: Parameters<OutputProps["addReplyListener"]>[1]) {
    if (typeof callback !== "function") {
      throw new TypeError("Callback is not a function.");
    }

    return this.#ctx.output.addReplyListener(this.messageID, callback);
  }

  atReaction(callback: Parameters<OutputProps["addReactionListener"]>[1]) {
    if (typeof callback !== "function") {
      throw new TypeError("Callback is not a function.");
    }

    return this.#ctx.output.addReactionListener(this.messageID, callback);
  }

  editSelf(
    text: Parameters<import("output-cassidy").OutputProps["edit"]>[0],
    delay: Parameters<
      import("output-cassidy").OutputProps["edit"]
    >[2] = undefined,
    style: Parameters<
      import("output-cassidy").OutputProps["edit"]
    >[3] = undefined,
  ) {
    return this.#ctx.output.edit(text, this.messageID, delay, style);
  }

  unsendSelf() {
    return this.#ctx.output.unsend(this.messageID);
  }

  removeAtReply() {
    this.#ctx.input.delReply(this.messageID);
  }

  removeAtReaction() {
    this.#ctx.input.delReact(this.messageID);
  }
}

export default OutputClass;
