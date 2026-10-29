// @ts-check
import InputClass from "@cass-modules/InputClass";
import {
  getWelcomeCardStream,
  listArrayStr,
  UNISpectra,
} from "@cassidy/unispectra";

export const meta = {
  name: "subscribe",
  author: "Liane Cagara 🎀 & MrKimsters",
  description:
    "Handles subscription events such as adding or removing the bot from groups, sending welcome messages, and logging these events for administrators.",
  version: "1.4.1",
  supported: "^1.0.0",
  type: "plugin",
  category: "events",
  after: ["output", "input"],
  order: 100,
};

const { Cassidy } = global;

/**
 * @type {Map<string, { timeout: NodeJS.Timeout; data: InputClass["logMessageData"]}>}
 */
const welcomeCaches = new Map();

/**
 *
 * @param {CommandContext} obj
 * @returns
 */
export async function use(obj) {
  const { next, api, output, input, prefix, threadsDB, money } = obj;

  if (!input.isFacebook) {
    return obj.next();
  }

  async function handleAdd() {
    try {
      if (
        input.is("event") &&
        input.getProperty("logMessageType") === "log:subscribe"
      ) {
        const { threadID, author } = input;
        await money.ensureUserInfo(author);
        const authorData = await money.getCache(author);

        const logMessageData = input.getProperty("logMessageData");
        const dataAddedParticipants = logMessageData?.addedParticipants || [];

        if (!dataAddedParticipants.length) return;
        const authorName =
          authorData.userMeta?.name ?? authorData.name ?? "Unknown User";
        if (
          dataAddedParticipants.some(
            (item) => item.userFbId === api.getCurrentUserID()
          )
        ) {
          if (Cassidy.config.NICKNAME) {
            await api.changeNickname(
              Cassidy.config.NICKNAME,
              input.tid,
              api.getCurrentUserID()
            );
          }
          return output.sendStyled(
            `${
              UNISpectra.arrow
            } ***Connected Successfully!*** ✅\n\nThanks for adding me to this group. Type **${prefix}menu** without fonts to see the list of available commands.\n\n✨ **Nickname**: ${
              Cassidy.config.NICKNAME || "No nickname."
            }\n🎀 **Added By**: ${authorName}`,
            {
              title: global.Cassidy.logo,
              contentFont: "fancy",
              titleFont: "bold",
            }
          );
        }

        /**
         * @type {{ data: InputClass["logMessageData"]; timeout: NodeJS.Timeout }}
         */
        const ex = welcomeCaches.get(input.tid) ?? {
          data: { addedParticipants: [] },
          timeout: null,
        };
        ex.data.addedParticipants.push(...dataAddedParticipants);
        if (ex.timeout) {
          clearTimeout(ex.timeout);
        }
        setTimeout(async () => {
          const { threadInfo, ...threadData } = await threadsDB.getItem(
            input.tid
          );

          const isEnabled =
            threadData?.settings?.sendWelcomeMessage !== undefined
              ? threadData.settings.sendWelcomeMessage
              : true;
          if (!isEnabled) return;
          const {
            data: { addedParticipants: dataAddedParticipants },
          } = welcomeCaches.get(input.tid) ?? {
            data: { addedParticipants: [] },
            timeout: null,
          };
          await threadsDB.ensureThreadInfo(input.tid, api);
          if (!threadInfo) {
            throw new Error("Missing thread info.");
          }

          const userName = dataAddedParticipants.map((user) => user.fullName);
          /**
           * @type {import("output-cassidy").StrictOutputForm["mentions"]}
           */
          const mentions = dataAddedParticipants.map((user) => ({
            tag: user.fullName,
            id: user.userFbId,
          }));

          if (!userName.length) return;
          const philippineTime = new Date().toLocaleString("en-US", {
            timeZone: "Asia/Manila",
            hour12: false,
            hour: "2-digit",
          });

          const hours = parseInt(philippineTime, 10);

          const session =
            hours <= 10
              ? "Morning"
              : hours <= 12
              ? "Noon"
              : hours <= 18
              ? "Afternoon"
              : "Evening";
          let image;
          try {
            await money.ensureUserInfo(dataAddedParticipants[0].userFbId);
            const firstUser = await money.getCache(
              dataAddedParticipants[0].userFbId
            );
            image = await getWelcomeCardStream({
              name: listArrayStr(userName),
              avatar: firstUser?.userMeta?.image,
              countText: `${(input.participantIDs ?? []).length} Members`,
              main: `Welcome to ${threadInfo.threadName}.`,
            });
          } catch (error) {
            console.error(error);
          }
          welcomeCaches.delete(input.tid);
          const defaultWelcome = `Hello {names}. Welcome to {threadName}! Have a nice {session}.`;
          const welcomeConfig = threadData?.welcomeConfig || null;
          let welcomeMessage = String(welcomeConfig?.message ?? defaultWelcome);

          welcomeMessage = welcomeMessage
            .replaceAll("{names}", listArrayStr(userName))
            .replaceAll("{threadName}", threadInfo.threadName)
            .replaceAll("{session}", session);

          return output.sendStyled(
            {
              body: welcomeMessage,
              mentions,
              ...(image
                ? {
                    attachment: image,
                  }
                : {}),
            },
            {
              title: global.Cassidy.logo,
              contentFont: "fancy",
              titleFont: "bold",
            },
            threadID
          );
        }, 1500);
      }
    } catch (error) {
      console.error(error);
    }
  }

  await handleAdd();

  try {
    const logData = input.getProperty("logMessageData");
    if (
      (input.getProperty("logMessageType") === "log:subscribe" &&
        logData.addedParticipants.some(
          (item) => item.userFbId === api.getCurrentUserID()
        )) ||
      (input.getProperty("logMessageType") === "log:unsubscribe" &&
        logData.leftParticipantFbId === api.getCurrentUserID())
    ) {
      if (input.author === api.getCurrentUserID()) return;

      const time = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      let threadName = "Unknown Group";
      let messageLog = "";

      if (input.getProperty("logMessageType") === "log:subscribe") {
        await threadsDB.ensureThreadInfo(input.threadID, api);
        threadName =
          (await threadsDB.getCache(input.threadID))?.threadInfo?.threadName ||
          threadName;
        await money.ensureUserInfo(input.author);
        const authorName = await money
          .getCache(input.author)
          .then(
            (data) => (data?.userMeta?.name ?? data?.name) || "Unknown User"
          );
        messageLog += `\n\n✅\n***Event***: Bot has been added to a new group\n- ***Added by***: ${authorName}`;
      }
      if (input.getProperty("logMessageType") === "log:unsubscribe") {
        threadName =
          (await threadsDB.getCache(input.threadID))?.threadInfo?.threadName ||
          threadName;
        await money.ensureUserInfo(input.author);
        const authorName = await money
          .getCache(input.author)
          .then(
            (data) => (data?.userMeta?.name ?? data?.name) || "Unknown User"
          );
        messageLog += `\n❌\n***Event***: Bot has been removed from a group\n- ***Removed by***: ${authorName}`;
      }

      messageLog += `\n- ***User ID***: ${input.author}\n- ***Group***: ${threadName}\n- ***Group ID***: ${input.threadID}\n- ***Time***: ${time}`;

      const { ADMINBOT = [], MODERATORBOT = [] } = Cassidy?.config || {};
      const staffs = [...ADMINBOT, MODERATORBOT];
      if (!staffs || !Array.isArray(staffs) || staffs.length === 0) {
        return console.warn("No admins configured to receive logs.");
      }

      for (const adminID of ADMINBOT) {
        if (!money.isNumKey(adminID)) {
          continue;
        }
        await output.sendStyled(
          messageLog,
          {
            title: "Thread Logs 🔍",
            titleFont: "bold",
            contentFont: "fancy",
          },
          adminID
        );
      }
    }
  } catch (error) {
    console.error("Error in logsBot:", error);
  }
  next();
}
