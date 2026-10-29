"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = exports.PagePayload = void 0;
const type_validator_1 = require("./type-validator");
const unisym_1 = require("./unisym");
class PagePayload {
    buttons;
    payloadTitle;
    payloadType = "template";
    genericPayload;
    constructor(buttonOrButtons, ...tail) {
        if (buttonOrButtons) {
            if (!Array.isArray(buttonOrButtons)) {
                this.buttons = [buttonOrButtons];
            }
            else {
                this.buttons = [...buttonOrButtons];
            }
        }
        else {
            this.buttons = [];
        }
        if (tail.length > 0) {
            this.buttons.push(...tail);
        }
        this.payloadTitle = "";
        this.buttons = this.buttons
            .filter(Boolean)
            .map((i) => {
            // @ts-ignore
            PagePayload.validator.validate(i);
            return i;
        })
            .map((i) => PagePayload.ButtonItem(i, this.payloadType));
    }
    static ButtonItem(item, payloadType = "template") {
        item ??= {};
        let a = {
            type: String(item.key ?? payloadType),
            url: String(item.url).startsWith("http")
                ? String(item.url)
                : "http://" + String(item.url),
            title: String(item.title ?? ""),
        };
        return a;
    }
    static GenericPayload(item) {
        let a = {
            ...item,
            is_reusable: true,
            url: String(item.url ?? "") || undefined,
        };
        return a;
    }
    button(urlTitle, title, customType) {
        if (typeof urlTitle === "number") {
            return this.buttons.at(urlTitle);
        }
        if (!urlTitle && !title && !customType) {
            return this.buttons;
        }
        const item = {
            type: customType ?? PagePayload.key,
            url: urlTitle,
            title: title ?? urlTitle,
        };
        PagePayload.validator.validate(item);
        this.buttons.push(item);
        return this;
    }
    audio(url) {
        if (!url) {
            return this.genericPayload?.url;
        }
        this.type("audio");
        this.genericPayload = PagePayload.GenericPayload({
            url,
            is_reusable: true,
        });
    }
    image(url) {
        if (!url) {
            return this.genericPayload?.url;
        }
        this.type("image");
        this.genericPayload = PagePayload.GenericPayload({
            url,
            is_reusable: true,
        });
    }
    video(url) {
        if (!url) {
            return this.genericPayload?.url;
        }
        this.type("video");
        this.genericPayload = PagePayload.GenericPayload({
            url,
            is_reusable: true,
        });
    }
    type(type) {
        if (!type) {
            return this.payloadType;
        }
        this.payloadType = String(type);
        return this;
    }
    buildPayload() {
        return {
            attachment: {
                type: this.payloadType,
                ...(this.payloadTitle ? { title: this.payloadTitle } : {}),
                ...(this.buttons.length > 0
                    ? {
                        buttons: [
                            ...this.buttons.map((i) => PagePayload.ButtonItem(i, this.payloadType)),
                        ],
                    }
                    : {}),
                ...(this.genericPayload
                    ? {
                        payload: PagePayload.GenericPayload(this.genericPayload),
                    }
                    : {}),
            },
        };
    }
    [Symbol.toStringTag] = PagePayload.name;
    static fromPayload(payload) {
        const inst = new PagePayload();
        inst.title(payload.title);
        payload.buttons.forEach((i) => inst.button(i.url, i.title));
        return inst;
    }
    toString(raw = false) {
        return `${this.title()}\n\n${!raw
            ? `${unisym_1.UNISpectra.standardLine}\n${this.button().map((i) => `**${i.title}** [${i.url}]`)}`
            : `\n\n${this.button().map((i) => `${i.title} [${i.url}]`)}`}`;
    }
    get payload() {
        return this.buildPayload();
    }
    title(title) {
        if (!title) {
            return this.payloadTitle;
        }
        this.payloadTitle = String(title);
        return this;
    }
    sendBy(output, isReply = true) {
        const payload = this.buildPayload();
        if (isReply && "reply" in output && typeof output.reply === "function") {
            return output.reply(payload);
        }
        else if ("send" in output && typeof output.send === "function") {
            return output.send(payload);
        }
        if (typeof output === "function") {
            return output(payload);
        }
        throw new TypeError("Invalid OutputLike Object, it must have a reply or send method or a function");
    }
}
exports.PagePayload = PagePayload;
exports.Button = PagePayload;
(function (PagePayload) {
    PagePayload.key = "web_url";
    PagePayload.validator = new type_validator_1.CassTypes.Validator({
        type: "string",
        url: "string",
        title: "string",
    });
    function isPageButton(attachment) {
        return "type" in (attachment ?? {});
    }
    PagePayload.isPageButton = isPageButton;
})(PagePayload || (exports.Button = exports.PagePayload = PagePayload = {}));
