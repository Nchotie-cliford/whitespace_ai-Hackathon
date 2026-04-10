# Hero.ai

AI voice copilot for trades dispatchers.

## What We Built

Hero.ai is an AI-powered scheduling and dispatch assistant for trades businesses. A manager can speak naturally into the app:

- `Max is sick this week, who should cover his jobs?`
- `Which projects will be affected by rain this week?`
- `Who is working on this project?`

The assistant turns that spoken request into a context-aware operational answer using live Supabase demo data:

- active tasks
- assigned technicians
- skills and availability
- project history
- calendar events
- recent dispatch decisions
- documents and line items

It then returns:

- a short operator-facing decision on screen
- a separate spoken brief prepared for ElevenLabs
- a clear next action when the request is actionable

## The Problem

Trades business owners and dispatchers are constantly switching between phone calls, WhatsApp, spreadsheets, and gut feeling.

When a technician is delayed or unavailable, the real problem is not just moving one task. It is understanding:

- which jobs are now at risk
- which customer gets affected first
- who is actually qualified to cover
- what should be delayed instead of reassigned

That decision usually lives in the dispatcher's head.

Hero.ai externalizes that judgment.

## The AI Feature

The core AI feature is a context-aware dispatch copilot with intent modes.

It does not treat every spoken request the same. It first determines whether the user is asking for:

- an action
- a planning overview
- a staffing/status answer
- a project summary

Then it pulls the right context from Supabase and answers in the right format.

Examples:

- `Max is sick this week`
  - action mode
  - recommends the best cover technician

- `Which projects will be affected by rain this week?`
  - planning mode
  - identifies affected projects first instead of jumping straight into a reassignment

- `Who is working on this project?`
  - status mode
  - answers with staffing context instead of rescheduling logic

## Why This Is Valuable

This solves a real daily trades-business pain point:

- faster dispatch decisions
- less mental overhead under pressure
- fewer missed appointments
- better use of skilled technicians
- safer handling of disruptions like weather, sickness, and delays

## What Makes It Different

The key idea is not just rescheduling.

The app is designed to reason about:

- cascade risk
- skill fit
- disruption impact
- safer fallback options

It also speaks back in natural, operator-friendly language rather than raw scoring output.

## Stack

- Next.js app router
- Claude API for reasoning
- ElevenLabs for speech-to-text and text-to-speech
- Supabase/Postgres for demo operational data
- Optional HERO integration hooks for applying confirmed changes

## Dataset

The project uses one unified Supabase schema and one unified seed file:

- `database_schema.sql`
- `database_seed.sql`

The seed models one growing trades business with a challenge-scale customer base and historical operating data. It includes:

- 50+ customers
- 6 months of historical projects and jobs
- quotes and quote line items
- invoices and invoice line items
- payment history
- time tracking logs
- project notes and logbook-style context
- calendar events and documents
- materials used and equipment assets

This gives the AI enough context to answer more than dispatch questions. It can also support future features around quoting, invoicing, collections, project briefing, profitability, and field execution.

## Data Model

The unified database covers four layers:

- operational mirror tables for users, customers, projects, tasks, addresses
- dispatch intelligence for skills, flexibility, business value, events, and decisions
- project context for workflow steps, calendar events, notes, documents, and materials
- business history for quotes, invoices, payments, time logs, and equipment

## How To Run

1. Copy `.env.example` to `.env`
2. Add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
   - `ELEVENLABS_API_KEY`
3. Seed Supabase using:
   - `database_schema.sql`
   - `database_seed.sql`
4. Start the app:

```bash
npm run dev
```

Open:

- `http://localhost:3000/`
- `http://localhost:3000/health`

## Important Setup Note

Use the real Supabase `service_role` key for the backend.

The publishable key will not work for protected backend reads because RLS is enabled.

## Useful Checks

```bash
npm run check:db
node test/run-tests.js
```

Example SQL checks in Supabase:

```sql
select count(*) from hero_customers;
select count(*) from hero_project_matches;
select count(*) from hero_tasks;
select count(*) from quotes;
select count(*) from invoices;
select count(*) from payments;
select count(*) from time_logs;
select count(*) from project_notes;
```

## AI Approach

The AI pipeline works in 4 stages:

1. Speech or text input
2. Intent-aware context retrieval from Supabase
3. Claude reasoning over live task, technician, and project context
4. Human-friendly response formatting for:
   - on-screen decision text
   - spoken ElevenLabs brief

If AI is unavailable, the system falls back to a deterministic dispatch engine.

## What We Would Build Next

- stronger planning-mode answers across multiple projects
- deeper use of document history and logbook patterns
- customer communication drafting
- invoice, quote, and time-tracking copilots
- tighter HERO write-back for confirmed decisions

## Submission Summary

This project focuses on one sharp idea:

An AI copilot that helps a trades dispatcher understand disruption, answer operational questions naturally, and make better decisions faster.
