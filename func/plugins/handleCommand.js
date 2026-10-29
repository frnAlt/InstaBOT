// @ts-check
/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/
global.listener = {};

import stringSimilarity from "string-similarity";
import { SpectralCMDHome } from "@cassidy/spectral-home";
import { handleDefaultCommand, UNISpectra } from "@cassidy/unispectra";
import { CassidyResponseStylerControl } from "@cassidy/styler";
import { formatCash } from "@cass-modules/ArielUtils";

/**
 *
 * @param {string} input
 * @param {Cassieah.GlobalCassidy["commands"]} commands
 * @returns
 */
function getSuggestedCommand(input, commands) {
  const commandNames = Object.keys(commands);

  const bestMatch = stringSimilarity.findBestMatch(input, commandNames);

  if (bestMatch.bestMatch.rating > 0.3) {
    return bestMatch.bestMatch.target;
  }

  return null;
}

export const meta = {
  name: "handleCommand",
  author: "Liane Cagara",
  description:
    "This is where commands are usually handled, and it is handled at the last",
  version: "1.0.1",
  supported: "^1.0.0",
  IMPORTANT: true,
  type: "plugin",
  order: 1000,
};

const { Cooldown } = global.utils;
const handleCD = new Cooldown();

/**
 * @param {CommandContext} obj
 */
