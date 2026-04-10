class DispatchAiService {
  constructor({ dashboardService, fallbackService, aiClient }) {
    this.dashboardService = dashboardService;
    this.fallbackService = fallbackService;
    this.aiClient = aiClient;
  }

  buildPromptPayload({ transcript, snapshot, baseline }) {
    const matchedTask = baseline.matchedTask || null;
    const matchedTechnician = baseline.matchedTechnician || null;
    const relatedProject = matchedTask
      ? (snapshot.projectSummary || []).find(
          (project) =>
            Number(project.hero_project_match_id) ===
            Number(matchedTask.hero_target_project_match_id),
        ) || null
      : null;

    const candidateSummaries = (baseline.candidates || []).slice(0, 5).map((candidate) => ({
      heroUserId: candidate.heroUserId,
      name: candidate.name,
      score: candidate.score,
      openTaskCount: candidate.openTaskCount,
      matchedSkills: candidate.breakdown?.matchedSkills || [],
      exactSkillMatch: candidate.breakdown?.exactSkillMatch || 0,
      partialSkillMatch: candidate.breakdown?.partialSkillMatch || 0,
      zoneMatch: candidate.breakdown?.zoneMatch || 0,
      workloadScore: candidate.breakdown?.workloadScore || 0,
    }));

    return {
      transcript,
      companyContext:
        'VoltWerk Service GmbH is a 15-person German field-service company. The manager needs a practical dispatch decision, not a generic summary.',
      requestMode: baseline.requestMode || "action",
      incidentType: baseline.incidentType || "general_disruption",
      matchedTask,
      matchedTechnician,
      relatedProject,
      affectedProjects: baseline.affectedProjects || [],
      projectContext: baseline.projectContext || null,
      dailyOpsContext: baseline.dailyOpsContext || null,
      cascadeRisk: baseline.cascadeRisk,
      baselineRecommendation: baseline.recommendedAction,
      baselineConfidence: baseline.confidence,
      baselineResidualRisk: baseline.residualRisk,
      baselineDispatcherBrief: baseline.dispatcherBrief,
      topCandidates: candidateSummaries,
      recentSimilarDispatches: (snapshot.recentDispatches || []).slice(0, 5),
    };
  }

  buildSpokenBrief({ requestMode, recommendedAction, matchedTask, residualRisk, dispatcherBrief, affectedProjects }) {
    const projectLabel =
      matchedTask?.customer_name ||
      matchedTask?.project_name ||
      matchedTask?.project_title ||
      matchedTask?.title ||
      "the job";

    if (requestMode === "daily_brief") {
      const topProject = Array.isArray(affectedProjects) ? affectedProjects[0] : null;
      const label = topProject?.customerName || topProject?.projectName || projectLabel;
      return `Today's first attention point is ${label}. Review that job before moving lower-priority work.`;
    }

    if (requestMode === "arrival_brief") {
      const riskNote = residualRisk ? ` Watch-out: ${residualRisk}` : "";
      return `Before you arrive, focus on ${projectLabel}.${riskNote}`.trim();
    }

    if (requestMode === "handover_summary") {
      const riskNote = residualRisk ? ` Watch-out: ${residualRisk}` : "";
      return `Before someone takes over ${projectLabel}, focus on the site handover and the next critical step.${riskNote}`.trim();
    }

    if (recommendedAction?.type === "reassign" && recommendedAction?.targetUserName) {
      const riskNote = residualRisk ? ` Watch-out: ${residualRisk}` : "";
      return `The best person to cover ${projectLabel} is ${recommendedAction.targetUserName}.${riskNote}`;
    }

    if (recommendedAction?.type === "delay") {
      const when = recommendedAction?.dueDate
        ? ` until ${new Date(recommendedAction.dueDate).toLocaleString([], {
            weekday: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}`
        : "";
      const riskNote = residualRisk ? ` ${residualRisk}` : "";
      return `The safest move is to delay ${projectLabel}${when}.${riskNote}`.trim();
    }

    return dispatcherBrief || `I need a manual review for ${projectLabel} before I can recommend the safest next step.`;
  }

  buildDisplayContent({ result }) {
    const displayMode = result.displayMode || result.requestMode || "action";
    const matchedTask = result.matchedTask || null;
    const action = result.recommendedAction || {};
    const projectLabel =
      matchedTask?.customer_name ||
      matchedTask?.project_name ||
      matchedTask?.project_title ||
      matchedTask?.title ||
      "this job";
    const projectRef = matchedTask?.display_id ? `#${matchedTask.display_id}` : null;

    if (displayMode === "handover_summary") {
      return {
        headline: `Here is the handover for ${projectLabel}.`,
        subline: "Worker handover",
        reason:
          result.problemSummary || `This is what the next worker needs to know before taking over ${projectLabel}.`,
        risk: result.residualRisk ? `Watch-out: ${result.residualRisk}` : "",
        primaryActionLabel: "",
        helperLabel: "What the next worker needs",
        riskLabel: "Watch-out",
        meta: projectRef || projectLabel,
      };
    }

    if (displayMode === "daily_brief") {
      const affectedProjects = Array.isArray(result.affectedProjects) ? result.affectedProjects : [];
      const topProject = affectedProjects[0];
      return {
        headline:
          affectedProjects.length > 0
            ? "Here is what needs attention today."
            : "Today looks steady.",
        subline: "Daily brief",
        reason:
          topProject
            ? `Start with ${topProject.customerName || topProject.projectName}. That is the first job most likely to create knock-on disruption.`
            : result.problemSummary || "No urgent issue stands out in the current board snapshot.",
        risk: result.residualRisk ? `Watch-out: ${result.residualRisk}` : "",
        primaryActionLabel: "",
        helperLabel: "What matters now",
        riskLabel: "Watch-out",
        meta: projectRef || `${affectedProjects.length} active priorities`,
      };
    }

    if (displayMode === "arrival_brief") {
      return {
        headline: `Before you arrive at ${projectLabel}.`,
        subline: "Arrival brief",
        reason:
          result.problemSummary || `Here is what matters before you arrive at ${projectLabel}.`,
        risk: result.residualRisk ? `Watch-out: ${result.residualRisk}` : "",
        primaryActionLabel: "",
        helperLabel: "What matters on site",
        riskLabel: "Watch-out",
        meta: projectRef || projectLabel,
      };
    }

    if (displayMode === "planning") {
      const affectedProjects = Array.isArray(result.affectedProjects) ? result.affectedProjects : [];
      const topProject = affectedProjects[0];
      return {
        headline:
          affectedProjects.length > 0
            ? `${affectedProjects.length} project${affectedProjects.length === 1 ? "" : "s"} need attention.`
            : "Planning update ready.",
        subline: "Planning view",
        reason:
          topProject
            ? `Most exposed: ${topProject.customerName || topProject.projectName}.`
            : result.problemSummary || "I checked the schedule for likely disruption.",
        risk:
          action.type === "delay" && action.dueDate
            ? `Best move: delay the first exposed visit to ${new Date(action.dueDate).toLocaleString([], {
                weekday: "short",
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })}.`
            : result.residualRisk || "",
        primaryActionLabel: "Review affected projects",
        helperLabel: "What stands out",
        riskLabel: "Best move",
        meta: topProject?.displayId ? `#${topProject.displayId}` : null,
      };
    }

    if (displayMode === "summary") {
      return {
        headline: `${projectLabel} summary ready.`,
        subline: "Project summary",
        reason: result.problemSummary || `Here is what you need to know about ${projectLabel}.`,
        risk: result.residualRisk || "",
        primaryActionLabel: "Review project",
        helperLabel: "What to know",
        riskLabel: "Watch-out",
        meta: projectRef,
      };
    }

    if (displayMode === "status") {
      return {
        headline: `${projectLabel} staffing update.`,
        subline: "Staffing view",
        reason: result.problemSummary || `Here is the current staffing situation for ${projectLabel}.`,
        risk: result.residualRisk || "",
        primaryActionLabel: "Review staffing",
        helperLabel: "Current status",
        riskLabel: "Watch-out",
        meta: projectRef,
      };
    }

    if (action.type === "reassign" && action.targetUserName) {
      return {
        headline: `Send ${action.targetUserName} to ${projectLabel}.`,
        subline: "Recommended move",
        reason:
          result.why?.[0] ||
          `The best person to cover ${projectLabel} is ${action.targetUserName}.`,
        risk: result.residualRisk || "",
        primaryActionLabel: `Send ${action.targetUserName}`,
        helperLabel: "Why this move",
        riskLabel: "Watch-out",
        meta: projectRef,
      };
    }

    if (action.type === "delay") {
      return {
        headline: `Delay ${projectLabel}.`,
        subline: "Recommended delay",
        reason:
          result.why?.[0] ||
          `Delaying ${projectLabel} causes less disruption than moving another technician.`,
        risk: result.residualRisk || "",
        primaryActionLabel: action.dueDate ? "Approve delay" : `Delay ${projectLabel}`,
        helperLabel: "Why this move",
        riskLabel: "Watch-out",
        meta: projectRef,
      };
    }

    return {
      headline: `${projectLabel} needs review.`,
      subline: "Manual review",
      reason: result.why?.[0] || result.problemSummary || "This case needs manual review before action.",
      risk: result.residualRisk || "",
      primaryActionLabel: "Review needed",
      helperLabel: "What needs checking",
      riskLabel: "Watch-out",
      meta: projectRef,
    };
  }

  async enrichBaselineWithProjectContext({ baseline }) {
    const projectMatchId =
      baseline.matchedTask?.hero_target_project_match_id ||
      baseline.affectedProjects?.[0]?.heroProjectMatchId ||
      null;

    const [projectContext, dailyOpsContext] = await Promise.all([
      this.dashboardService.getProjectContext(projectMatchId),
      baseline.requestMode === "daily_brief"
        ? this.dashboardService.getDailyOpsContext()
        : Promise.resolve(null),
    ]);
    return this.applyContextAwareBaseline({
      ...baseline,
      projectContext,
      dailyOpsContext,
    });
  }

  applyContextAwareBaseline(baseline) {
    if (baseline.requestMode !== "handover_summary") {
      return baseline;
    }

    const matchedTask = baseline.matchedTask || null;
    const projectContext = baseline.projectContext || {};
    const projectLabel =
      matchedTask?.customer_name ||
      matchedTask?.project_name ||
      matchedTask?.project_title ||
      matchedTask?.title ||
      "this job";
    const assignedWorker =
      baseline.matchedTechnician?.full_name ||
      matchedTask?.assigned_to_name ||
      "the current worker";
    const topNote =
      projectContext.projectNotes?.[0]?.content ||
      projectContext.logbookEntries?.[0]?.custom_text ||
      null;
    const topDocument =
      projectContext.documents?.[0]?.type_name ||
      projectContext.documents?.[0]?.type ||
      null;
    const recentTimeLog = projectContext.timeLogs?.[0] || null;
    const workedRecently = recentTimeLog?.duration_minutes
      ? `${recentTimeLog.duration_minutes} minutes of recent ${recentTimeLog.work_type || "site"} work are already logged.`
      : null;
    const summaryParts = [
      `${assignedWorker} is currently assigned to ${projectLabel}.`,
      topNote,
      workedRecently,
      topDocument ? `Relevant document on file: ${topDocument}.` : null,
    ].filter(Boolean);
    const handoverSummary = summaryParts.slice(0, 2).join(" ");
    const watchout =
      baseline.residualRisk ||
      topNote ||
      "Confirm the next step and site constraints before work resumes.";

    return {
      ...baseline,
      problemSummary:
        handoverSummary || `Prepare a handover for ${projectLabel}.`,
      residualRisk: watchout,
      dispatcherBrief:
        handoverSummary
          ? `${handoverSummary} Watch-out: ${watchout}`
          : baseline.dispatcherBrief,
    };
  }

  shouldPreferBaselineNarrative(requestMode) {
    return [
      "planning",
      "status",
      "summary",
      "arrival_brief",
      "daily_brief",
      "handover_summary",
    ].includes(requestMode);
  }

  mergeResult({ transcript, baseline, aiResult }) {
    const aiRecommendedAction = aiResult?.recommendedAction || {};
    const baselineAction = baseline.recommendedAction || {};
    const currentAssignedUserId =
      baseline.matchedTask?.hero_target_user_id ?? baseline.matchedTechnician?.hero_user_id ?? null;
    const baselineIsStrong =
      ['reassign', 'delay'].includes(baselineAction.type) &&
      Number(baseline.confidence || 0) >= 0.65;
    const aiDowngradesStrongBaseline =
      baselineIsStrong &&
      (!aiRecommendedAction.type || aiRecommendedAction.type === 'manual_review');
    const mergedAction = aiDowngradesStrongBaseline
      ? baselineAction
      : {
          type: aiRecommendedAction.type ?? baselineAction.type,
          targetUserId: aiRecommendedAction.targetUserId ?? baselineAction.targetUserId ?? null,
          targetUserName:
            aiRecommendedAction.targetUserName ?? baselineAction.targetUserName ?? null,
          dueDate: aiRecommendedAction.dueDate ?? baselineAction.dueDate ?? null,
        };
    const actionReassignsToCurrentAssignee =
      mergedAction.type === 'reassign' &&
      currentAssignedUserId !== null &&
      Number(mergedAction.targetUserId) === Number(currentAssignedUserId);
    const selectedAction =
      actionReassignsToCurrentAssignee && baselineIsStrong
        ? baselineAction
        : actionReassignsToCurrentAssignee
          ? { type: 'manual_review', targetUserId: null, targetUserName: null, dueDate: null }
          : mergedAction;

    const preferBaselineNarrative = this.shouldPreferBaselineNarrative(
      baseline.requestMode || "action",
    );

    const selectedProblemSummary =
      aiDowngradesStrongBaseline && baseline.matchedTask
        ? `${baseline.matchedTechnician?.full_name || baseline.matchedTask.assigned_to_name || 'The assigned technician'} is delayed for ${baseline.matchedTask.project_name || baseline.matchedTask.project_title || baseline.matchedTask.title}.`
        : preferBaselineNarrative && baseline.problemSummary
          ? baseline.problemSummary
        : aiResult.problemSummary ??
          baseline.problemSummary ??
          'Resolve the current field disruption.';

    const selectedWhy =
      aiDowngradesStrongBaseline && Array.isArray(baseline.candidates) && baseline.candidates[0]
        ? [
            `${baseline.candidates[0].name} is the best grounded replacement from the live workload and skill snapshot.`,
            `The current task is marked ${baseline.matchedTask?.is_flexible ? 'flexible' : 'non-flexible'} with ${baseline.matchedTask?.business_value || 'medium'} business value.`,
          ]
        : Array.isArray(aiResult.why) && aiResult.why.length > 0
          ? aiResult.why
          : [];
    const cleanedWhy = selectedWhy
      .map((item) => String(item || '').trim())
      .filter(Boolean)
      .filter((item, index, items) => items.indexOf(item) === index)
      .slice(0, 2);

    const selectedBrief =
      aiDowngradesStrongBaseline && baseline.dispatcherBrief
        ? baseline.dispatcherBrief
        : preferBaselineNarrative && baseline.dispatcherBrief
          ? baseline.dispatcherBrief
        : aiResult.dispatcherBrief ?? baseline.dispatcherBrief;
    const cleanedBrief = actionReassignsToCurrentAssignee
      ? `${baseline.matchedTask?.project_name || 'This task'} needs manual review because no grounded reassignment candidate was confirmed.`
      : selectedBrief;
    const cleanedResidualRisk =
      actionReassignsToCurrentAssignee
        ? 'No reliable reassignment candidate was confirmed, so this case should be reviewed manually.'
        : aiDowngradesStrongBaseline && baseline.residualRisk
          ? baseline.residualRisk
          : preferBaselineNarrative && baseline.residualRisk
            ? baseline.residualRisk
          : aiResult.residualRisk ?? baseline.residualRisk;
    const cleanedProblemSummary =
      baseline.requestMode === "planning" && Array.isArray(baseline.affectedProjects)
        ? aiResult.problemSummary ||
          `${baseline.affectedProjects.length} project${baseline.affectedProjects.length === 1 ? "" : "s"} could be affected.`
        : selectedProblemSummary;
    const displayMode = aiResult.displayMode || baseline.requestMode || "action";

    const result = {
      mode: 'ai',
      displayMode,
      transcript,
      requestMode: baseline.requestMode || "action",
      matchedTask: baseline.matchedTask || null,
      matchedTechnician: baseline.matchedTechnician || null,
      affectedProjects: baseline.affectedProjects || [],
      projectContext: baseline.projectContext || null,
      candidates: baseline.candidates || [],
      cascadeRisk: {
        score: aiResult.cascadeScore ?? baseline.cascadeRisk?.score ?? 0,
        severity: aiResult.cascadeSeverity ?? baseline.cascadeRisk?.severity ?? 'medium',
        explanation:
          aiResult.cascadeExplanation ??
          baseline.cascadeRisk?.explanation ??
          'Cascade risk was evaluated.',
      },
      recommendedAction: selectedAction,
      why: cleanedWhy,
      residualRisk: cleanedResidualRisk,
      confidence: Number(
        (
          actionReassignsToCurrentAssignee
            ? Math.min(Number(baseline.confidence || 0.4), 0.55)
            : aiDowngradesStrongBaseline
              ? Math.max(Number(baseline.confidence || 0), 0.75)
              : aiResult.confidence ?? baseline.confidence ?? 0.5
        ).toFixed(2),
      ),
      dispatcherBrief: cleanedBrief,
      spokenBrief:
        aiResult.spokenBrief ||
        this.buildSpokenBrief({
          requestMode: baseline.requestMode,
          recommendedAction: selectedAction,
          matchedTask: baseline.matchedTask,
          residualRisk: cleanedResidualRisk,
          dispatcherBrief: cleanedBrief,
          affectedProjects: baseline.affectedProjects,
        }),
      problemSummary: cleanedProblemSummary,
      fallbackRecommendation: baseline.recommendedAction,
    };

    return {
      ...result,
      display: this.buildDisplayContent({ result }),
    };
  }

  async resolveTranscript({ transcript }) {
    const snapshot = await this.dashboardService.getSnapshot();
    const hasOperationalData =
      Array.isArray(snapshot.activeTasks) &&
      snapshot.activeTasks.length > 0 &&
      Array.isArray(snapshot.technicianWorkload) &&
      snapshot.technicianWorkload.length > 0;

    if (!hasOperationalData) {
      return {
        mode: 'data_unavailable',
        displayMode: 'status',
        transcript,
        matchedTask: null,
        matchedTechnician: null,
        candidates: [],
        cascadeRisk: {
          score: 0,
          severity: 'medium',
          explanation:
            'The Supabase demo board does not have enough task and technician data for a grounded dispatch decision yet.',
        },
        recommendedAction: {
          type: 'manual_review',
          targetUserId: null,
          targetUserName: null,
          dueDate: null,
        },
        why: [
          'No active demo tasks were available in the current Supabase snapshot.',
          'No technician workload rows were available to compare reassignment options.',
        ],
        residualRisk:
          'Any recommendation would be low-confidence until the Supabase demo tables and dashboard views are populated.',
        confidence: 0.1,
        dispatcherBrief:
          'I cannot make a grounded dispatch decision yet because the Supabase demo board has no task or technician data. Please seed the demo data first.',
        spokenBrief:
          'I cannot make a dispatch recommendation yet because the demo schedule data is still empty.',
        problemSummary:
          'The current request cannot be resolved yet because the Supabase demo board is still empty.',
        fallbackRecommendation: { type: 'manual_review' },
        display: {
          headline: 'Demo data needed.',
          subline: 'Setup required',
          reason: 'The Supabase demo board is still empty, so I cannot answer this request from real jobs and technicians yet.',
          risk: 'Seed the demo data first, then try again.',
          primaryActionLabel: 'Setup required',
        },
      };
    }

    const baseline = await this.enrichBaselineWithProjectContext({
      baseline: this.fallbackService.resolve(transcript, snapshot),
    });

    if (!this.aiClient?.isConfigured()) {
      const result = {
        mode: 'fallback',
        transcript,
        displayMode: baseline.requestMode || "action",
        requestMode: baseline.requestMode || "action",
        spokenBrief: this.buildSpokenBrief({
          requestMode: baseline.requestMode,
          recommendedAction: baseline.recommendedAction,
          matchedTask: baseline.matchedTask,
          residualRisk: baseline.residualRisk,
          dispatcherBrief: baseline.dispatcherBrief,
          affectedProjects: baseline.affectedProjects,
        }),
        ...baseline,
      };
      return {
        ...result,
        display: this.buildDisplayContent({ result }),
      };
    }

    try {
      const aiResult = await this.aiClient.resolveIncident(
        this.buildPromptPayload({ transcript, snapshot, baseline }),
      );

      return this.mergeResult({ transcript, baseline, aiResult });
    } catch (error) {
      const result = {
        mode: 'fallback_after_ai_error',
        transcript,
        aiError: error.message,
        displayMode: baseline.requestMode || "action",
        requestMode: baseline.requestMode || "action",
        spokenBrief: this.buildSpokenBrief({
          requestMode: baseline.requestMode,
          recommendedAction: baseline.recommendedAction,
          matchedTask: baseline.matchedTask,
          residualRisk: baseline.residualRisk,
          dispatcherBrief: baseline.dispatcherBrief,
          affectedProjects: baseline.affectedProjects,
        }),
        ...baseline,
      };
      return {
        ...result,
        display: this.buildDisplayContent({ result }),
      };
    }
  }
}

module.exports = { DispatchAiService };
