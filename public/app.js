const state = {
  snapshot: null,
  resolution: null,
  transcript: "",
  recognition: null,
  listening: false,
  audio: null,
};

const elements = {
  tasksList: document.getElementById("tasks-list"),
  crewList: document.getElementById("crew-list"),
  boardMeta: document.getElementById("board-meta"),
  voiceStage: document.getElementById("voice-stage"),
  voiceButton: document.getElementById("voice-button"),
  transcriptText: document.getElementById("transcript-text"),
  textFallback: document.getElementById("text-fallback"),
  textSubmit: document.getElementById("text-submit"),
  resolutionCards: document.getElementById("resolution-cards"),
  riskBanner: document.getElementById("risk-banner"),
  modePill: document.getElementById("mode-pill"),
  applyButton: document.getElementById("apply-button"),
  replayButton: document.getElementById("replay-button"),
  resetButton: document.getElementById("reset-button"),
  settingsButton: document.getElementById("settings-button"),
  settingsDialog: document.getElementById("settings-dialog"),
  saveSettings: document.getElementById("save-settings"),
  elevenVoiceId: document.getElementById("eleven-voice-id"),
  audioStatus: document.getElementById("audio-status"),
  audioSettingsStatus: document.getElementById("audio-settings-status"),
  systemStatus: document.getElementById("system-status"),
};

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function getAudioSettings() {
  return {
    voiceId:
      localStorage.getItem("elevenlabs_voice_id") || "21m00Tcm4TlvDq8ikWAM",
  };
}

function setStage(stage) {
  elements.voiceStage.classList.remove("listening", "processing", "ready");
  if (stage) {
    elements.voiceStage.classList.add(stage);
  }
}

