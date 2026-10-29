export type Serializable =
  | string
  | number
  | boolean
  | null
  | Serializable[]
  | { [key: string]: Serializable };

export function generateInterface(name: string, obj: Serializable): string {
  function parseType(value: any, indentLevel = 1): string {
    if (value === null) return "null";

    if (Array.isArray(value)) {
      if (value.length === 0) return "any[]";
      const elementTypes = new Set(value.map((v) => parseType(v, indentLevel)));
      return `(${[...elementTypes].join(" | ")})[]`;
    }

    switch (typeof value) {
      case "string":
        return "string";
      case "number":
        return "number";
      case "boolean":
        return "boolean";
      case "object":
        return generateInlineObjectType(value, indentLevel);
      default:
        return "any";
    }
  }

  function generateInlineObjectType(
    value: Record<string, any>,
    indentLevel: number
  ): string {
    const entries = Object.entries(value);
    if (entries.length === 0) return "{}";

    const indent = "  ".repeat(indentLevel);
    const nestedIndent = "  ".repeat(indentLevel + 1);

    const props = entries.map(
      ([key, val]) =>
        `${nestedIndent}${key}: ${parseType(val, indentLevel + 1)};`
    );

    return `{\n${props.join("\n")}\n${indent}}`;
  }

  const isPlainObject =
    typeof obj === "object" && !Array.isArray(obj) && obj !== null;

  if (!isPlainObject) {
    const typeDef = parseType(obj);
    return `export type ${name} = ${typeDef};`;
  }

  const lines: string[] = [`export interface ${name} {`];
  for (const [key, value] of Object.entries(obj)) {
    const type = parseType(value, 1);
    lines.push(`  ${key}: ${type};`);
  }
  lines.push("}");
  return lines.join("\n");
}
