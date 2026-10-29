export namespace CassMenu {
  /**
   * A subcommand option function signature
   */
  export interface Option {
    (ctx: CassInteract.Ctx, extra: ExtraData): Promise<void>;
  }
  /**
   * A subcommand metadata for listing it.
   */
  export interface Meta {
    args?: (`<${string}>` | `[${string}]`)[];
    description?: string;
    emoji?: string;
    aliases?: string[];
  }

  /**
   * Extra manipulation context.
   */
  export interface ExtraData {
    /**
     * Returns the current subcommand.
     */
    subcommand: string;
    /**
     * Returns a properly sliced arguments (excluding command and subcommand).
     */
    args: string[];
    /**
     * Uses the default behavior when no subcommand provided or wrong subcommand. Useful if you want to quick validate args without custom response.
     */
    showMenu(): Promise<void>;

    /**
     * Reference instance.
     */
    menu: CassMenu;
  }

  export type OptionMap = Map<string, Option>;
  export type MetaMap = Map<string, Meta>;
}

export type IteratedToArray<T> = T extends Iterable<infer U> ? U[] : never;

export class CassMenu implements CassInteract.Contextual {
  /**
   * All option callbacks/handlers for a subcommand
   */
  #options: CassMenu.OptionMap;

  /**
   * All option metadata for a subcommand.
   */
  #meta: CassMenu.MetaMap;

  *[Symbol.iterator]() {
    yield* this.#options;
  }

  /**
   * Creates a quicker instance with existing options.
   * @param options Existing handler data (excluding meta)
   */
  constructor(options?: IteratedToArray<CassMenu>);

  /**
   * A clean constructor with no existing data.
   */
  constructor();

  constructor(options?: IteratedToArray<CassMenu>) {
    this.#options = new Map();
    this.#meta = new Map();

    if (Array.isArray(options)) {
      for (const [key, value] of options) {
        this.option(key, value);
      }
    }
  }

