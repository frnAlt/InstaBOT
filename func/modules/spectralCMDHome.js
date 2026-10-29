"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpectralCMDHome = exports.CassCheckly = void 0;
const unispectra_1 = require("@cass/unispectra");
class CassCheckly {
    rules;
    constructor(rules) {
        this.rules = rules.map((rule) => ({ name: `arg${rule.index}`, ...rule }));
    }
    extractValue(value, type) {
        switch (type) {
            case "number":
                return Number(value);
            case "boolean":
                return /^(true|1|yes)$/i.test(value);
            case "array":
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            case "object":
                try {
                    return JSON.parse(value);
                }
                catch {
                    return value;
                }
            default:
                return value;
        }
    }
    validateArgs(args) {
        const errors = [];
        for (const rule of this.rules) {
            const value = args[rule.index];
            const displayName = rule.name || `arg${rule.index}`;
            if (rule.required && !value) {
                errors.push(`**${displayName}** is required`);
                continue;
            }
            if (!value)
                continue;
            const parsedValue = this.extractValue(value, rule.type);
            let isValid = true;
            switch (rule.type) {
                case "number":
                    isValid =
                        !isNaN(parsedValue) && (!rule.regex || rule.regex.test(value));
                    if (!isValid)
                        errors.push(`**${displayName}** must be a number`);
                    break;
                case "boolean":
                    isValid =
                        /^(true|false|1|0|yes|no)$/i.test(value) &&
                            (!rule.regex || rule.regex.test(value));
                    if (!isValid)
                        errors.push(`**${displayName}** must be true/false`);
                    break;
                case "array":
                    isValid =
                        Array.isArray(parsedValue) &&
                            (!rule.regex ||
                                parsedValue.every((v) => rule.regex.test(String(v))));
                    if (!isValid)
                        errors.push(`**${displayName}** must be an array`);
                    break;
                case "object":
                    isValid =
                        typeof parsedValue === "object" &&
                            !Array.isArray(parsedValue) &&
                            (!rule.regex || rule.regex.test(value));
                    if (!isValid)
                        errors.push(`**${displayName}** must be an object`);
                    break;
                case "string":
                    isValid = rule.regex ? rule.regex.test(value) : true;
                    if (!isValid)
                        errors.push(`**${displayName}** doesn’t match pattern`);
                    break;
            }
            if (!isValid)
                continue;
            if (rule.type === "number") {
                if (rule.min !== undefined && parsedValue < rule.min)
                    errors.push(`**${displayName}** too small (min: ${rule.min})`);
                if (rule.max !== undefined && parsedValue > rule.max)
                    errors.push(`**${displayName}** too big (max: ${rule.max})`);
            }
            if (rule.type === "string") {
                if (rule.min !== undefined && value.length < rule.min)
                    errors.push(`**${displayName}** too short (min: ${rule.min})`);
                if (rule.max !== undefined && value.length > rule.max)
                    errors.push(`**${displayName}** too long (max: ${rule.max})`);
            }
            if (rule.custom) {
                const result = rule.custom(value);
                if (typeof result === "string")
                    errors.push(`**${displayName}** ${result}`);
                else if (result === false)
                    errors.push(`**${displayName}** invalid`);
            }
        }
        return { valid: errors.length === 0, errors };
    }
}
exports.CassCheckly = CassCheckly;
class SpectralCMDHome {
    configs;
    options;
    cooldowns;
    static updateMetaUsage(config, meta) {
        meta.usage = `{prefix}${meta.name} [${config.map((i) => i.key).join("/")}]`;
    }
    constructor({ home, isHypen = false, argIndex = 0, setup = () => { }, entryConfig, entryInfo, defaultKey = null, globalCooldown = 1, errorHandler, validator, defaultCategory = "General", allowDefaultOnCooldown = false, showDescription = false, }, configs) {
        if (entryConfig) {
            // @ts-ignore
            configs = Object.entries(entryConfig).map(([key, handler]) => ({
                key,
                handler,
                icon: "✨",
                category: defaultCategory,
                ...(entryInfo?.[key] ?? {}),
            }));
            isHypen = true;
            argIndex = 0;
        }
        this.configs = configs || [];
        if (!this.configs.some((i) => i.key === "help")) {
            this.addHelpCommand();
        }
        this.configs = this.configs.map((i) => {
            i.handler = i.handler.bind(i);
            return i;
        });
        this.options = {
            home: this.configs.find((i) => i.key === defaultKey)?.handler ??
                home?.bind(undefined) ??
                this.defaultHome?.bind(null),
            isHypen,
            argIndex,
            setup,
            globalCooldown,
            errorHandler,
            validator,
            defaultCategory,
            defaultKey,
            allowDefaultOnCooldown,
            showDescription,
        };
        this.cooldowns = new Map();
    }
    addHelpCommand() {
        this.configs.unshift({
            key: "help",
            handler: this.helpHandler.bind(this),
            description: "Shows commands",
            icon: "📖",
            category: "Utility",
            usage: "help [command] [page]",
        });
    }
    async defaultHome(ctx, extra) {
        await ctx.output.reply(`${extra.cooldown ? `🕒 Oops, **Cooling Down**!\n\n` : ""}${unispectra_1.UNIRedux.arrow} 🔎 ***All Options***\n\n` +
            extra.itemList +
            `\n\nUse **${ctx.prefix}${ctx.commandName}${extra.self.options.isHypen ? "-" : " "}help** for description/aliases.`);
    }
    async helpHandler(ctx, { spectralArgs }) {
        const filter = spectralArgs[0]?.toLowerCase();
        const page = Math.max(1, Number(spectralArgs[0]) || 1);
        const perPage = 5;
        const visibleCommands = this.configs.filter((c) => !c.hidden);
        let commandsToShow = visibleCommands;
        if (isNaN(page) && filter) {
            const command = this.getCommand(filter);
            if (command) {
                return ctx.output.reply(this.createDetailedHelp(command, ctx.commandName, ctx.prefix));
            }
        }
        const totalPages = Math.ceil(visibleCommands.length / perPage);
        const start = (page - 1) * perPage;
        const end = start + perPage;
        const paginated = commandsToShow.slice(start, end);
        const detailedList = paginated
            .map((command) => this.createDetailedHelp(command, ctx.commandName, ctx.prefix))
            .join("\n\n");
        const output = [
            `${unispectra_1.UNIRedux.arrow} ***Commands (Page ${page}/${totalPages})***\n\n`,
            detailedList,
            "\n",
            unispectra_1.UNIRedux.standardLine,
            `Page **${page}/${totalPages}** - Use **${ctx.prefix}${ctx.commandName}${this.options.isHypen ? "-" : " "}help [command|page]** ${unispectra_1.UNIRedux.charm}`,
        ].join("\n");
        return ctx.output.reply(output);
    }
    async runInContext(ctx) {
        const { input, output } = ctx;
        ctx.cancelCooldown?.();
        const key = (this.options.isHypen && "propertyArray" in input
            ? input.propertyArray[this.options.argIndex]
            : input.arguments[this.options.argIndex] || "") || "";
        const targets = this.findTargets(key);
        const spectralArgs = this.options.isHypen
            ? ctx.args
            : ctx.args.slice(this.options.argIndex + 1);
        const self = this;
        const extraCTX = {
            targets,
            key,
            self: this,
            itemList: this.createHomeLists(this.configs, ctx),
            spectralArgs,
            async execOther({ key, spectralArgsNew, io }) {
                const firstTarget = self.findTargets(key)[0];
                if (firstTarget) {
                    return firstTarget.handler({
                        ...ctx,
                        output: io.output,
                        input: io.input,
                    }, {
                        ...extraCTX,
                        spectralArgs: spectralArgsNew,
                        key,
                        targets: [firstTarget],
                    });
                }
                else {
                    throw new Error("Missing target.");
                }
            },
            cancelCooldown: () => {
                const userId = ctx.input.senderID;
                const userCooldowns = this.cooldowns.get(userId);
                if (userCooldowns) {
                    userCooldowns.delete(key);
                    if (userCooldowns.size === 0) {
                        this.cooldowns.delete(userId);
                    }
                }
            },
            useDefault: async () => {
                await this.options.home.call(this.getCommand(this.options.defaultKey), ctx, {
                    ...extraCTX,
                    spectralArgs: ctx.args.slice(0),
                });
            },
        };
        if (!this.checkCooldown(ctx, key)) {
            // return output.reply(
            //   `⏳ Wait a bit for ${
            //     this.getCooldown(ctx, key) / 1000
            //   }s before using this subcommand again.`
            // );
            const h = this.options.allowDefaultOnCooldown
                ? this.options.home
                : this.defaultHome;
            return await h.call(undefined, ctx, {
                ...extraCTX,
                cooldown: this.getCooldown(ctx, key) / 1000,
            });
        }
        try {
            await this.options.setup.call(undefined, ctx, extraCTX);
            if (this.options.validator) {
                const validation = this.options.validator.validateArgs(spectralArgs);
                if (!validation.valid) {
                    return output.reply(`❌ Oops!\n${validation.errors.join("\n")}${unispectra_1.UNIRedux.charm}`);
                }
            }
            if (targets.length > 0) {
                for (const target of targets) {
                    if (target.isAdmin && !input.isAdmin) {
                        return output.reply(`❌ Admin only ${unispectra_1.UNIRedux.charm}`);
                    }
                    const validator = target.validator instanceof CassCheckly
                        ? target.validator
                        : target.validator
                            ? new CassCheckly(target.validator)
                            : null;
                    if (validator) {
                        const validation = validator.validateArgs(spectralArgs);
                        if (!validation.valid) {
                            return output.reply(`❌ Bad args:\n${validation.errors.join("\n")}${unispectra_1.UNIRedux.charm}`);
                        }
                    }
                    await target.handler(ctx, extraCTX);
                    this.setCooldown(ctx, target.key, target.cooldown);
                }
            }
            else {
                await this.options.home.call(this.getCommand(this.options.defaultKey), ctx, {
                    ...extraCTX,
                    spectralArgs: ctx.args.slice(0),
                });
            }
        }
        catch (error) {
            this.handleError(error, ctx);
        }
    }
    findTargets(key) {
        return this.configs.filter((config) => {
            const lowerKey = String(key).toLowerCase();
            return (config.key.toLowerCase() === lowerKey ||
                config.aliases?.some((alias) => alias.toLowerCase() === lowerKey ||
                    alias.replace("-", "").toLowerCase() ===
                        lowerKey.replace("-", "").toLowerCase()));
        });
    }
    checkCooldown(ctx, key) {
        return -this.getCooldown(ctx, key) >= 0;
    }
    getCooldown(ctx, key) {
        const userId = ctx.input.senderID;
        const userCooldowns = this.cooldowns.get(userId) || new Map();
        const now = Date.now();
        const cooldownTime = userCooldowns.get(key) || Date.now();
        return -(now - cooldownTime);
    }
    // now = cooldownTime
    // now - cooldownTime = 0;
    setCooldown(ctx, key, customCooldown) {
        const userId = ctx.input.senderID;
        const cooldown = (customCooldown ||
            this.options.globalCooldown ||
            ctx.multiCommands.getOne(ctx.commandName)?.meta?.waitingTime ||
            0) * 1000;
        if (cooldown > 0) {
            const userCooldowns = this.cooldowns.get(userId) || new Map();
            userCooldowns.set(key, Date.now() + cooldown);
            this.cooldowns.set(userId, userCooldowns);
        }
    }
    handleError(error, ctx) {
        console.error("Error:", error);
        if (this.options.errorHandler) {
            this.options.errorHandler(error, ctx);
        }
        else {
            ctx.output.error(error);
        }
    }
    createItemList(config, commandName, prefix) {
        return `${unispectra_1.UNIRedux.arrow} ${config.icon || "✨"} ${prefix}${commandName}${this.options.isHypen ? "-" : " "}**${config.key}** `;
    }
    createDetailedHelp(config, commandName, prefix) {
        return [
            `${config.icon || "✨"} **${prefix}${commandName}${this.options.isHypen ? "-" : " "}${config.key}**`,
            config.args ? `[${config.args.join(" ")}]` : "",
            config.isAdmin ? "[Admin]" : "",
            config.description ? `\n${unispectra_1.UNIRedux.charm} ${config.description}` : "",
            config.usage ? `\nUse: **${config.usage}**` : "",
            config.aliases?.length
                ? `\nAliases: **${config.aliases.join(", ")}**`
                : "",
            config.cooldown
                ? `\nWait: **${config.cooldown ||
                    this.options.globalCooldown ||
                    "(Depends on command)"}s**`
                : "",
            config.category ? `\nCategory: **${config.category}**` : "",
            config.permissions?.length
                ? `\nNeeds: **${config.permissions.join(", ")}**`
                : "",
        ]
            .filter(Boolean)
            .join(" ");
    }
    createHomeLists(configs, ctx) {
        return configs
            .filter((c) => !c.hidden && (ctx.input.isAdmin || !c.isAdmin))
            .map((c) => `${c.icon || "✨"} ${ctx.prefix}${!this.checkCooldown(ctx, c.key)
            ? `***${ctx.commandName}***`
            : ctx.commandName}${this.options.isHypen ? "-" : " "}${!this.checkCooldown(ctx, c.key) ? `***${c.key}***` : `**${c.key}**`} ${this.checkCooldown(ctx, c.key)
            ? ""
            : ` (⏳ **${this.getCooldown(ctx, c.key) / 1000}s**)`}${(c.args ?? []).join(" ")}${this.options.showDescription && c.description
            ? `\n    ${unispectra_1.UNIRedux.arrowFromT} ${c.description}\n`
            : ""}`)
            .join("\n");
    }
    createItemLists(configs, commandName, prefix) {
        return configs
            .map((config) => this.createItemList(config, commandName, prefix))
            .join("\n");
    }
    addCommand(config) {
        this.configs.push({ category: this.options.defaultCategory, ...config });
    }
    getCommand(key) {
        return this.configs.find((c) => String(c.key).toLowerCase() === String(key).toLowerCase());
    }
}
exports.SpectralCMDHome = SpectralCMDHome;
