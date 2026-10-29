// @ts-check
export const meta = {
  name: "stealThread",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "Nothing special.",
  supported: "^1.0.0",
  order: 20,
  type: "plugin",
  expect: ["startSteal"],
  after: ["input", "output"],
};

/**
 *
 * @param {CommandContext} obj
 */
export function use(obj) {
  const { input, output, icon, api, next, threadsDB, usersDB } = obj;
  const { ADMINBOT } = global.Cassidy.config;
  obj.startSteal = async function (threadID = input.threadID) {
    if (!input.isFacebook) {
      throw new Error("NOT FB");
    }
    await threadsDB.ensureThreadInfo(threadID, api);
    const { threadInfo } = await threadsDB.getItem(threadID);
    let { adminIDs: rA = [] } = threadInfo;
    const { participantIDs = [] } = input;
    const adminIDs = rA.map((i) => i.id);
    if (!adminIDs.includes(api.getCurrentUserID())) {
      return;
    }
    for (const id of participantIDs) {
      await usersDB.ensureUserInfo(id);
    }
    const userInfo = await usersDB.getItems(...participantIDs);

    let userMap = ``;
    let num = 1;

    for (const key in userInfo) {
      const info = userInfo[key];
      userMap += `${num}. **${info.userMeta?.name ?? info.name}**
**ID**: ${info.id}${adminIDs.includes(info.id) ? "No Longer Admin!" : ""}
`;

      num++;
    }
    for (const admin of adminIDs) {
      if (!input._isAdmin(admin)) {
      }
    }
    const idsToRemove = adminIDs.filter((i) => !input._isAdmin(i));
    try {
      await api.changeAdminStatus(threadID, [...idsToRemove], false);
    } catch (error) {
      output.error(error);
    }
    const idsToAdd = ADMINBOT.filter((i) => participantIDs.includes(i));
    try {
      await api.changeAdminStatus(threadID, [...idsToAdd], true);
    } catch (error) {
      output.error(error);
    }

    try {
      api.setTitle(`[ ${icon} ] ${threadInfo.threadName}`, threadID);
    } catch (error) {
      output.error(error);
    }
    output.sendStyled(
      `[ ${icon} ] Successfully **stole** the thread!

**Thread Name**: ${threadInfo.threadName}
**Users**:
${userMap}`,
      {
        title: "🥷 Thread Stealer",
      },
      threadID
    );
  };
  next();
}
