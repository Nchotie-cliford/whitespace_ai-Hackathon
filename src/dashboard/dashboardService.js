class DashboardService {
  constructor(repository) {
    this.repository = repository;
  }

  async getSnapshot() {
    const [activeTasks, technicianWorkload, projectSummary, recentDispatches] =
      await Promise.all([
        this.repository.getActiveTasks(),
        this.repository.getTechnicianWorkload(),
        this.repository.getProjectSummary(),
        this.repository.getRecentDispatches(),
      ]);

    return {
      activeTasks,
      technicianWorkload,
      projectSummary,
      recentDispatches,
      generatedAt: new Date().toISOString(),
    };
  }

  async getProjectContext(projectMatchId) {
    if (!projectMatchId) {
      return {
        calendarEvents: [],
        logbookEntries: [],
        documents: [],
        projectNotes: [],
        timeLogs: [],
      };
    }

    const [calendarEvents, logbookEntries, documents, projectNotes, timeLogs] = await Promise.all([
      this.repository.getCalendarEventsForProject?.(projectMatchId) || [],
      this.repository.getLogbookEntriesForProject?.(projectMatchId) || [],
      this.repository.getDocumentsForProject?.(projectMatchId) || [],
      this.repository.getProjectNotesForProject?.(projectMatchId) || [],
      this.repository.getTimeLogsForProject?.(projectMatchId) || [],
    ]);

    return {
      calendarEvents,
      logbookEntries,
      documents,
      projectNotes,
      timeLogs,
    };
  }

  async getDailyOpsContext() {
    const [snapshot, invoicesAtRisk, openQuotes] = await Promise.all([
      this.getSnapshot(),
      this.repository.getInvoicesAtRisk?.() || [],
      this.repository.getOpenQuotes?.() || [],
    ]);

    const now = Date.now();
    const atRiskTasks = (snapshot.activeTasks || [])
      .filter((task) => {
        const due = new Date(task.due_date || task.start_at || 0).getTime();
        const hours = (due - now) / (1000 * 60 * 60);
        return hours <= 24 && hours >= -12;
      })
      .slice(0, 6);

    const unavailableTechnicians = (snapshot.technicianWorkload || [])
      .filter((tech) => tech.status && tech.status !== "active")
      .slice(0, 6);

    const overloadedTechnicians = (snapshot.technicianWorkload || [])
      .filter((tech) => Number(tech.open_task_count || 0) >= 3 || Number(tech.overdue_task_count || 0) > 0)
      .slice(0, 6);

    return {
      snapshot,
      atRiskTasks,
      unavailableTechnicians,
      overloadedTechnicians,
      invoicesAtRisk,
      openQuotes,
    };
  }
}

module.exports = { DashboardService };
