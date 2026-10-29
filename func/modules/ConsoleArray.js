"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleArray = void 0;
class ConsoleArray {
    lines;
    output;
    lastRendered;
    constructor(output = process.stdout) {
        this.lines = [];
        this.lastRendered = [];
        this.output = output;
    }
    append(msg) {
        this.lines.push(msg);
        this.updateLine(this.lines.length - 1);
    }
    prepend(msg) {
        this.lines.unshift(msg);
        this.rewriteFrom(0);
    }
    replace(ind, msg) {
        if (ind >= 0 && ind < this.lines.length) {
            this.lines[ind] = msg;
            this.updateLine(ind);
        }
    }
    appendAfter(ind, msg) {
        if (ind >= -1 && ind < this.lines.length) {
            this.lines.splice(ind + 1, 0, msg);
            this.rewriteFrom(ind + 1);
        }
    }
    appendBefore(ind, msg) {
        if (ind >= 0 && ind <= this.lines.length) {
            this.lines.splice(ind, 0, msg);
            this.rewriteFrom(ind);
        }
    }
    replaceLast(msg) {
        if (this.lines.length > 0) {
            this.lines[this.lines.length - 1] = msg;
            this.updateLine(this.lines.length - 1);
        }
    }
    replaceFirst(msg) {
        if (this.lines.length > 0) {
            this.lines[0] = msg;
            this.updateLine(0);
        }
    }
    updateLine(ind) {
        if (this.lines[ind] !== this.lastRendered[ind]) {
            this.output.write(`\x1B[${ind + 1};1H\x1B[2K${this.lines[ind]}`);
            this.lastRendered[ind] = this.lines[ind];
        }
    }
    rewriteFrom(startInd) {
        this.output.write(`\x1B[${startInd + 1};1H\x1B[0J`);
        for (let i = startInd; i < this.lines.length; i++) {
            this.output.write(this.lines[i] + "\n");
            this.lastRendered[i] = this.lines[i];
        }
        this.lastRendered.length = this.lines.length;
    }
    getLines() {
        return [...this.lines];
    }
    clear() {
        this.output.write("\x1B[1;1H\x1B[0J");
        this.lines = [];
        this.lastRendered = [];
    }
}
exports.ConsoleArray = ConsoleArray;
