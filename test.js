import { searchYouTube, searchYouTubeFavoriteChanels } from "./lib/youtube.js";

const topic = "JavaScript tutorial";
const run = async () => {
  try {
    const results = await searchYouTubeFavoriteChanels(
    );
    console.log("✅ Found videos:");
    results.forEach((v, i) => {
      console.log(
        `\n${i + 1}. ${v.title}\n   Channel: ${v.channel} (${
          v.subsCount
        } subs)\n   Views: ${v.viewCount}\n   URL: ${v.url}`
      );
    });
  } catch (err) {
    console.error("❌ Error:", err.message || err);
  }
};

run();


