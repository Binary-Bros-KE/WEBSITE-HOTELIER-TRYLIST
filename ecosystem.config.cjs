// pm2 process for the public websites. Runs Next's standalone server on
// localhost only; nginx (or Caddy) in front terminates TLS for every site
// host. Settings come from .env next to this file (never committed).
const fs = require("node:fs");
const path = require("node:path");

function readEnv(file) {
  if (!fs.existsSync(file)) return {};
  return Object.fromEntries(
    fs.readFileSync(file, "utf8").split(/\r?\n/)
      .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*"?(.*?)"?\s*$/))
      .filter(Boolean)
      .map((m) => [m[1], m[2]]),
  );
}

const env = readEnv(path.join(__dirname, ".env"));

module.exports = {
  apps: [{
    name: "hotelier-website",
    cwd: __dirname,
    script: ".next/standalone/server.js",
    env: { NODE_ENV: "production", HOSTNAME: "127.0.0.1", PORT: env.PORT || "3100", ...env },
    max_memory_restart: "600M",
  }],
};
