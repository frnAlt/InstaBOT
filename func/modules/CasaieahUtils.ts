export interface FlagsRaw extends Array<[string, boolean]> {}
export interface FlagsParsed extends Map<string, boolean> {}

import { TILE_REGISTRY } from "./CasaRegistry";

export type CasaTile = null | {
  id: string;
  name: string;
  price?: number;
  flags?: FlagsParsed;
  emoji: string;
};

export type CasaTileRaw = string;

export interface CasaRoom {
  tiles: Casa2d<CasaTile>;
  name: string;
  flags: FlagsParsed;
  width: number;
  height: number;
}

export interface CasaRoomRaw {
  tiles: CasaTileRaw[][];
  name: string;
  flags: FlagsRaw;
  width: number;
  height: number;
}

export class Casa2d<T extends CasaTile> {
  private grid: T[][];
  private room: CasaRoom;

  private constructor(grid: T[][] = [], room: CasaRoom) {
    this.grid = grid.map((d) => d.map((dd) => dd ?? null));
    this.room = room;
  }

  /** Construct CasaRoom from raw room */
  static fromRawRoom(room: CasaRoomRaw): CasaRoom {
    const newRoom: CasaRoom = {
      tiles: null!,
      name: `${room.name}`.replaceAll(" ", ""),
      width: Number(room.width),
      height: Number(room.height),
      flags: new Map(room.flags),
    };

    const tileGrid: CasaTile[][] = room.tiles.map((row) =>
      row.map((rawTile) => {
        if (rawTile === null) return null;

        const registry = TILE_REGISTRY.get(rawTile) ?? {
          name: rawTile,
          emoji: "❓",
          flags: [],
          price: 0,
          id: "unknown",
        };

        return {
          id: rawTile,
          price: registry.price,
          name: registry.name,
          emoji: registry.emoji,
          flags: new Map(registry.flags ?? []),
        };
      })
    );

    newRoom.tiles = new Casa2d(tileGrid, newRoom);
    return newRoom;
  }

