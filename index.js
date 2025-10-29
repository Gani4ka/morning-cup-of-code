import "dotenv/config";
import cron from "node-cron";
import { searchYouTube } from "./lib/youtube.js";
import { pickUnseenVideos } from "./lib/filter.js";
import { saveVideo } from "./lib/storage.js";
import { sendTelegramMessage } from "./lib/notify.js";
import { escapeMarkdown } from "./lib/escapeMarkdown.js";

export async function sendMorningThree() {
  const videos = await searchYouTube();

  if (!videos || videos.length === 0) {
    console.log("No videos found.");
    await sendTelegramMessage(
      "☕ Morning Cup of Code — no videos found today."
    );
    return;
  }

  const toSend = await pickUnseenVideos(videos, 3);

  if (!toSend || toSend.length === 0) {
    // await sendTelegramMessage(
    //   "☕ Morning Cup of Code — no *new* videos today. I'll try again tomorrow."
    // );
    return;
  }

  const message = [
    "🎬 *Morning Cup of Code* ☕\n",
    ...toSend.map((v, i) => {
      const idx = i + 1;
      const subsText =
        v.subsCount !== undefined
          ? ` (${v.subsCount.toLocaleString()} subs)`
          : "";
      const viewsText =
        v.viewCount !== undefined
          ? ` • ${v.viewCount.toLocaleString()} views`
          : "";

      return `*${idx}. ${escapeMarkdown(v.title)}*\n📺 ${escapeMarkdown(
        v.channel
      )}${subsText}${viewsText}\n[Watch on YouTube](${v.url})`;
    }),
  ].join("\n\n");

  await sendTelegramMessage(message, { parse_mode: "Markdown" });

  for (const v of toSend) {
    await saveVideo(v.id);
  }
}

cron.schedule("0 8 * * *", async () => {
  await sendMorningThree();
});
