# Hero.ai System Overview

## Purpose

Hero.ai is a voice-first AI copilot for trades managers and dispatchers. It is designed to turn spoken or typed operational questions into grounded, short, usable answers backed by live Supabase data.

The system is not just a chatbot. It combines:

- speech-to-text
- intent detection
- task and technician matching
- project context retrieval
- LLM reasoning
- deterministic fallback logic
- optional write-back to HERO

The result is an assistant that can help with field disruption decisions, project briefings, staffing questions, and operational summaries.

## Implemented AI Use Cases

The current AI use cases are implemented through `requestMode` detection in [src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js) and then shaped in [src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js).

### 1. Action Mode

This is the core dispatch mode.

Typical prompts:

- `Max is sick today. Who should cover his jobs?`
- `Jonas is stuck in traffic and will miss the Dresden switch install.`
- `Move the urgent electrical task to the best available technician.`

What it does:

- detects the disruption type
- matches the technician and/or task
- calculates cascade risk
- finds replacement candidates from technician workload and skills
- returns a recommended action:
  - `reassign`
  - `delay`
  - `manual_review`

Primary files:

- [src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js)
- [src/dispatch/scoring.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\scoring.js)
- [src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js)

### 2. Planning Mode

This mode answers broader planning questions instead of forcing a single action.

Typical prompts:

- `Which projects will be affected by rain this week?`
- `What jobs are at risk this afternoon?`

What it does:

- finds affected projects instead of jumping directly into reassignment
- highlights the most exposed project first
- can suggest a best move, usually around delay or review

Important behavior:

- planning mode prefers a multi-project answer shape
- the UI shows a planning summary rather than a direct apply button

Primary files:

- [src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js)
- [src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js)

### 3. Status Mode

This mode answers staffing questions.

Typical prompts:

- `Who is working on this project?`
- `Who is assigned here right now?`

What it does:

- resolves the current matched project/task
- uses staffing and task context
- responds with a status-oriented answer rather than rescheduling language

Primary files:

- [src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js)
- [src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js)

### 4. Summary Mode

This mode gives a project or task summary.

Typical prompts:

- `Summarize this project.`
- `What do I need to know about this job?`

What it does:

- builds a compact summary using matched task and project context
- is designed for fast comprehension, not detailed reporting

Primary files:

- [src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js)
- [src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js)

### 5. Arrival Brief

This mode prepares a worker or manager before reaching the site.

Typical prompts:

- `What should I know before I arrive?`
- `What do I need to know before I get there?`

What it does:

- retrieves project notes
- retrieves recent logbook and calendar context
- retrieves documents and time logs
- produces a short `before you arrive` brief with one watch-out

Primary files:

- [src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js)
- [src/dashboard/dashboardService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dashboard\dashboardService.js)
- [src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js)

### 6. Daily Ops Brief

This mode gives a top-level summary of what needs attention today.

Typical prompts:

- `What needs attention today?`
- `What should I focus on today?`
- `What is at risk today?`

What it does:

- pulls the live snapshot
- identifies at-risk tasks
- checks overloaded or unavailable technicians
- checks invoices at risk and open quotes
- returns a `what matters now` brief

Primary files:

- [src/dashboard/dashboardService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dashboard\dashboardService.js)
- [src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js)
- [src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js)

### 7. Worker Handover Summary

This is the newest dedicated mode and one of the most practical operational features.

Typical prompts:

- `What does Sarah need to know before taking over this job?`
- `Give me a handover for this project.`
- `What should the next worker know before taking over?`

What it does:

- detects takeover/handover intent
- retrieves grounded project context
- combines:
  - current assigned worker
  - top note or logbook item
  - recent work log
  - related document type when available
- returns a short, worker-ready handover brief

Primary files:

- [src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js)
- [src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js)

### 8. Voice In / Voice Out

This is not just a UI convenience. It is a core AI interaction mode.

Input:

- audio recorded in browser
- server-side transcription via ElevenLabs speech-to-text

Output:

- separate `spokenBrief` prepared for text-to-speech
- spoken aloud via ElevenLabs TTS
- browser speech or local replay fallback behavior still exists

Primary files:

- [src/components/CopilotClient.jsx](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\components\CopilotClient.jsx)
- [src/app/api/audio/transcribe/route.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\api\audio\transcribe\route.js)
- [src/app/api/audio/brief/route.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\api\audio\brief\route.js)
- [src/audio/elevenLabsClient.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\audio\elevenLabsClient.js)

## Incident Types

The action engine also classifies disruption type.

Implemented incident categories:

- `weather_disruption`
- `traffic_delay`
- `technician_unavailable`
- `urgent_insert`
- `general_disruption`

These are detected in [src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js).

They affect:

- cascade scoring
- whether the engine prefers delay or reassignment
- whether multiple affected projects are collected

## Technical Stack

### Frontend

