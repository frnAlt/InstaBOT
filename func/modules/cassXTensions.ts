import path from "path";
import { fetchFileContents } from "./github";
import fs from "fs";
export type ExtensionTypes = keyof ExtensionTypeMap;

export interface BaseExtensionType {
  category: ExtensionTypes;
  info: Record<string, any>;
  id: string;
  packageName: string;
  packageDesc: string;
  packagePermissions: string[];
  importance: number;
}

export interface GenericExtension extends BaseExtensionType {
  category: "generic";
}

export interface InventoryExtension extends BaseExtensionType {
  category: "inventory";
  info: {
    purpose: string;
    hook(ctx: CommandContext, extra: Record<string, any>): any | Promise<any>;
  };
}

export interface CustomExtension extends BaseExtensionType {
  category: `custom_${string}`;
}

export type ExtensionTypeMap = {
  inventory: InventoryExtension;
  generic: GenericExtension;
} & {
  [key: `custom_${string}`]: CustomExtension;
};

export type AutoExtensionType = ExtensionTypeMap[keyof ExtensionTypeMap];

export class CassExtensions<T extends AutoExtensionType> extends Array<T> {
  constructor(array: any[] = [], ...etc: any[]) {
    if (Array.isArray(array)) {
      super(...array);
    } else {
      super(array, ...etc);
    }
    this.normalizeExtensions();
  }

  normalizeExtensions(): void {
    const all = this;
    for (const item of all) {
      item.category ??= "generic";
      item.category = String(item.category).startsWith("custom_")
        ? item.category
        : `custom_${item.category}`;
      item.info ??= {};
      item.packageName ??= "No Name";
      item.packageDesc = String(item.packageName);
      item.id ??= null;
      item.packagePermissions ??= [];
      if (!Array.isArray(item.packagePermissions)) {
        item.packagePermissions = [];
      }
      item.packageDesc ??= "No Description";
      item.packageDesc = String(item.packageDesc);

      if (typeof item.info !== "object" || !item.info) {
        item.info = {};
      }
    }
    const nullIDs = new Array(...this).filter((i) => !i.id);
    this.removeExtensions(...nullIDs);
  }

  getCategorized<C extends T["category"]>(
    category: C
  ): CassExtensions<Extract<T, { category: C }>> {
    return new CassExtensions(
      this.filter(
        (i): i is Extract<T, { category: C }> => i.category === category
      )
    );
  }

  hasCategorized(category: ExtensionTypes): boolean {
    return this.getCategorized(category).length > 0;
  }

  getCategory(item: T): ExtensionTypes {
    return item.category;
  }

  hasID(id: string): boolean {
    return this.some((i) => i.id === id);
  }

  getAllID(id: string): T[] {
    return this.filter((i) => id === i.id);
  }

  getID(id: string): T {
    return this.find((i) => id === i.id);
  }

  clearDuplicates(id: string): CassExtensions<T> {
    if (this.hasID(id)) {
      this.removeExtensions(...this.getAllID(id));
    }
    return this;
  }

  registerExtensions(...items: T[]): CassExtensions<T> {
    items.forEach((item) => {
      this.clearDuplicates(item.id);
      super.push(item);
    });
    this.normalizeExtensions();
    return this;
  }

  removeExtensions(...refs: T[]): CassExtensions<T> {
    for (const ref of refs) {
      const index = this.indexOf(ref);
      this.splice(index, 1);
    }
    return this;
  }

  push(...items: T[]): number {
    this.registerExtensions(...items);
    return this.length;
  }

  async downloadRemoteExtensions() {
    const folder = "/";
    const repo = "lianecagara/CassReduxExtensions";

    console.log(`📥 Fetching extensions from ${repo}${folder}...`);

    try {
      const files = (await fetchFileContents(folder, repo)).filter((i) =>
        i.name.endsWith(".js")
      );

      console.log(`🔍 Found ${files.length} JavaScript files.`);

      for (const file of files) {
        try {
          console.log(`📄 Downloading: ${file.name}`);
          const content = await file.download();

          const pathh = path.join(process.cwd(), "CommandFiles", "extensions");

          if (!fs.existsSync(pathh)) {
            console.log(`📂 Creating directory: ${pathh}`);
            fs.mkdirSync(pathh, { recursive: true });
          }

          const filePath = path.join(pathh, file.name);
          if (fs.existsSync(filePath)) {
            console.warn(`⚠️ File already exists: ${filePath}, skipping.`);
          } else {
            console.log(`💾 Saving file: ${filePath}`);
            await fs.promises.writeFile(filePath, content);
          }

          // const mURL = pathToFileURL(filePath);
          // mURL.searchParams.set("timestamp", Date.now().toString());

          console.log(`🚀 Importing module: ${filePath}`);
          const moduleData: { default: T } =
            require("../extensions/" + file.name) ?? {};

          if (moduleData.default) {
            console.log(`✅ Successfully imported ${file.name}`);
            this.push(moduleData.default);
          } else {
            console.warn(`⚠️ No default export found in ${file.name}`);
          }
        } catch (error) {
          console.error(`❌ Error processing ${file.name}:`, error);
        }
      }
    } catch (error) {
      console.error("❌ Error fetching extensions:", error);
    }
  }
}

export const registeredExtensions = new CassExtensions<AutoExtensionType>([]);

export function getEnabledExtensions(userData: UserData) {
  const { extensionIDs = [] } = userData;
  const extensions = extensionIDs
    .filter((i) => typeof i === "string")
    .map((i) => registeredExtensions.getID(i));
  return new CassExtensions(extensions);
}

export function type(
  value: unknown
):
  | "string"
  | "number"
  | "bigint"
  | "boolean"
  | "symbol"
  | "undefined"
  | "object"
  | "function";

export function type(
  value: unknown,
  target:
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
): boolean;

export function type(
  value: unknown,
  target?:
    | "string"
    | "number"
    | "bigint"
    | "boolean"
    | "symbol"
    | "undefined"
    | "object"
    | "function"
): string | boolean {
  return target !== undefined ? typeof value === target : typeof value;
}

export function sortExtensions(
  items: CassExtensions<AutoExtensionType> | AutoExtensionType[]
): CassExtensions<AutoExtensionType> {
  return new CassExtensions(
    [...items].sort((a, b) => b.importance - a.importance)
  );
}
