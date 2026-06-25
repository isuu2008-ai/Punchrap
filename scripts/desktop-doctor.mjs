import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

let failed = false;

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function fail(message) {
  console.error(`[missing] ${message}`);
  failed = true;
}

function pass(message) {
  console.log(`[ok] ${message}`);
}

function checkFile(path, label) {
  if (!existsSync(path)) {
    fail(`${label} not found at ${path}`);
    return;
  }
  pass(`${label}: ${path}`);
}

function checkCommand(command, args, label) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (result.error || result.status !== 0) {
    fail(`${label} command is not available on PATH (${command})`);
    return;
  }
  const version = `${result.stdout || result.stderr}`.trim().split(/\r?\n/)[0];
  pass(`${label}: ${version || command}`);
}

function checkScript(scripts, name, expected) {
  if (scripts[name] !== expected) {
    fail(`package.json script ${name} must be "${expected}"`);
    return;
  }
  pass(`package script ${name}: ${expected}`);
}

console.log("PunchLab desktop doctor");

checkCommand("node", ["--version"], "Node");
checkCommand("npm", ["--version"], "npm");
checkCommand("rustc", ["--version"], "Rust compiler");
checkCommand("cargo", ["--version"], "Cargo");

checkFile("src-tauri/tauri.conf.json", "Tauri config");
checkFile("src-tauri/Cargo.toml", "Cargo manifest");
checkFile("src-tauri/src/main.rs", "Tauri main entry");
checkFile("src-tauri/src/lib.rs", "Tauri library entry");
checkFile("src-tauri/capabilities/main.json", "Tauri main capability");

const nodePackage = readJson("package.json");
const tauriConfig = readJson("src-tauri/tauri.conf.json");
const packageManifest = readJson("desktop-package-manifest.json");
const scripts = nodePackage.scripts || {};

checkScript(scripts, "desktop:check", "node scripts/check-desktop-contract.mjs");
checkScript(scripts, "desktop:doctor", "node scripts/desktop-doctor.mjs");
checkScript(scripts, "desktop:serve", "node scripts/start-desktop-dev-server.mjs");
checkScript(scripts, "desktop:dev", "tauri dev");
checkScript(scripts, "desktop:build", "tauri build");
checkScript(scripts, "tauri:dev", "tauri dev");
checkScript(scripts, "tauri:build", "tauri build");

if (nodePackage.devDependencies?.["@tauri-apps/cli"] !== packageManifest.desktopTooling?.tauriCliVersion) {
  fail("package.json @tauri-apps/cli version must match desktop-package-manifest.json");
} else {
  pass(`Tauri CLI npm package: @tauri-apps/cli ${nodePackage.devDependencies["@tauri-apps/cli"]}`);
}

if (tauriConfig.build?.devUrl !== packageManifest.entry?.devServer) {
  fail("tauri.conf.json build.devUrl must match desktop-package-manifest.json entry.devServer");
} else {
  pass(`Tauri dev URL: ${tauriConfig.build.devUrl}`);
}

if (tauriConfig.build?.beforeDevCommand !== "node scripts/start-desktop-dev-server.mjs") {
  fail("tauri.conf.json build.beforeDevCommand must start the local PunchLab server");
} else {
  pass(`Tauri beforeDevCommand: ${tauriConfig.build.beforeDevCommand}`);
}

if (tauriConfig.app?.withGlobalTauri !== true) {
  fail("tauri.conf.json app.withGlobalTauri must stay true for the vanilla JS bridge");
} else {
  pass("Tauri global invoke bridge enabled");
}

if (failed) {
  console.error("PunchLab desktop doctor found missing desktop prerequisites.");
  process.exit(1);
}

console.log("PunchLab desktop doctor passed. Run npm run desktop:dev to open the Tauri shell.");