  /**
   * Not recommended to be used directly. Please refer to Ctx.runContextual(Contextual);
   * @private
   */
  async runInContext(ctx: CassInteract.Ctx): Promise<void> {
    try {
      const { output, input, cancelCooldown, command, prefix, commandName } =
        ctx;
      output.setStyle(command.style);
      const [subcommand, ...menuArgs] = input.arguments;
      const extra: CassMenu.ExtraData = {
        subcommand,
        args: menuArgs,
        showMenu,
        menu: this,
      };
      const menu = this;
      async function showMenu() {
        cancelCooldown?.();
        const e = [...menu.#meta.entries()];
        let hasSomeEmoji = e.some((i) => i[1]?.emoji);
        const mapped = e.map(([subcommand, meta]) => {
          return `${
            hasSomeEmoji ? `${meta.emoji ?? "✨"} ` : ""
          }${prefix}${commandName} **${subcommand}**${
            meta.description ? ` - ${meta.description}` : ""
          }`;
        });
        await output.reply(`${mapped.join("\n")}`);
      }
      const found = this.option(subcommand);
      if (!subcommand || !found) {
        await extra.showMenu();
        return;
      }
      await found(ctx, extra);
    } catch (error) {
      await ctx.output.error(error);
    }
  }

  /**
   * Resolves meta and option callback using an alias
   */
  protected resolveAliased(alias: string): {
    option: CassMenu.Option;
    meta: CassMenu.Meta;
  } | null {
    const directOption = this.#options.get(alias);
    if (directOption) {
      const meta = this.#meta.get(alias) ?? {};
      return { option: directOption, meta };
    }

    for (const [subcommand, meta] of this.#meta.entries()) {
      if (meta.aliases?.includes(alias)) {
        const option = this.#options.get(subcommand);
        if (option) {
          return { option, meta };
        }
      }
    }

    return null;
  }

  /**
   * Resolves the option callback using an alias
   */
  protected resolveAliasedOpt(alias: string): CassMenu.Option | null {
    const directOption = this.#options.get(alias);
    if (directOption) return directOption;

    for (const [subcommand, meta] of this.#meta.entries()) {
      if (meta.aliases?.includes(alias)) {
        return this.#options.get(subcommand) ?? null;
      }
    }

    return null;
  }

  /**
   * Resolves meta using an alias
   */
  protected resolveAliasedMeta(alias: string): CassMenu.Meta | null {
    const directMeta = this.#meta.get(alias);
    if (directMeta) return directMeta;

    for (const [, meta] of this.#meta.entries()) {
      if (meta.aliases?.includes(alias)) {
        return meta;
      }
    }

    return null;
  }

  /**
   * Set an option using a subcommand.
   * @param subcommand the subcommand
   * @param callback the handler for the subcommand.
   */
  option(subcommand: string, callback: CassMenu.Option): CassMenu;

  /**
   * Resolves an option using a subcommand.
   * @param subcommand the subcommand
   */
  option(subcommand: string): CassMenu.Option;

  /**
   * Resolves the unmutable option map (each option entry is still mutable)
   */
  option(): CassMenu.OptionMap;

  option(
    ...args: [string?, CassMenu.Option?]
  ): CassMenu | CassMenu.OptionMap | CassMenu.Option {
    if (args.length === 0 || !args[0]) {
      return new Map(this.#options);
    }
    if (args.length === 1) {
      return this.resolveAliasedOpt(args[0]);
    }
    const [subcommand, callback] = args;
    this.#options.set(subcommand, callback);
    return this;
  }

  /**
   * Sets an important but optional metadata for an option.
   * @param subcommand the subcommand.
   * @param meta the object metadata contaning emoji, desc, etc.
   */
  meta(subcommand: string, meta: CassMenu.Meta): CassMenu;

  /**
   * Resolves a mutable metadata object (only if it exists.)
   * @param subcommand the subcommand.
   */
  meta(subcommand: string): CassMenu.Meta;

  /**
   * Resolves an unmutable map of metadata (but each metadata entry is mutable)
   */
  meta(): CassMenu.MetaMap;

  meta(
    ...args: [string?, CassMenu.Meta?]
  ): CassMenu | CassMenu.MetaMap | CassMenu.Meta {
    if (args.length === 0 || !args[0]) {
      return new Map(this.#meta);
    }
    if (args.length === 1) {
      return this.resolveAliasedMeta(args[0]);
    }
    const [subcommand, metadata] = args;
    this.#meta.set(subcommand, metadata);
    return this;
  }

  /**
   * Modifies the metadata description.
   */
  description(subcommand: string, desc: CassMenu.Meta["description"]): CassMenu;

  /**
   * Resolves the metadata description.
   */
  description(subcommand: string): CassMenu.Meta["description"];

  description(
    subcommand: string,
    desc?: CassMenu.Meta["description"]
  ): CassMenu.Meta["description"] | CassMenu {
    if (typeof desc === "string") {
      const meta = this.resolveAliasedMeta(subcommand) ?? {};
      meta.description = desc;
      this.#meta.set(subcommand, meta);
      return this;
    }
    const meta = this.resolveAliasedMeta(subcommand) ?? {};
    return meta.description ?? null;
  }

  /**
   * Modifies the metadata emoji.
   */
  emoji(subcommand: string, emoji: CassMenu.Meta["emoji"]): CassMenu;

  /**
   * Resolves the metadata emoji.
   */
  emoji(subcommand: string): CassMenu.Meta["emoji"];

  emoji(
    subcommand: string,
    emoji?: CassMenu.Meta["emoji"]
  ): CassMenu.Meta["emoji"] | CassMenu {
    if (typeof emoji === "string") {
      const meta = this.resolveAliasedMeta(subcommand) ?? {};
      meta.emoji = emoji;
      this.#meta.set(subcommand, meta);
      return this;
    }
    const meta = this.resolveAliasedMeta(subcommand) ?? {};
    return meta.emoji ?? null;
  }

  /**
   * Modifies the metadata args.
   */
  args(subcommand: string, args: CassMenu.Meta["args"]): CassMenu;

  /**
   * Resolves the metadata args.
   */
  args(subcommand: string): CassMenu.Meta["args"];

  args(
    subcommand: string,
    args?: CassMenu.Meta["args"]
  ): CassMenu.Meta["args"] | CassMenu {
    if (Array.isArray(args)) {
      const meta = this.resolveAliasedMeta(subcommand) ?? {};
      meta.args = args;
      this.#meta.set(subcommand, meta);
      return this;
    }
    const meta = this.resolveAliasedMeta(subcommand) ?? {};
    return meta.args ?? null;
  }
  /**
   * Modifies the metadata aliases.
   */
  aliases(subcommand: string, aliases: CassMenu.Meta["aliases"]): CassMenu;

  /**
   * Resolves the metadata aliases.
   */
  aliases(subcommand: string): CassMenu.Meta["aliases"];

  aliases(
    subcommand: string,
    aliases?: CassMenu.Meta["aliases"]
  ): CassMenu.Meta["aliases"] | CassMenu {
    if (Array.isArray(aliases)) {
      const meta = this.resolveAliasedMeta(subcommand) ?? {};
      meta.aliases = aliases;
      this.#meta.set(subcommand, meta);
      return this;
    }
    const meta = this.resolveAliasedMeta(subcommand) ?? {};
    return meta.aliases ?? null;
  }
}

export namespace CassInteract {
  export import Menu = CassMenu;
  export type Ctx = globalThis.CommandContext;

  export interface Contextual {
    runInContext(ctx: Ctx): Promise<void>;
  }
}
