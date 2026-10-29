import { CollectibleItem, InventoryItem } from "@cass-modules/cassidyUser";
import { readFileSync } from "fs";
import { Datum } from "./Datum";
import { v4 as uuidv4 } from "uuid";
import { MultiMap } from "./Multimap";

/**
 * Inventory Class for CassidySpectra
 * ------------
 * Simplifies management of items, etc.
 * @author lianecagara
 */
export class Inventory<T extends InventoryItem = InventoryItem> {
  /** The maximum number of items the inventory can hold. */
  limit: number;

  /** The array of items in the inventory. */
  inv: T[];

  /**
   * Generates a unique identifier based on a timestamp and UUID.
   * @param ts - The timestamp to use (defaults to current time).
   * @returns A unique string identifier.
   */
  static generateUUID(ts = Date.now()) {
    return `${ts}_${uuidv4()}`;
  }

  /**
   * Constructs a new Inventory instance.
   * @param inventory - Initial array of items (defaults to empty array).
   * @param limit - Maximum number of items allowed (defaults to global.Cassidy.invLimit).
   */
  constructor(
    inventory: T[] = [],
    limit: number | null = global.Cassidy.invLimit
  ) {
    inventory ??= [];

    this.limit = limit;

    this.inv = this.sanitize(JSON.parse(JSON.stringify(inventory)));
    this.removeDuplicates();
  }

  /**
   * Sanitizes the inventory array, ensuring valid item properties and sorting by name.
   * @param inv - The inventory array to sanitize (defaults to current inventory).
   * @returns The sanitized array of items.
   */
  sanitize(inv = this.inv): T[] {
    if (!Array.isArray(inv)) {
      throw new Error("Inventory must be an array.");
    }
    let result = inv.map((item, index) => {
      if (!item) {
        return;
      }
      const {
        name = "Unknown Item",
        key = "",
        flavorText = "Mysteriously not known to anyone.",
        icon = "❓",
        type = "generic",
        cannotToss = false,
        sellPrice = 0,
        uuid = Inventory.generateUUID(),
      } = item;
      if (!key) {
        return;
      }

      let result: T = {
        ...item,
        uuid,
        name: String(name),
        key: String(key).replaceAll(" ", "_"),
        flavorText: String(flavorText),
        icon: String(icon),
        type: String(type),
        index: Number(index),
        sellPrice: Number(sellPrice),
        cannotToss: Boolean(cannotToss),
      };
      if (type === "food") {
        result.heal ??= 0;
        result.heal = Number(result.heal);
      }
      if (type === "weapon" || type === "armor") {
        result.atk ??= 0;
        result.def ??= 0;
        result.atk = Number(result.atk);
        result.def = Number(result.def);
      }
      return result;
    });
    return result
      .filter(Boolean)
      .sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
  }

  /**
   * @deprecated Use array indexing or other methods instead.
   * Retrieves an item at the specified index (1-based).
   * @param index - The 1-based index of the item.
   * @returns The item at the specified index or undefined if invalid.
   */
  _deprecated_at(index: number) {
    const parsedIndex = parseInt(String(index));
    return isNaN(parsedIndex) ? undefined : this.inv.at(parsedIndex - 1);
  }

  /**
   * Retrieves the first item matching the specified key.
   * @param key - The key or index to search for.
   * @returns The first matching item or undefined if not found.
   */
  getOne(key: string | number): T {
    if (!key) {
      return;
    }
    return this.inv.find((item) => item.key === key);
  }

  /**
   * Retrieves all items matching the specified key.
   * @param key - The key or index to search for.
   * @returns An array of matching items.
   */
  get(key: string | number): T[] {
    if (!key) {
      return [];
    }
    return this.inv.filter((item) => item.key === key);
  }

  /**
   * Retrieves all items in the inventory. (Live)
   * @returns An array of all items.
   */
  getAll(): T[] {
    return this.inv;
  }

  /**
   * Retrieves all items matching the specified UUID.
   * @param id - The UUID to search for.
   * @returns An array of matching items.
   */
  getByID(id: string) {
    return this.getBy("uuid", id);
  }

  /**
   * Counts the number of items matching the specified UUID.
   * @param id - The UUID to count.
   * @returns The number of matching items.
   */
  countByID(id: string) {
    return this.countBy("uuid", id);
  }

