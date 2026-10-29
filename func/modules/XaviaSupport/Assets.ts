/**
 * The original code can be found on https://github.com/XaviaTeam/XaviaBot
 * This version is modified only for the sake of COMPATIBILITY of cassidy with xavia commands.
 * @XaviaTeam
 * @lianecagara
 */
import fs from "fs";
import path from "path";

import {
  isExists,
  createDir,
  isJSON,
  isURL,
  downloadFile,
  deleteFile,
} from "./utils";

export class Assets {
  static #instance: Assets = null;
  #linksPath;
  #linksBackupPath;
  #data: { name: string; links: { [key: string]: string } }[];
  #saveInterval;

  constructor() {
    if (Assets.#instance != null) throw new Error("Don't zo zat!!");

    this.#init();
    Assets.#instance = this;
  }

  #init() {
    const assetsDir = global.assetsPath ?? process.cwd() + "/temp";

    this.#linksPath = path.join(assetsDir, "links.json");
    this.#linksBackupPath = path.join(assetsDir, "links.bak.json");

    if (!isExists(assetsDir, "dir")) {
      createDir(assetsDir);
    }

    if (!isExists(this.#linksPath, "file")) {
      fs.writeFileSync(this.#linksPath, "[]");
    }

    const rawLinksData = fs.readFileSync(this.#linksPath, "utf8");
    if (!isJSON(rawLinksData)) {
      const backupData = this.#getBackupData();

      if (backupData == null) {
        logger("ASSETS LINKS CORRUPTED. RECREATING...", "WARN");
        this.#data = [];
      } else {
        logger("ASSETS LINKS CORRUPTED. RESTORING FROM BACKUP...", "WARN");
        this.#data = backupData;
      }

      this.#saveLinksData();
    } else {
      this.#data = JSON.parse(rawLinksData);
    }

    this.#validateLinks();

    const _5MINS = 5 * 60 * 1000;
    this.#saveInterval = setInterval(() => this.#saveLinksData(), _5MINS);
  }

  #validateLinks() {
    this.#data.forEach((e) => {
      for (const key in e.links) {
        if (!isExists(path.join(global.assetsPath, e.links[key]), "file")) {
          delete e.links[key];
        }
      }
    });
  }

  static gI() {
    if (this.#instance == null) return new Assets();

    return this.#instance;
  }

  #getBackupData() {
    if (isExists(this.#linksBackupPath, "file")) {
      const rawBackupData = fs.readFileSync(this.#linksBackupPath, "utf8");

      if (isJSON(rawBackupData)) return JSON.parse(rawBackupData);
    }

    return null;
  }

  #saveLinksData() {
    fs.writeFileSync(this.#linksBackupPath, JSON.stringify(this.#data));
    fs.writeFileSync(this.#linksPath, JSON.stringify(this.#data));
  }

  #_stream(assetPath: string) {
    return fs.createReadStream(assetPath);
  }

  #_has(name: string, key: string) {
    return !!this.#data
      .find((asset) => asset.name == name)
      ?.links?.hasOwnProperty(key);
  }

  #_get(name: string, key: string) {
    if (!this.#_has(name, key)) return null;

    const linkedPath = this.#data.find((asset) => asset.name == name).links[
      key
    ];

    return {
      path: path.join(global.assetsPath, linkedPath),
      stream: () => this.#_stream(path.join(global.assetsPath, linkedPath)),
    };
  }

  #_set(name: string, key: string, assetPath: string) {
    this.#data.find((asset) => asset.name == name).links[key] = assetPath;
  }

  #_drop(name: string, key: string) {
    if (!this.#_has(name, key)) return;

    try {
      deleteFile(this.#_get(name, key)?.path);
    } catch {
    } finally {
      delete this.#data.find((asset) => asset.name == name).links[key];
    }
  }

  async #_download(
    {
      name,
      key,
      path: assetPath,
      src,
      overwrite,
    }: {
      name: string;
      key: string;
      path: string;
      src: string;
      overwrite?: boolean;
    },
    { headers }: { headers?: Record<string, string> } = {}
  ) {
    if (this.#_has(name, key) && overwrite != true) return path;
    if (!isURL(src)) throw new Error("Invalid src");

    if (!this.#data.some((asset) => asset.name == name))
      this.#data.push({ name, links: {} });

    if (assetPath.endsWith("/") || assetPath.length == 0)
      throw new Error("Invalid path");
    const lastSlashIndex = assetPath.lastIndexOf("/");
    if (lastSlashIndex != -1) {
      const assetDirectory = path.join(
        global.assetsPath,
        assetPath.slice(0, lastSlashIndex)
      );
      if (!isExists(assetDirectory, "dir")) {
        createDir(assetDirectory);
      }
    }

    await downloadFile(path.join(global.assetsPath, assetPath), src, headers);
    this.#_drop(name, key);
    this.#_set(name, key, assetPath);

    return assetPath;
  }

  from(name: string) {
    return {
      has: (key: string) => this.#_has(name, key),

      get: (key: string) => this.#_get(name, key),

      drop: (key: string) => this.#_drop(name, key),

      download: (
        data: { key: string; path: string; src: string; overwrite?: boolean },
        options: { headers?: Record<string, string> } = {}
      ) => this.#_download({ name, ...data }, options),
    };
  }

  dispose() {
    clearInterval(this.#saveInterval);
  }
}
