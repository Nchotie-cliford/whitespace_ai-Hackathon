// ── STATE ──
const state = {
  snapshot: null,
  resolution: null,
  transcript: '',
  recognition: null,
  listening: false,
  audio: null,
};

// ── HELPERS ──
function el(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatTime(val) {
  return new Date(val).toLocaleString([], {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// ── PHASE (drives all visual state via CSS) ──
const ORB_ICONS = {
  idle: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
  </svg>`,
  listening: `<svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor"><rect x="9" y="9" width="6" height="6" rx="1"/><path fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" opacity="0.4"/></svg>`,
  processing: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
  </svg>`,
  ready: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,
  confirmed: `<svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,
};

const HINTS = {
  idle: "What's the problem?",
  listening: 'Keep talking...',
  processing: 'On it.',
  ready: "Here's the move.",
  confirmed: 'Done.',
};

function setPhase(phase) {
  document.body.dataset.phase = phase;
  el('orb-icon').innerHTML = ORB_ICONS[phase] || ORB_ICONS.idle;
  el('stage-hint').textContent = HINTS[phase] || '';

  const sheet = el('sheet');
  if (phase === 'ready' || phase === 'confirmed') {
    sheet.removeAttribute('aria-hidden');
  } else {
    sheet.setAttribute('aria-hidden', 'true');
  }
}

// ── AUDIO ──
function getVoiceId() {
  return localStorage.getItem('elevenlabs_voice_id') || '21m00Tcm4TlvDq8ikWAM';
}

async function speakBrief(text) {
  try {
    const res = await fetch('/api/audio/brief', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voiceId: getVoiceId() }),
    });
    if (res.ok) {
      const blob = await res.blob();
      if (state.audio) state.audio.pause();
      state.audio = new Audio(URL.createObjectURL(blob));
      await state.audio.play();
      return;
    }
  } catch (_) {}

  const u = new SpeechSynthesisUtterance(text);
  u.rate = 1;
  u.pitch = 0.95;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

// ── RESOLUTION RENDERING ──
function buildHeadline(resolution) {
  const action = resolution.recommendedAction || {};
  const brief = String(resolution.dispatcherBrief || '');

  if (action.targetUserName && action.type !== 'manual_review') {
    const verb = action.type === 'reassign' ? 'Reassign to' : 'Send';
    return `${verb} ${action.targetUserName}.`;
  }

  const first = brief.split(/[.!?]/)[0].trim();
  return first ? first + '.' : brief;
}

function buildWhy(resolution) {
  if (Array.isArray(resolution.why) && resolution.why.length > 0) {
    return resolution.why[0];
  }
  return resolution.cascadeRisk?.explanation || '';
}

function renderResolution(resolution) {
  const risk = resolution.cascadeRisk?.severity || 'low';
  const confidence = Math.round((resolution.confidence || 0) * 100);
  const isManualReview = resolution.recommendedAction?.type === 'manual_review';

  const chip = el('risk-chip');
  chip.textContent = risk.toUpperCase() + ' RISK';
  chip.className = `risk-chip ${risk}`;

  el('confidence-text').textContent = `${confidence}% confident`;
  el('decision-headline').textContent = buildHeadline(resolution);
  el('decision-why').textContent = buildWhy(resolution);
  el('decision-residual').textContent = resolution.residualRisk || '';
  el('confirm-btn').disabled = isManualReview;
}

// ── API ──
async function resolveTranscript(transcript) {
  state.transcript = transcript;
  setPhase('processing');

  const res = await fetch('/api/dispatch/resolve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transcript }),
  });

  const resolution = await res.json();
  state.resolution = resolution;

  renderResolution(resolution);
  setPhase('ready');
  renderBoard();
  await speakBrief(resolution.dispatcherBrief || 'Resolution ready.');
}

async function applyResolution() {
  if (!state.resolution) return;

  el('confirm-btn').disabled = true;
  setPhase('confirmed');

  await fetch('/api/dispatch/apply', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      transcript: state.transcript,
      resolution: state.resolution,
      actor: 'Thomas',
    }),
  });

  await fetchDashboard();
}

function reset() {
  state.resolution = null;
  state.transcript = '';
  el('text-input').value = '';
  if (state.audio) {
    state.audio.pause();
    state.audio = null;
  }
  speechSynthesis.cancel();
  setPhase('idle');
  renderBoard();
}

// ── BOARD ──
function renderBoard() {
  const tasks = state.snapshot?.activeTasks || [];
  const crew = state.snapshot?.technicianWorkload || [];
  const highlightTask = state.resolution?.matchedTask?.hero_task_id;
  const highlightCrew = state.resolution?.recommendedAction?.targetUserId;

  el('jobs-list').innerHTML = tasks.slice(0, 8).map((t) => {
    const hi = Number(t.hero_task_id) === Number(highlightTask) ? 'highlight' : '';
    return `
      <div class="job-card ${hi}">
        <div class="card-title">${escapeHtml(t.title)}</div>
        <div class="card-meta">
          <span>${escapeHtml(t.assigned_to_name)}</span>
          <span>${escapeHtml(formatTime(t.due_date))}</span>
        </div>
        <div class="card-tags">
          <span class="tag">${escapeHtml(t.city)}</span>
          <span class="tag">${t.is_flexible ? 'flexible' : 'locked'}</span>
        </div>
      </div>`;
  }).join('');

  el('crew-list').innerHTML = crew.slice(0, 8).map((c) => {
    const hi = Number(c.hero_user_id) === Number(highlightCrew) ? 'highlight' : '';
    return `
      <div class="crew-card ${hi}">
        <div class="card-title">${escapeHtml(c.full_name)}</div>
        <div class="card-meta">
          <span>${escapeHtml(c.geographic_zone)}</span>
          <span>${c.open_task_count} active</span>
        </div>
        <div class="card-tags">
          ${(c.skills || []).slice(0, 3).map((s) => `<span class="tag">${escapeHtml(s)}</span>`).join('')}
        </div>
      </div>`;
  }).join('');
}

// ── FETCH ──
async function fetchDashboard() {
  const res = await fetch('/api/dashboard');
  const data = await res.json();
  state.snapshot = data;
  el('jobs-count').textContent = data.activeTasks?.length || 0;
  renderBoard();
}

async function fetchHealth() {
  try {
    const res = await fetch('/health');
    const data = await res.json();
    if (data.ok) el('live-dot').classList.add('live');
  } catch (_) {}
}

// ── SPEECH RECOGNITION ──
function setupSpeech() {
  const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Rec) return;

  const rec = new Rec();
  rec.lang = 'en-US';
  rec.interimResults = true;
  rec.continuous = false;

  rec.onstart = () => {
    state.listening = true;
    setPhase('listening');
  };

  rec.onresult = async (event) => {
    const transcript = Array.from(event.results)
      .map((r) => r[0].transcript)
      .join(' ')
      .trim();

    if (event.results[event.results.length - 1].isFinal && transcript) {
      rec.stop();
      await resolveTranscript(transcript);
    }
  };

  rec.onerror = () => {
    state.listening = false;
    setPhase('idle');
  };

  rec.onend = () => {
    state.listening = false;
  };

  state.recognition = rec;
}

// ── DRAWER ──
function openDrawer() {
  el('drawer').classList.add('open');
  el('drawer-overlay').classList.add('open');
  el('drawer').removeAttribute('aria-hidden');
}

function closeDrawer() {
  el('drawer').classList.remove('open');
  el('drawer-overlay').classList.remove('open');
  el('drawer').setAttribute('aria-hidden', 'true');
}

// ── EVENTS ──
function initEvents() {
  el('orb').addEventListener('click', async () => {
    const phase = document.body.dataset.phase;

    if (phase === 'ready') {
      reset();
      return;
    }

    if (phase === 'confirmed') {
      reset();
      return;
    }

    if (phase !== 'idle') return;

    if (!state.recognition) {
      el('text-input').focus();
      return;
    }

    if (state.listening) {
      state.recognition.stop();
      return;
    }

    state.recognition.start();
  });

  el('go-btn').addEventListener('click', async () => {
    const text = el('text-input').value.trim();
    if (text) await resolveTranscript(text);
  });

  el('text-input').addEventListener('keydown', async (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const text = el('text-input').value.trim();
      if (text) await resolveTranscript(text);
    }
  });

  el('confirm-btn').addEventListener('click', applyResolution);

  el('replay-btn').addEventListener('click', () => {
    if (state.resolution?.dispatcherBrief) {
      speakBrief(state.resolution.dispatcherBrief);
    }
  });

  el('cancel-btn').addEventListener('click', reset);

  el('board-btn').addEventListener('click', openDrawer);
  el('close-drawer').addEventListener('click', closeDrawer);
  el('drawer-overlay').addEventListener('click', closeDrawer);
}

// ── INIT ──
async function init() {
  setupSpeech();
  initEvents();
  setPhase('idle');
  await Promise.all([fetchHealth(), fetchDashboard()]);
}

init().catch(console.error);
