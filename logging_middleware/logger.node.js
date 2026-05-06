const axios = require('axios');
const fs = require('fs');
const path = require('path');

const LOG_URL = "http://20.207.122.201/evaluation-service/logs";

const VALID_LEVELS = new Set(["debug", "info", "warn", "error", "fatal"]);
const VALID_STACKS = new Set(["backend", "frontend"]);

const BACKEND_PACKAGES = new Set([
  "cache", "controller", "cron_job", "db", "domain",
  "handler", "repository", "route", "service"
]);
const SHARED_PACKAGES = new Set(["auth", "config", "middleware", "utils"]);

function isValidPackage(stack, pkg) {
  if (SHARED_PACKAGES.has(pkg)) return true;
  if (stack === "backend") return BACKEND_PACKAGES.has(pkg);
  return false;
}

async function Log(stack, level, pkg, message) {
  if (!VALID_STACKS.has(stack)) {
    console.log(`[logger] skipped — invalid stack: '${stack}'`);
    return;
  }
  if (!VALID_LEVELS.has(level)) {
    console.log(`[logger] skipped — invalid level: '${level}'`);
    return;
  }
  if (!isValidPackage(stack, pkg)) {
    console.log(`[logger] skipped — '${pkg}' not allowed for stack '${stack}'`);
    return;
  }

  const envPath = path.join(__dirname, '..', 'notification_app_be', '.env');
  let token = process.env.AUTH_TOKEN;
  
  if (!token && fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const match = envContent.match(/AUTH_TOKEN=(.*)/);
    if (match) token = match[1].trim();
  }

  if (!token) {
    console.log("[logger] AUTH_TOKEN not found — skipping remote log");
    return;
  }

  try {
    const response = await axios.post(LOG_URL, {
      stack,
      level,
      package: pkg,
      message
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data && response.data.logID) {
      console.log(`[logger] sent (${level}) → logID: ${response.data.logID}`);
    }
  } catch (err) {
    console.log(`[logger] request failed: ${err.message}`);
  }
}

module.exports = { Log };