function formatTime(value) {
  return new Date(value).toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderTasks() {
  const resolutionTaskId = state.resolution?.matchedTask?.hero_task_id;
  elements.tasksList.innerHTML = (state.snapshot?.activeTasks || [])
    .slice(0, 6)
    .map((task) => {
      const highlight =
        Number(task.hero_task_id) === Number(resolutionTaskId) ? "highlight" : "";

      return `
        <article class="task-card ${highlight}">
          <div class="task-row">
            <span>${escapeHtml(task.display_id || task.project_nr)}</span>
            <span>${escapeHtml(formatTime(task.due_date))}</span>
          </div>
          <h3>${escapeHtml(task.title)}</h3>
          <div class="task-row">
            <span>${escapeHtml(task.assigned_to_name)}</span>
            <span>${escapeHtml(task.city)}</span>
          </div>
          <div class="task-tags">
            <span class="tag">${escapeHtml(task.business_value)}</span>
            <span class="tag">${task.is_flexible ? "flexible" : "locked"}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCrew() {
  const suggestedUserId = state.resolution?.recommendedAction?.targetUserId;
  elements.crewList.innerHTML = (state.snapshot?.technicianWorkload || [])
    .slice(0, 6)
    .map((crew) => {
      const highlight =
        Number(crew.hero_user_id) === Number(suggestedUserId) ? "highlight" : "";

      return `
        <article class="crew-card ${highlight}">
          <div class="task-row">
            <strong>${escapeHtml(crew.full_name)}</strong>
            <span>${escapeHtml(crew.status)}</span>
          </div>
          <div class="crew-row">
            <span>${escapeHtml(crew.geographic_zone)}</span>
            <span>${crew.open_task_count} active</span>
          </div>
          <div class="crew-tags">
            ${(crew.skills || []).slice(0, 3).map((skill) => `<span class="tag">${escapeHtml(skill)}</span>`).join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderResolution() {
  const resolution = state.resolution;
  if (!resolution) {
    elements.modePill.textContent = "Awaiting input";
    elements.riskBanner.className = "risk-banner risk-low";
    elements.riskBanner.textContent = "No disruption captured yet.";
    elements.applyButton.disabled = true;
    elements.replayButton.disabled = true;
    return;
  }

  elements.modePill.textContent =
    resolution.mode === "ai" ? "AI brief ready" : "Fallback brief ready";
  elements.riskBanner.className = `risk-banner risk-${resolution.cascadeRisk?.severity || "low"}`;
  elements.riskBanner.textContent = `${resolution.cascadeRisk?.severity?.toUpperCase() || "LOW"} cascade risk · ${resolution.cascadeRisk?.explanation || ""}`;

  const whyItems = (resolution.why && resolution.why.length
    ? resolution.why
    : [
        resolution.dispatcherBrief,
        resolution.residualRisk,
      ]
  )
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const action = resolution.recommendedAction || {};
  elements.resolutionCards.innerHTML = `
    <article class="decision-card">
      <div class="card-label">Best move</div>
      <p>${escapeHtml(action.type || "manual_review").toUpperCase()}</p>
      <p>${escapeHtml(action.targetUserName || "No assignee")} ${action.dueDate ? `· ${escapeHtml(formatTime(action.dueDate))}` : ""}</p>
    </article>
    <article class="decision-card">
      <div class="card-label">Why first</div>
      <ul>${whyItems}</ul>
    </article>
    <article class="decision-card">
      <div class="card-label">Residual risk</div>
      <p>${escapeHtml(resolution.residualRisk || "Residual risk is low.")}</p>
      <p>Confidence ${Math.round((resolution.confidence || 0) * 100)}%</p>
    </article>
  `;

  elements.applyButton.disabled = action.type === "manual_review";
  elements.replayButton.disabled = false;
}

async function fetchDashboard() {
  const response = await fetch("/api/dashboard");
  const data = await response.json();
  state.snapshot = data;
  elements.boardMeta.textContent = `${data.activeTasks.length} active tasks · ${data.technicianWorkload.length} technicians`;
  renderTasks();
  renderCrew();
}

async function fetchHealth() {
  const response = await fetch("/health");
  const data = await response.json();
  const hasServerVoice = Boolean(data.audio?.elevenLabsConfigured);
  elements.audioStatus.textContent = hasServerVoice
    ? "ElevenLabs server voice"
    : "Browser voice fallback";
  elements.audioSettingsStatus.textContent = hasServerVoice
    ? `Server-managed ElevenLabs voice is active. Default voice: ${data.audio?.voiceId || "configured"}.`
    : "No server-side ElevenLabs key detected. Browser speech synthesis will be used.";
}

async function speakBrief(text) {
  const settings = getAudioSettings();

  try {
    const response = await fetch("/api/audio/brief", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text,
        voiceId: settings.voiceId || undefined,
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      if (state.audio) {
        state.audio.pause();
      }
      state.audio = new Audio(URL.createObjectURL(blob));
      await state.audio.play();
      return;
    }
  } catch (error) {
    console.warn("Server-side ElevenLabs playback failed, falling back to browser speech.", error);
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1;
  utterance.pitch = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

async function resolveTranscript(transcript) {
  state.transcript = transcript;
  elements.transcriptText.textContent = transcript;
  setStage("processing");
  elements.systemStatus.textContent = "AI is tracing the cascade";

  const response = await fetch("/api/dispatch/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  const resolution = await response.json();
  state.resolution = resolution;
  setStage("ready");
  elements.systemStatus.textContent =
    resolution.mode === "ai" ? "AI resolution ready" : "Fallback resolution ready";
  renderResolution();
  renderTasks();
  renderCrew();
  await speakBrief(resolution.dispatcherBrief || "Resolution ready.");
}

function setupSpeechRecognition() {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    elements.systemStatus.textContent = "Browser speech recognition unavailable";
    return;
  }

  const recognition = new Recognition();
  recognition.lang = "en-US";
  recognition.interimResults = true;
  recognition.continuous = false;

  recognition.onstart = () => {
    state.listening = true;
    setStage("listening");
    elements.systemStatus.textContent = "Listening";
    elements.transcriptText.textContent = "Listening...";
  };

  recognition.onresult = async (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ")
      .trim();

    elements.transcriptText.textContent = transcript || "No speech captured.";

    if (event.results[event.results.length - 1].isFinal && transcript) {
      await resolveTranscript(transcript);
    }
  };

  recognition.onerror = () => {
    state.listening = false;
    setStage("");
    elements.systemStatus.textContent = "Mic error";
  };

  recognition.onend = () => {
    state.listening = false;
    if (!state.resolution) {
      setStage("");
    }
  };

  state.recognition = recognition;
}

async function applyResolution() {
  if (!state.resolution) {
    return;
  }

  const response = await fetch("/api/dispatch/apply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      transcript: state.transcript,
      resolution: state.resolution,
      actor: "Thomas",
    }),
  });

  const result = await response.json();
  elements.systemStatus.textContent = result.applied
    ? "Decision confirmed"
    : "Nothing applied";
  await fetchDashboard();
}

function resetUi() {
  state.resolution = null;
  state.transcript = "";
  setStage("");
  elements.transcriptText.textContent =
    "Thomas says the problem once. The copilot finds the impact, recommends the move, and explains the residual risk.";
  elements.systemStatus.textContent = "Live board";
  renderResolution();
  renderTasks();
  renderCrew();
}

function initSettings() {
  const settings = getAudioSettings();
  elements.elevenVoiceId.value = settings.voiceId;

  elements.settingsButton.addEventListener("click", () => {
    elements.settingsDialog.showModal();
  });

  elements.saveSettings.addEventListener("click", () => {
    localStorage.setItem("elevenlabs_voice_id", elements.elevenVoiceId.value.trim());
    elements.settingsDialog.close();
  });
}

function initEvents() {
  elements.voiceButton.addEventListener("click", async () => {
    if (!state.recognition) {
      elements.systemStatus.textContent = "Use text fallback on this browser";
      return;
    }

    if (state.listening) {
      state.recognition.stop();
      return;
    }

    resetUi();
    state.recognition.start();
  });

  elements.textSubmit.addEventListener("click", async () => {
    const text = elements.textFallback.value.trim();
    if (!text) {
      return;
    }

    resetUi();
    await resolveTranscript(text);
  });

  elements.applyButton.addEventListener("click", applyResolution);
  elements.replayButton.addEventListener("click", () => {
    if (state.resolution?.dispatcherBrief) {
      speakBrief(state.resolution.dispatcherBrief);
    }
  });
  elements.resetButton.addEventListener("click", resetUi);
}

async function init() {
  initSettings();
  initEvents();
  setupSpeechRecognition();
  renderResolution();
  await fetchHealth();
  await fetchDashboard();
}

init().catch((error) => {
  console.error(error);
  elements.systemStatus.textContent = "Failed to load board";
});
