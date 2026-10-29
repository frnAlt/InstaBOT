// @ts-check
import { InputClass } from "@cass-modules/InputClass";
import { NeaxScript } from "neax-script";
/*
  WARNING: This source code is created by Liane Cagara.
  Any unauthorized modifications or attempts to tamper with this code 
  can result in severe consequences, including a global ban from my server.
  Proceed with extreme caution and refrain from any unauthorized actions.
*/

export const meta = {
  name: "input",
  author: "Liane Cagara",
  version: "2.0.0",
  description: "All inputs are here, very easier to use, has more usages too!",
  supported: "^1.0.0",
  order: 1,
  IMPORTANT: true,
  type: "plugin",
  expect: ["censor", "args", "input", "replySystem", "reactSystem"],
};
/**
 *
 * @param {CommandContext} obj
 */
export async function use(obj) {
  try {
    if (obj.event.body) {
      const ns = new NeaxScript.Parser({
        ...obj,
        input: new InputClass(obj),
      });
      const inline = await ns.neaxInline(obj.event.body);
      console.log(inline);
      if (inline.codes.some((i) => i !== 0)) {
        return obj.api.sendMessage(
          inline.getIssues(),
          obj.event.threadID,
          obj.event.messageID
        );
      }
      obj.event.body = inline.result;
    }
    const input = new InputClass(obj);
    await input.updateRole();
    input.attachToContext(obj);

    console.log(obj.input);
  } catch (error) {
    console.error(error);
  } finally {
    obj.next();
  }
}
