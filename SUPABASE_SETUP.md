# Supabase Setup

## Goal

Set up a Supabase database for the AI Dispatcher MVP with:

- a lean HERO mirror
- dispatcher-specific tables
- optional `pgvector` support for future semantic features

## Files

- `supabase_schema.sql`: main database schema
- `seed_sample_data.sql`: realistic MVP sample dataset
- `dashboard_views.sql`: dashboard-friendly read views
- `recommendation_api.sql`: first recommendation RPC/function

## First Setup Steps

1. Create a new Supabase project.
2. Open the SQL Editor.
3. Paste and run `supabase_schema.sql`.
4. Verify that these core tables exist:
   - `hero_users`
   - `hero_addresses`
   - `hero_customers`
   - `hero_project_matches`
   - `hero_tasks`
   - `technician_profiles`
   - `task_overrides`
   - `dispatcher_events`
   - `dispatch_runs`
   - `dispatch_decisions`
   - `input_messages`
5. Run `seed_sample_data.sql`.
6. Run `dashboard_views.sql`.
7. Run `recommendation_api.sql`.

## Security Note

The schema enables Row Level Security on all public tables.

That means:

- browser clients will not be able to read or write these tables by default
- your backend can still access them using the Supabase service role key

This is the safest MVP setup for now because dispatcher data includes:

- internal operational records
- customer-related data
- manager voice/text input
- decision logs

If you later want frontend users to query tables directly, add explicit RLS policies for authenticated users.

## MVP-Critical Tables

These are enough to build the first version:

- `hero_users`
- `hero_customers`
- `hero_project_matches`
- `hero_tasks`
- `technician_profiles`
- `task_overrides`
- `dispatcher_events`
- `dispatch_runs`
- `dispatch_decisions`
- `input_messages`

## Optional For Later

- `hero_addresses`
  - useful for richer location-based logic
- `knowledge_chunks`
  - useful once you want semantic retrieval with `pgvector`

## Why This Structure

- HERO remains the system of record.
- Supabase stores only the mirrored subset needed for fast reasoning.
- Dispatcher-specific fields stay outside HERO so the AI can use custom business logic safely.

## Next Recommended Step

Use the sample dataset to test:

- a 15-person company including one manager
- 12 active projects across Germany
- 24 tasks
- several disruption and recommendation examples

After that, the next best step is wiring a simple HERO sync job or building the first recommendation API.

## Useful Test Queries

```sql
select * from dashboard_active_tasks order by due_date asc;
select * from dashboard_technician_workload order by open_task_count desc, full_name asc;
select * from dashboard_project_summary order by project_nr asc;
select * from dashboard_recent_dispatches;
```

## First Recommendation API Example

```sql
select * from recommend_dispatch_action('7ec6a421-67dc-4f39-a97b-10c6f07f6f01');
select * from recommend_dispatch_action('7ec6a421-67dc-4f39-a97b-10c6f07f6f03');
```
