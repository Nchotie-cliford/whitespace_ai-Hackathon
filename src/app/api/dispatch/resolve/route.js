import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()
    if (!body?.transcript) {
      return NextResponse.json({ error: 'transcript is required' }, { status: 400 })
    }

    const { config } = require('../../../../config')
    const { MockRepository } = require('../../../../data/mockRepository')
    const { SupabaseRepository } = require('../../../../data/supabaseRepository')
    const { DashboardService } = require('../../../../dashboard/dashboardService')
    const { TranscriptFallbackService } = require('../../../../dispatch/transcriptFallbackService')
    const { AnthropicDispatchClient } = require('../../../../ai/anthropicDispatchClient')
    const { DispatchAiService } = require('../../../../ai/dispatchAiService')

    const repo = config.useMockData ? new MockRepository() : new SupabaseRepository(config)
    const dashboardService = new DashboardService(repo)
    const fallbackService = new TranscriptFallbackService()
    const aiClient = new AnthropicDispatchClient(config)

    const service = new DispatchAiService({ dashboardService, fallbackService, aiClient })
    const result = await service.resolveTranscript({ transcript: body.transcript })

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
