/**
 * Represents a utility class for abstracting the api methods.
 * @class
 * @author Nealiana Kaye Cagara <https://github.com/lianecagara>
 * @license MIT
 */
import { Box } from "fca-liane-utils";
export { Box };
import Liane from "fca-liane-utils";

export const meta = {
  name: "liane-box",
  author: "Liane Cagara",
  version: "1.0.0",
  description:
    "Behaves exactly like the Botpack 1.7.2 box functions, WARNING: doesn't work on web.",
  supported: "^1.0.0",
  order: 1,
  type: "plugin",
  expect: ["Box", "Liane", "box"],
};

export async function use(obj) {
  obj.Box = Box;
  obj.Liane = Liane;
  obj.box = new Box(obj.api, obj.event);
  obj.next();
}
