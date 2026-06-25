const DEV_URL = process.env.PUNCHLAB_DEV_URL || "http://localhost:4173";
const HEALTH_URL = new URL("/index.html", DEV_URL).href;
const SERVER_SCRIPT = new URL("../server.mjs", import.meta.url);
const devPort = new URL(DEV_URL).port || "4173";

process.env.PORT ||= devPort;

async function probePunchLabServer() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);

  try {
    const response = await fetch(HEALTH_URL, {
      cache: "no-store",
      signal: controller.signal,
    });
    const body = await response.text();
    return {
      available: true,
      punchlab: response.ok && body.includes("<title>PunchLab</title>"),
      status: response.status,
    };
  } catch (error) {
    return {
      available: false,
      punchlab: false,
      error,
    };
  } finally {
    clearTimeout(timer);
  }
}

function holdForTauriShutdown() {
  const timer = setInterval(() => {}, 2147483647);
  const stop = () => {
    clearInterval(timer);
    process.exit(0);
  };

  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
}

const probe = await probePunchLabServer();

if (probe.punchlab) {
  console.log(`PunchLab dev server already running at ${DEV_URL}; reusing it for Tauri.`);
  holdForTauriShutdown();
} else if (probe.available) {
  console.error(`Port ${devPort} is already in use, but it is not serving PunchLab.`);
  console.error("Stop that process or set PUNCHLAB_DEV_URL/PORT to a free matching port.");
  process.exit(1);
} else {
  console.log(`Starting PunchLab dev server at ${DEV_URL}.`);
  await import(SERVER_SCRIPT);
}