  /**
   * Retrieves the first item matching the specified UUID.
   * @param id - The UUID to search for.
   * @returns The first matching item or undefined if not found.
   */
  getOneByID(id: string) {
    return this.getOneBy("uuid", id);
  }

  /**
   * Checks if an item with the specified UUID exists.
   * @param id - The UUID to check.
   * @returns True if an item exists, false otherwise.
   */
  hasByID(id: string) {
    return this.hasBy("uuid", id);
  }

  /**
   * Deletes all items matching the specified UUID.
   * @param id - The UUID to delete.
   */
  deleteByID(id: string) {
    return this.deleteBy("uuid", id);
  }

  /**
   * Deletes the first item matching the specified UUID.
   * @param id - The UUID to delete.
   * @returns True if an item was deleted, false otherwise.
   */
  deleteOneByID(id: string) {
    return this.deleteOneBy("uuid", id);
  }

  /**
   * Checks if an item with the same UUID exists in the inventory.
   * @param item - The UUID string or InventoryItem to check.
   * @returns True if an item with the same UUID exists, false otherwise.
   */
  isDuplicate(item: string | T): boolean {
    const uuid = typeof item === "string" ? item : item.uuid;
    return this.countByID(uuid) > 1;
  }

  /**
   * Checks if the inventory contains any items with duplicate UUIDs.
   * @returns True if any UUID appears more than once, false otherwise.
   */
  hasDuplicates(): boolean {
    return this.inv.some((item) => this.isDuplicate(item));
  }

  /**
   * Removes duplicate items from the inventory based on UUID, keeping the first occurrence.
   */
  removeDuplicates(): void {
    this.inv = this.toUnique((i) => i.uuid);
  }

  /**
   * Retrieves all items matching the specified property and value.
   * @param prop - The property to search by.
   * @param value - The value to match.
   * @returns An array of matching items.
   */
  getBy<K extends keyof T>(prop: K, value: T[K]): T[] {
    if (!prop) {
      return [];
    }
    return this.inv.filter((item) => item[prop] === value);
  }

  /**
   * Counts the number of items matching the specified property and value.
   * @param prop - The property to count by.
   * @param value - The value to match.
   * @returns The number of matching items.
   */
  countBy<K extends keyof T>(prop: K, value: T[K]): number {
    return this.getBy(prop, value).length;
  }

  /**
   * Checks if any items match the specified property and value.
   * @param prop - The property to check.
   * @param value - The value to match.
   * @returns True if any items match, false otherwise.
   */
  hasBy<K extends keyof T>(prop: K, value: T[K]): boolean {
    return this.getBy(prop, value).length > 0;
  }

  /**
   * Retrieves the first item matching the specified property and value.
   * @param prop - The property to search by.
   * @param value - The value to match.
   * @returns The first matching item or undefined if not found.
   */
  getOneBy<K extends keyof T>(prop: K, value: T[K]): T | undefined {
    return this.getBy(prop, value)[0];
  }

  /**
   * Deletes the first item matching the specified property and value.
   * @param prop - The property to match.
   * @param value - The value to match.
   * @returns True if an item was deleted, false otherwise.
   */
  deleteOneBy<K extends keyof T>(prop: K, value: T[K]): boolean {
    let index = this.inv.findIndex((item) => item[prop] === value);
    if (index === -1) {
      return false;
    }
    this.inv = this.inv.filter((_, i) => i !== index);
    this.resanitize();
    return true;
  }

  /**
   * Deletes all items matching the specified property and value.
   * @param prop - The property to match.
   * @param value - The value to match.
   */
  deleteBy<K extends keyof T>(prop: K, value: T[K]) {
    this.inv = this.inv.filter((item) => item[prop] !== value);
    this.resanitize();
  }

  /**
   * Deletes an item by reference or index.
   * @param item - The item reference to delete.
   */
  deleteRef(item: T) {
    let index1 = this.inv.indexOf(item);
    let index =
      index1 === -1 ? this.inv.indexOf(this.getOneByID(item.uuid)) : index1;

    if (index !== -1) {
      this.inv.splice(index, 1);
    }
    this.resanitize();
  }

  /**
   * Deletes multiple items by reference or index.
   * @param items - Array of items or indices to delete.
   */
  deleteRefs(items: Parameters<typeof this.deleteRef>[0][]) {
    for (const item of items) {
      this.deleteRef(item);
    }
    this.resanitize();
  }

