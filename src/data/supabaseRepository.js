class SupabaseRepository {
  constructor(config) {
    this.baseUrl = config.supabaseUrl;
    this.serviceRoleKey = config.supabaseServiceRoleKey;
  }

  isPlaceholder(value) {
    return (
      !value ||
      value === "..." ||
      value.includes("your-project-id") ||
      value.includes("your-service-role-key") ||
      value.includes("...")
    );
  }

  isPublishableKey(value) {
    return String(value || "").startsWith("sb_publishable_");
  }

  get headers() {
    return {
      apikey: this.serviceRoleKey,
      Authorization: `Bearer ${this.serviceRoleKey}`,
      "Content-Type": "application/json",
    };
  }

  assertConfigured() {
    if (this.isPlaceholder(this.baseUrl)) {
      throw new Error(
        "SUPABASE_URL is missing or still set to a placeholder value. Replace it with your real Supabase project URL.",
      );
    }

    if (this.isPlaceholder(this.serviceRoleKey)) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is missing or still set to a placeholder value. Replace it with your real service role key.",
      );
    }

    if (this.isPublishableKey(this.serviceRoleKey)) {
      throw new Error(
        "SUPABASE_SERVICE_ROLE_KEY is currently set to a publishable key. Replace it with your real Supabase service_role key so the backend can read protected tables.",
      );
    }

    if (!/^https?:\/\//i.test(this.baseUrl)) {
      throw new Error(
        "SUPABASE_URL must start with http:// or https:// and point to your Supabase project.",
      );
    }
  }

  async rpc(functionName, body) {
    this.assertConfigured();
    const response = await fetch(`${this.baseUrl}/rest/v1/rpc/${functionName}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase RPC ${functionName} failed: ${text}`);
    }

    return response.json();
  }

  async selectSingle(table, query) {
    this.assertConfigured();
    const response = await fetch(`${this.baseUrl}/rest/v1/${table}?${query}&limit=1`, {
      method: "GET",
      headers: {
        ...this.headers,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase select from ${table} failed: ${text}`);
    }

    const rows = await response.json();
    return rows[0] || null;
  }

  async getEventById(eventId) {
    return this.selectSingle("dispatcher_events", `id=eq.${eventId}`);
  }

  async getTaskById(taskId) {
    return this.selectSingle("hero_tasks", `hero_task_id=eq.${taskId}`);
  }

  async getTaskOverride(taskId) {
    return this.selectSingle("task_overrides", `hero_task_id=eq.${taskId}`);
  }

  async getProjectMatch(projectMatchId) {
    return this.selectSingle(
      "hero_project_matches",
      `hero_project_match_id=eq.${projectMatchId}`,
    );
  }

  async getUserById(userId) {
    return this.selectSingle("hero_users", `hero_user_id=eq.${userId}`);
  }

  async getTechnicianProfiles() {
    this.assertConfigured();
    const response = await fetch(
      `${this.baseUrl}/rest/v1/technician_profiles?select=*&order=name.asc`,
      {
      method: "GET",
      headers: this.headers,
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase select from technician_profiles failed: ${text}`);
    }

    return response.json();
  }

  async getOpenTasksForUsers(userIds) {
    if (userIds.length === 0) {
      return [];
    }

    this.assertConfigured();
    const ids = `(${userIds.join(",")})`;
    const response = await fetch(
      `${this.baseUrl}/rest/v1/hero_tasks?select=*&hero_target_user_id=in.${ids}&is_done=eq.false&is_deleted=eq.false`,
      {
        method: "GET",
        headers: this.headers,
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase select from hero_tasks failed: ${text}`);
    }

    return response.json();
  }

  async selectMany(table, query) {
    this.assertConfigured();
    const response = await fetch(`${this.baseUrl}/rest/v1/${table}?${query}`, {
      method: "GET",
      headers: this.headers,
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase select from ${table} failed: ${text}`);
    }

    return response.json();
  }

  async insert(table, payload) {
    this.assertConfigured();
    const response = await fetch(`${this.baseUrl}/rest/v1/${table}`, {
      method: "POST",
      headers: {
        ...this.headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase insert into ${table} failed: ${text}`);
    }

    const rows = await response.json();
    return rows[0] || null;
  }

  async patch(table, query, payload) {
    this.assertConfigured();
    const response = await fetch(`${this.baseUrl}/rest/v1/${table}?${query}`, {
      method: "PATCH",
      headers: {
        ...this.headers,
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Supabase update on ${table} failed: ${text}`);
    }

    const rows = await response.json();
    return rows[0] || null;
  }

  async getActiveTasks() {
    return this.selectMany("dashboard_active_tasks", "select=*&order=due_date.asc");
  }

  async getTechnicianWorkload() {
    return this.selectMany(
      "dashboard_technician_workload",
      "select=*&order=open_task_count.desc,full_name.asc",
    );
  }

  async getProjectSummary() {
    return this.selectMany("dashboard_project_summary", "select=*&order=project_nr.asc");
  }

  async getRecentDispatches() {
    return this.selectMany(
      "dashboard_recent_dispatches",
      "select=*&order=created_at.desc&limit=8",
    );
  }

  async getCalendarEventsForProject(projectMatchId) {
    return this.selectMany(
      "hero_calendar_events",
      `select=*&hero_project_match_id=eq.${projectMatchId}&order=starts_at.asc&limit=5`,
    );
  }

  async getLogbookEntriesForProject(projectMatchId) {
    return this.selectMany(
      "hero_logbook_entries",
      `select=*&hero_project_match_id=eq.${projectMatchId}&order=created_on.desc&limit=5`,
    );
  }

  async getDocumentsForProject(projectMatchId) {
    return this.selectMany(
      "hero_documents",
      `select=*&hero_project_match_id=eq.${projectMatchId}&order=created_at.desc&limit=5`,
    );
  }

  async getProjectNotesForProject(projectMatchId) {
    return this.selectMany(
      "project_notes",
      `select=*&hero_project_match_id=eq.${projectMatchId}&order=created_at.desc&limit=5`,
    );
  }

  async getTimeLogsForProject(projectMatchId) {
    return this.selectMany(
      "time_logs",
      `select=*&hero_project_match_id=eq.${projectMatchId}&order=started_at.desc&limit=6`,
    );
  }

  async getInvoicesAtRisk() {
    return this.selectMany(
      "invoices",
      "select=*&status=in.(sent,partially_paid,overdue)&order=due_on.asc&limit=8",
    );
  }

  async getOpenQuotes() {
    return this.selectMany(
      "quotes",
      "select=*&status=in.(draft,sent)&order=created_at.desc&limit=8",
    );
  }

  async createDispatchRun({ status, tasksConsidered, tasksChanged, summary }) {
    return this.insert("dispatch_runs", {
      status,
      tasks_considered: tasksConsidered,
      tasks_changed: tasksChanged,
      summary,
    });
  }

  async createDispatchDecision({
    dispatchRunId,
    heroTaskId,
    actionType,
    oldTargetUserId,
    newTargetUserId,
    oldDueDate,
    newDueDate,
    confidence,
    reason,
    applied,
  }) {
    return this.insert("dispatch_decisions", {
      dispatch_run_id: dispatchRunId,
      hero_task_id: heroTaskId,
      action_type: actionType,
      old_target_user_id: oldTargetUserId,
      new_target_user_id: newTargetUserId,
      old_due_date: oldDueDate,
      new_due_date: newDueDate,
      confidence,
      reason,
      applied,
      applied_at: applied ? new Date().toISOString() : null,
    });
  }

  async updateTaskAssignmentAndDueDate({ heroTaskId, targetUserId, dueDate }) {
    return this.patch("hero_tasks", `hero_task_id=eq.${heroTaskId}`, {
      hero_target_user_id: targetUserId,
      due_date: dueDate,
    });
  }

  async getHealthSnapshot() {
    const [users, tasks, events] = await Promise.all([
      this.selectSingle("hero_users", "select=hero_user_id"),
      this.selectSingle("hero_tasks", "select=hero_task_id"),
      this.selectSingle("dispatcher_events", "select=id"),
    ]);

    return {
      connected: true,
      hasUsers: Boolean(users),
      hasTasks: Boolean(tasks),
      hasEvents: Boolean(events),
    };
  }
}

module.exports = { SupabaseRepository };
