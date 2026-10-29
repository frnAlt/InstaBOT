import fs from "fs/promises";

/**
 * Datum Namespace Utilities
 * -------------------------
 * Collection of functions and types for manipulating and querying structured data.
 * Includes JSON helpers, filtering, schema validation, and data encoding/decoding utilities.
 *
 * Author: Nealiana Kaye Cagara (@lianecagara)
 */

export namespace Datum {
  /**
   * Type-safe structure for `package.json`.
   * Augments the base shape with optional fields and extensibility.
   */
  export type PackageJson = typeof import("@root/package.json") & {
    /** Optional name of the package */
    name?: string;
    /** Optional version of the package */
    version?: string;
    /** Runtime dependencies */
    dependencies?: Record<string, string>;
    /** Development dependencies */
    devDependencies?: Record<string, string>;
    /** Allows additional custom fields */
    [key: string]: any;
  };

  /**
   * Defines a flexible query interface for filtering values of type `T`.
   * Mirrors MongoDB-style operators.
   */
  export type QueryOperator<T> =
    | { $eq?: T } // Equal to
    | { $ne?: T } // Not equal to
    | { $gt?: T } // Greater than
    | { $gte?: T } // Greater than or equal
    | { $lt?: T } // Less than
    | { $lte?: T } // Less than or equal
    | { $in?: T[] } // Included in array
    | { $nin?: T[] } // Not included in array
    | { $regex?: RegExp }; // Matches RegExp

  /**
   * Filters object type `T` based on per-key conditions.
   * Each key may be matched directly or via an operator.
   */
  export type Query<T> = Partial<
    Record<keyof T, QueryOperator<T[keyof T]> | T[keyof T]>
  >;

  /**
   * Schema type for object validation.
   * Can be:
   * - a primitive type string (e.g., 'string', 'number')
   * - a class constructor (e.g., Date)
   * - a recursive object structure
   */
  export type Schema = string | Function | { [key: string]: Schema };

  /**
   * Reads and parses a package.json file asynchronously.
   * @param pkgPath - Path to the package.json file (default: "./package.json")
   * @returns Promise resolving to the parsed PackageJson object, or null if read/parse fails
   */
  export async function readPackageJson(
    pkgPath = "./package.json"
  ): Promise<PackageJson | null> {
    try {
      const data = await fs.readFile(pkgPath, "utf-8");
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  /**
   * Retrieves the `name` field from a package.json file asynchronously.
   * @param pkgPath - Path to the package.json file (default: "./package.json")
   * @returns Promise resolving to the package name string or null if not found/error
   */
  export async function getPackageName(
    pkgPath = "./package.json"
  ): Promise<string | null> {
    const pkg = await readPackageJson(pkgPath);
    return pkg?.name ?? null;
  }

  /**
   * Retrieves the `version` field from a package.json file asynchronously.
   * @param pkgPath - Path to the package.json file (default: "./package.json")
   * @returns Promise resolving to the package version string or null if not found/error
   */
  export async function getPackageVersion(
    pkgPath = "./package.json"
  ): Promise<string | null> {
    const pkg = await readPackageJson(pkgPath);
    return pkg?.version ?? null;
  }

  /**
   * Updates the package.json file at the specified path by applying an updater function.
   * Reads the existing package.json, applies the updater, and writes back the result.
   * @param pkgPath - Path to the package.json file
   * @param updater - Function receiving the current PackageJson and returning the updated PackageJson
   * @returns Promise resolving when the update and write operation completes
   */
  export async function updatePackageJson(
    pkgPath: string,
    updater: (pkg: PackageJson) => PackageJson
  ): Promise<void> {
    const pkg = (await readPackageJson(pkgPath)) || ({} as PackageJson);
    const updated = updater(pkg);
    await fs.writeFile(pkgPath, JSON.stringify(updated, null, 2));
  }

  /**
   * Parses a JSON string into an object of type T.
   * Returns null if parsing fails.
   * @param jsonStr - JSON string to parse
   * @returns Parsed object of type T or null if invalid JSON
   */
  export function parseJson<T>(jsonStr: string): T | null {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return null;
    }
  }

  /**
   * Stringifies an object into a JSON string.
   * Optionally pretty-prints with 2-space indentation.
   * @param obj - Object to stringify
   * @param pretty - If true, format JSON with indentation (default: false)
   * @returns JSON string representation of the object
   */
  export function stringifyJson(obj: unknown, pretty = false): string {
    return pretty ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
  }

  /**
   * Validates if an object matches a given schema.
   * Supports primitive type strings, constructor functions, and nested schemas.
   * @param obj - Object to validate
   * @param schema - Schema definition to validate against
   * @returns True if object matches schema, false otherwise
   */
  export function validateSchema(obj: unknown, schema: Schema): boolean {
    if (typeof schema === "string") {
      return typeof obj === schema;
    }

    if (typeof schema === "function") {
      return obj instanceof schema;
    }

    if (
      typeof schema === "object" &&
      schema !== null &&
      typeof obj === "object" &&
      obj !== null
    ) {
      for (const key in schema) {
        if (!validateSchema((obj as any)[key], schema[key])) {
          return false;
        }
      }
      return true;
    }

    return false;
  }

  /**
   * Internal helper to check if a value matches a query condition or operator.
   * Supports equality, inequality, comparison, inclusion, and regex operators.
   * @param value - The value to test
   * @param condition - Query condition or direct value
   * @returns True if value matches condition, false otherwise
   */
  function matchesField<T>(value: T, condition: QueryOperator<T> | T): boolean {
    if (condition instanceof RegExp) {
      return typeof value === "string" && condition.test(value);
    }

    if (typeof condition !== "object" || condition === null) {
      return value === condition;
    }

    if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value) &&
      !(
        "$eq" in condition ||
        "$ne" in condition ||
        "$gt" in condition ||
        "$gte" in condition ||
        "$lt" in condition ||
        "$lte" in condition ||
        "$in" in condition ||
        "$nin" in condition ||
        "$regex" in condition
      )
    ) {
      for (const key in condition) {
        if (!matchesField((value as any)[key], (condition as any)[key])) {
          return false;
        }
      }
      return true;
    }

