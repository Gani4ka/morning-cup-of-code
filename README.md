# ☕ Morning Cup of Code

A daily YouTube video curator that automatically finds and sends high-quality programming videos to your Telegram channel every morning.

## 🎯 What it does

- Searches YouTube for programming content using randomized topics and parameters
- Filters videos based on quality metrics (views, subscriber count, recency)
- Avoids beginner content and duplicate videos
- Sends 3 curated videos to Telegram daily at 8 AM
- Tracks previously sent videos to avoid repetition

## 📋 Prerequisites

- Node.js (v14 or higher)
- YouTube Data API v3 key
- Telegram Bot token and chat ID

## 🛠️ Installation

1. Clone the repository:

```bash
git clone https://github.com/Gani4ka/morning-cup-of-code.git
cd morning-cup-of-code
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file with your API credentials:

```env
YOUTUBE_API_KEY=your_youtube_api_key_here
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
TELEGRAM_CHAT_ID=your_telegram_chat_id_here
TOPIC=javascript frontend development
```

## 🔑 Getting API Keys

### YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API key)
5. Restrict the key to YouTube Data API v3

### Telegram Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Use `/newbot` command to create a new bot
3. Get your bot token
4. Add the bot to your channel/chat
5. Get your chat ID by messaging your bot and visiting:
   `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`

## 🏃‍♂️ Usage

### Run once:

```bash
node index.js
```

## ⚙️ Configuration

### Search Topics

The app randomly selects from predefined topics in `index.js`:

- javascript frontend development
- javascript backend development
- react js tutorial
- vue js development
- node js programming
- And more...

### Filtering Criteria

Videos must meet these requirements (configurable in `lib/youtube.js`):

- View count > 1,000
- Channel subscribers > 5,000
- Published within last 6 months
- Not tagged as beginner content

### Scheduling

Modify the cron schedule in `index.js`:

```javascript
cron.schedule("0 8 * * *", async () => {
  await sendMorningThree();
});
```

## 🔧 Customization

### Change Video Count

Modify the number in `index.js`:

```javascript
const toSend = await pickUnseenVideos(videos, 3); // Change 3 to desired number
```

### Adjust Filters

Edit criteria in `lib/youtube.js`:

```javascript
v.viewCount > 1000 && // Minimum views
  v.subsCount > 5000 && // Minimum subscribers
  !isVideoTooOld(v.publishedAt); // Age limit (180 days)
```

### Add Topics

Extend the topic array in `index.js`:

```javascript
const TOPIC_VARIATIONS = [
  "your new topic here",
  // ... existing topics
];
```

---

**Happy coding!** ☕️👨‍💻
