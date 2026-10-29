export const meta = {
  name: "reactSystem",
  author: "Liane Cagara",
  description:
    "This is a reaction system where you can push reactions and detect it, also delete reactiondetects",
  version: "1.0.0",
  supported: "^1.0.0",
  order: 799,
  type: "plugin",
  expect: ["reactSystem"],
  after: ["input", "output"],
};
global.currData = {};

const { reacts } = global.Cassidy.reacts;
export async function use(obj) {
  const { next, commandName, input, commands, output } = obj;
  obj.reactSystem = {
    set(detectID, reactObj = {}) {
      if (!commandName && !reactObj.key && !reactObj.callback) {
        throw new Error("No command detected");
      }
      if (!detectID) {
        throw new Error("Invalid Detect ID");
      }
      let key = reactObj.key || commandName;
      if (!commands[key] && !commands[key.toLowerCase()]) {
        throw new Error("Command not found.");
      }
      global.currData = commands[key] || commands[key.toLowerCase()];
      reacts[detectID] = {
        reactObj,
        commandKey: key,
        detectID,
      };
      return reacts[detectID];
    },
    delete(detectID) {
      if (!detectID) {
        throw new Error("Invalid Detect ID");
      }
      if (!reacts[detectID]) {
        return null;
      }
      const backup = reacts[detectID];
      delete reacts[detectID];
      return backup;
    },
    get(detectID) {
      if (!detectID) {
        throw new Error("Invalid Detect ID");
      }
      if (!reacts[detectID]) {
        return null;
      }
      return reacts[detectID];
    },
  };
  obj.input.setReact = obj.reactSystem.set;
  obj.input.delReact = obj.reactSystem.delete;
  obj.output.waitForReaction = async (body, callback) => {
    return new Promise(async (resolve, reject) => {
      const { reactSystem } = obj;
      const i = await obj.output.reply(body);

      reactSystem.set(i.messageID, {
        callback:
          callback ||
          (async ({ input, repObj: { resolve } }) => {
            resolve(input);
          }),
        resolve,
        reject,
        self: i,
        author: input.senderID,
      });
    });
  };
  obj.output.addReactionListener = async (body, callback) => {
    return new Promise(async (resolve, reject) => {
      const { reactSystem } = obj;

      reactSystem.set(messageID, {
        callback:
          callback ||
          (async ({ input, repObj: { resolve } }) => {
            resolve(input);
          }),
        resolve,
        reject,
      });
    });
  };
  obj.output.quickWaitReact = async (body, options = {}) => {
    if (input.isWeb) {
      return input;
    }
    if (!options.hasAwaitStack && typeof obj.clearCurrStack === "function") {
      obj.clearCurrStack();
    }
    const outcome = await obj.output.waitForReaction(
      body + `\n\n𝘛𝘩𝘪𝘴 𝘮𝘦𝘴𝘴𝘢𝘨𝘦 𝘦𝘹𝘱𝘦𝘤𝘵𝘴 𝘢 𝘳𝘦𝘢𝘤𝘵𝘪𝘰𝘯.`,
      async ({ input, output, reactObj }) => {
        const { self, resolve } = reactObj;
        if (
          options.authorOnly &&
          input.userID !== (options.author || reactObj.author)
        ) {
          console.log(
            `${self.messageID} not author for ${input.userID} !== ${reactObj.author}`
          );
          return;
        }
        if (options.emoji && options.emoji !== input.reaction) {
          console.log(
            `${self.messageID} not emoji for ${options.emoji} !== ${input.reaction}`
          );
          return;
        }
        if (options.edit) {
          await obj.output.edit(options.edit, self.messageID);
        }
        input.self = self;
        resolve(input);
      }
    );
    return outcome;
  };

  try {
    //senderID is id of sender whi received react, while userID is sender. also reaction is the reaction
    if (input.type == "message_reaction" && reacts[input.messageID]) {
      console.log(`Handling reaction for ${input.messageID}`);
      const { reactObj, commandKey, detectID } = reacts[input.messageID];
      const { callback, resolve, reject } = reactObj;
      const command =
        commands[commandKey] || commands[commandKey.toLowerCase()] || {};
      obj.reactCommand = command;
      const targetFunc = callback || command.reaction;
      //global.currData = command;
      if (typeof targetFunc === "function") {
        try {
          await targetFunc({
            ...obj,
            reactObj,
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
