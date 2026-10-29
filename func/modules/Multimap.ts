/**
 * A Map-like class that supports non-unique keys, storing key-value pairs in an array.
 * @template K The type of the keys.
 * @template V The type of the values.
 */
export class MultiMap<K, V> {
  /**
   * Internal array of key-value pair entries.
   * @private
   */
  #_entries: [K, V][];

  /**
   * Creates a new MultiMap instance.
   * @param entries An iterable of key-value pair entries to initialize the map.
   */
  constructor(entries: Iterable<readonly [K, V]> = []) {
    this.#_entries = [];
    for (const [key, value] of entries) {
      this.#_entries.push([key, value]);
    }
  }

  /**
   * Adds a single key-value pair to the map.
   * @param key The key to add.
   * @param value The value to associate with the key.
   * @returns This MultiMap instance for chaining.
   */
  addOne(key: K, value: V): this {
    this.#_entries.push([key, value]);
    return this;
  }

  /**
   * Replaces all entries for a key with new key-value pairs for the given values.
   * @param key The key to set.
   * @param values An array of values to associate with the key.
   * @returns This MultiMap instance for chaining.
   */
  set(key: K, values: V[]): this {
    this.#_entries = this.#_entries.filter(([k]) => k !== key);
    for (const value of values) {
      this.#_entries.push([key, value]);
    }
    return this;
  }

  /**
   * Replaces the value of a specific entry identified by reference.
   * @param entry The key-value pair entry to update.
   * @param newValue The new value to set.
   * @returns This MultiMap instance for chaining.
   */
  setRef(entry: [K, V], newValue: V): this {
    const index = this.#_entries.findIndex((e) => e === entry);
    if (index !== -1) {
      this.#_entries[index] = [this.#_entries[index][0], newValue];
    }
    return this;
  }

  /**
   * Retrieves all values associated with a key.
   * @param key The key to look up.
   * @returns An array of values associated with the key.
   */
  get(key: K): V[] {
    return this.#_entries.filter(([k]) => k === key).map(([, v]) => v);
  }

  /**
   * Retrieves the first value associated with a key.
   * @param key The key to look up.
   * @returns The first value associated with the key, or undefined if none exists.
   */
  getOne(key: K): V | undefined {
    const entry = this.#_entries.find(([k]) => k === key);
    return entry ? entry[1] : undefined;
  }

  /**
   * Retrieves the first key-value pair entry for a key.
   * @param key The key to look up.
   * @returns The first key-value pair entry, or undefined if none exists.
   */
  getRef(key: K): [K, V] | undefined {
    return this.#_entries.find(([k]) => k === key);
  }

  /**
   * Retrieves all key-value pair entries associated with a key.
   * @param key The key to look up.
   * @returns An array of [key, value] entry references.
   */
  getRefs(key: K): [K, V][] {
    return this.#_entries.filter(([k]) => k === key);
  }

  /**
   * Removes all entries associated with a key.
   * @param key The key to remove.
   * @returns True if any entries were removed, false otherwise.
   */
  delete(key: K): boolean {
    const initialLength = this.#_entries.length;
    this.#_entries = this.#_entries.filter(([k]) => k !== key);
    return initialLength !== this.#_entries.length;
  }

