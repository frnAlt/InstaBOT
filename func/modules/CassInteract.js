"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CassInteract = exports.CassMenu = void 0;
class CassMenu {
    /**
     * All option callbacks/handlers for a subcommand
     */
    #options;
    /**
     * All option metadata for a subcommand.
     */
    #meta;
    *[Symbol.iterator]() {
        yield* this.#options;
    }
    constructor(options) {
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
    async runInContext(ctx) {
        try {
            const { output, input, cancelCooldown, command, prefix, commandName } = ctx;
            output.setStyle(command.style);
            const [subcommand, ...menuArgs] = input.arguments;
            const extra = {
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
                    return `${hasSomeEmoji ? `${meta.emoji ?? "✨"} ` : ""}${prefix}${commandName} **${subcommand}**${meta.description ? ` - ${meta.description}` : ""}`;
                });
                await output.reply(`${mapped.join("\n")}`);
            }
            const found = this.option(subcommand);
            if (!subcommand || !found) {
                await extra.showMenu();
                return;
            }
            await found(ctx, extra);
        }
        catch (error) {
            await ctx.output.error(error);
        }
    }
    /**
     * Resolves meta and option callback using an alias
     */
    resolveAliased(alias) {
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
    resolveAliasedOpt(alias) {
        const directOption = this.#options.get(alias);
        if (directOption)
            return directOption;
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
    resolveAliasedMeta(alias) {
        const directMeta = this.#meta.get(alias);
        if (directMeta)
            return directMeta;
        for (const [, meta] of this.#meta.entries()) {
            if (meta.aliases?.includes(alias)) {
                return meta;
            }
        }
        return null;
    }
    option(...args) {
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
    meta(...args) {
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
    description(subcommand, desc) {
        if (typeof desc === "string") {
            const meta = this.resolveAliasedMeta(subcommand) ?? {};
            meta.description = desc;
            this.#meta.set(subcommand, meta);
            return this;
        }
        const meta = this.resolveAliasedMeta(subcommand) ?? {};
        return meta.description ?? null;
    }
    emoji(subcommand, emoji) {
        if (typeof emoji === "string") {
            const meta = this.resolveAliasedMeta(subcommand) ?? {};
            meta.emoji = emoji;
            this.#meta.set(subcommand, meta);
            return this;
        }
        const meta = this.resolveAliasedMeta(subcommand) ?? {};
        return meta.emoji ?? null;
    }
    args(subcommand, args) {
        if (Array.isArray(args)) {
            const meta = this.resolveAliasedMeta(subcommand) ?? {};
            meta.args = args;
            this.#meta.set(subcommand, meta);
            return this;
        }
        const meta = this.resolveAliasedMeta(subcommand) ?? {};
        return meta.args ?? null;
    }
    aliases(subcommand, aliases) {
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
exports.CassMenu = CassMenu;
var CassInteract;
(function (CassInteract) {
    CassInteract.Menu = CassMenu;
})(CassInteract || (exports.CassInteract = CassInteract = {}));
