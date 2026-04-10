const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { config } = require("./config");
const { MockRepository } = require("./data/mockRepository");
const { SupabaseRepository } = require("./data/supabaseRepository");
const { RecommendationService } = require("./dispatch/recommendationService");
const { DashboardService } = require("./dashboard/dashboardService");
const { TranscriptFallbackService } = require("./dispatch/transcriptFallbackService");
const { AnthropicDispatchClient } = require("./ai/anthropicDispatchClient");
const { DispatchAiService } = require("./ai/dispatchAiService");
const { HeroClient } = require("./hero/heroClient");
const { ApplyDispatchService } = require("./dispatch/applyDispatchService");
const { ElevenLabsClient } = require("./audio/elevenLabsClient");

function createRepository() {
  if (config.useMockData) {
    return new MockRepository();
  }

  return new SupabaseRepository(config);
}

function json(response, statusCode, payload) {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(payload, null, 2));
}

function getMimeType(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  switch (extension) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".js":
      return "application/javascript; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    default:
      return "text/plain; charset=utf-8";
  }
}

function serveStatic(request, response) {
  const publicRoot = path.join(process.cwd(), "public");
  const urlPath = new URL(request.url, `http://${request.headers.host}`).pathname;
  const relativePath = urlPath === "/" ? "index.html" : urlPath.replace(/^\/+/, "");
  const filePath = path.join(publicRoot, relativePath);

  if (!filePath.startsWith(publicRoot) || !fs.existsSync(filePath)) {
    return false;
  }

  response.writeHead(200, { "Content-Type": getMimeType(filePath) });
  response.end(fs.readFileSync(filePath));
  return true;
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let raw = "";
    request.on("data", (chunk) => {
      raw += chunk;
    });
    request.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

function createServer() {
  const repository = createRepository();
  const recommendationService = new RecommendationService(repository);
  const dashboardService = new DashboardService(repository);
  const fallbackService = new TranscriptFallbackService();
  const anthropicClient = new AnthropicDispatchClient(config);
  const dispatchAiService = new DispatchAiService({
    dashboardService,
    fallbackService,
    aiClient: anthropicClient,
  });
  const applyDispatchService = new ApplyDispatchService({
    repository,
    heroClient: new HeroClient(config),
  });
  const elevenLabsClient = new ElevenLabsClient(config);

  return http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, `http://${request.headers.host}`);

      if (request.method === "GET" && url.pathname === "/health") {
        const basePayload = {
          ok: true,
          mode: config.useMockData ? "mock" : "supabase",
          audio: {
            elevenLabsConfigured: elevenLabsClient.isConfigured(),
            voiceId: config.elevenLabsVoiceId,
            speechToTextModelId: config.elevenLabsSpeechToTextModelId,
          },
        };

        if (!config.useMockData && typeof repository.getHealthSnapshot === "function") {
          basePayload.database = await repository.getHealthSnapshot();
        }

        return json(response, 200, basePayload);
      }

      if (
        request.method === "GET" &&
        url.pathname.startsWith("/api/recommendation/")
      ) {
        const eventId = url.pathname.split("/").pop();
        const result = await recommendationService.recommendForEvent(eventId);
        return json(response, 200, result);
      }

      if (request.method === "GET" && url.pathname === "/api/dashboard") {
        const snapshot = await dashboardService.getSnapshot();
        return json(response, 200, snapshot);
      }

      if (request.method === "POST" && url.pathname === "/api/dispatch/resolve") {
        const body = await readJson(request);
        if (!body.transcript) {
          return json(response, 400, { error: "transcript is required" });
        }

        const result = await dispatchAiService.resolveTranscript({
          transcript: body.transcript,
        });
        return json(response, 200, result);
      }

      if (request.method === "POST" && url.pathname === "/api/dispatch/voice-resolve") {
        const body = await readJson(request);
        if (!body.audioBase64) {
          return json(response, 400, { error: "audioBase64 is required" });
        }

        try {
          const transcriptResponse = await elevenLabsClient.transcribe({
            audioBase64: body.audioBase64,
            mimeType: body.mimeType,
            languageCode: body.language,
          });

          const transcript = String(
            transcriptResponse.text ||
              transcriptResponse.transcript ||
              "",
          ).trim();

          if (!transcript) {
            return json(response, 422, {
              error: "No transcript could be extracted from the recorded audio.",
            });
          }

          const result = await dispatchAiService.resolveTranscript({
            transcript,
          });

          return json(response, 200, {
            transcript,
            transcription: transcriptResponse,
            ...result,
          });
        } catch (error) {
          return json(response, 503, {
            error: error.message,
          });
        }
      }

      if (request.method === "POST" && url.pathname === "/api/dispatch/apply") {
        const body = await readJson(request);
        const result = await applyDispatchService.applyResolution({
          transcript: body.transcript,
          resolution: body.resolution,
          actor: body.actor || "Thomas",
        });
        return json(response, 200, result);
      }

      if (request.method === "POST" && url.pathname === "/api/audio/brief") {
        const body = await readJson(request);
        if (!body.text) {
          return json(response, 400, { error: "text is required" });
        }

        try {
          const audio = await elevenLabsClient.synthesize({
            text: body.text,
            voiceId: body.voiceId,
          });
          response.writeHead(200, {
            "Content-Type": audio.contentType,
            "Content-Length": audio.audioBuffer.length,
            "Cache-Control": "no-store",
          });
          response.end(audio.audioBuffer);
          return;
        } catch (error) {
          return json(response, 503, {
            error: error.message,
            fallback: "browser_speech_synthesis",
          });
        }
      }

      if (request.method === "GET" && serveStatic(request, response)) {
        return;
      }

      return json(response, 404, { error: "Not found" });
    } catch (error) {
      return json(response, 500, {
        error: error.message,
      });
    }
  });
}

if (require.main === module) {
  const server = createServer();
  server.listen(config.port, () => {
    process.stdout.write(
      `Dispatch server listening on http://localhost:${config.port}\n`,
    );
  });
}

module.exports = { createServer };
