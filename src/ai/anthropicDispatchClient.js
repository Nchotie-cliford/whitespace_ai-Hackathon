function safeParseJson(rawText) {
  const trimmed = String(rawText || "").trim();

  if (!trimmed) {
    throw new Error("Claude returned an empty response.");
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : trimmed;
  return JSON.parse(candidate);
}

class AnthropicDispatchClient {
  constructor(config) {
    this.apiKey = config.anthropicApiKey;
    this.model = config.anthropicModel;
    this.version = config.anthropicVersion;
  }

  isConfigured() {
    return Boolean(this.apiKey);
  }

  async resolveIncident(promptPayload) {
    if (!this.isConfigured()) {
      throw new Error("ANTHROPIC_API_KEY is not configured.");
    }

    const systemPrompt = [
      "You are an AI dispatch copilot for a German trades business.",
      "You reason from a spoken field disruption and recommend the best operational response.",
      "Your users are busy field managers with little patience and little technical tolerance.",
      "Be simple, direct, human, and task-focused.",
      "Do not sound creative, verbose, speculative, or chatty.",
      "Do not mention scores, ties, raw ranking numbers, or internal reasoning mechanics.",
      "Do not dump all findings back to the user. Give one action, one main reason, and one short risk note.",
      "Prefer plain operational language such as 'Reassign to Sarah Lenz' or 'Delay the visit until 14:00'.",
      "Also prepare a short spoken brief for text-to-speech. It should sound natural when read aloud in a car: 1 to 2 sentences, direct, calm, and easy to understand on first listen.",
      "When possible, phrase the spoken brief like a human assistant: 'The best person to cover this is Sarah Lenz because she is the safest available fit.'",
      "If the request is broad, such as 'Max is sick this week', interpret it as a planning problem across that time window, not a single-task problem.",
      "If the request explicitly asks to remove one worker and replace them with another, treat it as a crew change. Confirm who is being removed, who will replace them, what project or task is affected, and one watch-out.",
      "If the request asks what a replacement worker needs to know before taking over, produce a handover summary: current project, assigned worker, key note from site history, one operational watch-out, and what to do first.",
      "If the request asks what to know before arrival, produce an arrival brief: top project facts, current worker, main issue, and one watch-out.",
      "If the request asks what needs attention today, produce a daily ops brief: top priorities first, then one main risk.",
      "Prioritize cascade risk, customer impact, legal or skill fit, proximity, workload, and minimal downstream disruption.",
      "Use the provided live database context as ground truth.",
      "If a strong baseline recommendation already exists from the live workload and skills data, do not downgrade it to manual_review unless the payload clearly shows missing or contradictory data.",
      "Be concrete. Mention the actual project, task, worker, and best candidate when they are present in the payload.",
      "Avoid vague phrases like 'likely to miss' when the task, city, and assignee are already identified.",
      "Return operational JSON only, not prose.",
      JSON.stringify({
        problemSummary: "string",
        cascadeSeverity: "critical|high|medium|low",
        cascadeScore: 0,
        cascadeExplanation: "string",
        recommendedAction: {
          type: "reassign|delay|manual_review",
          targetUserId: 0,
          targetUserName: "string",
          dueDate: "ISO timestamp or null",
        },
        why: ["one short main reason"],
        residualRisk: "string",
        confidence: 0.0,
        dispatcherBrief: "one short operator brief",
        spokenBrief: "one short spoken brief for text-to-speech",
        displayMode: "action|planning|status|summary|arrival_brief|daily_brief|handover_summary|crew_change",
      }),
    ].join("\n");

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": this.apiKey,
        "anthropic-version": this.version,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 1200,
        system: systemPrompt,
        messages: [
          {
            role: "user",
            content: JSON.stringify(promptPayload),
          },
        ],
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Anthropic request failed: ${text}`);
    }

    const data = await response.json();
    const contentBlocks = Array.isArray(data?.content) ? data.content : [];
    const text = contentBlocks
      .filter((block) => block?.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    return safeParseJson(text);
  }
}

module.exports = { AnthropicDispatchClient };
