'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import DecisionSheet from './DecisionSheet'
import BoardDrawer from './BoardDrawer'

// ── Icons ──────────────────────────────────────────────────────
const MicIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
  </svg>
)
const StopIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
    <rect x="5" y="5" width="14" height="14" rx="2.5"/>
  </svg>
)
const SpinnerIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
)
const CheckIcon = () => (
  <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const AlertIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
)
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2.5" />
    <path d="M12 19.5V22" />
    <path d="M4.93 4.93l1.77 1.77" />
    <path d="M17.3 17.3l1.77 1.77" />
    <path d="M2 12h2.5" />
    <path d="M19.5 12H22" />
    <path d="M4.93 19.07l1.77-1.77" />
    <path d="M17.3 6.7l1.77-1.77" />
  </svg>
)
const MoonIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z" />
  </svg>
)

const ICONS = { idle: <MicIcon />, listening: <StopIcon />, processing: <SpinnerIcon />, ready: <CheckIcon />, confirmed: <CheckIcon />, error: <AlertIcon /> }

const HINTS = {
  idle: "Tap to speak",
  listening: 'Listening — tap to stop',
  processing: 'Thinking...',
  ready: "Here's the move.",
  confirmed: 'Sent to HERO.',
  error: 'Something went wrong.',
}

