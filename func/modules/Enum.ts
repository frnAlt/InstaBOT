/**
 * Creates an immutable enum-like object from a record, preserving literal types.
 * Supports string or numerical keys mapping to primitive values.
 * Mimics TypeScript's native enum behavior with type safety and immutability.
 *
 * @template T - The type of the input record, with string or numerical keys and primitive values.
 * @template V - The type of the values, extending PrimitiveType (string, number, bigint, boolean, symbol).
 * @param values - A record with string or numerical keys mapping to primitive values.
 * @returns An immutable object with the same key-value pairs as the input record, typed as Readonly<T>.
 * @example
 * ```ts
 * const names = Enum({
 *   liane: "Liane Cagara",
 *   1: "HAHA",
 * });
 * // names: { readonly liane: "Liane Cagara"; readonly 1: "HAHA" }
 * console.log(names.liane); // "Liane Cagara"
 * console.log(names[1]); // "HAHA"
 * ```
 */
export function Enum<
  T extends Record<string | number, V>,
  V extends Enum.PrimitiveType
>(values: T): Readonly<T>;

/**
 * Creates an immutable numerical enum-like object from an array, preserving literal types.
 * Array indices become numerical keys, and unique string or number values map back to their indices (reverse mapping).
 * Mimics TypeScript's numerical enums with bidirectional key-value access.
 *
 * @template V - The type of the array elements, extending PrimitiveType (string, number, bigint, boolean, symbol).
 * @param values - An array of primitive values.
 * @returns An immutable object with numerical keys (indices) mapping to array values and reverse mappings for unique string or number values, typed as Readonly<Record<number, V> & Record<V & (string | number), number>>.
 * @example
 * ```ts
 * const numeric = Enum(["A", "B"]);
 * // numeric: { readonly 0: "A"; readonly 1: "B"; readonly A: 0; readonly B: 1 }
 * console.log(numeric[0]); // "A"
 * console.log(numeric["A"]); // 0
 * ```
 */
export function Enum<V extends Enum.PrimitiveType>(
  values: ReadonlyArray<V>
): Readonly<Record<number, V> & Record<V & (string | number), number>>;

/**
 * Implementation of Enum function.
 * @internal
 */
export function Enum<
  T extends Record<string | number, V> | V[],
  V extends Enum.PrimitiveType
>(values: T) {
  const enumObject = Object.create(null);

  if (Array.isArray(values)) {
    const seenValues = new Set<V>();
    values.forEach((value, index) => {
      enumObject[index] = value;
      // Add reverse mapping for unique string or number values
      if (
        (typeof value === "string" || typeof value === "number") &&
        !seenValues.has(value)
      ) {
        enumObject[value as string | number] = index;
        seenValues.add(value);
      }
    });
  } else {
    for (const key in values) {
      enumObject[key] = values[key];
    }
  }

  return Object.freeze(enumObject) as T extends V[]
    ? Readonly<Record<number, V> & Record<V & (string | number), number>>
    : Readonly<T>;
}

/**
 * Namespace for Enum-related types.
 */
export namespace Enum {
  /**
   * The allowed primitive types for enum values.
   */
  export type PrimitiveType = string | number | bigint | boolean | symbol;
}