  /**
   * Finds the key of the first item matching the callback condition.
   * @param callback - Function to test each item.
   * @returns The key of the first matching item or null if none found.
   */
  findKey(callback: (item: T) => boolean) {
    const result = this.inv.find((item) => callback(item));
    if (result) {
      return result.key;
    } else {
      return null;
    }
  }

  /**
   * Returns the index of the specified item.
   * @param item - The item to find.
   * @returns The index of the item or -1 if not found.
   */
  indexOf(item: T): number {
    return this.inv.indexOf(item) === -1
      ? this.inv.indexOf(this.getOneByID(item.uuid))
      : this.inv.indexOf(item);
  }

  /**
   * Returns the total number of items in the inventory.
   * @returns The number of items.
   */
  size(): number {
    return this.inv.length;
  }

  /**
   * Returns the number of unique items in the inventory.
   * @returns The number of unique items.
   */
  uniqueSize(): number {
    return this.toUnique().length;
  }

  /**
   * Returns an array of unique items based on a callback or key.
   * @param callback - Function to determine uniqueness (defaults to item key).
   * @returns Array of unique items.
   */
  toUnique(callback?: (item: T) => any) {
    return Datum.toUniqueArray<T, any>(this.inv, callback ?? ((i) => i.key));
  }

  /**
   * Creates a new inventory with unique items.
   * @param callback - Function to determine uniqueness (defaults to item key).
   * @returns A new Inventory instance with unique items.
   */
  toUniqueInventory(callback?: (item: T) => any) {
    return new Inventory<T>(this.toUnique(callback));
  }

  /**
   * Creates a deep copy of the inventory.
   * @returns A new Inventory instance with copied items.
   */
  clone(): Inventory<T> {
    return new Inventory<T>(this.inv);
  }

  /**
   * Merges another inventory into this one.
   * @param other - The inventory to merge.
   * @returns This inventory instance after merging.
   */
  merge(other: Inventory<T>): Inventory<T> {
    if (!(other instanceof Inventory)) {
      throw new Error("Argument must be an Inventory instance.");
    }
    const combined = [...this.inv, ...other.inv];
    if (this.limit && combined.length > this.limit) {
      throw new Error(
        `Cannot merge: exceeds inventory limit of ${this.limit}.`
      );
    }
    this.inv = this.sanitize(combined);
    this.removeDuplicates();
    return this;
  }

  /**
   * Filters items by their type.
   * @param type - The type to filter by.
   * @returns An array of items matching the specified type.
   */
  filterByType(type: string): T[] {
    if (!type) return [];
    return this.inv.filter((item) => item.type === type);
  }

  /**
   * Finds items by name, optionally case-sensitive.
   * @param name - The name to search for.
   * @param caseSensitive - Whether the search is case-sensitive (defaults to false).
   * @returns An array of items with matching names.
   */
  findByName(name: string, caseSensitive = false): T[] {
    if (!name) return [];
    const search = caseSensitive ? name : name.toLowerCase();
    return this.inv.filter((item) =>
      caseSensitive
        ? item.name.includes(search)
        : item.name.toLowerCase().includes(search)
    );
  }

