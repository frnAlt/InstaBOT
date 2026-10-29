"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputClass = exports.InputRoles = void 0;
const webSystem_js_1 = require("../../webSystem.js");
const fca_liane_utils_1 = require("fca-liane-utils");
const { stringArrayProxy } = global.utils;
const node_util_1 = require("node:util");
var InputRoles;
(function (InputRoles) {
    InputRoles[InputRoles["ADMINBOT"] = 2] = "ADMINBOT";
    InputRoles[InputRoles["MODERATORBOT"] = 1.5] = "MODERATORBOT";
    InputRoles[InputRoles["VIP"] = 1.2] = "VIP";
    InputRoles[InputRoles["ADMINBOX"] = 1] = "ADMINBOX";
    InputRoles[InputRoles["EVERYONE"] = 0] = "EVERYONE";
})(InputRoles || (exports.InputRoles = InputRoles = {}));
class InputClass extends String {
    messageID = null;
    xQ = null;
    isPage = false;
    strictPrefix = false;
    body = "";
    senderID = null;
    userID = null;
    type = null;
    threadID = null;
    author = null;
    reaction = null;
    messageReply = null;
    mentions = null;
    attachments = null;
    timestamp = null;
    isGroup = null;
    participantIDs = null;
    isWeb = false;
    isWss = false;
    logMessageType = null;
    logMessageData = null;
    arguments = null;
    args = null;
    argPipe = null;
    argPipeArgs = null;
    argArrow = null;
    argArrowArgs = null;
    wordCount = 0;
    property = {};
    propertyArray = [];
    charCount = 0;
    allCharCount = 0;
    links = null;
    mentionNames = null;
    numbers = null;
    words = null;
    text = "";
    sid = null;
    tid = null;
    replier = null;
    hasMentions = false;
    firstMention = null;
    isThread = false;
    detectUID = null;
    detectID = null;
    censor;
    isCommand = false;
    postback;
    /**
     * User roles (2 for bot admin, 1.5 for moderator, 1 for thread admin, 0 for everyone.)
     */
    role = 0;
    webQ = null;
    defStyle = null;
    style = null;
    isFacebook = false;
    originalBody = null;
    #__context;
    #__api;
    #__threadsDB;
    ReplySystem;
    ReactSystem;
    attachmentUrls;
    get prefix() {
        return this.#__context.prefix;
    }
    constructor(obj) {
        const { replies, reacts } = global.Cassidy;
        super(String(obj.event?.body || ""));
        this.#__context = obj;
        Object.assign(this, obj.event);
        if ("password" in this) {
            delete this.password;
        }
        this.#__api = obj.api;
        this.#__threadsDB = obj.threadsDB;
        this.censor = fca_liane_utils_1.censor;
        this.processEvent(obj.event, obj.command?.meta?.autoCensor ?? false);
        const self = this;
        this.ReplySystem = {
            set(detectID, repObj) {
                if (!self.#__context.commandName && !repObj.key && !repObj.callback) {
                    throw new Error("No command detected");
                }
                if (!detectID) {
                    return;
                }
                let key = repObj.key || self.#__context.commandName;
                if (!self.#__context.multiCommands.getOne(key) &&
                    !self.#__context.multiCommands.getOne(key.toLowerCase()) &&
                    !repObj.callback) {
                    return;
                }
                global.currData =
                    self.#__context.multiCommands.getOne(key) ||
                        self.#__context.multiCommands.getOne(key.toLowerCase());
                const ii = {
                    repObj,
                    commandKey: key,
                    detectID,
                    command: self.#__context.command,
                    registeredSender: self.senderID,
                };
                replies[detectID] = ii;
                logger(`Reply Detector Added: ${detectID}`, "INPUT");
                setTimeout(() => {
                    if (replies[detectID] === ii) {
                        self.ReplySystem.delete(detectID);
                    }
                }, 30 * 60 * 1000);
                return replies[detectID];
            },
            delete(detectID) {
                if (!detectID) {
                    throw new Error("Invalid Detect ID");
                }
                if (!replies[detectID]) {
                    return null;
                }
                const backup = replies[detectID];
                delete replies[detectID];
                logger(`Reply Detector Removed: ${detectID}`, "INPUT");
                return backup;
            },
            get(detectID) {
                if (!detectID) {
                    throw new Error("Invalid Detect ID");
                }
                if (!replies[detectID]) {
                    return null;
                }
                return replies[detectID];
            },
        };
        this.ReactSystem = {
            set(detectID, reactObj) {
                if (!self.#__context.commandName &&
                    !reactObj.key &&
                    !reactObj.callback) {
                    throw new Error("No command detected");
                }
                if (!detectID) {
                    throw new Error("Invalid Detect ID");
                }
                let key = reactObj.key || self.#__context.commandName;
                if (!self.#__context.multiCommands.getOne(key) &&
                    !self.#__context.multiCommands.getOne(key.toLowerCase())) {
                    throw new Error("Command not found.");
                }
                global.currData =
                    self.#__context.multiCommands.getOne(key) ||
                        self.#__context.multiCommands.getOne(key.toLowerCase());
                const ii = {
                    reactObj,
                    commandKey: key,
                    detectID,
                    command: self.#__context.command,
                };
                reacts[detectID] = ii;
                logger(`Reaction Detector Added: ${detectID}`, "INPUT");
                setTimeout(() => {
                    if (reacts[detectID] === ii) {
                        self.ReactSystem.delete(detectID);
                    }
                }, 30 * 60 * 1000);
                return reacts[detectID];
            },
            delete(detectID) {
                if (!detectID) {
                    throw new Error("Invalid Detect ID");
                }
                if (!reacts[detectID]) {
                    return null;
                }
                const backup = reacts[detectID];
                delete reacts[detectID];
                logger(`Reaction Detector Removed: ${detectID}`, "INPUT");
                return backup;
            },
            get(detectID) {
                if (!detectID) {
                    throw new Error("Invalid Detect ID");
                }
                if (!reacts[detectID]) {
                    return null;
                }
                return reacts[detectID];
            },
        };
        for (const method of Reflect.ownKeys(InputClass.prototype)) {
            const m = this[method];
            try {
                if (typeof m === "function") {
                    this[method] = m.bind(this);
                }
            }
            catch (error) { }
        }
    }
    get setReply() {
        return this.ReplySystem.set;
    }
    get delReply() {
        return this.ReplySystem.delete;
    }
    get getReply() {
        return this.ReplySystem.get;
    }
    get setReact() {
        return this.ReactSystem.set;
    }
    get delReact() {
        return this.ReactSystem.delete;
    }
    get getReact() {
        return this.ReactSystem.get;
    }
    attachToContext(ctx = this.#__context) {
        ctx.input = this;
        ctx.censor = fca_liane_utils_1.censor;
        ctx.replySystem = this.ReplySystem;
        ctx.reactSystem = this.ReactSystem;
        ctx.args = this.arguments;
        ctx.InputClass = InputClass;
        ctx.role = this.role;
        ctx.InputRoles = InputRoles;
    }
    processEvent(event, autoCensor) {
        try {
            this.senderID = event.senderID;
            this.threadID = event.threadID;
            this.type = event.type;
            this.author = event.author;
            this.reaction = event.reaction;
            this.messageID = event.messageID;
            this.isCommand = false;
            // this.password = event.password;
            this.mentions = event.mentions ?? {};
            this.attachments = event.attachments ?? [];
            this.timestamp = event.timestamp;
            this.isGroup = event.isGroup;
            this.participantIDs = event.participantIDs;
            if ("userID" in event && typeof event.userID === "string") {
                this.userID = event.userID;
            }
            this.originalBody = event.body ?? "";
            this.body = event.body ?? "";
            const { forceWebUID = false } = global.Cassidy.config;
            if (forceWebUID) {
                this.__formatWebUIDs();
            }
            if (autoCensor) {
                this.body = (0, fca_liane_utils_1.censor)(this.body);
            }
            this.__processMentions();
            this.__parseInput();
            this.sid = this.senderID;
            this.tid = this.threadID;
            this.attachmentUrls = [];
            if (Array.isArray(this.attachments)) {
                this.attachmentUrls = this.attachments
                    .map((i) => i?.url)
                    .filter(Boolean);
            }
            this.hasMentions = Object.keys(this.mentions).length > 0;
            this.firstMention = this.hasMentions
                ? {
                    name: Object.keys(this.mentions)[0].replace("@", ""),
                }
                : null;
            this.isThread = this.senderID !== this.threadID;
            this.detectUID = this.__getDetectUID();
            this.detectID = this.detectUID;
            this.text = this.body;
            if (event.messageReply) {
                this.replier = new InputClass({
                    ...this.#__context,
                    // @ts-ignore
                    event: event.messageReply,
                });
                this.messageReply = this.replier;
            }
        }
        catch (error) {
            console.error("Error processing event:", error);
        }
    }
    __formatWebUIDs() {
        if (!this.senderID.startsWith("web:")) {
            this.senderID = (0, webSystem_js_1.formatIP)(`custom_${this.senderID}`);
        }
        if (this.messageReply && !this.messageReply.senderID.startsWith("web:")) {
            this.messageReply.senderID = (0, webSystem_js_1.formatIP)(`custom_${this.messageReply.senderID}`);
        }
        if (Array.isArray(this.participantIDs)) {
            this.participantIDs = this.participantIDs.map((id) => id.startsWith("web:") ? id : (0, webSystem_js_1.formatIP)(`custom_${id}`));
        }
    }
    __processMentions() {
        if (this.mentions && Object.keys(this.mentions).length > 0) {
            for (const uid in this.mentions) {
                this.body = this.body.replace(this.mentions[uid], uid);
            }
        }
        this.body = this.body
            .replace(/\[uid\]/gi, this.senderID)
            .replace(/\[thisid\]/gi, this.messageReply?.senderID ?? this.senderID);
    }
    __parseInput() {
        const body = this.body;
        const args6 = body
            .split(" ")
            .filter((i) => !!i)
            .slice(1);
        this.arguments = stringArrayProxy(args6);
        this.arguments.original = stringArrayProxy(this.originalBody.split(" ")
            .filter((i) => !!i)
            .slice(1));
        this.args = this.arguments;
        this.argPipe = stringArrayProxy(this.arguments
            .join(" ")
            .split("|")
            .map((i) => i.trim()));
        this.argPipeArgs = this.argPipe.map((item) => item.split(" ").filter((i) => !!i));
        this.argArrow = stringArrayProxy(this.arguments
            .join(" ")
            .split("=>")
            .map((i) => i.trim()));
        this.argArrowArgs = this.argArrow.map((item) => item.split(" ").filter((i) => !!i));
        this.words = stringArrayProxy(body.split(" ").filter((i) => !!i));
        this.wordCount = this.words.length;
        this.charCount = body.split("").filter((i) => !!i).length;
        this.allCharCount = body.length;
        this.links = body.match(/(https?:\/\/[^\s]+)/g);
        this.mentionNames = body.match(/@[^\s]+/g);
        this.numbers = body.match(/\d+/g);
    }
    __getDetectUID() {
        if (this.hasMentions) {
            return Object.keys(this.mentions)[0];
        }
        if (this.messageReply) {
            return this.messageReply.senderID;
        }
        return undefined;
    }
    splitBody(splitter, str = this.body) {
        return str
            .replaceAll(`\\${splitter}`, "x69_input")
            .split(splitter)
            .map((i) => i.trim())
            .map((i) => i.replaceAll("x69_input", splitter))
            .filter(Boolean);
    }
    splitArgs(splitter, arr = this.arguments) {
        return arr
            .join(" ")
            .replaceAll(`\\${splitter}`, "x69_input")
            .split(splitter)
            .map((i) => i.trim())
            .map((i) => i.replaceAll("x69_input", splitter))
            .filter(Boolean);
    }
    test(reg) {
        const regex = typeof reg === "string" ? new RegExp(reg, "i") : reg;
        return regex.test(this.body);
    }
    get isAdmin() {
        const { ADMINBOT, WEB_PASSWORD } = global.Cassidy?.config ?? {};
        const webPassword = process.env.WEB_PASSWORD ?? WEB_PASSWORD;
        return (
        // @ts-ignore
        this.#__context.event.password === webPassword ||
            ADMINBOT?.includes(this.senderID));
    }
    get isModerator() {
        const { ADMINBOT, MODERATORBOT } = global.Cassidy?.config ?? {};
        return (MODERATORBOT?.includes(this.senderID) &&
            !ADMINBOT?.includes(this.senderID));
    }
    _isAdmin(uid) {
        return uid === this.senderID
            ? this.isAdmin
            : global.Cassidy?.config?.ADMINBOT?.includes(uid);
    }
    _isModerator(uid) {
        const { ADMINBOT, MODERATORBOT } = global.Cassidy?.config ?? {};
        return MODERATORBOT?.includes(uid) && !ADMINBOT?.includes(uid);
    }
    async userInfo() {
        await this.#__context.usersDB.ensureUserInfo(this.senderID);
        const data = await this.#__context.usersDB.queryItem(this.senderID, "userMeta");
        return data.userMeta;
    }
    async isThreadAdmin(uid, refresh = false) {
        try {
            if (refresh) {
                await this.#__threadsDB.saveThreadInfo(this.threadID, this.#__api);
            }
            else {
                // console.log(Reflect.ownKeys(this.#__context), new Error());
                await this.#__threadsDB.ensureThreadInfo(this.threadID, this.#__api);
            }
            const { threadInfo } = await this.#__threadsDB.getCache(this.threadID);
            return Boolean(threadInfo &&
                threadInfo.adminIDs &&
                threadInfo.adminIDs?.some((i) => i.id === uid));
        }
        catch (error) {
            console.error(error);
        }
        return false;
    }
    async updateRole() {
        if (this.isAdmin) {
            this.role = InputRoles.ADMINBOT;
        }
        else if (this.isModerator) {
            this.role = InputRoles.MODERATORBOT;
        }
        else if (await this.isThreadAdmin(this.senderID)) {
            this.role = InputRoles.ADMINBOX;
        }
        else {
            this.role = InputRoles.EVERYONE;
        }
        if (this.replier instanceof InputClass) {
            await this.replier.updateRole();
        }
    }
    attachSystemsToOutput(output) {
        const obj = this.#__context;
        const { replies } = global.Cassidy;
        const input = this;
        if (!output) {
            throw new Error("Output is missing!");
        }
        output.waitForReaction = async (body, callback) => {
            return new Promise(async (resolve, reject) => {
                const reactSystem = this.ReactSystem;
                const i = await obj.output.reply(body);
                reactSystem.set(i.messageID, {
                    // @ts-ignore
                    callback: callback ||
                        // @ts-ignore
                        (async ({ input, repObj: { resolve } }) => {
                            resolve(input);
                        }),
                    resolve,
                    reject,
                    self: i,
                    author: input.senderID,
                });
            });
        };
        obj.output.addReactionListener = async (mid, callback) => {
            return new Promise(async (resolve, reject) => {
                const reactSystem = this.ReactSystem;
                reactSystem.set(mid, {
                    // @ts-ignore
                    callback: callback ||
                        // @ts-ignore
                        (async ({ input, repObj: { resolve } }) => {
                            resolve(input);
                        }),
                    resolve,
                    reject,
                });
            });
        };
        obj.output.quickWaitReact = async (body, options = {}) => {
            if (input.isWeb || input.isPage) {
                return input;
            }
            const outcome = await output.waitForReaction(body + `\n\n𝘛𝘩𝘪𝘴 𝘮𝘦𝘴𝘴𝘢𝘨𝘦 𝘦𝘹𝘱𝘦𝘤𝘵𝘴 𝘢 𝘳𝘦𝘢𝘤𝘵𝘪𝘰𝘯.`, async ({ input, reactObj }) => {
                const { self, resolve } = reactObj;
                if (options.authorOnly &&
                    // @ts-ignore
                    input.userID !== (options.author || reactObj.author)) {
                    console.log(
                    // @ts-ignore
                    `${self.messageID} not author for ${input.userID} !== ${reactObj.author}`);
                    return;
                }
                if (options.emoji && options.emoji !== input.reaction) {
                    console.log(`${self.messageID} not emoji for ${options.emoji} !== ${input.reaction}`);
                    return;
                }
                if (options.edit) {
                    await obj.output.edit(options.edit, self.messageID);
                }
                // @ts-ignore
                input.self = self;
                resolve(input);
            });
            return outcome;
        };
        obj.output.addReplyListener = async (mid, callback) => {
            if (typeof callback !== "function") {
                callback = (ctx) => {
                    // @ts-ignore
                    return ctx.repObj.resolve(ctx);
                };
            }
            return new Promise(async (resolve, reject) => {
                this.ReplySystem.set(mid, {
                    // @ts-ignore
                    callback,
                    resolve,
                    reject,
                });
                const keys = Object.keys(replies);
                if (!keys.includes(mid)) {
                    throw new Error("Unknown Issue: " + mid);
                }
                else {
                }
            });
        };
        obj.output.waitForReply = async (body, callback) => {
            return new Promise(async (resolve, reject) => {
                const replySystem = this.ReplySystem;
                const i = await obj.output.reply({ body, referenceQ: obj.input.webQ });
                async function something(context, ...args) {
                    // console.log(`input.webQ: ${input.webQ}, new; ${context.input.webQ}`);
                    input.webQ = context.input.webQ;
                    const func = callback ||
                        (async ({ input, repObj: { resolve } }) => {
                            // @ts-ignore
                            resolve(input);
                        });
                    // @ts-ignore
                    return await func(context, ...args);
                }
                replySystem.set(i.messageID, {
                    callback: something,
                    resolve,
                    reject,
                    author: input.senderID,
                    self: i,
                });
            });
        };
    }
    hasReplyListener() {
        const { replies } = global.Cassidy;
        return this.replier && replies[this.replier.messageID];
    }
    hasReactionListener() {
        const { reacts } = global.Cassidy;
        return this.type == "message_reaction" && reacts[this.messageID];
    }
    async detectAndProcessReplies() {
        let isCancelCommand = false;
        try {
            const input = this;
            const { multiCommands } = this.#__context;
            const obj = this.#__context;
            const { replies } = global.Cassidy;
            if (this.hasReplyListener()) {
                isCancelCommand = true;
                const { repObj, commandKey, detectID, command: repCommand, } = replies[input.replier.messageID];
                const { callback } = repObj;
                let command = repCommand ??
                    (multiCommands.getOne(commandKey) ||
                        multiCommands.getOne(commandKey.toLowerCase())) ??
                    {};
                obj.repCommand = command;
                const targetFunc = callback || command?.reply;
                if (command && command.style) {
                    obj.output.setStyle(command?.style);
                }
                if (typeof targetFunc === "function") {
                    try {
                        await targetFunc({
                            ...obj,
                            repObj,
                            detectID,
                            eventData: repObj,
                            commandName: commandKey,
                            command,
                            getLang: obj.langParser.createGetLang(command?.langs),
                        });
                    }
                    catch (error) {
                        obj.output.error(error);
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
        }
        return isCancelCommand;
    }
    async detectAndProcessReactions() {
        try {
            const input = this;
            const { multiCommands } = this.#__context;
            const obj = this.#__context;
            const { reacts } = global.Cassidy;
            if (input.type == "message_reaction" && reacts[input.messageID]) {
                const { reactObj, commandKey, detectID } = reacts[input.messageID];
                const { callback } = reactObj;
                const command = multiCommands.getOne(commandKey) ||
                    multiCommands.getOne(commandKey.toLowerCase()) ||
                    {};
                obj.reactCommand = command;
                const targetFunc = callback || command.reaction;
                if (typeof targetFunc === "function") {
                    try {
                        await targetFunc({
                            ...obj,
                            reactObj,
                            detectID,
                            eventData: reactObj,
                            commandName: commandKey,
                            command,
                        });
                    }
                    catch (error) {
                        obj.output.error(error);
                    }
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    is(...args) {
        if (args.length === 0) {
            return this.type;
        }
        return args.includes(this.type);
    }
    hasWordOR(...words) {
        if (!this.isMessage()) {
            return false;
        }
        return words.some((word) => this.body.includes(word));
    }
    get has() {
        return this.hasOR;
    }
    get hasWord() {
        return this.hasWordOR;
    }
    isMessage() {
        return this.is("message", "message_reply");
    }
    hasOR(...chars) {
        if (!this.isMessage()) {
            return false;
        }
        return chars.some((char) => this.body.includes(char));
    }
    hasWordAND(...words) {
        if (!this.isMessage()) {
            return false;
        }
        return words.every((word) => this.body.includes(word));
    }
    hasAND(...chars) {
        if (!this.isMessage()) {
            return false;
        }
        return chars.every((char) => this.body.includes(char));
    }
    starts(...chars) {
        if (!this.isMessage()) {
            return false;
        }
        return chars.some((char) => this.body.startsWith(char));
    }
    ends(...chars) {
        if (!this.isMessage()) {
            return false;
        }
        return chars.some((char) => this.body.endsWith(char));
    }
    equal(...strs) {
        if (!this.isMessage()) {
            return false;
        }
        return strs.some((i) => i === this.body);
    }
    lower() {
        if (!this.isMessage()) {
            return this.clone();
        }
        return new InputClass({
            ...this.#__context,
            event: {
                ...this.#__context.event,
                body: String(this.#__context.event.body).toLowerCase(),
            },
        });
    }
    clone() {
        return new InputClass(this.#__context);
    }
    hasRole(role) {
        const specials = [InputRoles.VIP];
        if (specials.includes(role) || specials.includes(this.role)) {
            return this.role === role;
        }
        return this.role >= role;
    }
    toJSON() {
        let ignored = ["ReplySystem", "ReactSystem"];
        return Object.fromEntries(Object.entries(this)
            .filter((i) => typeof i[1] !== "function" && isNaN(Number(i[0])))
            .filter((i) => !ignored.includes(i[0])));
    }
    [node_util_1.inspect.custom]() {
        return (0, node_util_1.inspect)(this.toJSON(), {
            depth: 1,
        });
    }
    [Symbol.toStringTag]() {
        return InputClass.name;
    }
    getProperty(key) {
        return this[key];
    }
    hasProperty(key) {
        return Object.hasOwn(this, key);
    }
    isProperty(...args) {
        if (args.length === 1) {
            return this.hasProperty(args[0]);
        }
        return this[args[0]] === args[1];
    }
}
exports.InputClass = InputClass;
exports.default = InputClass;
