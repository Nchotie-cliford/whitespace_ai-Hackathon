const fs = require("node:fs");
const path = require("node:path");

function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const raw = fs.readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnv();

const config = {
  port: Number(process.env.PORT || 3000),
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  useMockData: (process.env.USE_MOCK_DATA || "true").toLowerCase() === "true",
  anthropicApiKey: process.env.ANTHROPIC_API_KEY || "",
  anthropicModel: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
  anthropicVersion: process.env.ANTHROPIC_VERSION || "2023-06-01",
  elevenLabsApiKey: process.env.ELEVENLABS_API_KEY || "",
  elevenLabsVoiceId: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
  elevenLabsModelId: process.env.ELEVENLABS_MODEL_ID || "eleven_turbo_v2_5",
  elevenLabsSpeechToTextModelId:
    process.env.ELEVENLABS_STT_MODEL_ID || "scribe_v1",
  heroApiUrl:
    process.env.HERO_API_URL || "https://login.hero-software.de/api/external/v9/graphql",
  heroApiToken: process.env.HERO_API_TOKEN || "",
};

module.exports = { config };