  /**
   * Groups items by their key.
   * @returns A Map with keys mapping to arrays of items.
   */
  groupByKey(): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of this.inv) {
      const key = item.key;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }
    return map;
  }

  /**
   * Checks if the inventory has reached its limit.
   * @returns True if the inventory is full, false otherwise.
   */
  isFull(): boolean {
    return this.limit !== null && this.inv.length >= this.limit;
  }

  /**
   * Adds items to the inventory if within limit.
   * @param item - The item or array of items to add.
   * @returns True if items were added, false if limit exceeded.
   */
  addSafe(item: T | T[]): boolean {
    const items = Array.isArray(item) ? item : [item];
    if (this.limit !== null && this.inv.length + items.length > this.limit) {
      return false;
    }
    this.inv.push(...items);
    this.resanitize();
    return true;
  }

  /**
   * Swaps two items in the inventory by their indices.
   * @param index1 - The index of the first item.
   * @param index2 - The index of the second item.
   * @returns True if the swap was successful, false otherwise.
   */
  swap(index1: number, index2: number): boolean {
    if (
      index1 < 0 ||
      index2 < 0 ||
      index1 >= this.inv.length ||
      index2 >= this.inv.length
    ) {
      return false;
    }
    [this.inv[index1], this.inv[index2]] = [this.inv[index2], this.inv[index1]];
    this.resanitize();
    return true;
  }

  /**
   * Returns a string representation of the inventory.
   * @returns A formatted string of the inventory contents.
   */
  toString(): string {
    if (!this.inv.length) return "Inventory: Empty";
    const items = this.inv
      .map((item, i) => `${i + 1}. ${item.name} (${item.key}, ${item.type})`)
      .join("\n");
    return `Inventory (${this.inv.length}/${this.limit ?? "∞"}):\n${items}`;
  }

  /**
   * Validates the inventory for missing or invalid properties.
   * @returns An object indicating validity and any errors.
   */
  validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    this.inv.forEach((item, index) => {
      if (!item.key) errors.push(`Item at index ${index} missing key.`);
      if (!item.name) errors.push(`Item at index ${index} missing name.`);
      if (item.type === "food" && typeof item.heal !== "number") {
        errors.push(`Food item at index ${index} has invalid heal value.`);
      }
      if (
        ["weapon", "armor"].includes(item.type) &&
        (typeof item.atk !== "number" || typeof item.def !== "number")
      ) {
        errors.push(`Weapon/armor at index ${index} has invalid atk/def.`);
      }
    });
    return { valid: errors.length === 0, errors };
  }

  /**
   * Converts the inventory to an array of key-value pairs.
   * @returns An array of objects with key and value properties.
   */
  toKeyValueArray(): { key: string; value: T }[] {
    return this.inv.map((item) => ({ key: item.key, value: item }));
  }

  /**
   * Converts the inventory to an array of key-item tuples.
   * @returns An array of tuples with key and item.
   */
  toEntries(): [string, T][] {
    return this.inv.map((item) => [item.key, item]);
  }

  /**
   * Returns a Set of all item UUIDs.
   * @returns A Set of UUIDs.
   */
  toUUIDSet(): Set<string> {
    return new Set(this.inv.map((item) => item.uuid));
  }

  /**
   * Returns a Set of all item keys.
   * @returns A Set of keys.
   */
  toKeySet(): Set<string> {
    return new Set(this.inv.map((item) => item.key));
  }

  /**
   * Groups items by their type into a Map.
   * @returns A Map with types mapping to arrays of items.
   */
  toTypeMap(): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const item of this.inv) {
      if (!map.has(item.type)) {
        map.set(item.type, []);
      }
      map.get(item.type)!.push(item);
    }
    return map;
  }

  /**
   * Converts the inventory to a Map of keys to item arrays.
   * @returns A Map with keys mapping to arrays of items.
   */
  toMap(): Map<string, T[]> {
    const map = new Map<string, T[]>();
    for (const [key, item] of this.toEntries()) {
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }
    return map;
  }

  /**
   * Converts the inventory to a MultiMap of keys to items.
   * @returns A MultiMap with keys mapping to items.
   */
  toMultiMap(): MultiMap<string, T> {
    return new MultiMap(this.toEntries());
  }

  /**
   * Converts the inventory to an object with keys mapping to item arrays.
   * @returns An object with keys mapping to arrays of items.
   */
  toObject(): Record<string, T[]> {
    const obj: Record<string, T[]> = {};
    for (const item of this.inv) {
      if (!obj[item.key]) {
        obj[item.key] = [];
      }
      obj[item.key].push(item);
    }
    return obj;
  }

  /**
   * Converts the inventory to a JSON-compatible array.
   * @returns An array of items.
   */
  toJSON(): T[] {
    return this.inv;
  }

  /**
   * Deletes the first item matching the specified key.
   * @param key - The key to delete.
   * @returns True if an item was deleted, false otherwise.
   */
  deleteOne(key: string | number): boolean {
    let index = this.inv.findIndex((item) => item.key === key);
    if (index === -1) {
      return false;
    }
    this.inv = this.inv.filter((_, i) => i !== index);
    this.resanitize();
    return true;
  }

  /**
   * @deprecated Use getOne or other methods instead.
   * Retrieves the key of an item at the specified index.
   * @param index - The index of the item.
   * @returns The key of the item or undefined if not found.
   */
  _deprecated_keyAt(index: number | string): string {
    return this._deprecated_at(Number(index))?.key;
  }

  /**
   * Deletes all items matching the specified key.
   * @param key - The key to delete.
   */
  delete(key: string | number) {
    this.inv = this.inv.filter((item) => item.key !== key);
    this.resanitize();
  }

  /**
   * Checks if an item with the specified key exists.
   * @param key - The key to check.
   * @returns True if an item exists, false otherwise.
   */
  has(key: string | number): boolean {
    if (!key) {
      return false;
    }
    return this.inv.some((item) => item.key === key);
  }

  /**
   * Checks if the inventory has at least the specified amount of items with the given key.
   * @param key - The key to check.
   * @param amount - The minimum number of items required.
   * @returns True if the inventory has enough items, false otherwise.
   */
  hasAmount(key: string | number, amount: number): boolean {
    const length = this.getAmount(key);
    return length >= amount;
  }

  /**
   * Counts the number of items with the specified key.
   * @param key - The key to count.
   * @returns The number of matching items.
   */
  getAmount(key: string | number): number {
    return this.get(key).length;
  }

  /**
   * Counts the number of items with the specified key (alias for getAmount).
   * @param key - The key to count.
   * @returns The number of matching items.
   */
  count(key: string) {
    return this.getAmount(key);
  }

  /**
   * Adds a single item to the inventory.
   * @param item - The item to add.
   * @returns The new length of the inventory.
   */
  addOne(item: T): number {
    const i = this.inv.push(item);
    this.resanitize();
    return i;
  }

  /**
   * Adds multiple items to the inventory.
   * @param item - The array of items to add.
   * @returns The new length of the inventory.
   */
  add(item: T[]): number {
    const i = this.inv.push(...item);
    this.resanitize();
    return i;
  }

  /**
   * Removes a specified number of items with the given key.
   * @param key - The key of the items to remove.
   * @param amount - The number of items to remove or "all" to remove all.
   */
  toss(key: string | number, amount: number | "all") {
    if (amount === "all") {
      amount = this.getAmount(key);
    }

    for (let i = 0; i < amount; i++) {
      this.deleteOne(key);
    }
    this.resanitize();
  }

  /**
   * @deprecated Use toss instead.
   * Removes a specified number of items with the given key.
   * @param key - The key of the items to remove.
   * @param amount - The number of items to remove or "all" to remove all.
   * @returns The number of items removed.
   */
  tossDEPRECATED(key: string | number, amount: number | "all"): number {
    if (amount === "all") {
      const i = this.getAmount(key);
      this.delete(key);
      return i;
    }
    let r = 0;
    for (let i = 0; i < amount; i++) {
      if (!this.has(key)) {
        break;
      }
      this.deleteOne(key);
      r++;
    }
    this.resanitize();
    return r;
  }

  /**
   * Sets the number of items with the specified key by adding existing items.
   * @param key - The key of the items.
   * @param amount - The number of items to set.
   */
  setAmount(key: string | number, amount: number) {
    const data = this.get(key);
    for (let i = 0; i < amount; i++) {
      this.addOne(data[i]);
    }
    this.resanitize();
  }

  /**
   * Iterator for the inventory items.
   * @yields Each item in the inventory.
   */
  *[Symbol.iterator]() {
    yield* this.inv;
  }

  /**
   * Returns a copy of the inventory array.
   * @returns An array of all items.
   */
  raw(): T[] {
    return Array.from(this.inv);
  }

  /**
   * Iterator for the keys of all items.
   * @yields Each item key in the inventory.
   */
  *keys() {
    yield* this.inv.map((item) => item.key);
  }

  /**
   * Creates an Inventory instance from various data sources.
   * @param data - The data to create the inventory from (array, Inventory, or object with key).
   * @param key - The property key to extract items from an object (defaults to "inventory").
   * @returns A new Inventory instance.
   */
  static from<T extends InventoryItem>(data: T, key = "inventory") {
    if (Array.isArray(data)) {
      return new Inventory<T>(data);
    }
    if (data instanceof Inventory) {
      return data.clone();
    }
    if (typeof data === "object" && data && key in data) {
      return new Inventory<T>(data[key] as T[]);
    }
    return new Inventory<T>([]);
  }

  /**
   * Re-sanitizes the current inventory.
   */
  resanitize() {
    this.inv = this.sanitize(this.inv);
    this.removeDuplicates();
  }
}

