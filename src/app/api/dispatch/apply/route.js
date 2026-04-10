import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const body = await request.json()

    const { config } = require('../../../../config')
    const { MockRepository } = require('../../../../data/mockRepository')
    const { SupabaseRepository } = require('../../../../data/supabaseRepository')
    const { HeroClient } = require('../../../../hero/heroClient')
    const { ApplyDispatchService } = require('../../../../dispatch/applyDispatchService')

    const repo = config.useMockData ? new MockRepository() : new SupabaseRepository(config)
    const heroClient = new HeroClient(config)
    const service = new ApplyDispatchService({ repository: repo, heroClient })

    const result = await service.applyResolution({
      transcript: body.transcript || '',
      resolution: body.resolution,
      actor: body.actor || 'Dispatcher',
    })

    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json({ error: err.message, applied: false }, { status: 500 })
  }
}