    for (const op in condition) {
      const condVal = (condition as any)[op];
      switch (op) {
        case "$eq":
          if (value !== condVal) return false;
          break;
        case "$ne":
          if (value === condVal) return false;
          break;
        case "$gt":
          if (!(value > condVal)) return false;
          break;
        case "$gte":
          if (!(value >= condVal)) return false;
          break;
        case "$lt":
          if (!(value < condVal)) return false;
          break;
        case "$lte":
          if (!(value <= condVal)) return false;
          break;
        case "$in":
          if (!Array.isArray(condVal) || !condVal.includes(value)) return false;
          break;
        case "$nin":
          if (Array.isArray(condVal) && condVal.includes(value)) return false;
          break;
        case "$regex":
          if (typeof value !== "string" || !condVal.test(value)) return false;
          break;
        default:
          return false;
      }
    }

    return true;
  }

  /**
   * Filters data entries based on a query object.
   * Supports data as a Record or Map.
   * @param data - Data collection to query (Record or Map)
   * @param query - Query object specifying filter conditions
   * @returns Array of matching data items
   */
  export function queryData<T>(
    data: Record<string, T> | Map<string, T>,
    query: Query<T>
  ): T[] {
    const items =
      data instanceof Map ? Array.from(data.values()) : Object.values(data);
    return items.filter((item) => {
      for (const key in query) {
        const condition = query[key];
        const val = (item as any)[key];
        if (!matchesField(val, condition as any)) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Returns the key or keys in the object that match the given value.
   * @param value - The value to search for.
   * @param parentObj - The object to search within.
   * @returns The first matching key as a string, or an array of matching keys, or null if none found.
   */
  export function keyOf<T extends object>(
    value: unknown,
    parentObj: T
  ): string | string[] | null {
    const keys = Object.entries(parentObj)
      .filter(([_, v]) => v === value)
      .map(([k]) => k);

    if (keys.length === 0) return null;
    return keys.length === 1 ? keys[0] : keys;
  }

  /**
   * Returns the value or values from the object for the given key(s).
   * @param key - A single key or an array of keys.
   * @param parentObj - The object to retrieve values from.
   * @returns The value for a single key, an array of values for multiple keys, or null if not found.
   */
  export function valueOf<T extends object>(
    key: keyof T | (keyof T)[],
    parentObj: T
  ): T[keyof T] | T[keyof T][] | null {
    if (Array.isArray(key)) {
      const values = key
        .map((k) => parentObj[k])
        .filter((v) => v !== undefined);

      if (values.length === 0) return null;
      return values;
    }

    const val = parentObj[key];
    return val !== undefined ? val : null;
  }

  /**
   * Returns a new array containing only unique elements from the input array.
   *
   * - If no callback is provided, uniqueness is determined using strict equality (`===`).
   * - If a callback is provided, it is used to derive a value from each item for uniqueness comparison.
   *
   * @template T - Type of items in the input array
   * @template K - Type of key returned by the callback function (if provided)
   *
   * @param array - The input array to filter.
   * @param callback - Optional function to generate a comparison key for each item.
   *
   * @returns A new array containing only unique items.
   *
   * @example
   * toUniqueArray([1, 2, 2, 3]); // [1, 2, 3]
   *
   * @example
   * toUniqueArray(['one', 'two', 'three'], str => str.length); // ['one', 'three']
   *
   * @example
   * toUniqueArray([{ id: 1 }, { id: 2 }, { id: 1 }], obj => obj.id); // [{ id: 1 }, { id: 2 }]
   */
  export function toUniqueArray<T, K = T>(
    array: T[],
    callback?: (item: T) => K
  ): T[] {
    const seen = new Set<K | T>();
    const result: T[] = [];

    for (const item of array) {
      const key = callback ? callback(item) : item;
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    }

    return result;
  }

  /** Permissible object keys in TypeScript */
  export type ObjectKey = string | number | symbol;

  /**
   * Decodes a game ID string from a custom web-safe base64 format.
   *
   * - Removes the GAME_ID_PREFIX if present.
   * - Adds padding to make the base64 valid.
   * - Decodes from base64 and removes the `custom_` prefix (if any).
   *
   * @param input - Encoded game ID string (e.g., from URL or database).
   * @returns Decoded UTF-8 string, or original input if decoding fails.
   */
  export function decodeGameID(input: string) {
    input = `${input}`;

    input = input.replace(GAME_ID_PREFIX, "");
    const pad = input.length % 4;
    if (pad > 0) {
      input += "=".repeat(4 - pad);
    }
    try {
      return Buffer.from(input, "base64")
        .toString("utf8")
        .replaceAll("custom_", "");
    } catch (e) {
      return input;
    }
  }

  /**
   * Prefix used to mark encoded game IDs in web-safe format.
   * Used by `encodeGameID` and `decodeGameID`.
   */
  export const GAME_ID_PREFIX = "web:";

  /**
   * Encodes a UTF-8 string into a custom base64 game ID format.
   *
   * - Encodes the input string using standard base64.
   * - Adds the GAME_ID_PREFIX.
   *
   * @param input - Raw string to encode as a game ID.
   * @returns Encoded game ID string or the original input if encoding fails.
   */
  export function encodeGameID(input: string) {
    input = `${input}`;
    try {
      if (input.startsWith(GAME_ID_PREFIX)) {
        return input;
      }
      const encodedIP = Buffer.from(input.replaceAll("custom_", ""))
        .toString("base64")
        .replace(/=/g, "");
      return `${GAME_ID_PREFIX}${encodedIP}`;
    } catch (error) {
      return input;
    }
  }

  /**
   * Encodes a UTF-8 string into a custom base64 game ID format.
   *
   * - Encodes the input string using standard base64.
   * - Replaces `+`, `/`, and `=` characters to make it URL-safe.
   * - Adds the GAME_ID_PREFIX.
   *
   * @param input - Raw string to encode as a game ID.
   * @returns Encoded game ID string or the original input if encoding fails.
   */
  export function encodeGameIDLegacy(input: string) {
    try {
      const encodedIP = Buffer.from(input)
        .toString("base64")
        .replace(/[+/=]/g, (match) => ({ "+": "0", "/": "1", "=": "" }[match]));
      return `${GAME_ID_PREFIX}${encodedIP}`;
    } catch (error) {
      return input;
    }
  }

  /**
   * Creates a proxy-based object that behaves like a plain object,
   * but is backed by an internal `Map`. Allows for:
   *
   * - Map-style access and mutation.
   * - Proxy-based integration with object semantics (`in`, `for...in`, etc.).
   *
   * @template T - Type of the original object.
   * @param plainObj - An optional base object to initialize the map from.
   * @returns An object containing:
   *   - `map`: the internal `Map` storing key-value pairs.
   *   - `proxied`: a proxy object with object-like behavior powered by the `Map`.
   *
   * @example
   * const { map, proxied } = makeMapPlain({ a: 1 });
   * proxied.b = 2;
   * console.log(map.get("b")); // 2
   */
  export function makeMapPlain<T extends Record<ObjectKey, any>>(
    plainObj: T = {} as T
  ) {
    const internalMap = new Map<keyof T, T[keyof T]>(
      Object.entries(plainObj) as [keyof T, T[keyof T]][]
    );

    const target: T = Object.create(Object.getPrototypeOf(plainObj));

    const handler: ProxyHandler<T> = {
      get(target, prop, receiver) {
        if (prop === Symbol.iterator) {
          return function* () {
            for (const [key, value] of internalMap) {
              yield [key, value];
            }
          };
        }
        if (typeof prop === "symbol" || prop in Object.prototype) {
          return Reflect.get(target, prop, receiver);
        }
        return internalMap.get(prop as keyof T);
      },
      set(_target, prop, value, _receiver) {
        internalMap.set(prop as keyof T, value);
        return true;
      },
      deleteProperty(_target, prop) {
        return internalMap.delete(prop as keyof T);
      },
      has(_target, prop) {
        return internalMap.has(prop as keyof T);
      },
      ownKeys(_target) {
        return Array.from(internalMap.keys()) as Array<string | symbol>;
      },
      getOwnPropertyDescriptor(_target, prop) {
        if (internalMap.has(prop as keyof T)) {
          return {
            value: internalMap.get(prop as keyof T),
            writable: true,
            enumerable: true,
            configurable: true,
          };
        }
        return undefined;
      },
      defineProperty(_target, prop, descriptor) {
        if ("value" in descriptor && descriptor.value !== undefined) {
          internalMap.set(prop as keyof T, descriptor.value);
        } else if (!descriptor.get && !descriptor.set) {
          internalMap.delete(prop as keyof T);
        }
        return true;
      },
      getPrototypeOf(target) {
        return Object.getPrototypeOf(target);
      },
      setPrototypeOf(target, proto) {
        Object.setPrototypeOf(target, proto);
        return true;
      },
      isExtensible(_target) {
        return true;
      },
      preventExtensions(_target) {
        return false;
      },
    };

    const proxied = new Proxy(target, handler);
    return { map: internalMap, proxied };
  }

  /**
   * Returns a shuffled version of the input array or object.
   *
   * - Arrays are shuffled using the Fisher-Yates algorithm.
   * - Objects are converted to key-value entries, shuffled, then reconstructed.
   *
   * @template T - Type of array elements or object values.
   * @param inp - Input array or object to shuffle.
   * @returns Shuffled array or object of the same type.
   *
   * @example
   * shuffle([1, 2, 3]); // e.g., [3, 1, 2]
   * shuffle({ a: 1, b: 2 }); // e.g., { b: 2, a: 1 }
   */
  export function shuffle<T>(array: T[]): T[];

  export function shuffle<O extends Record<ObjectKey, any>>(object: O): O;

  export function shuffle(inp: any[] | Record<ObjectKey, any>) {
    if (!Array.isArray(inp)) {
      return Object.fromEntries(shuffle(Object.entries(inp)));
    } else {
      return fisherYates(inp);
    }
  }

  /**
   * Returns a random integer between the given min and max values (inclusive).
   *
   * - Both `min` and `max` are inclusive.
   * - If `min` is greater than `max`, the values are swapped internally.
   *
   * @param min - The lower bound (inclusive).
   * @param max - The upper bound (inclusive).
   * @returns A random integer within the specified range.
   *
   * @example
   * randomInt(1, 5); // e.g., 3
   * randomInt(5, 5); // 5
   * randomInt(10, 1); // e.g., 7 (handles swapped bounds)
   */
  export function randomInt(min: number, max: number): number {
    if (min > max) [min, max] = [max, min];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Shuffles an array in-place using the Fisher-Yates algorithm.
   *
   * - Produces a uniformly random permutation.
   * - Returns a new array (does not mutate the original).
   *
   * @template T - Type of elements in the array.
   * @param array - Input array to shuffle.
   * @returns A new array with shuffled elements.
   *
   * @example
   * fisherYates([1, 2, 3]); // e.g., [2, 3, 1]
   */
  export function fisherYates<T>(array: T[]): T[] {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /**
   * Recursively sorts the keys of an object to produce a normalized structure.
   * Useful for consistent hashing, equality checks, or serialization where key order matters.
   *
   * @template T
   * @param input - The input to normalize, which may be an object, array, or primitive.
   * @returns A new object/array with keys sorted recursively, or the original primitive value.
   *
   * @example
   * const obj = { b: 1, a: { d: 4, c: 3 } };
   * const normalized = normalize(obj);
   * // normalized = { a: { c: 3, d: 4 }, b: 1 }
   */
  export function normalize<T>(input: T): T {
    if (Array.isArray(input)) {
      return input.map(normalize) as T;
    } else if (input !== null && typeof input === "object") {
      const sorted = Object.keys(input)
        .sort()
        .reduce((acc, key) => {
          acc[key] = normalize((input as any)[key]);
          return acc;
        }, {} as any);
      return sorted as T;
    }
    return input;
  }

  /**
   * Validates that an object conforms to a partial schema of validation functions.
   * Each schema key maps to a function that returns true if the value is valid, false otherwise.
   * Does not throw; instead returns a tuple of validity and error messages.
   *
   * @template T extends object
   * @param obj - The object to validate.
   * @param schema - Partial validation schema.
   * @returns A tuple where the first element indicates overall validity,
   *   and the second is an array of error messages for failed validations.
   *
   * @example
   * const schema = {
   *   age: (val) => typeof val === "number" && val > 0,
   *   name: (val) => typeof val === "string" && val.length > 0,
   * };
   * const [isValid, errors] = conform({ age: 25, name: "Alice" }, schema);
   */
  export function conform<T extends object>(
    obj: any,
    schema: Partial<Record<keyof T, (val: any) => boolean>>
  ): [boolean, string[]] {
    const errors: string[] = [];
    for (const key in schema) {
      if (!schema[key]!(obj[key])) {
        errors.push(`Key '${key}' failed validation.`);
      }
    }
    return [errors.length === 0, errors];
  }

  /**
   * Creates a new object by picking only the specified keys from the input object.
   *
   * @template T extends object, K extends keyof T
   * @param obj - Source object to pick properties from.
   * @param keys - Array of keys to select.
   * @returns New object containing only the picked keys.
   *
   * @example
   * const obj = { a: 1, b: 2, c: 3 };
   * const picked = pick(obj, ['a', 'c']);
   * // picked = { a: 1, c: 3 }
   */
  export function pick<T extends object, K extends keyof T>(
    obj: T,
    keys: K[]
  ): Pick<T, K> {
    const result = {} as Pick<T, K>;
    for (const key of keys) {
      if (key in obj) result[key] = obj[key];
    }
    return result;
  }

  /**
   * Infers the simple type or shape of a given value as a string.
   * Recognizes "array", "null", or the result of `typeof`.
   *
   * @param value - The value to infer the type of.
   * @returns The inferred type string: "array", "null", or `typeof` result.
   *
   * @example
   * infer([1,2]); // "array"
   * infer(null);  // "null"
   * infer(123);   // "number"
   */
  export function infer(value: any[]): "array";
  export function infer(value: null): "null";
  export function infer(value: string): "string";
  export function infer(value: number): "number";
  export function infer(value: boolean): "boolean";
  export function infer(value: undefined): "undefined";
  export function infer(value: Function): "function";
  export function infer(value: object): "object";
  export function infer(value: any): string;

  export function infer(value: any): string {
    if (Array.isArray(value)) return "array";
    if (value === null) return "null";
    return typeof value;
  }

  /**
   * Recursively searches an object to find the path (array of keys) to a given target value.
   * Returns null if the target is not found.
   *
   * @param obj - The object to search within.
   * @param target - The target value to find.
   * @param path - Accumulated path during recursion (for internal use).
   * @returns Array of keys representing the path to the target, or null if not found.
   *
   * @example
   * const obj = { a: { b: { c: 42 } } };
   * trace(obj, 42); // ["a", "b", "c"]
   */
  export function trace(
    obj: any,
    target: any,
    path: string[] = []
  ): string[] | null {
    if (obj === target) return path;
    if (typeof obj !== "object" || obj === null) return null;

    for (const key in obj) {
      const result = trace(obj[key], target, [...path, key]);
      if (result) return result;
    }

    return null;
  }

  /**
   * Converts an array of objects into a lookup map keyed by a specified object property.
   *
   * @template T, K extends keyof T
   * @param array - Array of objects to index.
   * @param key - Key property name to use as the map key.
   * @returns Object mapping from stringified key values to corresponding objects.
   *
   * @example
   * const users = [{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }];
   * const userMap = index(users, "id");
   * // userMap = { "1": { id: 1, name: "Alice" }, "2": { id: 2, name: "Bob" } }
   */
  export function index<T, K extends keyof T>(
    array: T[],
    key: K
  ): Record<string, T> {
    return array.reduce((acc, item) => {
      const id = String(item[key]);
      acc[id] = item;
      return acc;
    }, {} as Record<string, T>);
  }

  /**
   * Remaps keys of an object according to a mapping function or key map object.
   * If no mapping exists for a key, it retains the original key.
   *
   * @template T extends object
   * @param obj - The source object whose keys will be remapped.
   * @param mapper
   *   Either an object mapping old keys to new keys, or a function that returns the new key for each entry.
   * @returns New object with remapped keys and original values.
   *
   * @example
   * remap({ a: 1, b: 2 }, { a: "alpha" }); // { alpha: 1, b: 2 }
   * remap({ a: 1, b: 2 }, (k, v) => k.toUpperCase()); // { A: 1, B: 2 }
   */
  export function remap<T extends object>(
    obj: T,
    mapper:
      | { [K in keyof T]?: string }
      | ((key: keyof T, value: T[keyof T]) => string)
  ): Record<string, any> {
    const result: Record<string, any> = {};
    for (const key in obj) {
      const newKey =
        typeof mapper === "function"
          ? mapper(key, obj[key])
          : mapper[key] ?? key;
      result[newKey] = obj[key];
    }
    return result;
  }

  /**
   * Asserts that a condition is truthy. Throws an error with a message if the condition is falsy.
   * Useful for runtime type checks and ensuring invariants.
   *
   * @param condition - Condition to assert truthy.
   * @param message- Error message for the thrown exception.
   * @throws {Error} Throws if the condition is falsy.
   *
   * @example
   * assert(typeof value === "string", "Value must be a string");
   */
  export function assert(
    condition: any,
    message = "Assertion failed"
  ): asserts condition {
    if (!condition) {
      throw new Error(message);
    }
  }

  /**
   * Returns a random element from an array, or null if the array is empty.
   *
   * @template T
   * @param array - The array to sample from.
   * @returns A randomly chosen element, or null if the array has no elements.
   *
   * @example
   * sample([1, 2, 3]); // might return 2
   * sample([]);        // returns null
   */
  export function sample<T>(array: T[]): T | null {
    if (array.length === 0) return null;
    const index = Math.floor(Math.random() * array.length);
    return array[index];
  }
}
