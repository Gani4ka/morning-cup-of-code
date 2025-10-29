import { getStoredVideos } from "./storage.js";

/**
 * @param {Array} videos
 * @param {number} n
 * @returns {Array}
 */
export async function pickUnseenVideos(videos, n = 3) {
  const seen = await getStoredVideos();

  const unseen = [];
  for (const v of videos) {
    if (!seen.includes(v.id)) {
      unseen.push(v);
      if (unseen.length >= n) break;
    }
  }
  return unseen;
}
