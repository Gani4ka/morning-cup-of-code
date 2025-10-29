import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import "dotenv/config";

const apiKey = process.env.YOUTUBE_API_KEY;
const CACHE_FILE = path.resolve("./data/channels_cache.json");

const TOPIC_VARIATIONS = [
  "javascript",
  "javascript frontend development",
  "javascript backend development",
  "react.js",
  "node.js programming",
  "typescript",
  "javascript web development",
  "modern javascript",
  "javascript frameworks",
  "javascript libraries",
  "frontend web development",
  "full stack javascript",
  "web development trends 2025",
  "best practices in javascript",
  "advanced javascript concepts",
  "javascript performance optimization",
  "building web applications with javascript",
  "javascript coding tips",
  "javascript debugging techniques",
  "javascript design patterns",
  "javascript for web developers",
  "javascript fundamentals",
  "programming fundamentals",
  "css",
  "html5",
  "css frameworks",
  "css tips",
  "news of css",
  "web development news",
  "IT industry news",
  "news in frontend development",
  "news of tech industry",
  "news of web development",
  "web development trends",
  "web development tools",
  "frontend development best practices",
  "advanced frontend development",
  "full stack web development",
  "modern web applications",
  "building scalable web apps",
  "progressive web apps",
  "javascript security best practices",
  "tips for javascript",
  "tips for web development",
  "javascript coding tips",
  "javascript best practices",
  "advanced javascript",
  "advanced web development",
  "clean code",
  "senior javascript developer",
  "senior frontend developer",
];

function getRandomTopic() {
  const randomIndex = Math.floor(Math.random() * TOPIC_VARIATIONS.length);
  return TOPIC_VARIATIONS[randomIndex];
}

/**
 * @returns {Array}
 */
export async function searchYouTube() {
  const randomTopic = getRandomTopic();

  const orderOptions = ["relevance", "date", "viewCount"];
  const randomOrder =
    orderOptions[Math.floor(Math.random() * orderOptions.length)];

  const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.search = new URLSearchParams({
    part: "snippet",
    type: "video",
    q: randomTopic,
    maxResults: "50",
    order: randomOrder,
    videoDuration: "medium",
    safeSearch: "moderate",
    key: apiKey,
  });

  const searchRes = await fetch(searchUrl);
  const searchData = await searchRes.json();

  if (!searchData.items?.length) {
    console.log("No results found.");
    return [];
  }

  const videoIds = searchData.items.map((item) => item.id.videoId).join(",");
  const channelIds = [
    ...new Set(searchData.items.map((item) => item.snippet.channelId)),
  ];

  const videoDetails = await fetchJSON(
    "https://www.googleapis.com/youtube/v3/videos",
    { part: "statistics", id: videoIds, key: apiKey }
  );

  const videoMap = {};
  for (const v of videoDetails.items || []) {
    videoMap[v.id] = Number(v.statistics.viewCount || 0);
  }

  const channelStats = await getChannelStats(channelIds);

  const merged = searchData.items
    .map((item) => {
      const id = item.id.videoId;
      const chId = item.snippet.channelId;
      const views = videoMap[id] || 0;
      const subs = channelStats[chId]?.subs || 0;

      return {
        id,
        title: item.snippet.title,
        url: `https://www.youtube.com/watch?v=${id}`,
        channel: item.snippet.channelTitle,
        channelId: chId,
        publishedAt: item.snippet.publishedAt,
        viewCount: views,
        subsCount: subs,
      };
    })
    .filter(
      (v) =>
        !/beginner|for beginners/i.test(v.title) &&
        v.viewCount > 1000 &&
        v.subsCount > 5000 &&
        !isVideoTooOld(v.publishedAt)
    )
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  console.log(
    `Debug: Found ${searchData.items.length} raw videos, on topic ${randomTopic} filtered to ${merged.length} videos`
  );
  return merged;
}

/**
 * @param {Array} channelIds
 * @returns {Object}
 */
async function getChannelStats(channelIds) {
  const cache = loadChannelCache();
  const result = {};
  const missing = [];

  for (const id of channelIds) {
    const entry = cache[id];
    if (entry && !isOld(entry.date)) {
      result[id] = entry;
    } else {
      missing.push(id);
    }
  }

  if (missing.length) {
    const fetched = await fetchJSON(
      "https://www.googleapis.com/youtube/v3/channels",
      { part: "statistics", id: missing.join(","), key: apiKey }
    );

    for (const ch of fetched.items || []) {
      const subs = Number(ch.statistics.subscriberCount || 0);
      cache[ch.id] = { subs, date: today() };
      result[ch.id] = { subs, date: today() };
    }

    saveChannelCache(cache);
  }

  return result;
}

function loadChannelCache() {
  if (!fs.existsSync(CACHE_FILE)) return {};
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
  } catch {
    return {};
  }
}

function saveChannelCache(data) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function isOld(dateString) {
  const date = new Date(dateString);
  const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 7;
}

function isVideoTooOld(dateString) {
  const date = new Date(dateString);
  const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
  const twoYears = 365 * 2;
  return diff > twoYears;
}

/**
 * @param {string} baseUrl
 * @param {Object} params
 * @returns {Object}
 */
async function fetchJSON(baseUrl, params) {
  const url = new URL(baseUrl);
  url.search = new URLSearchParams(params);
  const res = await fetch(url);
  return res.json();
}
