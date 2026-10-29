import { Writable } from "stream";

export class ConsoleArray {
  private lines: string[];
  private output: Writable;
  private lastRendered: string[];

  constructor(output: Writable = process.stdout) {
    this.lines = [];
    this.lastRendered = [];
    this.output = output;
  }

  append(msg: string): void {
    this.lines.push(msg);
    this.updateLine(this.lines.length - 1);
  }

  prepend(msg: string): void {
    this.lines.unshift(msg);
    this.rewriteFrom(0);
  }

  replace(ind: number, msg: string): void {
    if (ind >= 0 && ind < this.lines.length) {
      this.lines[ind] = msg;
      this.updateLine(ind);
    }
  }

  appendAfter(ind: number, msg: string): void {
    if (ind >= -1 && ind < this.lines.length) {
      this.lines.splice(ind + 1, 0, msg);
      this.rewriteFrom(ind + 1);
    }
  }

  appendBefore(ind: number, msg: string): void {
    if (ind >= 0 && ind <= this.lines.length) {
      this.lines.splice(ind, 0, msg);
      this.rewriteFrom(ind);
    }
  }

  replaceLast(msg: string): void {
    if (this.lines.length > 0) {
      this.lines[this.lines.length - 1] = msg;
      this.updateLine(this.lines.length - 1);
    }
  }

  replaceFirst(msg: string): void {
    if (this.lines.length > 0) {
      this.lines[0] = msg;
      this.updateLine(0);
    }
  }

  private updateLine(ind: number): void {
    if (this.lines[ind] !== this.lastRendered[ind]) {
      this.output.write(`\x1B[${ind + 1};1H\x1B[2K${this.lines[ind]}`);
      this.lastRendered[ind] = this.lines[ind];
    }
  }

  private rewriteFrom(startInd: number): void {
    this.output.write(`\x1B[${startInd + 1};1H\x1B[0J`);
    for (let i = startInd; i < this.lines.length; i++) {
      this.output.write(this.lines[i] + "\n");
      this.lastRendered[i] = this.lines[i];
    }
    this.lastRendered.length = this.lines.length;
  }

  getLines(): string[] {
    return [...this.lines];
  }

  clear(): void {
    this.output.write("\x1B[1;1H\x1B[0J");
    this.lines = [];
    this.lastRendered = [];
  }
}
