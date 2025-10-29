import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

// __dirname workaround in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const VIDEO_HISTORY_FILE_PATH = path.join(__dirname, "../data/videos.json");

export async function getStoredVideos() {
  try {
    const data = await fs.readFile(VIDEO_HISTORY_FILE_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

export async function saveVideo(id) {
  const videos = await getStoredVideos();
  if (!videos.includes(id)) {
    videos.push(id);
    await fs.writeFile(
      VIDEO_HISTORY_FILE_PATH,
      JSON.stringify(videos, null, 2)
    );
  }
}
