class HeroClient {
  constructor(config) {
    this.endpoint = config.heroApiUrl;
    this.token = config.heroApiToken;
  }

  isConfigured() {
    return Boolean(this.token);
  }

  async updateTask({ taskId, targetUserId, dueDate }) {
    if (!this.isConfigured()) {
      return {
        skipped: true,
        reason: "HERO_API_TOKEN is not configured.",
      };
    }

    const response = await fetch(this.endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          mutation UpdateTask($task: TaskInput) {
            update_task(task: $task) {
              id
              target_user_id
              due_date
            }
          }
        `,
        variables: {
          task: {
            id: taskId,
            target_user_id: targetUserId,
            due_date: dueDate,
          },
        },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`HERO update_task failed: ${text}`);
    }

    const data = await response.json();
    if (data.errors?.length) {
      throw new Error(`HERO GraphQL error: ${data.errors[0].message}`);
    }

    return data.data.update_task;
  }
}

module.exports = { HeroClient };
