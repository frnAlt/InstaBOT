import axios from "axios";
import { Readable } from "stream";

export enum Quality {
  Small = 0,
  Medium = 1,
  High = 2,
}

interface ThumbnailOptions {
  baseURL?: string;
  legacy?: boolean;
}

/**
 * Builds thumbnail URL
 */
function buildThumbnailURL(
  levelID: number,
  quality: Quality,
  options?: ThumbnailOptions
): string {
  const baseURL = options?.baseURL ?? "https://levelthumbs.prevter.me";
  const legacy = options?.legacy ?? false;

  if (legacy) {
    return `${baseURL}/${levelID}.png`;
  }

  if (quality === Quality.High) {
    return `${baseURL}/thumbnail/${levelID}`;
  }

  return `${baseURL}/thumbnail/${levelID}/${quality}`;
}

/**
 * Fetches thumbnail as stream
 * Returns Readable stream or null if not found
 */
export async function fetchThumbnail(
  levelID: number,
  quality: Quality,
  options?: ThumbnailOptions
): Promise<Readable | null> {
  const url = buildThumbnailURL(levelID, quality, options);

  try {
    const response = await axios.get(url, {
      responseType: "stream",
      validateStatus: (status) => status === 200 || status === 404,
    });

    if (response.status === 404) {
      return null;
    }

    return response.data as Readable;
  } catch (err) {
    console.warn(`Failed to fetch thumbnail from ${url}:`, err);
    return null;
  }
}
