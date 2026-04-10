const { calculateCandidateScore, determinePreferredZone } = require("./scoring");

function resolveTaskIdFromEvent(event) {
  const affectedTaskIds = event.payload?.affected_task_ids;
  if (Array.isArray(affectedTaskIds) && affectedTaskIds.length > 0) {
    return Number(affectedTaskIds[0]);
  }

  return event.payload?.hero_task_id ? Number(event.payload.hero_task_id) : null;
}

function normalizeRequiredSkills(taskOverride, projectType) {
  if (taskOverride?.required_skills?.length) {
    return taskOverride.required_skills;
  }

  if (projectType) {
    return [projectType];
  }

  return [];
}

class RecommendationService {
  constructor(repository) {
    this.repository = repository;
  }

  async recommendForEvent(eventId) {
    const event = await this.repository.getEventById(eventId);
    if (!event) {
      throw new Error(`Event ${eventId} not found.`);
    }

    const taskId = resolveTaskIdFromEvent(event);
    if (!taskId) {
      return {
        eventId: event.id,
        eventType: event.event_type,
        suggestedAction: "manual_review",
        confidence: 0.25,
        reason: "No affected task could be resolved from the event payload.",
      };
    }

    const task = await this.repository.getTaskById(taskId);
    if (!task) {
      return {
        eventId: event.id,
        eventType: event.event_type,
        heroTaskId: taskId,
        suggestedAction: "manual_review",
        confidence: 0.25,
        reason: "The affected task could not be found.",
      };
    }

    const [taskOverride, projectMatch, currentUser] = await Promise.all([
      this.repository.getTaskOverride(task.hero_task_id),
      this.repository.getProjectMatch(task.hero_target_project_match_id),
      this.repository.getUserById(task.hero_target_user_id),
    ]);

    if (
      event.event_type === "weather_disruption" ||
      event.payload?.reason === "weather"
    ) {
      return {
        eventId: event.id,
        eventType: event.event_type,
        heroTaskId: task.hero_task_id,
        currentUserId: task.hero_target_user_id,
        currentUserName: currentUser?.full_name || null,
        suggestedAction: "delay",
        suggestedUserId: task.hero_target_user_id,
        suggestedUserName: currentUser?.full_name || null,
        suggestedDueDate: new Date(
          new Date(task.due_date).getTime() + 4 * 60 * 60 * 1000,
        ).toISOString(),
        confidence: 0.86,
        reason:
          "Weather-related safety blocker detected, so delaying the task is safer than reassignment.",
      };
    }

    const requiredSkills = normalizeRequiredSkills(taskOverride, projectMatch?.project_type);
    const preferredZone = determinePreferredZone(projectMatch?.project_type);
    const technicians = await this.repository.getTechnicianProfiles();
    const activeCandidates = technicians.filter(
      (candidate) =>
        candidate.hero_user_id !== task.hero_target_user_id && candidate.status === "active",
    );
    const allCandidateTaskLoads = await this.repository.getOpenTasksForUsers(
      activeCandidates.map((candidate) => candidate.hero_user_id),
    );

    const scoredCandidates = activeCandidates
      .map((candidate) => {
        const openTaskCount = allCandidateTaskLoads.filter(
          (candidateTask) => candidateTask.hero_target_user_id === candidate.hero_user_id,
        ).length;
        const { score, breakdown } = calculateCandidateScore({
          candidate,
          requiredSkills,
          preferredZone,
          openTaskCount,
        });

        return {
          candidate,
          openTaskCount,
          score,
          breakdown,
        };
      })
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score;
        }

        if (left.openTaskCount !== right.openTaskCount) {
          return left.openTaskCount - right.openTaskCount;
        }

        return left.candidate.name.localeCompare(right.candidate.name);
      });

    const bestCandidate = scoredCandidates[0];
    const isFlexible = taskOverride?.is_flexible ?? true;

    if (bestCandidate && bestCandidate.score >= 0.55) {
      const suggestedDueDate = new Date(
        new Date(task.due_date).getTime() + 30 * 60 * 1000,
      ).toISOString();

      return {
        eventId: event.id,
        eventType: event.event_type,
        heroTaskId: task.hero_task_id,
        currentUserId: task.hero_target_user_id,
        currentUserName: currentUser?.full_name || null,
        suggestedAction: "reassign",
        suggestedUserId: bestCandidate.candidate.hero_user_id,
        suggestedUserName: bestCandidate.candidate.name,
        suggestedDueDate,
        confidence: Number(Math.min(0.95, 0.45 + bestCandidate.score).toFixed(2)),
        reason: `Reassign to ${bestCandidate.candidate.name} because the technician is active, covers ${bestCandidate.breakdown.matchedSkills.join(", ") || "the core trade"}, and has a manageable workload.`,
        scoreBreakdown: bestCandidate.breakdown,
      };
    }

    if (isFlexible) {
      return {
        eventId: event.id,
        eventType: event.event_type,
        heroTaskId: task.hero_task_id,
        currentUserId: task.hero_target_user_id,
        currentUserName: currentUser?.full_name || null,
        suggestedAction: "delay",
        suggestedUserId: task.hero_target_user_id,
        suggestedUserName: currentUser?.full_name || null,
        suggestedDueDate: new Date(
          new Date(task.due_date).getTime() + 2 * 60 * 60 * 1000,
        ).toISOString(),
        confidence: 0.62,
        reason:
          "No better technician was found immediately, so the safest fallback is a short delay.",
      };
    }

    return {
      eventId: event.id,
      eventType: event.event_type,
      heroTaskId: task.hero_task_id,
      currentUserId: task.hero_target_user_id,
      currentUserName: currentUser?.full_name || null,
      suggestedAction: "manual_review",
      confidence: 0.4,
      reason: "No safe recommendation was found automatically; manual review is required.",
    };
  }
}

module.exports = { RecommendationService };