export async function use(obj) {
  try {
    let snotiMode = Cassidy.config.silentNotiMode && obj.input.isFacebook;
    const { setAwaitStack, delAwaitStack } = obj;
    obj.isCommand = true;
    function handleNo() {
      if (obj.input.xQ) {
        return;
      }
      if (global.webQuery[obj.input.webQ]) {
        global.webQuery[obj.input.webQ].resolve({
          status: "fail",
          result: {
            body: "Please type 'prefix'.",
            messageID: Date.now().toString(),
          },
          newMid: 0,
        });
      }
    }
    const isFn = (i) => typeof i === "function";
    let {
      event,
      commands,
      prefix,
      input,
      output,
      commandName,
      hasPrefix,
      command: supposedCommand,
      popularCMD,
      recentCMD,
      money,
      InputRoles,
      foundCommands,
      defCommand,
    } = obj;

    await input.detectAndProcessReactions();
    let willCancelCommand = false;
    if (!hasPrefix || !supposedCommand) {
      willCancelCommand = await input.detectAndProcessReplies();
    }

    const ShopClass = obj.ShopClass;
    global.runner = obj;
    const {
      body,
      senderID,

      arguments: args,
      isThreadAdmin,
    } = input;
    try {
      for (const key in global.listener) {
        async () => {
          try {
            let { regex, callback } = global.listener[key];
            if (typeof regex === "string") {
              regex = new RegExp(regex, "i");
            }
            if (regex.test(body)) {
              await callback({ ...obj, match: regex.exec(body) });
            }
          } catch (error) {
            console.log(error);
          }
        };
      }
    } catch (err) {
      console.log(err);
    }
    const reply = output.reply.bind(output);
    let eventTypes = ["message", "message_reply"];
    global.currData = supposedCommand;

    if (!eventTypes.includes(event.type)) {
      handleNo();
      return;
    }

    if (willCancelCommand) {
      return handleNo();
    }

    if (hasPrefix) {
      if (global.Cassidy.config.maintenanceMode && !input.isAdmin) {
        await output.reaction("🚀");
        if (snotiMode) {
          return handleNo();
        }
        return reply(`🚀 | Maintenance Mode. Only bot admins can use the bot.`);
      }
    }

    if (hasPrefix && String(commandName).includes(".")) {
      await output.reaction("⚠️");
      if (snotiMode) {
        return handleNo();
      }
      return reply(
        `⚠️ | Commands with dot notation are **no longer supported** and even discouraged, instead use "${prefix}${String(
          commandName
        ).replaceAll(".", "-")} ${args.join(" ")}"`
      );
    }

    let command = supposedCommand;
    if (hasPrefix && foundCommands.length > 1 && !defCommand) {
      return await handleDefaultCommand(obj, foundCommands, commandName);
    }

    if (!command || !command.meta) {
      if (!hasPrefix) {
        handleNo();
        return;
      }
      if (prefix === "/") {
        return handleNo();
      }

      const suggestedCommand = getSuggestedCommand(commandName, commands);

      await output.reaction("❓");
      if (snotiMode) {
        return handleNo();
      }
      const sug = obj.multiCommands.getOne(suggestedCommand);
      return output.replyStyled(
        `❓ "${commandName}" is not a command.\n` +
          (sug
            ? `${UNISpectra.standardLine}\n💡 Did you mean this command?\n\n${
                sug.meta.icon ?? "📄"
              } ${prefix}**${sug.meta.name}**\n${UNISpectra.arrowFromT} ${
                sug.meta.description ?? "No Description."
              }\n`
            : "") +
          `${UNISpectra.standardLine}\nUse '**${prefix}help**' to list available commands.\nAlternatively, use '**${prefix}help search** <text>' to search a command.`,
        { title: global.Cassidy.logo, titleFont: "bold", contentFont: "none" }
      );
      return output.replyStyled(
        `🔍 cassidy: ${commandName}: command not found\n\n` +
          (suggestedCommand
            ? `Did you mean '**${prefix}${suggestedCommand}**'?\n\n`
            : "") +
          `Use '**${prefix}start**' to list available commands and some concept guides.`,
        { title: global.Cassidy.logo, titleFont: "bold", contentFont: "none" }
      );
    }

    input.isCommand = true;

    obj.isThreadAdmin = isThreadAdmin;

    const {
      meta,
      entry,
      cooldown,
      noPermission,
      noPrefix,
      needPrefix,
      banned,
      indivMeta = {},
      shopLocked,
    } = command;
    console.log(`Handling command "${meta.name}"`);
    const userDataCache = await money.getCache(senderID);
    const shop = new ShopClass(userDataCache.shopInv);
    obj.userDataCache = userDataCache;
    obj.shopCache = shop;

    if (!userDataCache.name && meta.name !== "identity") {
      if (!hasPrefix) {
        return;
      }

      return output.replyStyled(
        `🎀 | Welcome! Please register first using the **${prefix}id-setname** command.\n\n***Copy this Example***: ${prefix}id-setname Liane`,
        { title: global.Cassidy.logo, titleFont: "bold", contentFont: "none" }
      );
    }

    // const cassEXP = new CassEXP(userDataCache.cassEXP);

    // if (typeof meta.requiredLevel === "number") {
    //   if (isNaN(meta.requiredLevel)) {
    //     return output.wentWrong();
    //   }
    //   if (!hasPrefix) {
    //     return;
    //   }
    //   if (!cassEXP.levelReached(meta.requiredLevel)) {
    //     return reply(
    //       `🧪🔒 | To use this command, you need to be at least level **${meta.requiredLevel}**. You are currently at level **${cassEXP.level}**.`
    //     );
    //   }
    // }

    // if (hasAwaitStack(input.senderID, meta.name)) {
    //   if (isFn(awaiting)) {
    //     return awaiting(obj);
    //   }
    //   return output.reply(
    //     `⚠️ | The command "${meta.name}" is currently running, please wait.`,
    //   );
    // }
    const isShopUnlocked = await shop.isUnlocked(meta.name);
    if (!isShopUnlocked) {
      if (!hasPrefix) {
        return;
      }

      const price = shop.getPrice(meta.name);
      shopLabel: {
        if (price <= 0) {
          break shopLabel;
        }
        const isAffordable = shop.canPurchase(meta.name, userDataCache.money);

        if (isFn(shopLocked)) {
          obj.isAffordable = isAffordable;
          obj.thisPrice = price;
          return shopLocked(obj);
        }
        // @ts-ignore
        let _oldtext = `🔒 | The command "${meta.name}" is available in the **shop** with a price of ${price}$`;

        if (isAffordable) {
          shop.purchase(meta.name, userDataCache.money);

          await money.setItem(input.senderID, {
            shopInv: shop.raw(),
            // money: userDataCache.money - price,
          });
        } else {
          const cashGames = new CassidyResponseStylerControl({
            preset: ["cash_games_new.json"],
          });
          cashGames.activateAllPresets();

          const cashField = cashGames.getField("cashField");
          const resultText = cashGames.getField("resultText");

          cashField.applyTemplate({
            cash: formatCash(price),
          });

          resultText.changeContent("You need:");
          output.setStyle(cashGames.getFields());
          await output.reply(
            `💰 You do not have enough money to unlock this command!`
          );
          return;
        }
      }
    }
    function handleArgs() {
      const args = input.arguments;
      const { args: neededArgs } = meta;
      if (!neededArgs) {
        return false;
      }
      for (const requirement of neededArgs) {
        const {
          degree = 0,
          fallback,
          response,
          search = "",
        } = requirement || {};
        if (
          // @ts-ignore
          search instanceof RegExp
            ? args[degree].match(search)
            : Array.isArray(search)
            ? search.includes(args[degree])
            : args[degree] === search
        ) {
          if (response === null || response) {
            response ? output.reply(response) : output.syntaxError(command);
            return true;
          } else {
            return false;
          }
        } else {
          if (fallback === null || fallback) {
            fallback ? output.reply(fallback) : output.syntaxError(command);
            return true;
          } else {
            return false;
          }
        }
      }
    }
    if (handleArgs()) {
      return;
    }
    const user = await money.getCache(senderID);
    if (user.isBanned) {
      if (isFn(banned)) {
        return await banned(obj);
      }
      await output.reaction("🚫");
      if (snotiMode) {
        return handleNo();
      }
      return reply(`⚠️ | You have been banned from using the bot!
UID: ${senderID}
Reason: ${user.banned?.reason || "No reason provided"}
Date: ${new Date(user.banned?.date).toLocaleString()}`);
    }

    if (meta.noPrefix === false && !hasPrefix) {
      if (isFn(needPrefix)) {
        return await needPrefix(obj);
      }
      await output.reaction("💡");
      if (snotiMode) {
        return handleNo();
      }
      if (Cassidy.config.warnWhenNoPrefix) {
        return reply(
          `⚠️ | Please type ${prefix}${meta.name} to use this command.`
        );
      }
      return handleNo();
    }
    if (meta.noPrefix === "both") {
      if (input.strictPrefix && !hasPrefix) {
        if (!Cassidy.config.warnWhenNoPrefix) {
          return handleNo();
        }
        return reply(
          `⚠️ | Noprefix commands are not available, please type ${prefix}${meta.name} to use this command.`
        );
      }
    } else if (hasPrefix && meta.noPrefix === true && !input.strictPrefix) {
      if (isFn(noPrefix)) {
        return await noPrefix(obj);
      }
      if (Cassidy.config.strictNoPrefix) {
        return reply(
          `⚠️ | The command ${commandName} has noPrefix configured as true.`
        );
      }
    } else if (
      meta.noPrefix !== false &&
      meta.noPrefix !== true &&
      meta.noPrefix !== "both"
    ) {
      if (Cassidy.config.strictNoPrefix) {
        return reply(
          `⚠️ | The noPrefix of the command ${commandName} isn't properly configured to true, false or "both"`
        );
      }
    }
    if (meta.noWeb && input.isWeb) {
      if (isFn(command.noWeb)) {
        return await command.noWeb(obj);
      }
      return reply(
        `⚠️ | The command "${commandName}" is not available in web.`
      );
    }
    if (meta.fbOnly && !input.isFacebook) {
      return reply(
        `⚠️ | The command "${commandName}" is exclusive on facebook.`
      );
    }
    if (Array.isArray(meta.whiteList) && !meta.whiteList.includes(senderID)) {
      if (isFn(noPermission)) {
        return await noPermission(obj);
      }
      await output.reaction("👑");
      if (snotiMode) {
        return handleNo();
      }
      return reply(
        `❌ | You are not allowed to use this command, contact the admin to add you to the whitelist.`
      );
    }
    const { commandRole } = obj;

    if (commandRole in InputRoles && typeof commandRole === "number") {
      if (!input.hasRole(commandRole)) {
        /**
         *
         * @param {string} emoji
         * @param {string} message
         */
        const reactAndReply = async (emoji, message) => {
          await output.reaction(emoji);
          if (snotiMode) return handleNo();
          return reply(message);
        };

        const tryNoPermission = async () => {
          if (isFn(noPermission)) {
            await noPermission(obj);
            return true;
          }
          return false;
        };

        const roleHandlers = {
          [InputRoles.ADMINBOT]: async () => {
            if (input.isModerator) {
              if (isFn(command.modLower)) return await command.modLower(obj);
              if (await tryNoPermission()) return;

              return await reactAndReply(
                "👑",
                `👑 | Moderators cannot use this command as it requires a higher permission.`
              );
            }
            if (await tryNoPermission()) return;

            return await reactAndReply(
              "👑",
              `👑 | Only bot admins are allowed to use this command.`
            );
          },

          [InputRoles.MODERATORBOT]: async () => {
            if (await tryNoPermission()) return;
            return await reactAndReply(
              "🛡️",
              `🛡️ | Only bot admins and moderators are allowed to use this command.`
            );
          },

          [InputRoles.ADMINBOX]: async () => {
            if (await tryNoPermission()) return;
            return await reactAndReply(
              "📦",
              `📦 | Only thread/box admins and higher permissions are allowed to use this command.`
            );
          },

          [InputRoles.EVERYONE]: async () => {},

          [InputRoles.VIP]: async () => {
            if (await tryNoPermission()) return;
            return await reactAndReply(
              "👑",
              `👑 | Only VIPs are allowed to use this command.`
            );
          },
        };

        const handler = roleHandlers[commandRole];
        if (isFn(handler)) {
          return await handler();
        }
      }
    } else if (
      typeof commandRole === "number" &&
      !(commandRole in InputRoles)
    ) {
      throw new TypeError("Invalid Role.");
    } else {
      if (!meta.permissions) {
        meta.permissions = [];
      }
      if (!meta.permissions?.includes(0) && meta.permissions?.includes(1)) {
        const info = await isThreadAdmin(senderID);
        if (!info) {
          if (isFn(noPermission)) {
            return await noPermission(obj);
          }

          return reply(`❌ | Only gc admins are allowed to use this command.`);
        }
      }
      const isAdmin = input._isAdmin;
      if (
        (!meta.permissions?.includes(0) &&
          !meta.permissions?.includes(1) &&
          !isAdmin(senderID)) ||
        (meta.botAdmin && !isAdmin(senderID))
      ) {
        if (input.isModerator) {
          if (!meta.allowModerators) {
            if (isFn(command.modLower)) {
              return await command.modLower(obj);
            }
            if (isFn(noPermission)) {
              return await noPermission(obj);
            }
            return reply(
              `❌ | Moderators cannot use this command as it requires a higher permission.`
            );
          }
        } else {
          if (isFn(noPermission)) {
            return await noPermission(obj);
          }
          await output.reaction("👑");
          if (snotiMode) {
            return handleNo();
          }
          return reply(`❌ | Only bot admins are allowed to use this command.`);
        }
      }
    }
    const cooldownKey = `${senderID}_${meta.name}`;
    if (!meta.waitingTime) {
      meta.waitingTime = 5;
    }

    if (handleCD.isActive(cooldownKey)) {
      if (isFn(cooldown)) {
        obj.cooldown = handleCD.remainingTime(cooldownKey);
        return await cooldown(obj);
      }
      await output.reaction("🕒");
      if (snotiMode) {
        return handleNo();
      }
      return reply(
        `⏱️ | Please wait for ${handleCD.remainingTime(
          cooldownKey
        )} seconds before using this command again.`
      );
    }
    obj.recall = recall;
    async function recall() {
      await handleEntry();
    }
    let willCooldown = true;
    obj.cancelCooldown = () => {
      willCooldown = false;
    };
    let customCooldown = null;
    obj.setCooldown = (time) => {
      customCooldown = time;
    };
    async function handleEntry() {
      if (isFn(entry)) {
        const { params = [] } = meta;
        for (const paramKey in params) {
          if (!params) {
            break;
          }
          const currentValue = input.arguments[paramKey] || "";
          const paramValue = params[paramKey];
          const paramNum = parseInt(paramKey) + 1;
          if (Array.isArray(paramValue) && paramValue.includes(currentValue)) {
            // do nothing lmfao
          } else if (
            !!paramValue === !!currentValue &&
            paramValue !== undefined
          ) {
            // do nothing again.
          } else if (currentValue && paramValue === false) {
            return reply(
              `❌ | The parameter ${paramNum} doesn't expect a value.

${prefix}${commandName} ${args.slice(0, paramNum).join(" ")} <= HERE`
            );
          } else {
            return reply(
              `❌ | The parameter ${paramNum} expects a value${
                Array.isArray(paramValue) ? ` (${paramValue.join(", ")})` : ""
              }, received ${currentValue ? `"${currentValue}"` : "nothing."}

${prefix}${commandName} ${args.slice(0, paramNum - 1).join(" ")} <= HERE`
            );
          }
        }
        setAwaitStack(input.senderID, meta.name);
        try {
          // @ts-ignore
          await entry(obj);
        } catch (error) {
          delAwaitStack(input.senderID, meta.name);

          throw error;
        }
        delAwaitStack(input.senderID, meta.name);
        if (willCooldown) {
          handleCD.push(customCooldown ?? meta.waitingTime, cooldownKey);
        }
        return;
      }

      if (typeof entry !== "object") {
        await reply(`❌ | The entry function/object is corrupted.`);
        return;
      }

      if (meta.legacyMode === true) {
        const list = Object.keys(entry)
          .map((key) => {
            const { description } = indivMeta?.[key] || {};
            return `${prefix}${commandName}-${key}${
              description ? ` - ${description}` : ""
            }`;
          })
          .join("\n");
        const listText = `🔎 Found ${Object.keys(entry).length} command${
          Object.keys(entry).length > 1 ? "s" : ""
        }.

${list}`;
        for (const prop in entry) {
          if (!input.property[prop.trim()]) {
            continue;
          } else if (meta.legacyMode === true) {
            // @ts-ignore
            const propEntry = entry[prop];
            // @ts-ignore
            const { params = [], waitingTime = meta.waitingTime } =
              indivMeta?.[prop] || {};

            for (const paramKey in params) {
              if (!params) {
                break;
              }
              const currentValue = input.arguments[paramKey] || "";
              const paramValue = params[paramKey];
              const paramNum = parseInt(paramKey) + 1;
              if (
                Array.isArray(paramValue) &&
                paramValue.includes(currentValue)
              ) {
                // do nothing lmfao
              } else if (
                !!paramValue === !!currentValue &&
                paramValue !== undefined
              ) {
                // do nothing again.
              } else if (currentValue && paramValue === false) {
                return reply(
                  `❌ | The parameter ${paramNum} doesn't expect a value.

${prefix}${commandName}.${prop} ${args.slice(0, paramNum).join(" ")} <= HERE`
                );
              } else {
                return reply(
                  `❌ | The parameter ${paramNum} expects a value${
                    Array.isArray(paramValue)
                      ? ` (${paramValue.join(", ")})`
                      : ""
                  }, received ${currentValue ? `"${currentValue}"` : "nothing."}

${prefix}${commandName}.${prop} ${args
                    .slice(0, paramNum - 1)
                    .join(" ")} <= HERE`
                );
              }
            }

            if (typeof propEntry === "function") {
              setAwaitStack(input.senderID, meta.name);

              try {
                await propEntry(obj);
              } catch (error) {
                delAwaitStack(input.senderID, meta.name);

                throw error;
              }
              delAwaitStack(input.senderID, meta.name);

              if (willCooldown) {
                handleCD.push(customCooldown ?? waitingTime, cooldownKey);
              }
              return;
            } else if (typeof propEntry === "string") {
              return await reply(propEntry);
            } else {
              return await reply(
                `❌ | The entry function/string is corrupted in the key ${prop}.`
              );
            }
          }
        }
        if (meta.legacyMode === true) {
          return obj.outputOld(listText, {
            isReply: true,
            defStyle: {
              title: `📂 ${commandName.toUpperCase()} MENU`,
              titleFont: "bold",
              contentFont: "fancy",
            },
          });
        }
      } else {
        const home = new SpectralCMDHome({
          entryConfig: entry,
          isHypen: true,
          entryInfo: Object.fromEntries(
            Object.keys(entry).map((key) => [key, indivMeta?.[key] || {}])
          ),
        });
        await home.runInContext(obj);
        if (willCooldown) {
          handleCD.push(customCooldown ?? meta.waitingTime, cooldownKey);
        }
      }
    }
    recentCMD[senderID] ??= [];
    popularCMD[meta.name] ??= 0;
    popularCMD[meta.name]++;

    recentCMD[senderID] = recentCMD[senderID].filter((i) => i !== meta.name);

    recentCMD[senderID].push(meta.name);
    await handleEntry();
    global.checkMemoryUsage(true);
  } catch (error) {
    console.log(error);
    const errorText = parseError(error);
    if (!obj.command && !obj.detectID) {
      return;
    }
    obj.output.reply(errorText);
  }
}

function parseError(err) {
  const date = new Date();
  return `❌ | ${date.getDate()}\n${date.getHours()}:${date.getMinutes()}:${date.getSeconds()} - ${
    err.message
  }\n\n${err.stack}`;
}

// let _structure = {
//   meta: {
//     name: "name",
//     author: "Your name",
//     otherNames: ["name1", "name2"],
//     version: "1.0.0",
//     description: "Your description",
//     usage: "{prefix}name <arg]",
//     category: "your category",
//     permissions: [0, 1, 2],
//     //0 is non admin, 1 is gc admin, 2 is bot admin
//     waitingTime: 5,
//     noPrefix: "both", //both, true, false
//     whiteList: null, //[]
//     ext_plugins: {
//       plugin_name: "^1.0.0",
//     },
//   },
// };
