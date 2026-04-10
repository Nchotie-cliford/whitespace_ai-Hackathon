const assert = require("node:assert/strict");
const { DispatchAiService } = require("../src/ai/dispatchAiService");

class StubDashboardService {
  async getSnapshot() {
    return {
      activeTasks: [
        {
          hero_task_id: 6016,
          title: "Install replacement main switch",
          project_name: "Dresden Mixed-Use Building Upgrade",
          project_title: "Basement distribution board replacement",
          assigned_to_name: "Jonas Schmidt",
          hero_target_project_match_id: 5008,
          hero_target_user_id: 1003,
          business_value: "high",
          is_flexible: false,
          due_date: "2026-04-10T12:00:00.000Z",
          required_skills: ["electrical", "distribution_boards"],
          display_id: "DRS-008",
        },
      ],
      technicianWorkload: [
        {
          hero_user_id: 1003,
          full_name: "Jonas Schmidt",
          status: "active",
          geographic_zone: "east",
          skills: ["electrical", "distribution_boards", "service_calls"],
          open_task_count: 1,
        },
        {
          hero_user_id: 1013,
          full_name: "Jan Reiter",
          status: "active",
          geographic_zone: "south",
          skills: ["electrical", "thermal_imaging", "testing"],
          open_task_count: 1,
        },
        {
          hero_user_id: 1014,
          full_name: "Sarah Lenz",
          status: "active",
          geographic_zone: "east",
          skills: ["electrical", "distribution_boards", "testing"],
          open_task_count: 1,
        },
      ],
      projectSummary: [
        {
          hero_project_match_id: 5008,
          project_nr: "VW-2026-008",
          display_id: "DRS-008",
          project_name: "Dresden Mixed-Use Building Upgrade",
          project_title: "Basement distribution board replacement",
          project_type: "electrical",
          customer_name: "Elbtor Gewerbehof",
          city: "Dresden",
        },
      ],
      recentDispatches: [
        {
          hero_task_id: 6016,
          action_type: "reassign",
          new_target_user_name: "Jan Reiter",
          confidence: 0.91,
          reason: "Jan handled the previous Dresden delay case successfully.",
        },
      ],
    };
  }

  async getProjectContext() {
    return {
      calendarEvents: [],
      logbookEntries: [],
      documents: [],
      projectNotes: [
        {
          title: "Tenant notice",
          content: "Keep the outage inside the agreed morning slot.",
        },
      ],
      timeLogs: [
        {
          work_type: "inspection",
          duration_minutes: 95,
        },
      ],
    };
  }

  async getDailyOpsContext() {
    return {
      atRiskTasks: [
        {
          hero_target_project_match_id: 5008,
          project_name: "Dresden Mixed-Use Building Upgrade",
          customer_name: "Elbtor Gewerbehof",
          display_id: "DRS-008",
          due_date: "2026-04-10T12:00:00.000Z",
          business_value: "high",
          is_flexible: false,
          title: "Install replacement main switch",
        },
      ],
      unavailableTechnicians: [],
      overloadedTechnicians: [
        {
          full_name: "Jonas Schmidt",
          open_task_count: 3,
          overdue_task_count: 1,
        },
      ],
      invoicesAtRisk: [],
      openQuotes: [],
    };
  }
}

class StubFallbackService {
  resolve() {
    return {
      matchedTask: {
        hero_task_id: 6016,
        title: "Install replacement main switch",
        project_name: "Dresden Mixed-Use Building Upgrade",
        project_title: "Basement distribution board replacement",
        assigned_to_name: "Jonas Schmidt",
        hero_target_project_match_id: 5008,
        business_value: "high",
        is_flexible: false,
      },
      matchedTechnician: {
        hero_user_id: 1003,
        full_name: "Jonas Schmidt",
      },
      cascadeRisk: {
        score: 80,
        severity: "high",
        explanation: "Cascade risk is high because the board replacement is non-flexible and time-sensitive.",
      },
      recommendedAction: {
        type: "reassign",
        targetUserId: 1013,
        targetUserName: "Jan Reiter",
        dueDate: "2026-04-10T12:30:00.000Z",
      },
      residualRisk: "Jan may need one lower-priority follow-up shifted later.",
      confidence: 0.87,
      dispatcherBrief:
        "Jonas Schmidt is delayed for Dresden Mixed-Use Building Upgrade. Best move: reassign to Jan Reiter.",
      problemSummary:
        "Jonas Schmidt is delayed for Dresden Mixed-Use Building Upgrade.",
      candidates: [
        {
          heroUserId: 1013,
          name: "Jan Reiter",
          score: 0.62,
          openTaskCount: 1,
          breakdown: {
            matchedSkills: ["electrical"],
            exactSkillMatch: 0,
            partialSkillMatch: 0.5,
            zoneMatch: 0,
            workloadScore: 0.83,
          },
        },
      ],
    };
  }
}

