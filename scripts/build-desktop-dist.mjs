import { cpSync, existsSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST_DIR = "dist";
const staticEntries = [
  "index.html",
  "styles.css",
  "app.js",
  "sw.js",
  "manifest.webmanifest",
  "assets",
  "src",
  "desktop-host-manifest.json",
  "desktop-wrapper-manifest.json",
  "desktop-package-manifest.json",
  "plugin-host-manifest.json",
];

function copyEntry(entry) {
  if (!existsSync(entry)) {
    throw new Error(`Missing desktop dist asset: ${entry}`);
  }

  const target = join(DIST_DIR, entry);
  cpSync(entry, target, {
    recursive: statSync(entry).isDirectory(),
  });
}

rmSync(DIST_DIR, { recursive: true, force: true });
mkdirSync(DIST_DIR, { recursive: true });

for (const entry of staticEntries) {
  copyEntry(entry);
}

console.log(`PunchLab desktop dist built at ${DIST_DIR}`);