- Next.js 14 app router
- React 18
- CSS variables and custom styling in [src/app/globals.css](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\globals.css)

Key frontend components:

- [src/components/CopilotClient.jsx](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\components\CopilotClient.jsx)
  - main voice/text interaction shell
  - microphone recording
  - theme switching
  - audio playback
- [src/components/DecisionSheet.jsx](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\components\DecisionSheet.jsx)
  - on-screen answer rendering
  - mode-specific copy and actions
- [src/components/BoardDrawer.jsx](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\components\BoardDrawer.jsx)
  - planner/schedule drawer
  - project/task inspection
  - current assignment context

### Backend / API

The app uses Next.js API routes as the backend orchestration layer.

Key API routes:

- [src/app/api/dispatch/resolve/route.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\api\dispatch\resolve\route.js)
  - main AI resolution endpoint
- [src/app/api/dispatch/apply/route.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\api\dispatch\apply\route.js)
  - applies confirmed action
- [src/app/api/dashboard/route.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\api\dashboard\route.js)
  - live board snapshot
- [src/app/api/audio/transcribe/route.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\api\audio\transcribe\route.js)
  - speech-to-text endpoint
- [src/app/api/audio/brief/route.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\api\audio\brief\route.js)
  - text-to-speech endpoint
- [src/app/api/health/route.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\api\health\route.js)
  - runtime health/status

### AI / Reasoning

- Anthropic Claude Messages API
- JSON-only operational output contract
- model prompt designed for:
  - directness
  - low cognitive load
  - no score dumping
  - short spoken output

Primary file:

- [src/ai/anthropicDispatchClient.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\anthropicDispatchClient.js)

### Voice

- ElevenLabs speech-to-text
- ElevenLabs text-to-speech
- browser media recording
- unlocked playback path for mobile/Safari behavior

Primary files:

- [src/audio/elevenLabsClient.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\audio\elevenLabsClient.js)
- [src/components/CopilotClient.jsx](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\components\CopilotClient.jsx)

### Data Layer

- Supabase / Postgres
- REST access through PostgREST
- RLS-protected tables
- service-role backend access

Primary repository:

- [src/data/supabaseRepository.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\data\supabaseRepository.js)

Local fallback/demo repository:

- [src/data/mockRepository.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\data\mockRepository.js)

### Optional External Write-Back

- HERO GraphQL `update_task`

Primary file:

- [src/hero/heroClient.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\hero\heroClient.js)

## Database / Data Dependencies

The unified schema is in:

- [database_schema.sql](C:\Users\cliff\OneDrive\Dokumente\New%20project\database_schema.sql)

The unified seed is in:

- [database_seed.sql](C:\Users\cliff\OneDrive\Dokumente\New%20project\database_seed.sql)

### Core Operational Tables

- `hero_users`
- `hero_addresses`
- `hero_customers`
- `hero_project_matches`
- `hero_tasks`

These support:

- task matching
- staffing answers
- dispatch actions
- project summaries

### Dispatch Intelligence Tables

- `technician_profiles`
- `task_overrides`
- `dispatcher_events`
- `dispatch_runs`
- `dispatch_decisions`
- `input_messages`

These support:

- skills and zone fit
- business value and flexibility
- dispatch audit trail
- reasoning history

### Project Context Tables

- `hero_project_types`
- `hero_project_workflow_steps`
- `hero_measures`
- `hero_calendar_categories`
- `hero_calendar_events`
- `hero_logbook_entries`
- `hero_documents`
- `hero_document_line_items`
- `project_notes`
- `materials_used`
- `equipment_assets`

These support:

- arrival brief
- handover summary
- project summary
- future field execution AI features

### Commercial / History Tables

- `quotes`
- `quote_line_items`
- `invoices`
- `invoice_line_items`
- `payments`
- `time_logs`

These support:

- daily ops financial context
- invoice chase features
- profitability features
- quote drafting features

### Views and Functions

The app reads dashboard-oriented views:

- `dashboard_active_tasks`
- `dashboard_technician_workload`
- `dashboard_project_summary`
- `dashboard_recent_dispatches`

And the schema also contains:

- `recommend_dispatch_action(...)`

That function exists as a SQL-side recommendation helper, even though the main live app uses the Node/Claude orchestration path.

## Runtime Architecture Flow

## 1. Input Layer

The user speaks or types in [src/components/CopilotClient.jsx](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\components\CopilotClient.jsx).

Possible inputs:

- audio through the orb
- typed text through the text box

### Voice path

1. browser records audio with `MediaRecorder`
2. audio is posted to `/api/audio/transcribe`
3. ElevenLabs returns a transcript
4. transcript is passed to `/api/dispatch/resolve`

### Text path

1. text is typed directly
2. text goes straight to `/api/dispatch/resolve`

## 2. Resolve Endpoint

[src/app/api/dispatch/resolve/route.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\app\api\dispatch\resolve\route.js) builds the runtime services:

- repository
- dashboard service
- transcript fallback service
- Anthropic client
- dispatch AI service

Then it calls:

- `DispatchAiService.resolveTranscript({ transcript })`

## 3. Snapshot Retrieval

Inside [src/dashboard/dashboardService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dashboard\dashboardService.js), the app retrieves:

- active tasks
- technician workload
- project summary
- recent dispatches

This is the base operational snapshot.

## 4. Deterministic Grounding Layer

[src/dispatch/transcriptFallbackService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\transcriptFallbackService.js) performs the first-pass deterministic grounding:

- request mode detection
- incident type detection
- technician match
- task match
- affected project collection
- candidate scoring
- baseline recommendation

This layer is important because:

- it provides a usable fallback when AI is unavailable
- it anchors the later LLM output in real matched entities

## 5. Context Enrichment

[src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js) then enriches the baseline with deeper context:

- project notes
- calendar events
- logbook entries
- documents
- time logs
- daily ops context

This step uses:

- [src/dashboard/dashboardService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dashboard\dashboardService.js)
- [src/data/supabaseRepository.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\data\supabaseRepository.js)

## 6. LLM Reasoning

[src/ai/anthropicDispatchClient.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\anthropicDispatchClient.js) sends a JSON payload to Claude.

The prompt instructs Claude to:

- be direct and human
- avoid dumping raw scoring
- produce an operational JSON response
- generate a separate `spokenBrief`
- respect live DB context as ground truth

## 7. Merge and Guardrails

[src/ai/dispatchAiService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\ai\dispatchAiService.js) merges AI output with the grounded baseline.

Important safeguards:

- strong baseline actions are not downgraded to vague manual review unless necessary
- reassigning a task back to the current assignee is blocked
- brief-style modes prefer grounded baseline narrative over drifting AI wording
- dedicated display copy is built separately from spoken copy

## 8. Output Formatting

The service returns:

- `dispatcherBrief`
- `spokenBrief`
- `display`
- `recommendedAction`
- `cascadeRisk`
- `confidence`
- `problemSummary`

### Spoken output

`spokenBrief` is sent to ElevenLabs TTS or a fallback playback path.

### Screen output

[src/components/DecisionSheet.jsx](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\components\DecisionSheet.jsx) renders:

- mode badge
- headline
- subline
- what matters
- watch-out
- action button when the result is actionable

## 9. Apply Flow

When the user confirms an actionable recommendation:

1. frontend posts to `/api/dispatch/apply`
2. [src/dispatch/applyDispatchService.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\dispatch\applyDispatchService.js) writes:
   - `dispatch_runs`
   - `dispatch_decisions`
   - updated task assignment/due date
3. optional HERO `update_task` is attempted through [src/hero/heroClient.js](C:\Users\cliff\OneDrive\Dokumente\New%20project\src\hero\heroClient.js)

## Robustness Model

The project already implements several robustness layers:

### 1. Deterministic Fallback

If Claude is not configured or fails:

- the fallback service still returns a usable decision

### 2. Data Availability Guard

If the Supabase board is empty:

- the app returns a clear `data_unavailable` response

### 3. Safer Narrative Merge

For brief modes:

- grounded baseline context is favored to reduce hallucinated or off-topic text

### 4. Mobile Audio Safeguards

For voice playback:

- the app unlocks playback on user gesture
- it uses a Web Audio fallback path for Safari/mobile behavior

## Current Limitations

These are the main real limitations in the current codebase:

- no dedicated `crew_change` intent yet for removing a worker from a project and replacing them
- no invoice chase copilot implementation yet, even though the schema supports it
- no profitability analysis flow yet, though the data model supports future work
- mock repository does not simulate rich project context deeply
- output quality still depends on prompt discipline and grounding, especially for broad planning prompts

## Recommended Next Features

The next strongest AI features, based on the existing schema, are:

### 1. Crew Change

Example:

- `Remove Jonas from the Dresden project and replace him with Sarah.`

Why it fits:

- builds directly on current task/staffing logic
- extends action mode naturally

### 2. Invoice Chase Copilot

Example:

- `Which invoices should I chase this week?`

Why it fits:

- invoices and payments already exist in schema
- strong business impact

### 3. Profitability Warning

Example:

- `Which jobs are losing money?`

Why it fits:

- time logs, materials, and invoices already exist
- strong owner/operator value

## Summary

Hero.ai currently implements a real multi-mode AI operations layer for a trades business.

What is already live in the code:

- voice-to-dispatch workflow
- intent-aware answers
- grounded task and technician matching
- planning and briefing modes
- handover mode
- mobile-aware voice playback
- optional apply flow into HERO

The architecture is already split clearly into:

- input
- deterministic grounding
- context retrieval
- AI reasoning
- guarded merge
- display/voice output
- optional write-back

That makes the system a good base for extending beyond dispatch into quoting, collections, profitability, and broader business copilots.