class StubAiClient {
  isConfigured() {
    return true;
  }

  async resolveIncident() {
    return {
      problemSummary: "Jonas Schmidt is likely to miss the Dresden switch install because of traffic.",
      cascadeSeverity: "high",
      cascadeScore: 70,
      cascadeExplanation:
        "Switch installation is time-critical infrastructure work that could impact multiple downstream electrical systems if delayed.",
      recommendedAction: {
        type: "manual_review",
      },
      why: ["No matched task or technician data available for automated reassignment."],
      residualRisk:
        "Customer electrical service interruption if installation window missed; potential cascade to connected systems.",
      confidence: 0.45,
      dispatcherBrief:
        "Priority manual review needed - Jonas Schmidt delayed for Dresden switch install.",
    };
  }
}

class StubArrivalAiClient {
  isConfigured() {
    return true;
  }

  async resolveIncident() {
    return {
      problemSummary: "A different project summary that does not match the grounded arrival context.",
      cascadeSeverity: "medium",
      cascadeScore: 42,
      cascadeExplanation: "Generic explanation.",
      recommendedAction: {
        type: "manual_review",
      },
      why: ["Generic AI wording."],
      residualRisk: "Generic AI risk.",
      confidence: 0.51,
      dispatcherBrief: "Generic AI brief.",
      spokenBrief: "Before you arrive, focus on the generic AI summary.",
      displayMode: "arrival_brief",
    };
  }
}

async function testStrongBaselineBeatsVagueManualReview() {
  const service = new DispatchAiService({
    dashboardService: new StubDashboardService(),
    fallbackService: new StubFallbackService(),
    aiClient: new StubAiClient(),
  });

  const result = await service.resolveTranscript({
    transcript:
      "Jonas is stuck in traffic and will miss the Dresden switch install. Who should take it?",
  });

  assert.equal(result.mode, "ai");
  assert.equal(result.recommendedAction.type, "reassign");
  assert.equal(result.recommendedAction.targetUserName, "Jan Reiter");
  assert.ok(result.problemSummary.includes("Jonas Schmidt is delayed"));
  assert.ok(result.dispatcherBrief.includes("reassign to Jan Reiter"));
  assert.ok(result.confidence >= 0.75);
}

class StubDailyBriefFallbackService {
  resolve() {
    return {
      requestMode: "daily_brief",
      incidentType: "general_disruption",
      matchedTask: {
        hero_task_id: 6016,
        title: "Install replacement main switch",
        project_name: "Dresden Mixed-Use Building Upgrade",
        project_title: "Basement distribution board replacement",
        customer_name: "Elbtor Gewerbehof",
        assigned_to_name: "Jonas Schmidt",
        hero_target_project_match_id: 5008,
        hero_target_user_id: 1003,
        business_value: "high",
        is_flexible: false,
        due_date: "2026-04-10T12:00:00.000Z",
      },
      affectedProjects: [
        {
          heroProjectMatchId: 5008,
          projectName: "Dresden Mixed-Use Building Upgrade",
          customerName: "Elbtor Gewerbehof",
          displayId: "DRS-008",
          dueDate: "2026-04-10T12:00:00.000Z",
          businessValue: "high",
          isFlexible: false,
          title: "Install replacement main switch",
        },
      ],
      cascadeRisk: {
        score: 68,
        severity: "high",
        explanation: "Today's riskiest work starts with Dresden Mixed-Use Building Upgrade.",
      },
      recommendedAction: {
        type: "manual_review",
      },
      residualRisk: "Jonas Schmidt is already carrying a heavy load today.",
      confidence: 0.74,
      dispatcherBrief:
        "Today's first attention point is Dresden Mixed-Use Building Upgrade. Review that job before moving lower-priority work.",
      problemSummary:
        "Today's work should start with Dresden Mixed-Use Building Upgrade.",
      candidates: [],
    };
  }
}

