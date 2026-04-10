import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { config } = require('../../../config')
    const { MockRepository } = require('../../../data/mockRepository')
    const { SupabaseRepository } = require('../../../data/supabaseRepository')
    const { DashboardService } = require('../../../dashboard/dashboardService')

    const repo = config.useMockData ? new MockRepository() : new SupabaseRepository(config)
    const service = new DashboardService(repo)
    const snapshot = await service.getSnapshot()
    const degraded =
      !Array.isArray(snapshot.activeTasks) ||
      !snapshot.activeTasks.length ||
      !Array.isArray(snapshot.technicianWorkload) ||
      !snapshot.technicianWorkload.length

    return NextResponse.json({
      ...snapshot,
      degraded,
    })
  } catch (err) {
    return NextResponse.json(
      {
        activeTasks: [],
        technicianWorkload: [],
        projectSummary: [],
        recentDispatches: [],
        degraded: true,
        error: err.message,
      },
      { status: 503 }
    )
  }
}