  /**
   * Removes the first entry associated with a key.
   * @param key The key to remove.
   * @returns True if an entry was removed, false otherwise.
   */
  deleteOne(key: K): boolean {
    const index = this.#_entries.findIndex(([k]) => k === key);
    if (index !== -1) {
      this.#_entries.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Removes a specific key-value pair entry by reference.
   * @param entry The key-value pair entry to remove.
   * @returns True if the entry was removed, false otherwise.
   */
  deleteRef(entry: [K, V]): boolean {
    const index = this.#_entries.findIndex((e) => e === entry);
    if (index !== -1) {
      this.#_entries.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Removes a specific value by reference.
   * @param value The value to remove.
   * @returns True if the entry was removed, false otherwise.
   */
  deleteRefVal(entry: V): boolean {
    const index = this.#_entries.findIndex((e) => e[1] === entry);
    if (index !== -1) {
      this.#_entries.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Removes multiple specific key-value pair entries by reference.
   * @param entries The key-value pair entries to remove.
   * @returns The number of entries successfully removed.
   */
  deleteRefs(entries: [K, V][]): number {
    let count = 0;
    for (const entry of entries) {
      const index = this.#_entries.findIndex((e) => e === entry);
      if (index !== -1) {
        this.#_entries.splice(index, 1);
        count++;
      }
    }
    return count;
  }

  /**
   * Checks if a key exists in the map.
   * @param key The key to check.
   * @returns True if the key exists, false otherwise.
   */
  has(key: K): boolean {
    return this.#_entries.some(([k]) => k === key);
  }

  /**
   * Removes all entries from the map.
   */
  clear(): void {
    this.#_entries = [];
  }

  /**
   * Gets the number of key-value pair entries in the map.
   * @returns The number of entries.
   */
  get size(): number {
    return this.#_entries.length;
  }

  /**
   * Returns a copy of all key-value pair entries.
   * @returns An array of key-value pair entries.
   */
  entries(): [K, V][] {
    return this.#_entries.slice();
  }

  /**
   * Returns all keys in the map.
   * @returns An array of keys.
   */
  keys(): K[] {
    return this.#_entries.map(([key]) => key);
  }

  /**
   * Returns all values in the map.
   * @returns An array of values.
   */
  values(): V[] {
    return this.#_entries.map(([, value]) => value);
  }

  /**
   * Returns an iterator for the key-value pair entries.
   * @returns An iterator of key-value pair entries.
   */
  [Symbol.iterator](): Iterator<[K, V]> {
    return this.#_entries[Symbol.iterator]();
  }

  /**
   * Executes a callback for each key-value pair in the map.
   * @param callback Function to execute for each entry, taking the value, key, and map as arguments.
   * @param thisArg Value to use as `this` when executing the callback.
   */
  forEach(
    callback: (value: V, key: K, map: this) => void,
    thisArg?: any
  ): void {
    this.#_entries.forEach(([key, value]) => {
      callback.call(thisArg, value, key, this);
    });
  }

  /**
   * Finds all key-value entries that match a predicate.
   * @param predicate A function to test each entry.
   * @returns An array of matching entries.
   */
  find(predicate: (key: K, value: V, map: this) => boolean): [K, V][] {
    return this.#_entries.filter(([k, v]) => predicate(k, v, this));
  }

  /**
   * Finds the first key-value entry that matches a predicate.
   * @param predicate A function to test each entry.
   * @returns The first matching entry, or undefined.
   */
  findOne(
    predicate: (key: K, value: V, map: this) => boolean
  ): [K, V] | undefined {
    return this.#_entries.find(([k, v]) => predicate(k, v, this));
  }

  /**
   * Returns a new MultiMap with globally unique values, determined by a derived key from each value.
   * @param predicate Optional projection function to derive the comparison key from each value.
   * @returns A new MultiMap with only unique values.
   */
  toUnique<T>(predicate?: (v: V) => T): MultiMap<K, V> {
    const newMap = new MultiMap<K, V>();
    const seen = new Set<T | V>();

    for (const [key, value] of this.#_entries) {
      const identifier: T | V = predicate ? predicate(value) : value;
      if (!seen.has(identifier)) {
        seen.add(identifier);
        newMap.addOne(key, value);
      }
    }

    return newMap;
  }

  /**
   * Returns a new MultiMap with unique keys. Each key will have only the first unique value associated with it.
   * @returns A new MultiMap with unique keys.
   */
  toUniqueKeys(): MultiMap<K, V> {
    const newMap = new MultiMap<K, V>();
    const seenKeys: K[] = [];

    for (const [key, value] of this.#_entries) {
      if (!seenKeys.includes(key)) {
        newMap.addOne(key, value);
        seenKeys.push(key);
      }
    }

    return newMap;
  }
  /**
   * Returns a new MultiMap with unique values. Each value will be associated with only one key.
   * @returns A new MultiMap with unique values.
   */
  toUniqueValues(): MultiMap<K, V> {
    const newMap = new MultiMap<K, V>();
    const seenValues: V[] = [];

    for (const [key, value] of this.#_entries) {
      if (!seenValues.includes(value)) {
        newMap.addOne(key, value);
        seenValues.push(value);
      }
    }

    return newMap;
  }

  /**
   * Retrieves all keys associated with a given value.
   * @param value The value to look for.
   * @returns An array of keys that have the specified value.
   */
  getKeys(value: V): K[] {
    return this.#_entries.filter(([_, v]) => v === value).map(([k]) => k);
  }

  /**
   * Retrieves the entries associated with a specific key and returns them as a new MultiMap.
   * @param key The key to look up in the MultiMap.
   * @returns A new MultiMap containing the key-value pairs for that specific key.
   */
  getMap(key: K): MultiMap<K, V> {
    const entriesForKey = this.#_entries.filter(([k]) => k === key);
    return new MultiMap<K, V>(entriesForKey);
  }

  /**
   * Finds entries that match the provided predicate and returns them as a new MultiMap.
   * @param predicate A function that tests each key-value pair.
   * @returns A new MultiMap containing the matching entries.
   */
  findAndGetMap(predicate: (key: K, value: V) => boolean): MultiMap<K, V> {
    const matchingEntries = this.#_entries.filter(([key, value]) =>
      predicate(key, value)
    );
    return new MultiMap<K, V>(matchingEntries);
  }
}
