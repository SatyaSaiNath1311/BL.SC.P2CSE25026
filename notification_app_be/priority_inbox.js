const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { Log } = require('../logging_middleware/logger.node');

const NOTIFICATION_URL = "http://20.207.122.201/evaluation-service/notifications";

const TYPE_WEIGHT = {
  "Placement": 3,
  "Result": 2,
  "Event": 1
};

function parseTs(tsStr) {
  return new Date(tsStr).getTime();
}

function computeScore(weight, ts, oldest, newest) {
  const span = newest - oldest;
  const recency = span > 0 ? (ts - oldest) / span : 1.0;
  return Number((weight + recency).toFixed(6));
}

function getTopN(notifications, n) {
  if (!notifications || notifications.length === 0) return [];

  const timestamps = notifications.map(item => parseTs(item.Timestamp));
  const oldest = Math.min(...timestamps);
  const newest = Math.max(...timestamps);

  const scored = notifications.map(item => {
    const ts = parseTs(item.Timestamp);
    const weight = TYPE_WEIGHT[item.Type] || 0;
    const score = computeScore(weight, ts, oldest, newest);
    return { score, item };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

async function fetchNotifications(token) {
  try {
    const response = await axios.get(NOTIFICATION_URL, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data.notifications || [];
  } catch (err) {
    const msg = err.response?.data?.message || err.message;
    throw new Error(msg);
  }
}

function loadEnv() {
  const envPath = path.join(__dirname, '.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const parts = line.match(/^([^=]+)=(.*)$/);
      if (parts) process.env[parts[1].trim()] = parts[2].trim();
    });
  }
}

async function main() {
  loadEnv();
  const token = (process.env.AUTH_TOKEN || "").trim();
  const topN = parseInt(process.env.TOP_N || "10");

  if (!token) {
    console.log("Error: AUTH_TOKEN is not set.\nAdd it to your .env file and run:\n  node priority_inbox.js");
    process.exit(1);
  }

  console.log("\nFetching campus notifications...\n");
  await Log("backend", "info", "service", "priority inbox run started");

  try {
    const notifications = await fetchNotifications(token);
    const total = notifications.length;
    console.log(`Total received : ${total}`);
    await Log("backend", "info", "service", `fetched ${total} notifications from API`);

    const top = getTopN(notifications, top_n = topN);

    console.log("=".repeat(52));
    console.log(`  Priority Inbox — Top ${topN} Notifications`);
    console.log(`  Scoring: type weight + recency (0–1 scale)`);
    console.log("=".repeat(52) + "\n");

    top.forEach((entry, idx) => {
      const { score, item } = entry;
      const rank = (idx + 1).toString().padStart(2, '0');
      const label = item.Type.padEnd(9);
      console.log(`  #${rank}  [${label}]  ${item.Message}`);
      console.log(`        Timestamp : ${item.Timestamp}`);
      console.log(`        Score     : ${score}`);
      console.log(`        ID        : ${item.ID}\n`);
    });

    await Log("backend", "info", "service", `top ${topN} priority notifications displayed`);
  } catch (err) {
    await Log("backend", "error", "handler", err.message);
    console.log(`Failed to fetch notifications: ${err.message}`);
    process.exit(1);
  }
}

main();
