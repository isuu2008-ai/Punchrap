import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

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

function findVswhere() {
  const candidates = [
    join(process.env["ProgramFiles(x86)"] || "", "Microsoft Visual Studio", "Installer", "vswhere.exe"),
    join(process.env.ProgramFiles || "", "Microsoft Visual Studio", "Installer", "vswhere.exe"),
  ];
  return candidates.find((path) => path && existsSync(path));
}

function findMsvcLinker(installationPath) {
  const toolsRoot = join(installationPath, "VC", "Tools", "MSVC");
  if (!existsSync(toolsRoot)) {
    return "";
  }

  const versions = readdirSync(toolsRoot).sort().reverse();
  for (const version of versions) {
    for (const relativePath of [
      ["bin", "Hostx64", "x64", "link.exe"],
      ["bin", "Hostx64", "x86", "link.exe"],
      ["bin", "Hostx86", "x64", "link.exe"],
      ["bin", "Hostx86", "x86", "link.exe"],
    ]) {
      const linker = join(toolsRoot, version, ...relativePath);
      if (existsSync(linker)) {
        return linker;
      }
    }
  }

  return "";
}

function checkWindowsMsvcLinker() {
  if (process.platform !== "win32") {
    pass("MSVC linker check skipped on non-Windows platform");
    return;
  }

  const vswhere = findVswhere();
  if (!vswhere) {
    fail("Visual Studio Installer/vswhere not found; install Visual Studio 2022 Build Tools with Desktop development with C++");
    return;
  }

  const result = spawnSync(vswhere, [
    "-latest",
    "-products",
    "*",
    "-requires",
    "Microsoft.VisualStudio.Component.VC.Tools.x86.x64",
    "-property",
    "installationPath",
  ], {
    encoding: "utf8",
  });
  const installationPath = result.stdout.trim().split(/\r?\n/)[0];
  if (result.status !== 0 || !installationPath) {
    fail("MSVC C++ x64/x86 build tools are missing; open Visual Studio Installer and install Desktop development with C++");
    return;
  }

  const linker = findMsvcLinker(installationPath);
  if (!linker) {
    fail("MSVC linker link.exe not found; install MSVC v143 C++ x64/x86 build tools and a Windows SDK");
    return;
  }

  pass(`MSVC linker: ${linker}`);
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
checkWindowsMsvcLinker();

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
checkScript(scripts, "desktop:dist", "node scripts/build-desktop-dist.mjs");
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

if (tauriConfig.build?.beforeBuildCommand !== "node scripts/build-desktop-dist.mjs") {
  fail("tauri.conf.json build.beforeBuildCommand must build the isolated desktop dist");
} else {
  pass(`Tauri beforeBuildCommand: ${tauriConfig.build.beforeBuildCommand}`);
}

if (tauriConfig.build?.frontendDist !== "../dist") {
  fail("tauri.conf.json build.frontendDist must point to ../dist for production builds");
} else {
  pass(`Tauri frontendDist: ${tauriConfig.build.frontendDist}`);
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