class StubArrivalFallbackService {
  resolve() {
    return {
      requestMode: "arrival_brief",
      incidentType: "general_disruption",
      matchedTask: {
        hero_task_id: 6016,
        title: "Install replacement main switch",
        project_name: "Dresden Mixed-Use Building Upgrade",
        project_title: "Basement distribution board replacement",
        customer_name: "Elbtor Gewerbehof",
        assigned_to_name: "Jonas Schmidt",
        hero_target_project_match_id: 5008,
        hero_target_user_id: 1003,
        business_value: "high",
        is_flexible: false,
        due_date: "2026-04-10T12:00:00.000Z",
      },
      matchedTechnician: {
        hero_user_id: 1003,
        full_name: "Jonas Schmidt",
      },
      affectedProjects: [],
      cascadeRisk: {
        score: 61,
        severity: "high",
        explanation: "Arrival risk is elevated because the board shutdown slot is fixed.",
      },
      recommendedAction: {
        type: "manual_review",
      },
      residualRisk: "Keep the outage inside the agreed morning slot.",
      confidence: 0.72,
      dispatcherBrief:
        "Dresden Mixed-Use Building Upgrade is the key focus on arrival. Arrival risk is elevated because the board shutdown slot is fixed.",
      problemSummary:
        "Brief the arriving worker on Dresden Mixed-Use Building Upgrade.",
      candidates: [],
    };
  }
}

class StubHandoverFallbackService {
  resolve() {
    return {
      requestMode: "handover_summary",
      incidentType: "general_disruption",
      matchedTask: {
        hero_task_id: 6016,
        title: "Install replacement main switch",
        project_name: "Dresden Mixed-Use Building Upgrade",
        project_title: "Basement distribution board replacement",
        customer_name: "Elbtor Gewerbehof",
        assigned_to_name: "Jonas Schmidt",
        hero_target_project_match_id: 5008,
        hero_target_user_id: 1003,
        business_value: "high",
        is_flexible: false,
        due_date: "2026-04-10T12:00:00.000Z",
        display_id: "DRS-008",
      },
      matchedTechnician: {
        hero_user_id: 1003,
        full_name: "Jonas Schmidt",
      },
      affectedProjects: [],
      cascadeRisk: {
        score: 57,
        severity: "high",
        explanation: "The shutdown slot is fixed and needs a clear handover.",
      },
      recommendedAction: {
        type: "manual_review",
      },
      residualRisk: "Keep the outage inside the agreed morning slot.",
      confidence: 0.71,
      dispatcherBrief:
        "Dresden Mixed-Use Building Upgrade needs a handover brief for the next worker.",
      problemSummary:
        "Prepare a handover for Dresden Mixed-Use Building Upgrade.",
      candidates: [],
    };
  }
}

class StubCrewChangeFallbackService {
  resolve() {
    return {
      requestMode: "crew_change",
      incidentType: "general_disruption",
      matchedTask: {
        hero_task_id: 6016,
        title: "Install replacement main switch",
        project_name: "Dresden Mixed-Use Building Upgrade",
        project_title: "Basement distribution board replacement",
        customer_name: "Elbtor Gewerbehof",
        assigned_to_name: "Jonas Schmidt",
        hero_target_project_match_id: 5008,
        hero_target_user_id: 1003,
        business_value: "high",
        is_flexible: false,
        due_date: "2026-04-10T12:00:00.000Z",
        display_id: "DRS-008",
      },
      matchedTechnician: {
        hero_user_id: 1003,
        full_name: "Jonas Schmidt",
      },
      affectedProjects: [],
      cascadeRisk: {
        score: 64,
        severity: "high",
        explanation: "This is high-value work with a close deadline.",
      },
      recommendedAction: {
        type: "reassign",
        targetUserId: 1014,
        targetUserName: "Sarah Lenz",
        dueDate: "2026-04-10T12:00:00.000Z",
      },
      residualRisk: "Sarah Lenz may need one later follow-up moved.",
      confidence: 0.84,
      dispatcherBrief:
        "Remove Jonas Schmidt from Dresden Mixed-Use Building Upgrade and send Sarah Lenz.",
      problemSummary:
        "Replace Jonas Schmidt with Sarah Lenz on Dresden Mixed-Use Building Upgrade.",
      candidates: [],
      replacementTechnician: {
        hero_user_id: 1014,
        full_name: "Sarah Lenz",
      },
    };
  }
}

