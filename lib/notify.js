import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

/**
 * @param {string} message
 */
export async function sendTelegramMessage(message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    throw new Error(
      "TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing in .env"
    );
  }

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: message }),
    });

    const data = await res.json();

    if (!data.ok) {
      console.error("Telegram API error:", data);
    } else {
      console.log("Message sent successfully!");
    }
  } catch (err) {
    console.error("Failed to send Telegram message:", err);
  }
}
