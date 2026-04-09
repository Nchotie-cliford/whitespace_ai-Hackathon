# Dispatcher Architecture: Pure LLM Engine (MVP)

## Technical Approach (Option 1)
For the hackathon MVP, we are building a **Pure LLM Dispatcher**. This approach leverages a Large Language Model (e.g., Google's `gemini-2.5-flash` or `gemini-2.5-pro`) to act as the primary reasoning engine for scheduling and task assignment. 

By using the LLM directly, we avoid building complex mathematical routing algorithms (like Google OR-Tools) which are time-consuming and rigid. Instead, we lean into the AI's ability to intuitively understand "fuzzier" constraints (e.g., emergencies, sick workers, proximity) based on natural language prompting combined with structured data.

### The Contract
Because our team *only* owns the Dispatcher, we define a strict contract between the Data Layer and the UI.
1. **Input:** We expect a JSON payload containing the current state of the world: a list of `Technicians` (with availability/skills), a list of `Jobs` (with location/requirements), and the `Trigger` event (e.g., "Worker A is sick").
2. **Processing:** We serialize this JSON and pass it to the LLM via the `google-genai` core SDK, utilizing **Structured Outputs** to force the LLM to reply firmly with a valid JSON array.
3. **Output:** We emit a strictly formatted JSON list of assigned tasks back to the Data Layer to be written to the database.

### Why this works for the Hackathon:
* **Speed of Delivery:** We can build and test this in an hour.
* **Resilience:** LLMs are great at parsing messy or incomplete data payloads without crashing.
* **"Wow" Factor:** It demonstrates genuine AI reasoning adapting schedules on the fly rather than just hardcoded logic loops.
