// @ts-check
import { Files } from "@cass-modules/File";
import { NeaxScript } from "@cass-modules/NeaxScript";
import { UNISpectra } from "@cassidy/unispectra";
import * as UNIUtils from "@cass-modules/unisym";
import * as SmartSpectra from "@cass-modules/SmartSpectra";

export const meta = {
  name: "extra-ctx",
  author: "Liane Cagara",
  version: "1.0.0",
  description: "Just registers context variables.",
  supported: "^1.0.0",
  order: -100000,
  type: "plugin",
};

/**
 *
 * @param {CommandContextOG} ctx
 */
export async function use(ctx) {
  ctx.Files = Files;
  ctx.NeaxScript = NeaxScript;
  ctx.UNISpectra = UNISpectra;
  ctx.UNIUtils = UNIUtils;
  ctx.SmartSpectra = SmartSpectra;
  ctx.pause = global.utils.delay;
  return ctx.next();
}