async function testDailyBriefGetsDailyDisplay() {
  const service = new DispatchAiService({
    dashboardService: new StubDashboardService(),
    fallbackService: new StubDailyBriefFallbackService(),
    aiClient: null,
  });

  const result = await service.resolveTranscript({
    transcript: "What needs attention today?",
  });

  assert.equal(result.requestMode, "daily_brief");
  assert.equal(result.display.headline, "Here is what needs attention today.");
  assert.equal(result.display.helperLabel, "What matters now");
  assert.ok(result.spokenBrief.includes("Today's first attention point"));
}

async function testArrivalBriefGetsArrivalDisplay() {
  const service = new DispatchAiService({
    dashboardService: new StubDashboardService(),
    fallbackService: new StubArrivalFallbackService(),
    aiClient: null,
  });

  const result = await service.resolveTranscript({
    transcript: "What should I know before I arrive?",
  });

  assert.equal(result.requestMode, "arrival_brief");
  assert.equal(result.display.headline, "Before you arrive at Elbtor Gewerbehof.");
  assert.equal(result.display.helperLabel, "What matters on site");
  assert.ok(result.spokenBrief.includes("Before you arrive"));
}

async function testArrivalBriefPrefersGroundedBaselineNarrative() {
  const service = new DispatchAiService({
    dashboardService: new StubDashboardService(),
    fallbackService: new StubArrivalFallbackService(),
    aiClient: new StubArrivalAiClient(),
  });

  const result = await service.resolveTranscript({
    transcript: "What should I know before I arrive?",
  });

  assert.equal(result.requestMode, "arrival_brief");
  assert.equal(result.problemSummary, "Brief the arriving worker on Dresden Mixed-Use Building Upgrade.");
  assert.ok(result.dispatcherBrief.includes("Dresden Mixed-Use Building Upgrade is the key focus on arrival."));
  assert.equal(result.residualRisk, "Keep the outage inside the agreed morning slot.");
}

async function testHandoverSummaryGetsHandoverDisplay() {
  const service = new DispatchAiService({
    dashboardService: new StubDashboardService(),
    fallbackService: new StubHandoverFallbackService(),
    aiClient: null,
  });

  const result = await service.resolveTranscript({
    transcript: "What does Sarah need to know before taking over this job?",
  });

  assert.equal(result.requestMode, "handover_summary");
  assert.equal(result.display.headline, "Here is the handover for Elbtor Gewerbehof.");
  assert.equal(result.display.helperLabel, "What the next worker needs");
  assert.ok(result.spokenBrief.includes("Before someone takes over"));
  assert.ok(result.problemSummary.includes("Jonas Schmidt is currently assigned"));
}

async function testCrewChangeGetsDedicatedDisplay() {
  const service = new DispatchAiService({
    dashboardService: new StubDashboardService(),
    fallbackService: new StubCrewChangeFallbackService(),
    aiClient: null,
  });

  const result = await service.resolveTranscript({
    transcript: "Remove Jonas from the Dresden project and replace him with Sarah.",
  });

  assert.equal(result.requestMode, "crew_change");
  assert.equal(result.display.headline, "Replace Jonas Schmidt with Sarah Lenz.");
  assert.equal(result.display.subline, "Crew change");
  assert.equal(result.recommendedAction.targetUserName, "Sarah Lenz");
  assert.ok(result.spokenBrief.includes("send Sarah Lenz instead"));
}

module.exports = {
  testStrongBaselineBeatsVagueManualReview,
  testDailyBriefGetsDailyDisplay,
  testArrivalBriefGetsArrivalDisplay,
  testArrivalBriefPrefersGroundedBaselineNarrative,
  testHandoverSummaryGetsHandoverDisplay,
  testCrewChangeGetsDedicatedDisplay,
};
