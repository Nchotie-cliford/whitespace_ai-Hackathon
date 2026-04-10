import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { config } = require('../../config')
    const { ElevenLabsClient } = require('../../audio/elevenLabsClient')
    const elevenLabs = new ElevenLabsClient(config)

    const payload = {
      ok: true,
      mode: config.useMockData ? 'mock' : 'supabase',
      audio: {
        elevenLabsConfigured: elevenLabs.isConfigured(),
        voiceId: config.elevenLabsVoiceId,
      },
    }

    if (!config.useMockData) {
      try {
        const { SupabaseRepository } = require('../../data/supabaseRepository')
        const repo = new SupabaseRepository(config)
        if (typeof repo.getHealthSnapshot === 'function') {
          payload.database = await repo.getHealthSnapshot()
        }
      } catch (dbErr) {
        payload.database = { error: dbErr.message }
      }
    }

    return NextResponse.json(payload)
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
  }
}
