// Render's free plan sleeps a web service after 15 minutes without inbound traffic.
// GitHub Actions cron is too unreliable to prevent that (scheduled runs arrive hours late),
// so the server pings its own public URL every 10 minutes. The request goes through
// Render's proxy, so it counts as inbound traffic and keeps the instance awake.
//
// Render sets RENDER_EXTERNAL_URL automatically; KEEP_AWAKE_URL overrides it.
// Set KEEP_AWAKE=false to turn this off (e.g. after moving to a paid instance).

const INTERVAL_MS = 10 * 60 * 1000;

const startKeepAwake = () => {
  const baseUrl = process.env.KEEP_AWAKE_URL || process.env.RENDER_EXTERNAL_URL;

  if (process.env.KEEP_AWAKE === "false" || !baseUrl) {
    return;
  }

  const url = `${baseUrl.replace(/\/+$/, "")}/api/health`;

  const ping = async () => {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(30000) });
      if (!res.ok) console.warn(`Keep-awake ping got HTTP ${res.status}`);
    } catch (error) {
      console.warn(`Keep-awake ping failed: ${error.message}`);
    }
  };

  setInterval(ping, INTERVAL_MS);
  console.log(`Keep-awake: pinging ${url} every ${INTERVAL_MS / 60000} minutes.`);
};

module.exports = startKeepAwake;
