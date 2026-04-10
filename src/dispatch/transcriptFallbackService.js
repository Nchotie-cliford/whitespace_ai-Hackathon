const { calculateCandidateScore, determinePreferredZone } = require("./scoring");

function lower(value) {
  return String(value || "").toLowerCase();
}

function determineIncidentType(transcript) {
  const text = lower(transcript);

  if (/(weather|wind|storm|unsafe|roof)/.test(text)) {
    return "weather_disruption";
  }

  if (/(traffic|late|delay|stuck)/.test(text)) {
    return "traffic_delay";
  }

  if (/(sick|ill|unavailable|cannot make it|can't make it)/.test(text)) {
    return "technician_unavailable";
  }

  if (/(urgent|emergency|critical|asap)/.test(text)) {
    return "urgent_insert";
  }

  return "general_disruption";
}

function determineRequestMode(transcript) {
  const text = lower(transcript);

  if (
    /(remove|take off|replace).*(with|instead|swap|send)/.test(text) ||
    /(replace .* with .*|take .* off .* and .* instead)/.test(text)
  ) {
    return "crew_change";
  }

  if (
    /(take over|taking over|handover|hand over|cover this job|needs to know before taking over|what does .* need to know)/.test(text)
  ) {
    return "handover_summary";
  }

  if (
    /(today|this morning|this afternoon|daily|day).*(brief|overview|plan|risk)/.test(text) ||
    /(what needs attention|what should i focus on|what is at risk today)/.test(text)
  ) {
    return "daily_brief";
  }

  if (
    /(before i arrive|before we arrive|before i get there|what should i know before i arrive)/.test(text)
  ) {
    return "arrival_brief";
  }

  if (
    /(which|what).*(projects|jobs|appointments).*(affected|at risk|impacted)/.test(text) ||
    /(this week|next week).*(affected|at risk|impacted)/.test(text)
  ) {
    return "planning";
  }

  if (/(who is working|who's working|who is assigned|who's assigned)/.test(text)) {
    return "status";
  }

  if (/(summari[sz]e|what do i need to know|give me a summary)/.test(text)) {
    return "summary";
  }

  return "action";
}

function findTechnicianMatch(transcript, technicians) {
  const text = lower(transcript);

  let best = null;
  let bestScore = 0;

  for (const technician of technicians) {
    const fullName = lower(technician.full_name || technician.name);
    const firstName = fullName.split(" ")[0];
    let score = 0;

    if (fullName && text.includes(fullName)) {
      score += 5;
    }

    if (firstName && text.includes(firstName)) {
      score += 2;
    }

    if (score > bestScore) {
      best = technician;
      bestScore = score;
    }
  }

  return bestScore > 0 ? best : null;
}

function extractReplacementTechnician(transcript, technicians, currentTechnician) {
  const text = lower(transcript);
  const currentId = currentTechnician?.hero_user_id ?? null;
  let best = null;
  let bestScore = 0;

  for (const technician of technicians) {
    if (currentId !== null && Number(technician.hero_user_id) === Number(currentId)) {
      continue;
    }

    const fullName = lower(technician.full_name || technician.name);
    const firstName = fullName.split(" ")[0];
    let score = 0;

    if (new RegExp(`(?:replace|with|instead|send)\\s+${fullName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`).test(text)) {
      score += 6;
    }

    if (firstName && new RegExp(`(?:replace|with|instead|send)\\s+${firstName}`).test(text)) {
      score += 4;
    }

    if (fullName && text.includes(fullName)) {
      score += 2;
    } else if (firstName && text.includes(firstName)) {
      score += 1;
    }

    if (score > bestScore) {
      best = technician;
      bestScore = score;
    }
  }

  return bestScore > 0 ? best : null;
}

function scoreTaskMatch(transcript, task) {
  const text = lower(transcript);
  const fields = [
    task.title,
    task.project_name,
    task.project_title,
    task.project_nr,
    task.display_id,
    task.city,
    task.customer_name,
    task.assigned_to_name,
  ].map(lower);

  let score = 0;
  for (const field of fields) {
    if (!field) {
      continue;
    }

    if (text.includes(field)) {
      score += 5;
      continue;
    }

    const tokens = field.split(/[^a-z0-9]+/).filter((token) => token.length > 3);
    for (const token of tokens) {
      if (text.includes(token)) {
        score += 1;
      }
    }
  }

  return score;
}

function findTaskMatch(transcript, activeTasks, technicianMatch) {
  const scopedTasks = technicianMatch
    ? activeTasks.filter(
        (task) => Number(task.hero_target_user_id) === Number(technicianMatch.hero_user_id),
      )
    : activeTasks;

  const ranked = scopedTasks
    .map((task) => ({
      task,
      score: scoreTaskMatch(transcript, task),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return new Date(left.task.due_date).getTime() - new Date(right.task.due_date).getTime();
    });

  if (ranked[0]?.score > 0) {
    return ranked[0].task;
  }

  if (technicianMatch) {
    return scopedTasks
      .slice()
      .sort(
        (left, right) =>
          new Date(left.due_date).getTime() - new Date(right.due_date).getTime(),
      )[0];
  }

  return activeTasks
    .slice()
    .sort((left, right) => new Date(left.due_date).getTime() - new Date(right.due_date).getTime())[0];
}

function computeCascade(task, incidentType, transcript) {
  let score = 0;
  const reasons = [];

  if (task.business_value === "high") {
    score += 30;
    reasons.push("high business value");
  } else if (task.business_value === "medium") {
    score += 15;
  }

  if (!task.is_flexible) {
    score += 20;
    reasons.push("hard to move");
  }

  const dueHours = (new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60);
  if (dueHours <= 4) {
    score += 20;
    reasons.push("deadline is close");
  } else if (dueHours <= 24) {
    score += 10;
  }

  if (/(clinic|hospital|tenant|handover|cert|safety|urgent)/i.test(
    [task.title, task.project_title, task.project_name, transcript].join(" "),
  )) {
    score += 20;
    reasons.push("downstream operational impact");
  }

  if (incidentType === "weather_disruption" || incidentType === "traffic_delay") {
    score += 10;
  }

  const severity =
    score >= 75 ? "critical" : score >= 55 ? "high" : score >= 35 ? "medium" : "low";

  return {
    score: Math.min(score, 100),
    severity,
    explanation:
      reasons.length > 0
        ? `Cascade risk is ${severity} because of ${reasons.join(", ")}.`
        : `Cascade risk is ${severity}.`,
  };
}

function isWeatherSensitiveTask(task) {
  const haystack = [
    task.title,
    task.comment,
    task.project_name,
    task.project_title,
    task.project_type,
    ...(Array.isArray(task.required_skills) ? task.required_skills : []),
  ]
    .map(lower)
    .join(" ");

  return /(solar|roof|site_safety|outdoor|weather|wind)/.test(haystack);
}

function collectAffectedProjects({ transcript, snapshot, incidentType, technicianMatch }) {
  const requestMode = determineRequestMode(transcript);
  if (requestMode !== "planning") {
    return [];
  }

  const activeTasks = snapshot.activeTasks || [];
  let filteredTasks = activeTasks;

  if (incidentType === "weather_disruption") {
    filteredTasks = activeTasks.filter(isWeatherSensitiveTask);
  } else if (incidentType === "technician_unavailable" && technicianMatch) {
    filteredTasks = activeTasks.filter(
      (task) => Number(task.hero_target_user_id) === Number(technicianMatch.hero_user_id),
    );
  }

  const seen = new Set();
  return filteredTasks
    .map((task) => ({
      heroProjectMatchId: task.hero_target_project_match_id,
      projectName: task.project_name,
      customerName: task.customer_name,
      displayId: task.display_id,
      dueDate: task.due_date,
      businessValue: task.business_value,
      isFlexible: task.is_flexible,
      title: task.title,
    }))
    .filter((project) => {
      if (!project.heroProjectMatchId || seen.has(project.heroProjectMatchId)) {
        return false;
      }
      seen.add(project.heroProjectMatchId);
      return true;
    })
    .slice(0, 5);
}

class TranscriptFallbackService {
  resolve(transcript, snapshot) {
    const requestMode = determineRequestMode(transcript);
    const incidentType = determineIncidentType(transcript);
    const technicianMatch = findTechnicianMatch(
      transcript,
      snapshot.technicianWorkload || [],
    );
    const replacementTechnician = requestMode === "crew_change"
      ? extractReplacementTechnician(
          transcript,
          snapshot.technicianWorkload || [],
          technicianMatch,
        )
      : null;
    const affectedProjects = collectAffectedProjects({
      transcript,
      snapshot,
      incidentType,
      technicianMatch,
    });
    const matchedTask = findTaskMatch(
      transcript,
      snapshot.activeTasks || [],
      technicianMatch,
    );

    if (!matchedTask && requestMode !== "daily_brief") {
      return {
        mode: "fallback",
        transcript,
        requestMode,
        incidentType,
        affectedProjects,
        cascadeRisk: { score: 20, severity: "low", explanation: "No task match was found." },
        recommendedAction: { type: "manual_review" },
        residualRisk: "The incident could not be mapped confidently to a live task.",
        confidence: 0.3,
        dispatcherBrief:
          "I could not confidently map the disruption to a specific live task, so manual review is recommended.",
        candidates: [],
      };
    }

    if (requestMode === "daily_brief") {
      const activeTasks = snapshot.activeTasks || [];
      const atRiskTasks = activeTasks
        .slice()
        .sort((left, right) => new Date(left.due_date).getTime() - new Date(right.due_date).getTime())
        .slice(0, 5);
      const topTask = atRiskTasks[0] || null;
      const overloaded = (snapshot.technicianWorkload || [])
        .filter((tech) => Number(tech.open_task_count || 0) >= 3 || Number(tech.overdue_task_count || 0) > 0)
        .slice(0, 3);

      return {
        mode: "fallback",
        transcript,
        requestMode,
        incidentType,
        matchedTask: topTask,
        matchedTechnician: null,
        affectedProjects: atRiskTasks.map((task) => ({
          heroProjectMatchId: task.hero_target_project_match_id,
          projectName: task.project_name,
          customerName: task.customer_name,
          displayId: task.display_id,
          dueDate: task.due_date,
          businessValue: task.business_value,
          isFlexible: task.is_flexible,
          title: task.title,
        })),
        cascadeRisk: {
          score: topTask ? 68 : 40,
          severity: topTask ? "high" : "medium",
          explanation: topTask
            ? `Today's riskiest work starts with ${topTask.project_name || topTask.title}.`
            : "No critical task spike was found in the current board snapshot.",
        },
        recommendedAction: {
          type: topTask?.is_flexible ? "delay" : "manual_review",
          targetUserId: topTask?.hero_target_user_id || null,
          targetUserName: topTask?.assigned_to_name || null,
          dueDate: topTask?.due_date || null,
        },
        residualRisk:
          overloaded.length > 0
            ? `${overloaded[0].full_name} is already carrying a heavy load today.`
            : "No overloaded technician was found in the top crew snapshot.",
        confidence: 0.74,
        dispatcherBrief: topTask
          ? `Today's first attention point is ${topTask.project_name || topTask.title}. Review that job before moving lower-priority work.`
          : "The board looks stable right now, with no single job standing out as critical.",
        problemSummary: topTask
          ? `Today's work should start with ${topTask.project_name || topTask.title}.`
          : "The current board is stable.",
        candidates: [],
      };
    }

    const requiredSkills = Array.isArray(matchedTask.required_skills)
      ? matchedTask.required_skills
      : [];
    const preferredZone = determinePreferredZone(matchedTask.project_type);
    const candidates = (snapshot.technicianWorkload || [])
      .filter(
        (technician) =>
          Number(technician.hero_user_id) !== Number(matchedTask.hero_target_user_id) &&
          technician.status === "active",
      )
      .map((technician) => {
        const { score, breakdown } = calculateCandidateScore({
          candidate: technician,
          requiredSkills,
          preferredZone,
          openTaskCount: technician.open_task_count || 0,
        });

        return {
          heroUserId: technician.hero_user_id,
          name: technician.full_name,
          openTaskCount: technician.open_task_count || 0,
          score: Number(score.toFixed(2)),
          breakdown,
        };
      })
      .sort((left, right) => right.score - left.score)
      .slice(0, 5);

    const bestCandidate = candidates[0];
    const cascadeRisk = computeCascade(matchedTask, incidentType, transcript);
    const currentAssignedName = matchedTask.assigned_to_name;
    let recommendedAction;
    let residualRisk;
    let confidence;

    if (requestMode === "crew_change" && replacementTechnician) {
      recommendedAction = {
        type: "reassign",
        targetUserId: replacementTechnician.hero_user_id,
        targetUserName: replacementTechnician.full_name,
        dueDate: matchedTask.due_date,
      };
      residualRisk =
        replacementTechnician.open_task_count >= 2
          ? `${replacementTechnician.full_name} may need one later follow-up moved.`
          : "Residual operational risk is low.";
      confidence = 0.84;
    } else if (incidentType === "weather_disruption") {
      recommendedAction = {
        type: "delay",
        targetUserId: matchedTask.hero_target_user_id,
        targetUserName: currentAssignedName,
        dueDate: new Date(
          new Date(matchedTask.due_date).getTime() + 4 * 60 * 60 * 1000,
        ).toISOString(),
      };
      residualRisk = "Customer timing may slip, but safety risk is removed.";
      confidence = 0.82;
    } else if (bestCandidate && bestCandidate.score >= 0.55) {
      recommendedAction = {
        type: "reassign",
        targetUserId: bestCandidate.heroUserId,
        targetUserName: bestCandidate.name,
        dueDate: new Date(
          new Date(matchedTask.due_date).getTime() + 30 * 60 * 1000,
        ).toISOString(),
      };
      residualRisk =
        bestCandidate.openTaskCount >= 2
          ? `${bestCandidate.name} may need one follow-up task shifted later.`
          : "Residual operational risk is low.";
      confidence = Math.min(0.92, 0.45 + bestCandidate.score);
    } else if (matchedTask.is_flexible) {
      recommendedAction = {
        type: "delay",
        targetUserId: matchedTask.hero_target_user_id,
        targetUserName: currentAssignedName,
        dueDate: new Date(
          new Date(matchedTask.due_date).getTime() + 2 * 60 * 60 * 1000,
        ).toISOString(),
      };
      residualRisk = "Delay is manageable, but the customer should be informed quickly.";
      confidence = 0.6;
    } else {
      recommendedAction = { type: "manual_review" };
      residualRisk = "No safe replacement was found with high confidence.";
      confidence = 0.38;
    }

    const dispatcherBrief =
      requestMode === "crew_change"
        ? `Remove ${currentAssignedName} from ${matchedTask.project_name || matchedTask.title} and send ${recommendedAction.targetUserName}. ${cascadeRisk.explanation}`
        : requestMode === "handover_summary"
        ? `${matchedTask.project_name || matchedTask.title} needs a handover brief for the next worker. ${cascadeRisk.explanation}`
        : requestMode === "arrival_brief"
        ? `${matchedTask.project_name || matchedTask.title} is the key focus on arrival. ${cascadeRisk.explanation}`
        : recommendedAction.type === "reassign"
        ? `${currentAssignedName} is at risk on ${matchedTask.project_name}. Best move: reassign to ${recommendedAction.targetUserName}. ${cascadeRisk.explanation}`
        : recommendedAction.type === "delay"
          ? `${matchedTask.project_name} should be delayed rather than reassigned. ${cascadeRisk.explanation}`
          : `${matchedTask.project_name} needs manual review. ${cascadeRisk.explanation}`;

    return {
      mode: "fallback",
      transcript,
      requestMode,
      incidentType,
      matchedTask,
      matchedTechnician: technicianMatch,
      affectedProjects,
      cascadeRisk,
      recommendedAction,
      residualRisk,
      confidence: Number(confidence.toFixed(2)),
      dispatcherBrief,
      problemSummary:
        requestMode === "crew_change"
          ? `Replace ${currentAssignedName} with ${recommendedAction.targetUserName || "a new worker"} on ${matchedTask.project_name}.`
          : requestMode === "handover_summary"
          ? `Prepare a handover for ${matchedTask.project_name}.`
          : requestMode === "arrival_brief"
          ? `Brief the arriving worker on ${matchedTask.project_name}.`
          : `Resolve disruption affecting ${matchedTask.project_name}.`,
      candidates,
      replacementTechnician,
    };
  }
}

module.exports = { TranscriptFallbackService };