  static createRoom(
    name: string,
    width: number,
    height: number,
    tileFactory: (x: number, y: number) => CasaTile
  ): CasaRoom {
    const room: CasaRoom = {
      name,
      width,
      height,
      flags: new Map(),
      tiles: null!,
    };
    const grid = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => tileFactory(x, y))
    );
    room.tiles = new Casa2d(grid, room);
    return room;
  }

  at(x: number, y: number): T | undefined {
    return this.inBounds(x, y) ? this.get(x, y) : undefined;
  }

  /** Export raw room (with no x/y — inferred by index) */
  exportAsRaw(): CasaRoomRaw {
    return {
      name: this.room.name,
      width: this.room.width,
      height: this.room.height,
      flags: Array.from(this.room.flags.entries()),
      tiles: this.mapRaw((tile) => tile?.id ?? null),
    };
  }

  // ==== Core Grid Methods ====

  get(x: number, y: number): T | undefined {
    return this.grid[y]?.[x];
  }

  set(x: number, y: number, value: T): void {
    if (!this.grid[y]) this.grid[y] = [];
    this.grid[y][x] = value ?? null;
  }

  row(y: number): T[] | undefined {
    return this.grid[y];
  }

  column(x: number): T[] {
    return this.grid.map((row) => row[x]);
  }

  get emptyCount() {
    return this.filter((i) => i === null).length;
  }
  get filledCount() {
    return this.filter((i) => i !== null).length;
  }

  map<U extends CasaTile>(fn: (tile: T, x: number, y: number) => U): Casa2d<U> {
    const newGrid = this.grid.map((row, y) =>
      row.map((tile, x) => fn(tile, x, y))
    );
    return new Casa2d(newGrid, this.room);
  }

  mapRaw<U>(fn: (tile: T, x: number, y: number) => U): U[][] {
    return this.grid.map((row, y) => row.map((tile, x) => fn(tile, x, y)));
  }

  forEach(fn: (tile: T, x: number, y: number) => void): void {
    this.grid.forEach((row, y) => row.forEach((tile, x) => fn(tile, x, y)));
  }

  entries(): { x: number; y: number; value: T }[] {
    const out: { x: number; y: number; value: T }[] = [];
    this.forEach((value, x, y) => out.push({ x, y, value }));
    return out;
  }
  *[Symbol.iterator]() {
    yield* this.entries();
  }

  find(
    fn: (tile: T, x: number, y: number) => boolean
  ): { x: number; y: number; value: T } | undefined {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.get(x, y);
        if (tile && fn(tile, x, y)) {
          return { x, y, value: tile };
        }
      }
    }
    return undefined;
  }

  filter(
    fn: (tile: T, x: number, y: number) => boolean
  ): { x: number; y: number; value: T }[] {
    const out: { x: number; y: number; value: T }[] = [];
    this.forEach((tile, x, y) => {
      if (fn(tile, x, y)) out.push({ x, y, value: tile });
    });
    return out;
  }

  every(fn: (tile: T, x: number, y: number) => boolean): boolean {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.get(x, y);
        if (!tile || !fn(tile, x, y)) return false;
      }
    }
    return true;
  }

  some(fn: (tile: T, x: number, y: number) => boolean): boolean {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const tile = this.get(x, y);
        if (tile && fn(tile, x, y)) return true;
      }
    }
    return false;
  }

  clone(): Casa2d<T> {
    const cloned = this.grid.map((row) => [...row]);
    return new Casa2d(cloned, this.room);
  }

  toArray(): T[][] {
    return this.grid.map((row) => [...row]);
  }

  fill(value: T): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.set(x, y, value);
      }
    }
  }

  fillWith(fn: (x: number, y: number) => T): void {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        this.set(x, y, fn(x, y));
      }
    }
  }

  rotate90(): Casa2d<T> {
    const newGrid: T[][] = [];
    for (let x = 0; x < this.width; x++) {
      const newRow: T[] = [];
      for (let y = this.height - 1; y >= 0; y--) {
        newRow.push(this.grid[y][x]);
      }
      newGrid.push(newRow);
    }
    return new Casa2d(newGrid, this.room);
  }

  mapPerX<U>(fn: (column: T[], x: number) => U): U[] {
    const result: U[] = [];
    for (let x = 0; x < this.width; x++) {
      const column = this.grid.map((row) => row[x]);
      result.push(fn(column, x));
    }
    return result;
  }

  mapPerY<U>(fn: (row: T[], y: number) => U): U[] {
    return this.grid.map((row, y) => fn(row, y));
  }

  transpose(): Casa2d<T> {
    const newGrid: T[][] = [];
    for (let x = 0; x < this.width; x++) {
      const row: T[] = [];
      for (let y = 0; y < this.height; y++) {
        row.push(this.grid[y][x]);
      }
      newGrid.push(row);
    }
    return new Casa2d(newGrid, this.room);
  }

  inBounds(x: number, y: number): boolean {
    return y >= 0 && y < this.height && x >= 0 && x < this.width;
  }

  get width(): number {
    return this.grid[0]?.length ?? 0;
  }

  get height(): number {
    return this.grid.length;
  }

  getCoords(target: T): [number, number] | undefined {
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] === target) return [x, y];
      }
    }
  }

  get canWidth(): number {
    return (
      this.width * this.tileSize +
      (this.width + 1) * this.spacing +
      this.marginBorder * 2
    );
  }

  get canHeight(): number {
    return (
      this.height * this.tileSize +
      (this.height + 1) * this.spacing +
      this.marginBorder * 2
    );
  }

  rectAt(x: number, y: number) {
    const left =
      this.marginBorder + this.spacing + x * (this.tileSize + this.spacing);
    const top =
      this.marginBorder + this.spacing + y * (this.tileSize + this.spacing);

    return CanvCass.createRect({
      width: this.tileSize,
      height: this.tileSize,
      left,
      top,
    });
  }

  getTileCenter(x: number, y: number): [number, number] {
    const left =
      this.marginBorder + this.spacing + x * (this.tileSize + this.spacing);
    const top =
      this.marginBorder + this.spacing + y * (this.tileSize + this.spacing);
    return [left + this.tileSize / 2, top + this.tileSize / 2];
  }

  tileSize = 45;
  spacing = 5;
  marginBorder = 20;

  async renderView(): Promise<CanvCass> {
    const can = new CanvCass(this.canWidth, this.canHeight);
    await can.drawBackground();
    const labelSize = this.marginBorder / 2;
    const labelColor = "rgba(255, 255, 255, 0.5)";

    for (let x = 0; x < this.width; x++) {
      const centerX =
        this.marginBorder +
        this.spacing +
        x * (this.tileSize + this.spacing) +
        this.tileSize / 2;

      const label = `${x + 1}`;

      can.drawText(label, {
        align: "center",
        baseline: "middle",
        size: labelSize,
        fill: labelColor,
        fontType: "cbold",
        x: centerX,
        y: this.marginBorder / 2,
      });

      can.drawText(label, {
        align: "center",
        baseline: "middle",
        size: labelSize,
        fill: labelColor,
        fontType: "cbold",
        x: centerX,
        y: this.canHeight - this.marginBorder / 2,
      });
    }

    for (let y = 0; y < this.height; y++) {
      const centerY =
        this.marginBorder +
        this.spacing +
        y * (this.tileSize + this.spacing) +
        this.tileSize / 2;

      const label = `${y + 1}`;

      can.drawText(label, {
        align: "center",
        baseline: "middle",
        size: labelSize,
        fill: labelColor,
        fontType: "cbold",
        x: this.marginBorder / 2,
        y: centerY,
      });

      can.drawText(label, {
        align: "center",
        baseline: "middle",
        size: labelSize,
        fill: labelColor,
        fontType: "cbold",
        x: this.canWidth - this.marginBorder / 2,
        y: centerY,
      });
    }
    for (const { value, x, y } of this) {
      if (!this.inBounds(x, y)) continue;
      const rect = this.rectAt(x, y);
      const emojiSize = (rect.height + rect.width) / 2 - this.spacing * 2;
      can.drawBox({
        rect,
        fill: "rgba(0, 0, 0, 0.5)",
      });
      if (value === null) continue;

      can.drawText(`${value.emoji}`, {
        align: "center",
        baseline: "middle",
        size: emojiSize,
        fill: "white",
        fontType: "cnormal",
        x: rect.centerX,
        y: rect.centerY,
      });
    }
    return can;
  }
}

