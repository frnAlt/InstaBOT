export type Replacer =
  | string
  | number
  | ((position: number) => string | number);
export type ReplacerRecord = Record<string, string | number>;
export type FormatArgs = Replacer | ReplacerRecord;

/**
 * Formats a string by replacing:
 * - `%1`, `%2`, ... with values by position (1-based index)
 * - `${key}` with values from a named replacement object
 *
 * Replacers can be:
 * - String or number
 * - Function returning a string or number, given position
 * - Object with string keys and string/number values
 *
 * @param str - Input string with placeholders
 * @param replacers - Values, functions, or named replacer objects
 * @returns The formatted string
 *
 * @example
 * format("Hello %1, welcome to ${planet}!", "John", { planet: "Earth" })
 * => "Hello John, welcome to Earth!"
 */
function formatFunc(str: string, ...replacers: FormatArgs[]): string {
  let result = str;

  for (let i = replacers.length; i >= 1; i--) {
    const placeholder = `%${i}`;
    const replacer = replacers[i - 1];

    if (replacer !== undefined && typeof replacer !== "object") {
      const value = typeof replacer === "function" ? replacer(i) : replacer;
      result = result.replaceAll(placeholder, String(value));
    }
  }

  for (const replacer of replacers) {
    if (
      typeof replacer === "object" &&
      replacer !== null &&
      !Array.isArray(replacer)
    ) {
      for (const [key, value] of Object.entries(replacer)) {
        const regex = new RegExp(`\\\${${key}}`, "g");
        result = result.replace(regex, String(value));
      }
    }
  }

  return result;
}

namespace formatFunc {
  export const format = formatFunc;
}

export default formatFunc;

export { formatFunc as format };
