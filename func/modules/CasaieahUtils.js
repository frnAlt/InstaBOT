"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Casaieah = exports.Casa2d = void 0;
const CasaRegistry_1 = require("./CasaRegistry");
class Casa2d {
    grid;
    room;
    constructor(grid = [], room) {
        this.grid = grid.map((d) => d.map((dd) => dd ?? null));
        this.room = room;
    }
    /** Construct CasaRoom from raw room */
    static fromRawRoom(room) {
        const newRoom = {
            tiles: null,
            name: `${room.name}`.replaceAll(" ", ""),
            width: Number(room.width),
            height: Number(room.height),
            flags: new Map(room.flags),
        };
        const tileGrid = room.tiles.map((row) => row.map((rawTile) => {
            if (rawTile === null)
                return null;
            const registry = CasaRegistry_1.TILE_REGISTRY.get(rawTile) ?? {
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
        }));
        newRoom.tiles = new Casa2d(tileGrid, newRoom);
        return newRoom;
    }
    static createRoom(name, width, height, tileFactory) {
        const room = {
            name,
            width,
            height,
            flags: new Map(),
            tiles: null,
        };
        const grid = Array.from({ length: height }, (_, y) => Array.from({ length: width }, (_, x) => tileFactory(x, y)));
        room.tiles = new Casa2d(grid, room);
        return room;
    }
    at(x, y) {
        return this.inBounds(x, y) ? this.get(x, y) : undefined;
    }
    /** Export raw room (with no x/y — inferred by index) */
    exportAsRaw() {
        return {
            name: this.room.name,
            width: this.room.width,
            height: this.room.height,
            flags: Array.from(this.room.flags.entries()),
            tiles: this.mapRaw((tile) => tile?.id ?? null),
        };
    }
    // ==== Core Grid Methods ====
    get(x, y) {
        return this.grid[y]?.[x];
    }
    set(x, y, value) {
        if (!this.grid[y])
            this.grid[y] = [];
        this.grid[y][x] = value ?? null;
    }
    row(y) {
        return this.grid[y];
    }
    column(x) {
        return this.grid.map((row) => row[x]);
    }
    get emptyCount() {
        return this.filter((i) => i === null).length;
    }
    get filledCount() {
        return this.filter((i) => i !== null).length;
    }
    map(fn) {
        const newGrid = this.grid.map((row, y) => row.map((tile, x) => fn(tile, x, y)));
        return new Casa2d(newGrid, this.room);
    }
    mapRaw(fn) {
        return this.grid.map((row, y) => row.map((tile, x) => fn(tile, x, y)));
    }
    forEach(fn) {
        this.grid.forEach((row, y) => row.forEach((tile, x) => fn(tile, x, y)));
    }
    entries() {
        const out = [];
        this.forEach((value, x, y) => out.push({ x, y, value }));
        return out;
    }
    *[Symbol.iterator]() {
        yield* this.entries();
    }
    find(fn) {
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
    filter(fn) {
        const out = [];
        this.forEach((tile, x, y) => {
            if (fn(tile, x, y))
                out.push({ x, y, value: tile });
        });
        return out;
    }
    every(fn) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.get(x, y);
                if (!tile || !fn(tile, x, y))
                    return false;
            }
        }
        return true;
    }
    some(fn) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const tile = this.get(x, y);
                if (tile && fn(tile, x, y))
                    return true;
            }
        }
        return false;
    }
    clone() {
        const cloned = this.grid.map((row) => [...row]);
        return new Casa2d(cloned, this.room);
    }
    toArray() {
        return this.grid.map((row) => [...row]);
    }
    fill(value) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.set(x, y, value);
            }
        }
    }
    fillWith(fn) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.set(x, y, fn(x, y));
            }
        }
    }
    rotate90() {
        const newGrid = [];
        for (let x = 0; x < this.width; x++) {
            const newRow = [];
            for (let y = this.height - 1; y >= 0; y--) {
                newRow.push(this.grid[y][x]);
            }
            newGrid.push(newRow);
        }
        return new Casa2d(newGrid, this.room);
    }
    mapPerX(fn) {
        const result = [];
        for (let x = 0; x < this.width; x++) {
            const column = this.grid.map((row) => row[x]);
            result.push(fn(column, x));
        }
        return result;
    }
    mapPerY(fn) {
        return this.grid.map((row, y) => fn(row, y));
    }
    transpose() {
        const newGrid = [];
        for (let x = 0; x < this.width; x++) {
            const row = [];
            for (let y = 0; y < this.height; y++) {
                row.push(this.grid[y][x]);
            }
            newGrid.push(row);
        }
        return new Casa2d(newGrid, this.room);
    }
    inBounds(x, y) {
        return y >= 0 && y < this.height && x >= 0 && x < this.width;
    }
    get width() {
        return this.grid[0]?.length ?? 0;
    }
    get height() {
        return this.grid.length;
    }
    getCoords(target) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                if (this.grid[y][x] === target)
                    return [x, y];
            }
        }
    }
    get canWidth() {
        return (this.width * this.tileSize +
            (this.width + 1) * this.spacing +
            this.marginBorder * 2);
    }
    get canHeight() {
        return (this.height * this.tileSize +
            (this.height + 1) * this.spacing +
            this.marginBorder * 2);
    }
    rectAt(x, y) {
        const left = this.marginBorder + this.spacing + x * (this.tileSize + this.spacing);
        const top = this.marginBorder + this.spacing + y * (this.tileSize + this.spacing);
        return CassieahExtras_1.CanvCass.createRect({
            width: this.tileSize,
            height: this.tileSize,
            left,
            top,
        });
    }
    getTileCenter(x, y) {
        const left = this.marginBorder + this.spacing + x * (this.tileSize + this.spacing);
        const top = this.marginBorder + this.spacing + y * (this.tileSize + this.spacing);
        return [left + this.tileSize / 2, top + this.tileSize / 2];
    }
    tileSize = 45;
    spacing = 5;
    marginBorder = 20;
    async renderView() {
        const can = new CassieahExtras_1.CanvCass(this.canWidth, this.canHeight);
        await can.drawBackground();
        const labelSize = this.marginBorder / 2;
        const labelColor = "rgba(255, 255, 255, 0.5)";
        for (let x = 0; x < this.width; x++) {
            const centerX = this.marginBorder +
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
            const centerY = this.marginBorder +
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
            if (!this.inBounds(x, y))
                continue;
            const rect = this.rectAt(x, y);
            const emojiSize = (rect.height + rect.width) / 2 - this.spacing * 2;
            can.drawBox({
                rect,
                fill: "rgba(0, 0, 0, 0.5)",
            });
            if (value === null)
                continue;
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
exports.Casa2d = Casa2d;
var Casaieah;
(function (Casaieah) {
    function parse(raw) {
        const rooms = raw.rooms.map((roomRaw) => Casa2d.fromRawRoom(roomRaw));
        const flags = new Map(raw.flags);
        return { rooms, flags };
    }
    Casaieah.parse = parse;
    function exportRaw(parsed) {
        const rooms = parsed.rooms.map((room) => room.tiles.exportAsRaw());
        const flags = Array.from(parsed.flags.entries());
        return { rooms, flags };
    }
    Casaieah.exportRaw = exportRaw;
    function createDefault() {
        return {
            flags: [],
            rooms: [],
        };
    }
    Casaieah.createDefault = createDefault;
    async function fromDB(userID) {
        const { usersDB } = Cassidy.databases;
        const res = await usersDB.queryItem(userID, "casaieah");
        const { casaieah = createDefault() } = res;
        return {
            raw: casaieah,
            parsed: parse(casaieah),
        };
    }
    Casaieah.fromDB = fromDB;
    async function toDB(userID, casa, extra = {}) {
        const { usersDB } = Cassidy.databases;
        const raw = exportRaw(casa);
        await usersDB.setItem(userID, {
            ...extra,
            casaieah: raw,
        });
    }
    Casaieah.toDB = toDB;
    function getRoom(parsed, name) {
        return parsed.rooms.find((room) => room.name === name);
    }
    Casaieah.getRoom = getRoom;
    Casaieah.registry = CasaRegistry_1.TILE_REGISTRY;
    function parseInputCoords(x, y) {
        return [Number(x) - 1, Number(y) - 1];
    }
    Casaieah.parseInputCoords = parseInputCoords;
    Casaieah.itemType = "casatile";
    function itemToTile(item) {
        if (item.type !== "casatile" || !item.tileID) {
            return null;
        }
        const found = Casaieah.registry.get(item.tileID);
        if (!found)
            return null;
        return {
            emoji: String(found.emoji),
            name: String(found.name),
            flags: new Map(found.flags ?? []),
            id: String(found.id),
            price: found.price,
        };
    }
    Casaieah.itemToTile = itemToTile;
    function tileToItem(tile) {
        if (!tile)
            return null;
        return {
            tileID: tile.id,
            type: Casaieah.itemType,
            icon: `🔨${tile.emoji}`,
            name: `CasaTile - ${tile.name}`,
            key: `casa_${tile.id}`,
            flavorText: "This item can be used with Casa.",
        };
    }
    Casaieah.tileToItem = tileToItem;
})(Casaieah || (exports.Casaieah = Casaieah = {}));
const CassieahExtras_1 = require("./CassieahExtras");
