import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export namespace GDBrowserAPI {
  export const baseUrl = "https://gdbrowser.com/api";
  export const mainUrl = "https://gdbrowser.com";

  export async function level(
    levelId: string,
    params?: Record<string, any>
  ): Promise<LevelInfo> {
    return (await get("level", levelId, params)).data;
  }

  export async function getLevelIDFromPage(
    url: string
  ): Promise<string | null> {
    const html = (await axios.get(url)).data as string;
    const match = html.match(/<title>.*\((\d+)\)<\/title>/);
    return match ? match[1] : null;
  }

  export interface LevelInfo {
    name: string;
    id: string;
    description: string;
    author: string;
    playerID: string;
    accountID: string;
    difficulty: string;
    downloads: number;
    likes: number;
    disliked: boolean;
    length: string;
    platformer: boolean;
    stars: number;
    orbs: number;
    diamonds: number;
    featured: boolean;
    epic: boolean;
    epicValue: number;
    legendary: boolean;
    mythic: boolean;
    gameVersion: string;
    editorTime: number;
    totalEditorTime: number;
    version: number;
    copiedID: string;
    twoPlayer: boolean;
    officialSong: number;
    customSong: string;
    coins: number;
    verifiedCoins: boolean;
    starsRequested: number;
    ldm: boolean;
    objects: number;
    large: boolean;
    cp: number;
    partialDiff: string;
    difficultyFace: string;
    songName: string;
    songAuthor: string;
    songSize: string;
    songID: string;
    songLink: string;
  }

  export async function profile(
    username: string,
    params?: Record<string, any>
  ): Promise<LevelCounts> {
    return (await get("profile", username, params)).data;
  }

  export interface RGBColor {
    r: number;
    g: number;
    b: number;
  }

  export interface LevelCounts {
    auto?: number;
    easy?: number;
    normal?: number;
    hard?: number;
    harder?: number;
    insane?: number;
    extreme?: number;
    weekly?: number;
    daily?: number;
    gauntlet?: number;
  }

  export interface UserStats {
    username: string;
    playerID: string;
    accountID: string;
    rank: number;
    stars: number;
    diamonds: number;
    coins: number;
    userCoins: number;
    demons: number;
    moons: number;
    cp: number;
    icon: number;
    friendRequests: boolean;
    messages: string;
    commentHistory: string;
    moderator: number;
    youtube: string;
    twitter: string;
    twitch: string;
    ship: number;
    ball: number;
    ufo: number;
    wave: number;
    robot: number;
    spider: number;
    swing: number;
    jetpack: number;
    col1: number;
    col2: number;
    colG: number;
    deathEffect: number;
    glow: boolean;
    classicDemonsCompleted: LevelCounts;
    platformerDemonsCompleted: LevelCounts;
    classicLevelsCompleted: LevelCounts;
    platformerLevelsCompleted: LevelCounts;
    col1RGB: RGBColor;
    col2RGB: RGBColor;
    colGRGB: RGBColor;
  }

  export async function search(
    query: string,
    params?: { page?: number; count?: number }
  ): Promise<Levels> {
    return (await get("search", query, params)).data;
  }

  export interface Level {
    name: string;
    id: string;
    description: string;
    author: string;
    playerID: string;
    accountID: string;
    difficulty: string;
    downloads: number;
    likes: number;
    disliked: boolean;
    length: string;
    platformer: boolean;
    stars: number;
    orbs: number;
    diamonds: number;
    featured: boolean;
    featuredPosition?: number;
    epic: boolean;
    epicValue: number;
    legendary: boolean;
    mythic: boolean;
    gameVersion: string;
    editorTime: number;
    totalEditorTime: number;
    version: number;
    copiedID: string;
    twoPlayer: boolean;
    officialSong: number;
    customSong: string;
    coins: number;
    verifiedCoins: boolean;
    starsRequested: number;
    ldm: boolean;
    objects: number;
    large: boolean;
    cp: number;
    partialDiff: string;
    difficultyFace: string;
    songName: string;
    songAuthor: string;
    songSize: string;
    songID: string;
    songLink: string;
    results?: number;
    pages?: number;
  }

  export type Levels = Level[];

  export async function comments(
    levelId: string,
    params?: Record<string, any>
  ): Promise<LevelComments> {
    return (await get("comments", levelId, params)).data;
  }

  export interface Icon {
    form: string;
    icon: number;
    col1: number;
    col2: number;
    colG?: number | null;
    glow: boolean;
  }

  export interface LevelComment {
    content: string;
    ID: string;
    likes: number;
    date: string;
    username: string;
    playerID: string;
    accountID: string;
    rank?: number | null;
    stars?: number | null;
    diamonds?: number | null;
    coins?: number | null;
    userCoins?: number | null;
    demons?: number | null;
    moons?: number | null;
    cp?: number | null;
    icon: Icon;
    col1RGB: RGBColor;
    col2RGB: RGBColor;
    colGRGB?: RGBColor | null;
    levelID: string;
    color: string;
    moderator: number;
    results?: number;
    pages?: number;
    range?: string;
    percent?: number;
  }

  export type LevelComments = LevelComment[];

  export const headers = {
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Accept-Language": "en-US,en;q=0.9,zh-CN;q=0.8,zh;q=0.7",
    Connection: "keep-alive",
    Cookie:
      "_ga_3EHJW0BL52=deleted; _ga=GA1.1.1844855046.1754459322; _ga_3EHJW0BL52=GS2.1.s1760537977$o1$g1$t1760538844$j60$l0$h0; _ga_JRGBZWQKV5=GS2.1.s1760536259$o5$g1$t1760538844$j60$l0$h0",
    Host: "gdbrowser.com",
    "If-None-Match": 'W/"295c-iXe7fbF0PSHkd/SKE2Ds2SGxNBc"',
    "Sec-CH-UA":
      '"Google Chrome";v="141", "Not?A_Brand";v="8", "Chromium";v="141"',
    "Sec-CH-UA-Mobile": "?0",
    "Sec-CH-UA-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  };

  async function get(
    endpoint: string,
    identifier: string,
    params?: Record<string, any>
  ) {
    const start = Date.now();

    let response: AxiosResponse;
    try {
      response = await axios.get(
        `${baseUrl}/${endpoint}/${encodeURIComponent(identifier)}`,
        {
          params: params,
          headers,
        } satisfies AxiosRequestConfig
      );
    } catch (err) {
      throw err;
    }

    const end = Date.now();

    if (response.data === "-1") {
      throw new Error("The server response was '-1'");
    }

    return { data: response.data, ping: end - start };
  }
}
