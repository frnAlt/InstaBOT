// @ts-check
import { UNIRedux } from "@cassidy/unispectra";

export const meta = {
  name: "ban",
  author: "MrkimstersDev, Liane",
  description:
    "Automatically detects and removes banned users when they are added to the thread",
  version: "1.0.0",
  supported: "^1.0.0",
  after: ["output"],
  type: "plugin",
  order: 4,
};

/**
 *
 * @param {CommandContext} obj
 * @returns
 */
export async function use(obj) {
  const { input, output, threadsDB, usersDB } = obj;

  try {
    if (input.is("event") && input.logMessageType === "log:subscribe") {
      const { threadID, logMessageData } = input;
      const dataAddedParticipants = logMessageData?.addedParticipants || [];

      if (!dataAddedParticipants.length) {
        return obj.next();
      }

      const threadData = await threadsDB.getCache(threadID);
      /**
       * @type {import("@cass-commands/ban").BanEntry[]}
       */
      const bans = threadData?.bans || [];

      if (!bans.length) {
        return obj.next();
      }

      for (const participant of dataAddedParticipants) {
        const userID = participant.userFbId;
        const banEntry = bans.find((ban) => ban.userID === userID);
        if (!banEntry) {
          continue;
        }

        try {
          const userInfo = await usersDB.getUserInfo([userID]);
          const userName = userInfo[userID]?.name || "Unknown User";

          await output.kick(userID);
          await output.send(
            `🌌 **Banned User Detected** 🚪\n\n` +
              `${userName} (${userID}) is banned and has been removed from the thread.\n` +
              `**Reason**: ${banEntry.reason}\n` +
              `🚂 **Astral Express Network**`
          );
        } catch (error) {
          await output.send(
            `${UNIRedux.arrow} **Error** ❌\n\n` +
              `Failed to remove banned user ${userID}. I may need admin permissions.\n` +
              `**Reason**: ${banEntry.reason}\n` +
              `🚂 **Astral Express Network**`
          );
        }
      }
    }
  } catch (error) {
    console.error("Error in ban plugin:", error);
  }

  obj.next();
}
