class ElevenLabsClient {
  constructor(config) {
    this.apiKey = config.elevenLabsApiKey;
    this.defaultVoiceId = config.elevenLabsVoiceId;
    this.modelId = config.elevenLabsModelId;
    this.speechToTextModelId = config.elevenLabsSpeechToTextModelId;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async synthesize({ text, voiceId }) {
    if (!this.isConfigured()) {
      throw new Error("ELEVENLABS_API_KEY is not configured.");
    }

    const resolvedVoiceId = voiceId || this.defaultVoiceId;
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${resolvedVoiceId}/stream`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": this.apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: this.modelId,
          voice_settings: {
            stability: 0.35,
            similarity_boost: 0.78,
          },
        }),
      },
    );

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ElevenLabs request failed: ${body}`);
    }

    return {
      contentType: response.headers.get("content-type") || "audio/mpeg",
      audioBuffer: Buffer.from(await response.arrayBuffer()),
    };
  }

  async transcribe({ audioBase64, mimeType, languageCode }) {
    if (!this.isConfigured()) {
      throw new Error("ELEVENLABS_API_KEY is not configured.");
    }

    if (!audioBase64) {
      throw new Error("audioBase64 is required for transcription.");
    }

    const extension = this.getFileExtensionForMimeType(mimeType);
    const form = new FormData();
    const audioBlob = new Blob([Buffer.from(audioBase64, "base64")], {
      type: mimeType || "audio/webm",
    });

    form.set("model_id", this.speechToTextModelId);
    form.set("file", audioBlob, `dispatch-request.${extension}`);
    if (languageCode) {
      form.set("language_code", languageCode);
    }

    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": this.apiKey,
      },
      body: form,
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`ElevenLabs transcription failed: ${body}`);
    }

    return response.json();
  }

  getFileExtensionForMimeType(mimeType) {
    switch (mimeType) {
      case "audio/mp4":
        return "mp4";
      case "audio/ogg":
      case "audio/ogg;codecs=opus":
        return "ogg";
      case "audio/webm":
      case "audio/webm;codecs=opus":
      default:
        return "webm";
    }
  }
}

module.exports = { ElevenLabsClient };