export class Collectibles<T extends CollectibleItem = CollectibleItem> {
  #collectibles: T[];

  constructor(collectibles: T[] = []) {
    this.#collectibles = this.sanitize(collectibles);
    try {
      const data = JSON.parse(
        readFileSync(
          process.cwd() +
            "/CommandFiles/resources/collectibles/collectibles.json",
          "utf-8"
        )
      );
      for (const key in data) {
        const meta = data[key];
        this.register(key, meta);
      }
    } catch (error) {
      console.error(error);
    }
  }

  get collectibles() {
    return this.#collectibles;
  }

  sanitize(c = this.#collectibles) {
    const collectibleMap = new Map<string, T>();

    for (let i = c.length - 1; i >= 0; i--) {
      const collectible = c[i];
      if (!collectible.metadata) continue;

      let {
        key,
        name = "Unknown Collectible",
        icon = "❓",
        type = "generic",
        limit = undefined,
      } = collectible.metadata;

      if (!key) continue;

      if (collectibleMap.has(key)) {
        collectibleMap.get(key).amount += Math.abs(collectible.amount);
      } else {
        collectibleMap.set(key, {
          metadata: { key, name, icon, type, limit },
          amount: Math.abs(collectible.amount),
        } as T);
      }
    }

    return Array.from(collectibleMap.values());
  }
  register(key: string, metadata: T["metadata"]) {
    let index = this.#collectibles.findIndex((c) => c?.metadata.key === key);
    if (index === -1) {
      this.#collectibles.push({ metadata, amount: 0 } as T);
      index = this.#collectibles.length - 1;
    } else {
      this.#collectibles[index].metadata = metadata;
    }
    this.#collectibles = this.sanitize(this.#collectibles);
    this.combineDuplicates();
    return index;
  }

