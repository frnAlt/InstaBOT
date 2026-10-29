export const meta = {
  name: "replySystem",
  author: "Liane Cagara",
  description:
    "This is a reply system where you can push replies and detect it, also delete reply detects",
  version: "1.0.0",
  supported: "^1.0.0",
  order: 800,
  type: "plugin",
  expect: ["replySystem"],
  after: ["input", "output"],
};
global.currData = {};

const { replies } = global.Cassidy;
export async function use(obj) {
  const { next, commandName, input, commands, output } = obj;
  obj.replySystem = {
    set(detectID, repObj = {}) {
      if (!commandName && !repObj.key && !repObj.callback) {
        throw new Error("No command detected");
      }
      if (!detectID) {
        //throw new Error("Invalid Detect ID");
        return;
      }
      let key = repObj.key || commandName;
      if (!commands[key] && !commands[key.toLowerCase()] && !repObj.callback) {
        //throw new Error("Command not found.");
        return;
      }
      global.currData = commands[key] || commands[key.toLowerCase()];
      replies[detectID] = {
        repObj,
        commandKey: key,
        detectID,
      };
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
  obj.input.setReply = obj.replySystem.set;
  obj.input.delReply = obj.replySystem.delete;
  obj.output.addReplyListener = async (mid, callback) => {
    if (typeof callback !== "function") {
      callback = (ctx) => {
        return ctx.repObj.resolve(ctx);
      };
    }
    console.log(`New Reply listener for ${mid}`, callback.toString());
    return new Promise(async (resolve, reject) => {
      obj.replySystem.set(mid, {
        callback,
        resolve,
        reject,
      });
      const keys = Object.keys(replies);
      if (!keys.includes(mid)) {
        throw new Error("Unknown Issue: " + mid);
      } else {
        console.log(keys);
      }
    });
  };
  obj.output.waitForReply = async (body, callback) => {
    return new Promise(async (resolve, reject) => {
      const { replySystem } = obj;
      if (typeof obj.clearCurrStack === "function") {
        obj.clearCurrStack();
      }
      const i = await obj.output.reply({ body, referenceQ: obj.input.webQ });
      async function something(context, ...args) {
        console.log(`input.webQ: ${input.webQ}, new; ${context.input.webQ}`);
        input.webQ = context.input.webQ;
        const func =
          callback ||
          (async ({ input, repObj: { resolve } }) => {
            resolve(input);
          });
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

  try {
    if (input.replier && replies[input.replier.messageID]) {
      const { repObj, commandKey, detectID } = replies[input.replier.messageID];
      console.log("rEPLYsySTEM", replies[input.replier.messageID]);
      const { callback, resolve, reject } = repObj;
      const command =
        commands[commandKey] || commands[commandKey.toLowerCase()] || {};
      obj.repCommand = command;
      const targetFunc = callback || command.reply;
      if (typeof targetFunc === "function") {
        try {
          await targetFunc({
            ...obj,
            repObj,
            detectID,
            commandName: commandKey,
            command,
          });
        } catch (error) {
          obj.output.error(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
    throw error;
  } finally {
    next();
  }
}
