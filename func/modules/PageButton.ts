import { CassTypes } from "./type-validator";
import { UNISpectra } from "./unisym";

export class PagePayload {
  private buttons: PagePayload.ButtonItem[];
  private payloadTitle: string;
  private payloadType: string = "template";
  private genericPayload: PagePayload.GenericPayload;

  constructor(buttons: PagePayload.ButtonItem[]);

  constructor(button: PagePayload.ButtonItem);

  constructor(...buttons: PagePayload.ButtonItem[]);

  constructor(
    buttonOrButtons?:
      | PagePayload.ButtonItem[]
      | PagePayload.ButtonItem
      | undefined,
    ...tail: (PagePayload.ButtonItem | undefined)[]
  ) {
    if (buttonOrButtons) {
      if (!Array.isArray(buttonOrButtons)) {
        this.buttons = [buttonOrButtons];
      } else {
        this.buttons = [...buttonOrButtons];
      }
    } else {
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

  static ButtonItem(
    item: any,
    payloadType = "template"
  ): PagePayload.ButtonItem {
    item ??= {};
    let a: PagePayload.ButtonItem = {
      type: String(item.key ?? payloadType),
      url: String(item.url).startsWith("http")
        ? String(item.url)
        : "http://" + String(item.url),
      title: String(item.title ?? ""),
    };

    return a;
  }

  static GenericPayload(item: any): PagePayload.GenericPayload {
    let a: PagePayload.GenericPayload = {
      ...item,
      is_reusable: true,
      url: String(item.url ?? "") || undefined,
    };
    return a;
  }

  button(): PagePayload.ButtonItem[];

  button(at: number): PagePayload.ButtonItem;

  button(urlTitle: PagePayload.ButtonItem["url"]): this;

  button(
    url: PagePayload.ButtonItem["url"],
    title: PagePayload.ButtonItem["title"]
  ): this;

  button(
    url: PagePayload.ButtonItem["url"],
    title: PagePayload.ButtonItem["title"],
    customType: PagePayload.ButtonItem["type"]
  ): this;

  button(
    urlTitle?: PagePayload.ButtonItem["url"] | number,
    title?: PagePayload.ButtonItem["title"],
    customType?: PagePayload.ButtonItem["type"]
  ) {
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

  audio(): string | undefined;

  audio(url?: string) {
    if (!url) {
      return this.genericPayload?.url;
    }
    this.type("audio");
    this.genericPayload = PagePayload.GenericPayload({
      url,
      is_reusable: true,
    });
  }

  image(): string | undefined;

  image(url?: string) {
    if (!url) {
      return this.genericPayload?.url;
    }
    this.type("image");
    this.genericPayload = PagePayload.GenericPayload({
      url,
      is_reusable: true,
    });
  }

  video(): string | undefined;

  video(url?: string) {
    if (!url) {
      return this.genericPayload?.url;
    }
    this.type("video");
    this.genericPayload = PagePayload.GenericPayload({
      url,
      is_reusable: true,
    });
  }

  type(): string;

  type(type: string): this;

  type(type?: string) {
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
                ...this.buttons.map((i) =>
                  PagePayload.ButtonItem(i, this.payloadType)
                ),
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

  static fromPayload(
    payload: ReturnType<PagePayload["buildPayload"]>["attachment"]
  ) {
    const inst = new PagePayload();
    inst.title(payload.title);
    payload.buttons.forEach((i) => inst.button(i.url, i.title));
    return inst;
  }

  toString(): string;

  toString(raw: boolean = false) {
    return `${this.title()}\n\n${
      !raw
        ? `${UNISpectra.standardLine}\n${this.button().map(
            (i) => `**${i.title}** [${i.url}]`
          )}`
        : `\n\n${this.button().map((i) => `${i.title} [${i.url}]`)}`
    }`;
  }

  get payload() {
    return this.buildPayload();
  }

  title(): string;

  title(title: string): this;

  title(title?: string) {
    if (!title) {
      return this.payloadTitle;
    }
    this.payloadTitle = String(title);
    return this;
  }

  sendBy(output: PagePayload.OutputLike, isReply: boolean = true) {
    const payload = this.buildPayload();

    if (isReply && "reply" in output && typeof output.reply === "function") {
      return output.reply(payload);
    } else if ("send" in output && typeof output.send === "function") {
      return output.send(payload);
    }
    if (typeof output === "function") {
      return output(payload);
    }
    throw new TypeError(
      "Invalid OutputLike Object, it must have a reply or send method or a function"
    );
  }
}

export namespace PagePayload {
  export type OutputLike =
    | ((form: { attachment: any; [key: string]: any }) => any | Promise<any>)
    | {
        reply?: (form: {
          attachment: any;
          [key: string]: any;
        }) => any | Promise<any>;
        send?: (form: {
          attachment: any;
          [key: string]: any;
        }) => any | Promise<any>;
      };

  export const key = "web_url";
  export const validator = new CassTypes.Validator({
    type: "string",
    url: "string",
    title: "string",
  });

  export function isPageButton(
    attachment: any
  ): attachment is ReturnType<PagePayload["buildPayload"]> {
    return "type" in (attachment ?? {});
  }

  export type ValidatorT = CassTypes.FromValidator<typeof validator>;

  export interface ButtonItem {
    type: string;
    url: string;
    title?: string;
    is_reusable?: boolean;
  }

  export interface GenericPayload {
    url?: string;
    is_reusable?: boolean;
    [key: string]: any;
  }
}

export { PagePayload as Button };
