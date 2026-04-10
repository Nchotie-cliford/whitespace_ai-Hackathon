export async function POST(request) {
  try {
    const body = await request.json()
    if (!body?.text) {
      return Response.json({ error: 'text is required' }, { status: 400 })
    }

    const { config } = require('../../../../config')
    const { ElevenLabsClient } = require('../../../../audio/elevenLabsClient')
    const client = new ElevenLabsClient(config)

    const audio = await client.synthesize({
      text: body.text,
      voiceId: body.voiceId,
    })

    return new Response(audio.audioBuffer, {
      status: 200,
      headers: {
        'Content-Type': audio.contentType,
        'Content-Length': String(audio.audioBuffer.length),
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    return Response.json(
      { error: err.message, fallback: 'browser_speech_synthesis' },
      { status: 503 }
    )
  }
}