  combineDuplicates() {
    const collectibleMap = new Map();
    for (const collectible of this.#collectibles) {
      const key = collectible.metadata.key;
      const amount = collectible.amount;
      if (collectibleMap.has(key)) {
        collectibleMap.get(key).amount += amount;
      } else {
        collectibleMap.set(key, { ...collectible });
      }
    }
    this.#collectibles = Array.from(collectibleMap.values());
  }

  raiseOne(key: string) {
    return this.raise(key, 1);
  }

  getAll() {
    return this.collectibles;
  }

  toJSON() {
    return this.getAll();
  }

  *[Symbol.iterator]() {
    yield* this.collectibles;
  }

  *keys() {
    yield* this.collectibles.map((c) => c.metadata.key);
  }

  raise(key: string, amount = 0) {
    this.validate(key);
    if (isNaN(amount)) {
      throw new Error("Amount must be a number.");
    }
    const data = this.get(key);
    data.amount = (data.amount ?? 0) + amount;
    if (data.metadata.limit) {
      data.amount = Math.min(data.amount, data.metadata.limit);
    }
    return data.amount;
  }

  get(key: string) {
    return this.collectibles.find((c) => c?.metadata.key === key);
  }

  set(key: string, amount: number) {
    this.validate(key);
    const index = this.#collectibles.findIndex((c) => c?.metadata.key === key);
    if (index !== -1) {
      this.#collectibles[index].amount = amount;
      if (this.#collectibles[index].metadata.limit) {
        this.#collectibles[index].amount = Math.min(
          this.#collectibles[index].amount,
          this.#collectibles[index].metadata.limit
        );
      }
    }
    return index;
  }

  getAmount(key: string) {
    return this.get(key)?.amount ?? 0;
  }

  hasAmount(key: string, amount: number) {
    return this.getAmount(key) >= (amount ?? 1);
  }

  has(key: string) {
    return this.get(key) !== undefined;
  }

  atLimit(key: string) {
    const data = this.get(key);
    return (
      data?.metadata.limit !== undefined && data.amount >= data.metadata.limit
    );
  }

  validate(key: string) {
    if (!this.get(key)) {
      throw new Error(`Collectible "${key}" is not yet registered.`);
    }
  }

  getMeta(key: string) {
    return this.get(key)?.metadata;
  }

  remove(key: string) {
    this.validate(key);
    this.#collectibles = this.#collectibles.filter(
      (c) => c?.metadata.key !== key
    );
  }

  removeEmpty() {
    for (const key of this.keys()) {
      const amount = this.getAmount(key);
      if (amount === 0) {
        this.remove(key);
      }
    }
    return this.collectibles;
  }

  resetAmount(key: string) {
    this.validate(key);
    const data = this.get(key);
    if (data) {
      data.amount = 0;
    }
    return data.amount;
  }
}
