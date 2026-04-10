export async function POST(request) {
  try {
    const body = await request.json()
    if (!body?.audioBase64) {
      return Response.json({ error: 'audioBase64 is required' }, { status: 400 })
    }

    const { config } = require('../../../../config')

    if (!config.elevenLabsApiKey) {
      return Response.json({ error: 'ELEVENLABS_API_KEY not configured' }, { status: 503 })
    }

    const mimeType = body.mimeType || 'audio/webm'
    const ext = mimeType.includes('mp4') ? 'mp4'
      : mimeType.includes('ogg') ? 'ogg'
      : 'webm'

    // Decode base64 → binary buffer
    const binaryStr = atob(body.audioBase64)
    const bytes = new Uint8Array(binaryStr.length)
    for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i)
    const audioBlob = new Blob([bytes], { type: mimeType })

    const form = new FormData()
    form.set('model_id', config.elevenLabsSpeechToTextModelId || 'scribe_v1')
    form.set('file', audioBlob, `audio.${ext}`)
    if (body.languageCode) form.set('language_code', body.languageCode)

    const res = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: { 'xi-api-key': config.elevenLabsApiKey },
      body: form,
    })

    if (!res.ok) {
      const text = await res.text()
      return Response.json({ error: `ElevenLabs STT error: ${text}` }, { status: 502 })
    }

    const data = await res.json()
    return Response.json({ transcript: data.text || '' })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
