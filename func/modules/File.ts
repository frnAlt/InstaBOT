import * as fs from "fs-extra";

export namespace Files {
  export function read(
    path: string,
    encoding: BufferEncoding = "utf8"
  ): string {
    try {
      return fs.readFileSync(path, encoding);
    } catch (err) {
      throw new Error(`Read failed: ${err.message}`);
    }
  }

  export function write(
    path: string,
    data: string,
    encoding: BufferEncoding = "utf8"
  ): void {
    try {
      fs.writeFileSync(path, data, { encoding });
    } catch (err) {
      throw new Error(`Write failed: ${err.message}`);
    }
  }

  export function json<T>(path: string): T {
    try {
      return fs.readJsonSync(path);
    } catch (err) {
      throw new Error(`JSON read failed: ${err.message}`);
    }
  }

  export function writeJson<T>(
    path: string,
    data: T,
    spaces: number = 2
  ): void {
    try {
      fs.writeJsonSync(path, data, { spaces });
    } catch (err) {
      throw new Error(`JSON write failed: ${err.message}`);
    }
  }
}
