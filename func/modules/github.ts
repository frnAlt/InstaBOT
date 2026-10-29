import axios from "axios";
import { URL } from "node:url";

export interface GithubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string | null;
  type: "file" | "dir";
  _links: {
    self: string;
    git: string;
    html: string;
  };
  download(key: keyof GithubFile): Promise<string>;
  download(): Promise<string>;
}

export class GithubFileClass implements GithubFile {
  public name: string;
  public path: string;
  public sha: string;
  public size: number;
  public url: string;
  public html_url: string;
  public git_url: string;
  public download_url: string | null;
  public type: "file" | "dir";
  public _links: {
    self: string;
    git: string;
    html: string;
  };
  constructor(file: GithubFile) {
    Object.assign(this, file);
  }

  public download(key: keyof GithubFile): Promise<string>;
  public download(): Promise<string>;
  public async download(key?: unknown): Promise<string> {
    if (typeof key === "string") {
      // @ts-ignore
      const res = await axios.get(this[key], { responseType: "text" });
      return res.data;
    }
    const res = await axios.get(this.download_url, { responseType: "text" });
    return res.data;
  }
}

export const originalRepo = "lianecagara/CassidyRedux";

export async function fetchFileContents(
  folder: string = "",
  repo: `${string}/${string}` = originalRepo
): Promise<GithubFileClass[]> {
  try {
    folder = folder.replace(/^\/+/, "");

    const url = new URL(
      `${repo}/contents/${folder}`,
      "https://api.github.com/repos/"
    ).toString();

    const res = await axios.get<GithubFile[]>(url);
    return res.data.map((i) => new GithubFileClass(i));
  } catch (error) {
    console.error("❌ Error fetching GitHub file contents:", error);
    throw new Error(
      "Failed to fetch file contents. Check the repository or folder path."
    );
  }
}

export async function bulkFetch(...urls: string[]): Promise<(string | null)[]> {
  return Promise.all(
    urls.map(async (url) => {
      try {
        const res = await axios.get(url, { responseType: "text" });
        return res.data;
      } catch (error) {
        console.error(`❌ Error fetching ${url}:`, error);
        return null;
      }
    })
  );
}