function getBoardRisk(snapshot) {
  const tasks = snapshot?.activeTasks
  if (!tasks?.length) return 'unknown'
  const now = Date.now()
  const atRisk = tasks.filter(t => {
    const h = (new Date(t.due_date) - now) / 3_600_000
    return h < 2 && h > -1
  })
  if (atRisk.length >= 3) return 'high'
  if (atRisk.length >= 1) return 'medium'
  return 'low'
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result.split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function getElevenLabsLanguageCode(locale) {
  const normalized = String(locale || '').toLowerCase()
  const language = normalized.split('-')[0]
  const mapping = {
    de: 'deu',
    en: 'eng',
    fr: 'fra',
    es: 'spa',
    it: 'ita',
    nl: 'nld',
    pt: 'por',
    pl: 'pol',
    tr: 'tur',
  }

  return mapping[language] || ''
}

const SILENT_AUDIO_DATA_URI =
  'data:audio/mp3;base64,SUQzAwAAAAAAF1RTU0UAAAAPAAADTGF2ZjU4LjMyLjEwMAAAAAAAAAAAAAAA//uQxAADBzQAP9AAAaQAAAACAAADSAAAAAEAAACgAgAATGF2YzU4LjU0AAAAAAAAAAAAAAAAJAAAAAAAAAAA//uQxAADBzQAP9AAAaQAAAACAAADSAAAAAEAAACgAgAA'

export default function CopilotClient() {
  const [phase, setPhase]               = useState('idle')
  const [snapshot, setSnapshot]         = useState(null)
  const [resolution, setResolution]     = useState(null)
  const [transcript, setTranscript]     = useState('')
  const [liveTranscript, setLiveText]   = useState('')
  const [errorMsg, setErrorMsg]         = useState('')
  const [drawerOpen, setDrawerOpen]     = useState(false)
  const [heroResult, setHeroResult]     = useState(null)
  const [theme, setTheme]               = useState('dark')

  const audioRef        = useRef(null)
  const phaseRef        = useRef('idle')
  const mediaRecRef     = useRef(null)   // MediaRecorder instance
  const chunksRef       = useRef([])     // audio chunks collected during recording
  const streamRef       = useRef(null)   // getUserMedia stream (so we can stop tracks)
  const audioUnlockedRef = useRef(false)

  // ── Keep phaseRef + body attr in sync ──
  const setPhaseSync = useCallback((p) => {
    phaseRef.current = p
    setPhase(p)
    document.body.dataset.phase = p
  }, [])

  useEffect(() => {
    document.body.dataset.phase = 'idle'
  }, [])

  useEffect(() => {
    const savedTheme = typeof window !== 'undefined' ? localStorage.getItem('hero_theme') : null
    const systemTheme =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: light)').matches
        ? 'light'
        : 'dark'
    const nextTheme = savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : systemTheme
    setTheme(nextTheme)
    document.body.dataset.theme = nextTheme
  }, [])

  useEffect(() => {
    document.body.dataset.theme = theme
    if (typeof window !== 'undefined') {
      localStorage.setItem('hero_theme', theme)
    }
  }, [theme])

  useEffect(() => {
    document.body.dataset.boardRisk = getBoardRisk(snapshot)
  }, [snapshot])

  // ── API ────────────────────────────────────────────────────────

  const refreshBoard = useCallback(async () => {
    try {
      const res = await fetch('/api/dashboard')
      if (res.ok) setSnapshot(await res.json())
    } catch (_) {}
  }, [])

  const unlockAudioPlayback = useCallback(async () => {
    if (audioUnlockedRef.current || typeof window === 'undefined') {
      return
    }

    try {
      const unlockAudio = new Audio(SILENT_AUDIO_DATA_URI)
      unlockAudio.muted = true
      unlockAudio.playsInline = true
      await unlockAudio.play()
      unlockAudio.pause()
      unlockAudio.currentTime = 0
      audioUnlockedRef.current = true
    } catch (_) {}

    try {
      if (typeof window.AudioContext !== 'undefined') {
        const ctx = new window.AudioContext()
        await ctx.resume()
        await ctx.close()
        audioUnlockedRef.current = true
      }
    } catch (_) {}
  }, [])

  const speakBrief = useCallback(async (text) => {
    try {
      const voiceId = localStorage.getItem('elevenlabs_voice_id') || undefined
      const res = await fetch('/api/audio/brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId }),
      })
      if (res.ok) {
        const blob = await res.blob()
        if (audioRef.current) audioRef.current.pause()
        audioRef.current = new Audio(URL.createObjectURL(blob))
        audioRef.current.playsInline = true
        try { await audioRef.current.play(); return } catch (_) {}
      }
    } catch (_) {}
    // Browser speech fallback
    try {
      const u = new SpeechSynthesisUtterance(text)
      u.rate = 1; u.pitch = 0.95
      speechSynthesis.cancel()
      speechSynthesis.speak(u)
    } catch (_) {}
  }, [])

  const resolveTranscript = useCallback(async (text) => {
    setTranscript(text)
    setLiveText('')
    setErrorMsg('')
    setPhaseSync('processing')
    try {
      const res = await fetch('/api/dispatch/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: text }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)
      const data = await res.json()
      setResolution(data)
      setPhaseSync('ready')
      await refreshBoard()
      await speakBrief(data.spokenBrief || data.dispatcherBrief || 'Decision ready.')
    } catch (err) {
      setErrorMsg(err.message || 'Could not reach server.')
      setPhaseSync('error')
    }
  }, [setPhaseSync, refreshBoard, speakBrief])

  const reset = useCallback(() => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null }
    try { speechSynthesis.cancel() } catch (_) {}
    setResolution(null)
    setTranscript('')
    setLiveText('')
    setHeroResult(null)
    setErrorMsg('')
    setPhaseSync('idle')
  }, [setPhaseSync])

  const confirmResolution = useCallback(async () => {
    if (!resolution) return
    setPhaseSync('confirmed')
    try {
      const res = await fetch('/api/dispatch/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, resolution, actor: 'Thomas' }),
      })
      if (res.ok) setHeroResult(await res.json())
      await refreshBoard()
    } catch (_) {}
  }, [resolution, transcript, setPhaseSync, refreshBoard])

  // ── Mic — MediaRecorder + ElevenLabs STT (works in all browsers) ──
  const stopMic = useCallback(() => {
    if (mediaRecRef.current && mediaRecRef.current.state !== 'inactive') {
      mediaRecRef.current.stop()
    }
    // stopMic without resolving = user manually stopped, go back to idle
    // (onStop will handle phase transition when there's audio)
  }, [])

  const startMic = useCallback(async () => {
    setErrorMsg('')

    if (!navigator.mediaDevices?.getUserMedia) {
      setErrorMsg('Microphone not available in this browser.')
      document.getElementById('text-input')?.focus()
      return
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      const msg = err.name === 'NotAllowedError'
        ? 'Microphone blocked — allow access in your browser settings.'
        : 'Could not access microphone: ' + err.message
      setErrorMsg(msg)
      setPhaseSync('error')
      return
    }

    streamRef.current = stream
    chunksRef.current = []

    // Pick the best supported format
    const mimeType = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4']
      .find(t => MediaRecorder.isTypeSupported(t)) || ''

    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : {})
    mediaRecRef.current = rec

    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }

    rec.onstart = () => setPhaseSync('listening')

    rec.onstop = async () => {
      // Release mic tracks immediately
      stream.getTracks().forEach(t => t.stop())

      const chunks = chunksRef.current
      if (!chunks.length) { setPhaseSync('idle'); return }

      setLiveText('Transcribing...')
      setPhaseSync('processing')

      try {
        const blob = new Blob(chunks, { type: mimeType || 'audio/webm' })
        const base64 = await blobToBase64(blob)

        const res = await fetch('/api/audio/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64,
            mimeType: mimeType || 'audio/webm',
            languageCode: getElevenLabsLanguageCode(navigator.language),
          }),
        })

        const data = await res.json()
        const text = data.transcript?.trim()

        if (!text) {
          setErrorMsg('No speech detected. Try again.')
          setPhaseSync('error')
          return
        }

        setLiveText(text)
        resolveTranscript(text)
      } catch (err) {
        setErrorMsg('Transcription failed: ' + err.message)
        setPhaseSync('error')
      }
    }

    rec.onerror = () => {
      stream.getTracks().forEach(t => t.stop())
      setErrorMsg('Recording error. Try again.')
      setPhaseSync('error')
    }

    rec.start()
  }, [setPhaseSync, resolveTranscript])

  // ── Orb tap handler ──
  const handleOrbTap = useCallback(() => {
    const p = phaseRef.current
    if (p === 'ready' || p === 'confirmed') { reset(); return }
    if (p === 'processing') return
    if (p === 'listening') { stopMic(); return }
    // idle or error
    unlockAudioPlayback()
    startMic()
  }, [reset, startMic, stopMic, unlockAudioPlayback])

  // ── Spacebar shortcut ──
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space') return
      const tag = document.activeElement?.tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT' || tag === 'BUTTON') return
      e.preventDefault()
      handleOrbTap()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleOrbTap])

  // ── Board auto-refresh ──
  useEffect(() => {
    refreshBoard()
    const id = setInterval(refreshBoard, 60_000)
    return () => clearInterval(id)
  }, [refreshBoard])

  // ── Text submit ──
  const submitText = useCallback(() => {
    const val = document.getElementById('text-input')?.value?.trim()
    if (val) resolveTranscript(val)
  }, [resolveTranscript])

  // ── Render ─────────────────────────────────────────────────────
  const jobCount = snapshot?.activeTasks?.length ?? '–'
  const isOffline = resolution?.mode?.startsWith('fallback')
  const isLive = snapshot !== null
  const showTextZone = phase === 'idle' || phase === 'error'

  return (
    <>
      <div className="app">
        <header className="header">
          <div className="brand">
            <span className={`live-dot ${isLive ? 'live' : ''}`} />
            <span className="brand-name">Hero.ai</span>
            {isOffline && <span className="offline-badge">Offline mode</span>}
          </div>
          <div className="header-actions">
            <button
              className="theme-btn"
              onClick={() => setTheme(current => (current === 'dark' ? 'light' : 'dark'))}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <span className="theme-btn-icon" aria-hidden="true">
                {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
              </span>
            </button>
            <button className="board-btn" onClick={() => setDrawerOpen(true)}>
              <span>{jobCount}</span>&nbsp;Schedule
            </button>
          </div>
        </header>

        <main className="stage">
          <div className="orb-wrap">
            <div className="orb-rings"><span /><span /><span /></div>
            <button
              className="orb"
              onClick={handleOrbTap}
              aria-label={
                phase === 'idle'      ? 'Tap to speak' :
                phase === 'listening' ? 'Tap to stop'  : 'Tap to reset'
              }
            >
              <span className={`orb-icon ${phase === 'processing' ? 'spin' : ''}`}>
                {ICONS[phase] || ICONS.idle}
              </span>
            </button>
          </div>

          <p className="stage-hint">{HINTS[phase] || HINTS.idle}</p>

          <div className="wave-zone" aria-hidden="true">
            <span/><span/><span/><span/><span/><span/>
          </div>

          {phase === 'listening' && liveTranscript && (
            <p className="live-transcript">{liveTranscript}</p>
          )}

          {errorMsg && (
            <p className="error-msg">{errorMsg}</p>
          )}

          {showTextZone && (
            <div className="text-zone">
              <textarea
                id="text-input"
                placeholder="Or type the problem here..."
                rows={2}
                autoComplete="off"
                spellCheck="false"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitText() }
                }}
              />
              <button className="go-btn" onClick={submitText}>Go &rarr;</button>
            </div>
          )}
        </main>
      </div>

      <DecisionSheet
        phase={phase}
        resolution={resolution}
        heroResult={heroResult}
        onConfirm={confirmResolution}
        onReplay={() => {
          const text = resolution?.spokenBrief || resolution?.dispatcherBrief
          if (text) speakBrief(text)
        }}
        onCancel={reset}
      />

      <BoardDrawer
        open={drawerOpen}
        snapshot={snapshot}
        resolution={resolution}
        onClose={() => setDrawerOpen(false)}
      />
    </>
  )
}
