const {
  mockEvents,
  mockTasks,
  mockProjectMatches,
  mockTaskOverrides,
  mockUsers,
  mockTechnicianProfiles,
  mockAllTasks,
} = require("./mockData");
const {
  mockDashboardActiveTasks,
  mockDashboardTechnicianWorkload,
  mockDashboardProjectSummary,
  mockDashboardRecentDispatches,
} = require("./mockBoardData");

class MockRepository {
  async getEventById(eventId) {
    return mockEvents.find((event) => event.id === eventId) || null;
  }

  async getTaskById(taskId) {
    return mockTasks.find((task) => task.hero_task_id === taskId) || null;
  }

  async getTaskOverride(taskId) {
    return (
      mockTaskOverrides.find((taskOverride) => taskOverride.hero_task_id === taskId) || null
    );
  }

  async getProjectMatch(projectMatchId) {
    return (
      mockProjectMatches.find(
        (projectMatch) => projectMatch.hero_project_match_id === projectMatchId,
      ) || null
    );
  }

  async getUserById(userId) {
    return mockUsers.find((user) => user.hero_user_id === userId) || null;
  }

  async getTechnicianProfiles() {
    return mockTechnicianProfiles;
  }

  async getOpenTasksForUsers(userIds) {
    return mockAllTasks.filter(
      (task) =>
        userIds.includes(task.hero_target_user_id) && !task.is_done && !task.is_deleted,
    );
  }

  async getActiveTasks() {
    return mockDashboardActiveTasks;
  }

  async getTechnicianWorkload() {
    return mockDashboardTechnicianWorkload;
  }

  async getProjectSummary() {
    return mockDashboardProjectSummary;
  }

  async getRecentDispatches() {
    return mockDashboardRecentDispatches;
  }

  async getCalendarEventsForProject() {
    return [];
  }

  async getLogbookEntriesForProject() {
    return [];
  }

  async getDocumentsForProject() {
    return [];
  }

  async getProjectNotesForProject() {
    return [];
  }

  async getTimeLogsForProject() {
    return [];
  }

  async getInvoicesAtRisk() {
    return [];
  }

  async getOpenQuotes() {
    return [];
  }

  async createDispatchRun({ status, tasksConsidered, tasksChanged, summary }) {
    return {
      id: crypto.randomUUID(),
      status,
      tasks_considered: tasksConsidered,
      tasks_changed: tasksChanged,
      summary,
      created_at: new Date().toISOString(),
    };
  }

  async createDispatchDecision(input) {
    return {
      id: crypto.randomUUID(),
      ...input,
      created_at: new Date().toISOString(),
    };
  }

  async updateTaskAssignmentAndDueDate({ heroTaskId, targetUserId, dueDate }) {
    const task = mockTasks.find((entry) => entry.hero_task_id === heroTaskId);
    if (task) {
      task.hero_target_user_id = targetUserId;
      task.due_date = dueDate;
    }

    const dashboardTask = mockDashboardActiveTasks.find(
      (entry) => entry.hero_task_id === heroTaskId,
    );
    if (dashboardTask) {
      dashboardTask.hero_target_user_id = targetUserId;
      dashboardTask.due_date = dueDate;
      const user = mockUsers.find((entry) => entry.hero_user_id === targetUserId);
      dashboardTask.assigned_to_name = user?.full_name || dashboardTask.assigned_to_name;
    }

    return task || dashboardTask || null;
  }
}

module.exports = { MockRepository };
