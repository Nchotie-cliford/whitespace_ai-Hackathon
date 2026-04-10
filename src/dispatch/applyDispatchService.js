class ApplyDispatchService {
  constructor({ repository, heroClient }) {
    this.repository = repository;
    this.heroClient = heroClient;
  }

  async applyResolution({ transcript, resolution, actor = "Thomas" }) {
    const matchedTask = resolution.matchedTask;
    const action = resolution.recommendedAction;

    if (!matchedTask || !action?.type || action.type === "manual_review") {
      return {
        applied: false,
        reason: "No actionable recommendation was supplied.",
      };
    }

    const run = await this.repository.createDispatchRun({
      status: "completed",
      tasksConsidered: Math.max(1, (resolution.candidates || []).length),
      tasksChanged: 1,
      summary: resolution.dispatcherBrief,
    });

    const updatedTask = await this.repository.updateTaskAssignmentAndDueDate({
      heroTaskId: matchedTask.hero_task_id,
      targetUserId: action.targetUserId || matchedTask.hero_target_user_id,
      dueDate: action.dueDate || matchedTask.due_date,
    });

    const decision = await this.repository.createDispatchDecision({
      dispatchRunId: run.id,
      heroTaskId: matchedTask.hero_task_id,
      actionType: action.type,
      oldTargetUserId: matchedTask.hero_target_user_id,
      newTargetUserId: action.targetUserId || matchedTask.hero_target_user_id,
      oldDueDate: matchedTask.due_date,
      newDueDate: action.dueDate || matchedTask.due_date,
      confidence: resolution.confidence,
      reason: `${resolution.problemSummary || "AI resolution"} Confirmed by ${actor}. Transcript: ${transcript || "n/a"}`,
      applied: true,
    });

    let heroSync = { skipped: true, reason: "HERO sync not attempted." };
    try {
      heroSync = await this.heroClient.updateTask({
        taskId: matchedTask.hero_task_id,
        targetUserId: action.targetUserId || matchedTask.hero_target_user_id,
        dueDate: action.dueDate || matchedTask.due_date,
      });
    } catch (error) {
      heroSync = { skipped: false, error: error.message };
    }

    return {
      applied: true,
      run,
      decision,
      updatedTask,
      heroSync,
    };
  }
}

module.exports = { ApplyDispatchService };