export interface CasaieahParsed {
  rooms: CasaRoom[];
  flags: FlagsParsed;
}

export interface CasaieahRaw {
  rooms: CasaRoomRaw[];
  flags: FlagsRaw;
}

export namespace Casaieah {
  export function parse(raw: CasaieahRaw): CasaieahParsed {
    const rooms: CasaRoom[] = raw.rooms.map((roomRaw) =>
      Casa2d.fromRawRoom(roomRaw)
    );
    const flags: FlagsParsed = new Map(raw.flags);
    return { rooms, flags };
  }

  export function exportRaw(parsed: CasaieahParsed): CasaieahRaw {
    const rooms: CasaRoomRaw[] = parsed.rooms.map((room) =>
      room.tiles.exportAsRaw()
    );
    const flags: FlagsRaw = Array.from(parsed.flags.entries());
    return { rooms, flags };
  }

  export function createDefault(): CasaieahRaw {
    return {
      flags: [],
      rooms: [],
    };
  }

  export async function fromDB(userID: string) {
    const { usersDB } = Cassidy.databases;
    const res = await usersDB.queryItem(userID, "casaieah");
    const { casaieah = createDefault() } = res;
    return {
      raw: casaieah,
      parsed: parse(casaieah),
    };
  }
  export async function toDB(
    userID: string,
    casa: CasaieahParsed,
    extra: Partial<UserData> = {}
  ) {
    const { usersDB } = Cassidy.databases;
    const raw = exportRaw(casa);
    await usersDB.setItem(userID, {
      ...extra,
      casaieah: raw,
    });
  }

  export function getRoom(
    parsed: CasaieahParsed,
    name: string
  ): CasaRoom | undefined {
    return parsed.rooms.find((room) => room.name === name);
  }

  export const registry = TILE_REGISTRY;

  export function parseInputCoords(x: string | number, y: string | number) {
    return [Number(x) - 1, Number(y) - 1];
  }

  export const itemType = "casatile";
  export type Item = UserData["inventory"][number] & {
    type: typeof itemType;
    tileID: string;
  };

  export function itemToTile(item: Item): CasaTile | null {
    if (item.type !== "casatile" || !item.tileID) {
      return null;
    }
    const found = registry.get(item.tileID);
    if (!found) return null;
    return {
      emoji: String(found.emoji),
      name: String(found.name),
      flags: new Map(found.flags ?? []),
      id: String(found.id),
      price: found.price,
    };
  }
  export function tileToItem(tile: CasaTile): Item | null {
    if (!tile) return null;
    return {
      tileID: tile.id,
      type: itemType,
      icon: `🔨${tile.emoji}`,
      name: `CasaTile - ${tile.name}`,
      key: `casa_${tile.id}`,
      flavorText: "This item can be used with Casa.",
    };
  }
}
import { CanvCass } from "./CassieahExtras";
