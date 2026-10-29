"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvCass = void 0;
const canvas_1 = require("@napi-rs/canvas");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const path_1 = require("path");
const uuid_1 = require("uuid");
const unisym_1 = require("./unisym");
/**
 * CanvCass by lianecagara
 * ========
 * A high-level napi-rs canvas wrapper with quality of life features.
 */
class CanvCass {
    /**
     * Registers a new font file to the system.
     * @param font contains a relative path and name of the font file.
     */
    static registerFont(font) {
        CanvCass.fonts.registerFromPath(font.path, font.name);
    }
    /**
     * Instance ID. Not always required.
     */
    static ID = (0, uuid_1.v4)();
    /**
     * Loads default text files for the first time.
     */
    static async singleSetup() {
        logger("Registering fonts...", "CanvCass");
        this.registerFont({
            name: "Roboto-Regular",
            path: "./public/Roboto-Regular.woff",
        });
        this.registerFont({
            name: "Roboto-Bold",
            path: "./public/Roboto-Bold.woff",
        });
        this.registerFont({
            name: "EMOJI",
            path: "./public/NotoColorEmoji.ttf",
        });
        this.registerFont({
            name: "Cassieah",
            path: "./public/fonts/SFPRODISPLAYREGULAR.OTF",
        });
        this.registerFont({
            name: "Cassieah-Bold",
            path: "./public/fonts/SFPRODISPLAYBOLD.OTF",
        });
        logger("Fonts registered!", "CanvCass");
    }
    /**
     * Reference to napi-rs canvas GlobalFonts
     */
    static fonts = canvas_1.GlobalFonts;
    #config;
    #canvas;
    #context;
    /**
     * Creates a multi-purpose rect object that contains important layout-related coordinates like left, top, width, height, right, bottom, centerX, and centerY
     * @param basis The reference partial data like width, height, top and left
     * @returns a rect.
     */
    static createRect(basis) {
        const { width, height } = basis;
        if (typeof width !== "number" || typeof height !== "number") {
            throw new Error("createRect: width and height must be provided as numbers.");
        }
        const x = basis.centerX ?? basis.centerX;
        const y = basis.centerY ?? basis.centerY;
        const left = basis.left ??
            (typeof x === "number"
                ? x - width / 2
                : typeof basis.right === "number"
                    ? basis.right - width
                    : undefined);
        const top = basis.top ??
            (typeof y === "number"
                ? y - height / 2
                : typeof basis.bottom === "number"
                    ? basis.bottom - height
                    : undefined);
        if (typeof left !== "number" || typeof top !== "number") {
            throw new Error("createRect: insufficient data to calculate position. Provide at least (x/y), (right/bottom), or (left/top).");
        }
        return {
            width,
            height,
            left,
            top,
            right: left + width,
            bottom: top + height,
            centerX: left + width / 2,
            centerY: top + height / 2,
        };
    }
    constructor(...args) {
        let config;
        if (typeof args[0] === "number" && typeof args[1] === "number") {
            config = {
                width: args[0],
                height: args[1],
            };
        }
        else if (config && "width" in config && "height" in config) {
            config = args[0];
        }
        else {
            throw new TypeError("Invalid First Parameter (Config)");
        }
        config.background ??= null;
        this.#config = config;
        this.#canvas = (0, canvas_1.createCanvas)(config.width, config.height);
        this.#context = this.#canvas.getContext("2d");
        return this;
    }
    /**
     * @returns The pre-made canvas size.
     */
    static premade() {
        return new CanvCass(CanvCass.preW, CanvCass.preH);
    }
    /**
     * Changes the resolution of the canvas, might cost more memory.
     * @param size the multiplier for current resolution.l
     */
    changeScale(size) {
        this.#canvas.width *= size;
        this.#canvas.height *= size;
        this.#context.scale(size, size);
    }
    /**
     * Resets transform and width and height of the canvas.
     */
    reset() {
        this.#context.resetTransform();
        this.#canvas.width = this.#config.width;
        this.#canvas.height = this.#config.height;
    }
    /**
     * Default width.
     */
    static preW = 1024;
    /**
     * Default height.
     */
    static preH = 768;
    /**
     * Exposes the configuration (do not modify.)
     */
    get config() {
        return this.#config;
    }
    /**
     * Exposes the current canvas width (might not be reliable when scaled.)
     */
    get realWidth() {
        return this.#canvas.width;
    }
    /**
     * Exposes the current canvas height (might not be reliable when scaled.)
     */
    get realHeight() {
        return this.#canvas.height;
    }
    /**
     * Exposes the configuration width. (Read-only)
     */
    get width() {
        return this.#config.width;
    }
    /**
     * Exposes the configuration width. (Read-only)
     */
    get height() {
        return this.#config.height;
    }
    /**
     * Left (X) coordinates of the canvas. Always zero.
     */
    get left() {
        return 0;
    }
    /**
     * Top (Y) coordinates of the canvas. Always zero.
     */
    get top() {
        return 0;
    }
    /**
     * Right (X) coordinates of the canvas. Always equal to the width.
     */
    get right() {
        return this.width;
    }
    /**
     * Bottom (Y) coordinates of the canvas. Always equal to the height.
     */
    get bottom() {
        return this.height;
    }
    /**
     * Center (X) coordinates of the canvas. Always equal to the width/2.
     */
    get centerX() {
        return this.width / 2;
    }
    /**
     * Center (Y) coordinates of the canvas. Always equal to the height/2.
     */
    get centerY() {
        return this.height / 2;
    }
    /**
     * Draws the default background.
     */
    async drawBackground() {
        if (this.#config.background !== null) {
            this.drawBox({
                left: this.left,
                top: this.top,
                width: this.width,
                height: this.height,
                fill: this.#config.background,
            });
        }
        else {
            const bg = await CanvCass.loadImage((0, path_1.join)(process.cwd(), "public", "canvcassbg.png"));
            if (bg) {
                this.#context.drawImage(bg, this.left, this.top, this.width, this.height);
            }
        }
    }
    /**
     * Creates an isolated rect object using canvas rect-related properties.
     */
    get rect() {
        return {
            width: this.width,
            height: this.height,
            left: this.left,
            top: this.top,
            right: this.right,
            bottom: this.bottom,
            centerX: this.centerX,
            centerY: this.centerY,
        };
    }
    setBlendMode(compositeOperation) {
        this.#context.globalCompositeOperation = compositeOperation;
    }
    resetBlendMode() {
        this.#context.globalCompositeOperation = "source-over";
    }
    /**
     * Gives (unsafe) access to the actual canvas context. Automatically saves and restore. DO NOT USE SAVE AND RESTORE inside.
     * * @param cb the callback that might use the context.
     */
    withContext(cb) {
        const ctx = this.#context;
        ctx.save();
        try {
            cb(ctx);
        }
        finally {
            ctx.restore();
        }
    }
    /**
     * Returns a png buffer of the canvas.
     */
    toPng() {
        return this.#canvas.toBuffer("image/png");
    }
    /**
     * Creates and returns a ReadStream of the canvas (uses the disk temporarily.)
     */
    toStream() {
        const tempDir = (0, path_1.join)(process.cwd(), "temp");
        if (!(0, fs_1.existsSync)(tempDir)) {
            (0, fs_1.mkdirSync)(tempDir);
        }
        const filename = `${(0, crypto_1.randomUUID)()}.png`;
        const filePath = (0, path_1.join)(tempDir, filename);
        const buffer = this.#canvas.toBuffer("image/png");
        return new Promise((resolve, reject) => {
            const out = (0, fs_1.createWriteStream)(filePath);
            out.on("error", reject);
            out.write(buffer, (err) => {
                if (err)
                    return reject(err);
                out.end();
            });
            out.on("finish", () => {
                const stream = (0, fs_1.createReadStream)(filePath);
                stream.on("close", () => {
                    try {
                        (0, fs_1.unlinkSync)(filePath);
                    }
                    catch (err) {
                        console.error(`Failed to delete temp file ${filePath}`, err);
                    }
                });
                resolve(stream);
            });
        });
    }
    drawBox(arg1, arg2, arg3, arg4, arg5) {
        let rect;
        let style = {};
        if (typeof arg1 === "number" &&
            typeof arg2 === "number" &&
            typeof arg3 === "number" &&
            typeof arg4 === "number") {
            rect = CanvCass.createRect({
                left: arg1,
                top: arg2,
                width: arg3,
                height: arg4,
            });
            style = arg5 ?? {};
        }
        else if (typeof arg1 !== "number" && "rect" in arg1) {
            rect = arg1.rect;
            style = arg1;
            if ("rect" in style) {
                delete style.rect;
            }
        }
        else if (typeof arg1 !== "number") {
            const inline = arg1;
            rect = CanvCass.createRect({
                ...inline,
            });
            style = inline;
        }
        else {
            throw new TypeError("Invalid Arguments, please check the method overloads.");
        }
        const ctx = this.#context;
        ctx.save();
        ctx.beginPath();
        let path;
        if (typeof style.cornerRadius !== "number") {
            path = CanvCass.rectToPath(rect);
        }
        else {
            path = CanvCass.createCorneredRectPath(style.cornerRadius, rect);
        }
        if (style.stroke) {
            ctx.strokeStyle = style.stroke;
            ctx.lineWidth = Number(style.strokeWidth ?? "1");
            ctx.stroke(path);
        }
        if (style.fill) {
            ctx.fillStyle = style.fill;
            ctx.fill(path);
        }
        ctx.restore();
    }
    /**
     * Draws any polygon possible using points.
     * @param points
     * @param style
     */
    drawPolygon(points, style) {
        if (!Array.isArray(points) || points.length < 3) {
            throw new Error("drawPolygon requires at least 3 points.");
        }
        const ctx = this.#context;
        const { fill, stroke, strokeWidth } = style ?? {};
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
            ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.closePath();
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = Number(strokeWidth ?? "1");
            ctx.stroke();
        }
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
        }
        ctx.restore();
    }
    drawLine(arg1, arg2, arg3) {
        let start;
        let end;
        let style = {};
        if (Array.isArray(arg1[0])) {
            const points = arg1;
            if (points.length !== 2) {
                throw new Error("drawLine requires exactly two points.");
            }
            [start, end] = points;
            style = arg2 ?? {};
        }
        else {
            start = arg1;
            end = arg2;
            style = arg3 ?? {};
        }
        const ctx = this.#context;
        const { stroke, strokeWidth } = style;
        if (!stroke)
            return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(start[0], start[1]);
        ctx.lineTo(end[0], end[1]);
        ctx.strokeStyle = stroke;
        ctx.lineWidth = Number(strokeWidth ?? "1");
        ctx.stroke();
        ctx.restore();
    }
    drawFromPath(path, style) {
        const ctx = this.#context;
        const { fill, stroke, strokeWidth } = style;
        ctx.save();
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = Number(strokeWidth ?? "1");
            ctx.stroke(path);
        }
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fill(path);
        }
        ctx.restore();
    }
    drawCircle(arg1, arg2, arg3) {
        let centerX;
        let centerY;
        let radius;
        let style = {};
        if (arg1 instanceof canvas_1.Path2D && typeof arg2 !== "number") {
        }
        else if (typeof arg1 === "number" &&
            typeof arg2 === "number" &&
            typeof arg3 !== "number") {
            centerX = arg1;
            centerY = arg2;
            radius = arg3?.radius ?? 0;
            style = arg3 ?? {};
        }
        else if (Array.isArray(arg1) &&
            typeof arg3 !== "number" &&
            typeof arg2 === "number") {
            centerX = arg1[0];
            centerY = arg1[1];
            radius = arg2 ?? 0;
            style = arg3 ?? {};
        }
        else {
            const config = arg1;
            [centerX, centerY] = config.center;
            radius = config.radius;
            style = config;
        }
        const ctx = this.#context;
        const { fill, stroke, strokeWidth } = style;
        ctx.save();
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = Number(strokeWidth ?? "1");
            ctx.stroke();
        }
        if (fill) {
            ctx.fillStyle = fill;
            ctx.fill();
        }
        ctx.restore();
    }
    /**
     * A high level way of drawing a child with proper layout (flex-like) by providing a container and a children.
     * @param container
     * @param children
     */
    drawFlexbox(container, children) {
        const { rect: containerRect, flexDirection = "row", justifyContent = "flex-start", alignItems = "flex-start", gap = 0, } = container;
        const isRow = flexDirection === "row";
        const containerMain = isRow ? containerRect.width : containerRect.height;
        const containerCross = isRow ? containerRect.height : containerRect.width;
        const childSizes = children.map((child) => {
            if (typeof child === "function")
                return { width: 0, height: 0 };
            return { width: child.width, height: child.height };
        });
        let totalMain = childSizes.reduce((sum, c) => sum + (isRow ? c.width : c.height), 0) +
            Math.max(0, children.length - 1) * gap;
        let adjustedGap = gap;
        let mainStart = 0;
        const extraSpace = containerMain - totalMain;
        switch (justifyContent) {
            case "flex-start":
                mainStart = 0;
                break;
            case "center":
                mainStart = extraSpace / 2;
                break;
            case "flex-end":
                mainStart = extraSpace;
                break;
            case "space-between":
                mainStart = 0;
                adjustedGap =
                    children.length > 1 ? extraSpace / (children.length - 1) : 0;
                break;
            case "space-around":
                adjustedGap = extraSpace / children.length;
                mainStart = adjustedGap / 2;
                break;
        }
        let pos = mainStart;
        children.forEach((child, idx) => {
            let width, height;
            if (typeof child === "function") {
                width = childSizes[idx].width || 0;
                height = childSizes[idx].height || 0;
            }
            else {
                width = child.width;
                height = child.height;
            }
            let crossPos = 0;
            switch (alignItems) {
                case "flex-start":
                    crossPos = 0;
                    break;
                case "center":
                    crossPos = (containerCross - (isRow ? height : width)) / 2;
                    break;
                case "flex-end":
                    crossPos = containerCross - (isRow ? height : width);
                    break;
                case "stretch":
                    if (isRow)
                        height = containerCross;
                    else
                        width = containerCross;
                    crossPos = 0;
                    break;
            }
            let childRect;
            if (isRow) {
                childRect = CanvCass.createRect({
                    width,
                    height,
                    left: containerRect.left + pos,
                    top: containerRect.top + crossPos,
                });
                pos += width + adjustedGap;
            }
            else {
                childRect = CanvCass.createRect({
                    width,
                    height,
                    left: containerRect.left + crossPos,
                    top: containerRect.top + pos,
                });
                pos += height + adjustedGap;
            }
            if (typeof child === "function") {
                child(childRect, idx);
            }
            else {
                this.drawBox({
                    rect: childRect,
                    fill: child.fill,
                });
            }
        });
    }
    #currentFamily = "";
    setFont(family) {
        this.#currentFamily = family;
    }
    resetFont() {
        this.#currentFamily = "";
    }
    drawText(arg1, arg2, arg3, arg4) {
        const ctx = this.#context;
        let text;
        let x;
        let y;
        let options = {};
        if (typeof arg1 === "string" &&
            typeof arg2 === "number" &&
            typeof arg3 === "number") {
            text = arg1;
            x = arg2;
            y = arg3;
            options = arg4 ?? {};
        }
        else if (typeof arg1 === "string" && typeof arg2 === "object") {
            text = arg1;
            const opt = arg2;
            x = opt.x ?? 0;
            y = opt.y ?? 0;
            options = opt;
        }
        else {
            const config = arg1;
            text = config.text;
            x = config.x;
            y = config.y;
            options = config;
        }
        this.#processFont(options);
        const { fill = "white", stroke, strokeWidth = 1, cssFont: font = "", align = "center", baseline = "middle", vAlign = "middle", size, yMargin = 0, breakTo = "bottom", breakMaxWidth = Infinity, letterSpacing, } = options;
        const origY = y;
        if (vAlign === "top") {
            y -= size / 2;
        }
        if (vAlign === "bottom") {
            y += size / 2;
        }
        ctx.save();
        if (typeof letterSpacing === "number") {
            ctx.letterSpacing = `${letterSpacing}px`;
        }
        const lineHeight = size + (yMargin ?? 0);
        const direction = breakTo === "top" ? -1 : breakTo === "center" ? 1 : 1;
        ctx.font = font;
        ctx.textAlign = align;
        ctx.textBaseline = baseline;
        let { lines, maxWidth } = this.splitBreakDetailed({
            ...options,
            text,
        }, breakMaxWidth);
        lines = lines.filter(Boolean);
        let tx = x;
        let ty = y;
        if (breakTo === "top") {
            lines.reverse();
        }
        if (breakTo === "center") {
            ty -= ((lines.length - 1) / 2) * lineHeight;
        }
        const linePos = [];
        for (const line of lines) {
            if (stroke) {
                ctx.strokeStyle = stroke;
                ctx.lineWidth = strokeWidth;
                ctx.strokeText(line, tx, ty);
            }
            if (fill) {
                ctx.fillStyle = fill;
                ctx.fillText(line, tx, ty);
            }
            linePos.push([tx, ty]);
            ty += lineHeight * direction;
            if (breakTo === "center") {
            }
        }
        let modY = y;
        if (vAlign === "top") {
            modY += size;
        }
        if (vAlign === "bottom") {
            modY -= size;
        }
        let lastLine = linePos.length > 0 ? linePos.at(-1)[1] : ty;
        const rect = CanvCass.createRect({
            width: maxWidth,
            height: Math.abs(modY - lastLine),
            ...(breakTo === "bottom"
                ? {
                    top: origY,
                }
                : {}),
            ...(breakTo === "top"
                ? {
                    bottom: origY,
                }
                : {}),
            ...(breakTo === "center"
                ? {
                    centerY: origY,
                }
                : {}),
            ...(align === "left"
                ? {
                    left: x,
                }
                : {}),
            ...(align === "right"
                ? {
                    right: x,
                }
                : {}),
            ...(align === "center"
                ? {
                    centerX: x,
                }
                : {}),
            ...(align === "start"
                ? {
                    left: x,
                }
                : {}),
            ...(align === "end"
                ? {
                    right: x,
                }
                : {}),
        });
        ctx.restore();
        const result = {
            lines,
            rect,
            text,
            linePos,
            fill,
            lineHeight,
            direction,
            stroke,
            strokeWidth,
            cssFont: font,
            align,
            baseline,
            vAlign,
            size,
            yMargin,
            breakTo,
            breakMaxWidth,
            x,
            y: origY,
            newY: y,
            fontType: options.fontType,
        };
        return result;
    }
    /**
     * Creats a slightly dim gradient, perfect for photo overlays.
     * @param rect
     * @param options
     * @returns a canvas gradient.
     */
    createDim(rect, options) {
        const { fadeStart = 0, fadeEnd = 1, color = "rgba(0, 0, 0, 0.7)", } = options ?? {};
        const ctx = this.#context;
        const gradient = ctx.createLinearGradient(rect.left, rect.top, rect.left, rect.bottom);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(fadeStart, "transparent");
        gradient.addColorStop(fadeEnd, color);
        return gradient;
    }
    /**
     * Converts any CanvCass Rect into a Path2D.
     * @param rect
     * @returns A Path2D
     */
    static rectToPath(rect) {
        const path = new canvas_1.Path2D();
        path.rect(rect.left, rect.top, rect.width, rect.height);
        return path;
    }
    /**
     * Creates a circle path 2D.
     * @param center
     * @param radius
     * @returns
     */
    static createCirclePath(center, radius) {
        const path = new canvas_1.Path2D();
        path.arc(center[0], center[1], radius, 0, Math.PI * 2);
        return path;
    }
    /**
     * Creates a cornered rectangle path 2D.
     * @param radius - The radius of the corners
     * @param rect - The reference rect.
     * @returns A Path2D object representing the cornered rectangle
     */
    static createCorneredRectPath(radius, rect) {
        const { left, top, width, height } = rect;
        const right = left + width;
        const bottom = top + height;
        const path = new canvas_1.Path2D();
        path.moveTo(left + radius, top);
        path.arc(left + radius, top + radius, radius, Math.PI, Math.PI * 1.5);
        path.lineTo(right - radius, top);
        path.arc(right - radius, top + radius, radius, Math.PI * 1.5, 0);
        path.lineTo(right, bottom - radius);
        path.arc(right - radius, bottom - radius, radius, 0, Math.PI / 2);
        path.lineTo(left + radius, bottom);
        path.arc(left + radius, bottom - radius, radius, Math.PI / 2, Math.PI);
        path.lineTo(left, top + radius);
        path.closePath();
        return path;
    }
    #processFont(options) {
        if (!options.cssFont) {
            options.fontType ??= "cnormal";
            options.size ??= 50;
            if (options.fontType === "cbold") {
                options.cssFont = `bold ${options.size}px ${options.fontFamily || this.#currentFamily || `Cassieah-Bold`}, EMOJI, sans-serif`;
            }
            if (options.fontType === "cnormal") {
                options.cssFont = `normal ${options.size}px ${options.fontFamily || this.#currentFamily || `Cassieah`}, EMOJI, sans-serif`;
            }
            if (options.fontType === "auto") {
                options.cssFont = `${options.size}px ${options.fontFamily || this.#currentFamily || `Cassieah`}, EMOJI, sans-serif`;
            }
        }
    }
    static colorA = "#9700af";
    static colorB = "#a69a00";
    defaultGradient(width, height) {
        return this.tiltedGradient(width, height, Math.PI / 4, [
            [0, CanvCass.colorB],
            [1, CanvCass.colorA],
        ]);
    }
    /**
     * Typically measures a text with a given config.
     * @param style
     */
    measureText(style) {
        const ctx = this.#context;
        ctx.save();
        this.#processFont(style);
        const { cssFont: font = "" } = style;
        ctx.font = font;
        const result = ctx.measureText(style.text);
        ctx.restore();
        return result;
    }
    /**
     * Splits lines based on max width and text config.
     * @param style
     * @param maxW
     * @returns
     */
    splitBreak(style, maxW) {
        const lines = [];
        const paragraphs = style.text.split("\n");
        for (const paragraph of paragraphs) {
            let words = paragraph.split(" ");
            let currentLine = "";
            let accuW = 0;
            for (let word of words) {
                let wordWidth = this.measureText({ ...style, text: word }).width;
                while (wordWidth > maxW) {
                    let splitIndex = word.length;
                    while (splitIndex > 0) {
                        const part = word.slice(0, splitIndex) + "-";
                        const partWidth = this.measureText({ ...style, text: part }).width;
                        if (partWidth <= maxW)
                            break;
                        splitIndex--;
                    }
                    const part = word.slice(0, splitIndex) + "-";
                    lines.push(currentLine ? currentLine + " " + part : part);
                    currentLine = "";
                    word = word.slice(splitIndex);
                    wordWidth = this.measureText({ ...style, text: word }).width;
                }
                const addSpace = currentLine ? " " : "";
                const totalWidth = accuW + this.measureText({ ...style, text: addSpace + word }).width;
                if (totalWidth > maxW) {
                    if (currentLine)
                        lines.push(currentLine);
                    currentLine = word;
                    accuW = this.measureText({ ...style, text: word }).width;
                }
                else {
                    currentLine += addSpace + word;
                    accuW = totalWidth;
                }
            }
            if (currentLine)
                lines.push(currentLine);
        }
        return lines;
    }
    /**
     * Splits lines based on max width and text config.
     * @param style
     * @param maxW
     * @returns
     */
    splitBreakDetailed(style, maxW) {
        const lines = [];
        const widths = [];
        const paragraphs = style.text.split("\n");
        for (const paragraph of paragraphs) {
            let words = paragraph.split(" ");
            let currentLine = "";
            let accuW = 0;
            for (let word of words) {
                let wordWidth = this.measureText({ ...style, text: word }).width;
                while (wordWidth > maxW) {
                    let splitIndex = word.length;
                    while (splitIndex > 0) {
                        const part = word.slice(0, splitIndex) + "-";
                        const partWidth = this.measureText({ ...style, text: part }).width;
                        if (partWidth <= maxW)
                            break;
                        splitIndex--;
                    }
                    const part = word.slice(0, splitIndex) + "-";
                    lines.push(currentLine ? currentLine + " " + part : part);
                    widths.push(this.measureText({
                        ...style,
                        text: currentLine ? currentLine + " " + part : part,
                    }).width);
                    currentLine = "";
                    word = word.slice(splitIndex);
                    wordWidth = this.measureText({ ...style, text: word }).width;
                }
                const addSpace = currentLine ? " " : "";
                const totalWidth = accuW + this.measureText({ ...style, text: addSpace + word }).width;
                if (totalWidth > maxW) {
                    if (currentLine) {
                        lines.push(currentLine);
                        widths.push(accuW);
                    }
                    currentLine = word;
                    accuW = this.measureText({ ...style, text: word }).width;
                }
                else {
                    currentLine += addSpace + word;
                    accuW = totalWidth;
                }
            }
            if (currentLine) {
                lines.push(currentLine);
                widths.push(accuW);
            }
        }
        const maxWidth = Math.max(...widths);
        return {
            lines,
            maxWidth,
        };
    }
    splitBreakOld(style, maxW) {
        let accuW = 0;
        const text = style.text;
        let words = [];
        let lines = [];
        const split = text.split(" ");
        let ii = 0;
        for (const word of split) {
            const w = this.measureText({
                ...style,
                text: word + " ",
            }).width;
            if (w > maxW) {
                // continue;
            }
            accuW += w;
            if (accuW >= maxW) {
                lines.push(words.join(" "));
                accuW = 0;
                words = [word];
            }
            else {
                words.push(word);
            }
            if (ii + 1 >= split.length) {
                lines.push(words.join(" "));
            }
            ii++;
        }
        return lines;
    }
    /**
     * Generates an angled gradient.
     * @param width
     * @param height
     * @param angleRad
     * @param colorStops
     * @returns
     */
    tiltedGradient(width, height, angleRad, colorStops) {
        const cx = width / 2;
        const cy = height / 2;
        const halfLen = Math.sqrt(width ** 2 + height ** 2) / 2;
        const dx = Math.cos(angleRad) * halfLen;
        const dy = Math.sin(angleRad) * halfLen;
        const x0 = cx - dx;
        const y0 = cy - dy;
        const x1 = cx + dx;
        const y1 = cy + dy;
        const gradient = this.#context.createLinearGradient(x0, y0, x1, y1);
        for (const [offset, color] of colorStops) {
            gradient.addColorStop(offset, color);
        }
        return gradient;
    }
    /**
     * Draws any image src, Image, or Buffer.
     * @param image
     * @param left
     * @param top
     * @param options
     */
    async drawImage(imageOrSrc, left, top, options) {
        const ctx = this.#context;
        let image;
        if (typeof imageOrSrc !== "string" && "onload" in imageOrSrc) {
            image = imageOrSrc;
        }
        else {
            image = await CanvCass.loadImage(imageOrSrc);
        }
        ctx.save();
        if (options?.clipTo) {
            ctx.clip(options.clipTo);
        }
        if (options.left) {
            left = options.left;
        }
        if (options.top) {
            top = options.top;
        }
        let width = options?.width;
        let height = options?.height;
        if (width && !height) {
            height = (width / image.width) * image.height;
        }
        else if (!width && height) {
            width = (height / image.height) * image.width;
        }
        else if (!width && !height) {
            width = image.width;
            height = image.height;
        }
        let drawWidth = width;
        let drawHeight = height;
        if (options?.maximizeFit) {
            const ratio = image.width / image.height;
            if (width > height * ratio) {
                drawWidth = height * ratio;
            }
            else if (height > width / ratio) {
                drawHeight = width / ratio;
            }
        }
        if (!options.clipTo) {
            const r = CanvCass.createRect({
                width,
                height,
                left,
                top,
            });
            ctx.clip(CanvCass.rectToPath(r));
        }
        ctx.drawImage(image, options.sourceOffsetLeft ?? 0, options.sourceOffsetTop ?? 0, options.cropWidth ?? image.width, options.cropHeight ?? image.height, left, top, drawWidth, drawHeight);
        // ctx.drawImage(image, left, top, drawWidth, drawHeight);
        ctx.restore();
    }
    withClip(path, cb) {
        const ctx = this.#context;
        ctx.save();
        ctx.clip(path);
        try {
            cb();
        }
        finally {
            ctx.restore();
        }
    }
    async withClipAsync(path, cb) {
        const ctx = this.#context;
        ctx.save();
        ctx.clip(path);
        try {
            await cb();
        }
        finally {
            ctx.restore();
        }
    }
    drawCassItem({ rect, item, dontDrawRect = false, }) {
        if (!dontDrawRect) {
            this.drawBox({
                rect,
                fill: "rgba(0, 0, 0, 0.5)",
            });
        }
        const spacing = rect.width / 8;
        const iconLen = (0, unisym_1.countEmojis)(item.icon);
        this.drawText(`${item.icon}`, {
            x: rect.centerX,
            y: rect.centerY,
            align: "center",
            baseline: "middle",
            fontType: "cnormal",
            fill: "white",
            size: rect.width / iconLen - spacing * 2,
        });
    }
}
exports.CanvCass = CanvCass;
(function (CanvCass) {
    function lineYs(height, lines, offset = 0) {
        if (lines <= 0)
            return [];
        const spacing = height / lines;
        const halfSpacing = spacing / 2;
        const ys = [];
        for (let i = 0; i < lines; i++) {
            ys.push(Math.round(halfSpacing + spacing * i + offset));
        }
        return ys;
    }
    CanvCass.lineYs = lineYs;
    /**
     * Loads an image 5 times before it gives up.
     * @param source Whatever, string, URL instance, a Buffer? ArrayBufferLike? Uint8Arrays, and finally Image of napi-rs canvas.
     * @param options More options you don't even need.
     * @returns The normalized napi-rs Image instance. It is NOT a stream. You may only use it for drawImage.
     */
    async function loadImage(source, options) {
        const tries = 5;
        let i = 0;
        while (i <= tries) {
            i++;
            try {
                return (0, canvas_1.loadImage)(source, options);
            }
            catch (error) {
                console.error(error);
                await utils.delay(500);
                continue;
            }
        }
    }
    CanvCass.loadImage = loadImage;
})(CanvCass || (exports.CanvCass = CanvCass = {}));
