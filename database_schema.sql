-- ============================================================
-- FILE: database_schema.sql
-- PURPOSE: Unified schema for the full Hero.ai database
-- GENERATED FROM THE PREVIOUS SPLIT SQL PACK
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- SOURCE: supabase_schema.sql
-- ------------------------------------------------------------

-- ============================================================
-- FILE: supabase_schema.sql
-- PURPOSE: Core operational schema for the Hero.ai app
-- RUN ORDER: 1
--
-- This file creates the base Supabase schema used by the app:
--   * HERO mirror tables
--   * dispatch intelligence tables
--   * audit / input / semantic support tables
--
-- HERO remains the source of truth. Supabase stores the mirrored
-- subset needed for the demo plus AI-specific operational context.
-- ============================================================


CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TYPE technician_status AS ENUM (
  'active',
  'sick',
  'offline',
  'unavailable'
);

CREATE TYPE business_value_level AS ENUM (
  'low',
  'medium',
  'high'
);

CREATE TYPE dispatch_run_status AS ENUM (
  'started',
  'completed',
  'failed',
  'cancelled'
);

CREATE TYPE input_source AS ENUM (
  'text',
  'audio_transcript'
);

CREATE TYPE dispatch_action_type AS ENUM (
  'reassign',
  'delay',
  'manual_review'
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- HERO mirror tables
-- ------------------------------------------------------------

CREATE TABLE hero_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_user_id BIGINT NOT NULL UNIQUE,
  hero_partner_id BIGINT,
  email TEXT,
  role TEXT,
  first_name TEXT,
  last_name TEXT,
  full_name TEXT,
  partner_status TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_users_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE hero_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_address_id BIGINT NOT NULL UNIQUE,
  street TEXT,
  line_1 TEXT,
  line_2 TEXT,
  city TEXT,
  zipcode TEXT,
  country_code TEXT,
  country_name TEXT,
  full_address TEXT,
  maps_link TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_addresses_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE hero_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_customer_id BIGINT NOT NULL UNIQUE,
  hero_address_id BIGINT,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  full_name TEXT,
  email TEXT,
  phone_home TEXT,
  phone_mobile TEXT,
  category TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_customers_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE hero_project_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_project_match_id BIGINT NOT NULL UNIQUE,
  hero_customer_id BIGINT,
  hero_contact_id BIGINT,
  hero_address_id BIGINT,
  name TEXT,
  project_title TEXT,
  project_nr TEXT,
  display_id TEXT,
  partner_notes TEXT,
  project_type TEXT,
  type_id BIGINT,
  current_status_id BIGINT,
  status_name TEXT,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_project_matches_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE hero_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_task_id BIGINT NOT NULL UNIQUE,
  hero_author_user_id BIGINT,
  hero_target_user_id BIGINT,
  hero_target_project_match_id BIGINT,
  title TEXT,
  comment TEXT,
  due_date TIMESTAMPTZ,
  start_at TIMESTAMPTZ,
  end_at TIMESTAMPTZ,
  done_date TIMESTAMPTZ,
  is_done BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_tasks_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

-- ------------------------------------------------------------
-- Dispatcher tables
-- ------------------------------------------------------------

CREATE TABLE technician_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_user_id BIGINT NOT NULL UNIQUE,
  name TEXT,
  status technician_status NOT NULL DEFAULT 'active',
  geographic_zone TEXT,
  skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT technician_profiles_skills_is_array
    CHECK (jsonb_typeof(skills) = 'array')
);

CREATE TABLE task_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_task_id BIGINT NOT NULL UNIQUE,
  business_value business_value_level NOT NULL DEFAULT 'medium',
  is_flexible BOOLEAN NOT NULL DEFAULT TRUE,
  required_skills JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT task_overrides_required_skills_is_array
    CHECK (jsonb_typeof(required_skills) = 'array')
);

CREATE TABLE dispatcher_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  target_id TEXT,
  message TEXT,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT dispatcher_events_payload_is_object
    CHECK (jsonb_typeof(payload) = 'object')
);

CREATE TABLE dispatch_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_event_id UUID REFERENCES dispatcher_events(id) ON DELETE SET NULL,
  status dispatch_run_status NOT NULL DEFAULT 'started',
  tasks_considered INTEGER NOT NULL DEFAULT 0,
  tasks_changed INTEGER NOT NULL DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  CONSTRAINT dispatch_runs_task_counts_non_negative
    CHECK (tasks_considered >= 0 AND tasks_changed >= 0)
);

CREATE TABLE dispatch_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_run_id UUID NOT NULL REFERENCES dispatch_runs(id) ON DELETE CASCADE,
  hero_task_id BIGINT NOT NULL,
  action_type dispatch_action_type NOT NULL,
  old_target_user_id BIGINT,
  new_target_user_id BIGINT,
  old_due_date TIMESTAMPTZ,
  new_due_date TIMESTAMPTZ,
  confidence NUMERIC(5,4),
  reason TEXT NOT NULL,
  applied BOOLEAN NOT NULL DEFAULT FALSE,
  applied_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT dispatch_decisions_confidence_range
    CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 1))
);

CREATE TABLE input_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source input_source NOT NULL,
  session_key TEXT,
  raw_text TEXT NOT NULL,
  normalized_text TEXT,
  parsed_intent TEXT,
  extracted_entities JSONB NOT NULL DEFAULT '{}'::jsonb,
  hero_project_match_id BIGINT,
  hero_task_id BIGINT,
  hero_user_id BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT input_messages_extracted_entities_is_object
    CHECK (jsonb_typeof(extracted_entities) = 'object')
);

-- Optional semantic layer for future voice/text retrieval.
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL,
  source_key TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT knowledge_chunks_metadata_is_object
    CHECK (jsonb_typeof(metadata) = 'object')
);

-- ------------------------------------------------------------
-- Foreign keys across mirror tables
-- ------------------------------------------------------------

ALTER TABLE hero_customers
  ADD CONSTRAINT hero_customers_address_fk
  FOREIGN KEY (hero_address_id)
  REFERENCES hero_addresses(hero_address_id)
  ON DELETE SET NULL;

ALTER TABLE hero_project_matches
  ADD CONSTRAINT hero_project_matches_customer_fk
  FOREIGN KEY (hero_customer_id)
  REFERENCES hero_customers(hero_customer_id)
  ON DELETE SET NULL;

ALTER TABLE hero_project_matches
  ADD CONSTRAINT hero_project_matches_contact_fk
  FOREIGN KEY (hero_contact_id)
  REFERENCES hero_customers(hero_customer_id)
  ON DELETE SET NULL;

ALTER TABLE hero_project_matches
  ADD CONSTRAINT hero_project_matches_address_fk
  FOREIGN KEY (hero_address_id)
  REFERENCES hero_addresses(hero_address_id)
  ON DELETE SET NULL;

ALTER TABLE hero_tasks
  ADD CONSTRAINT hero_tasks_author_fk
  FOREIGN KEY (hero_author_user_id)
  REFERENCES hero_users(hero_user_id)
  ON DELETE SET NULL;

ALTER TABLE hero_tasks
  ADD CONSTRAINT hero_tasks_target_fk
  FOREIGN KEY (hero_target_user_id)
  REFERENCES hero_users(hero_user_id)
  ON DELETE SET NULL;

ALTER TABLE hero_tasks
  ADD CONSTRAINT hero_tasks_project_fk
  FOREIGN KEY (hero_target_project_match_id)
  REFERENCES hero_project_matches(hero_project_match_id)
  ON DELETE SET NULL;

ALTER TABLE technician_profiles
  ADD CONSTRAINT technician_profiles_user_fk
  FOREIGN KEY (hero_user_id)
  REFERENCES hero_users(hero_user_id)
  ON DELETE CASCADE;

ALTER TABLE task_overrides
  ADD CONSTRAINT task_overrides_task_fk
  FOREIGN KEY (hero_task_id)
  REFERENCES hero_tasks(hero_task_id)
  ON DELETE CASCADE;

ALTER TABLE dispatch_decisions
  ADD CONSTRAINT dispatch_decisions_task_fk
  FOREIGN KEY (hero_task_id)
  REFERENCES hero_tasks(hero_task_id)
  ON DELETE CASCADE;

-- ------------------------------------------------------------
-- Indexes
-- ------------------------------------------------------------

CREATE INDEX idx_hero_users_email
  ON hero_users(email);

CREATE INDEX idx_hero_customers_full_name
  ON hero_customers(full_name);

CREATE INDEX idx_hero_project_matches_project_nr
  ON hero_project_matches(project_nr);

CREATE INDEX idx_hero_project_matches_customer_id
  ON hero_project_matches(hero_customer_id);

CREATE INDEX idx_hero_tasks_target_user
  ON hero_tasks(hero_target_user_id);

CREATE INDEX idx_hero_tasks_project_match
  ON hero_tasks(hero_target_project_match_id);

CREATE INDEX idx_hero_tasks_due_date
  ON hero_tasks(due_date);

CREATE INDEX idx_hero_tasks_open
  ON hero_tasks(is_done, is_deleted);

CREATE INDEX idx_technician_profiles_status
  ON technician_profiles(status);

CREATE INDEX idx_technician_profiles_zone
  ON technician_profiles(geographic_zone);

CREATE INDEX idx_technician_profiles_skills_gin
  ON technician_profiles
  USING GIN (skills);

CREATE INDEX idx_task_overrides_business_value
  ON task_overrides(business_value);

CREATE INDEX idx_task_overrides_is_flexible
  ON task_overrides(is_flexible);

CREATE INDEX idx_task_overrides_required_skills_gin
  ON task_overrides
  USING GIN (required_skills);

CREATE INDEX idx_dispatcher_events_event_type
  ON dispatcher_events(event_type);

CREATE INDEX idx_dispatch_runs_status
  ON dispatch_runs(status);

CREATE INDEX idx_dispatch_decisions_run_id
  ON dispatch_decisions(dispatch_run_id);

CREATE INDEX idx_dispatch_decisions_task_id
  ON dispatch_decisions(hero_task_id);

CREATE INDEX idx_input_messages_session_key
  ON input_messages(session_key);

CREATE INDEX idx_input_messages_project_match
  ON input_messages(hero_project_match_id);

CREATE INDEX idx_knowledge_chunks_source
  ON knowledge_chunks(source_type, source_key);

-- Use ivfflat after you have enough rows to justify vector search.
-- CREATE INDEX idx_knowledge_chunks_embedding
--   ON knowledge_chunks
--   USING ivfflat (embedding vector_cosine_ops)
--   WITH (lists = 100);

-- ------------------------------------------------------------
-- Updated-at triggers
-- ------------------------------------------------------------

CREATE TRIGGER trg_hero_users_updated_at
BEFORE UPDATE ON hero_users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_addresses_updated_at
BEFORE UPDATE ON hero_addresses
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_customers_updated_at
BEFORE UPDATE ON hero_customers
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_project_matches_updated_at
BEFORE UPDATE ON hero_project_matches
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_tasks_updated_at
BEFORE UPDATE ON hero_tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_technician_profiles_updated_at
BEFORE UPDATE ON technician_profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_task_overrides_updated_at
BEFORE UPDATE ON task_overrides
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_knowledge_chunks_updated_at
BEFORE UPDATE ON knowledge_chunks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

ALTER TABLE hero_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_project_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE technician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatcher_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE dispatch_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE input_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;

-- MVP-safe default:
-- no client-side access is granted yet.
-- Use the Supabase service role in your backend for sync, dispatch, and admin workflows.


-- ------------------------------------------------------------
-- SOURCE: demo_extension_schema.sql
-- ------------------------------------------------------------

-- ============================================================
-- FILE: demo_extension_schema.sql
-- PURPOSE: Rich demo context schema
-- RUN ORDER: 4
--
-- Adds richer HERO-style entities for better AI context:
--   * project types and workflow steps
--   * products and document types
--   * calendar categories and events
--   * logbook entries and documents
--   * demo trigger events
-- ============================================================


CREATE TABLE IF NOT EXISTS hero_project_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_project_type_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_project_types_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE IF NOT EXISTS hero_project_workflow_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_workflow_step_id BIGINT NOT NULL UNIQUE,
  hero_project_type_id BIGINT NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_project_workflow_steps_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE IF NOT EXISTS hero_measures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_measure_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  short_code TEXT,
  skill_mapping JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_measures_skill_mapping_is_array
    CHECK (jsonb_typeof(skill_mapping) = 'array'),
  CONSTRAINT hero_measures_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE IF NOT EXISTS hero_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_product_id TEXT NOT NULL UNIQUE,
  nr TEXT,
  name TEXT NOT NULL,
  base_price NUMERIC(12,2),
  list_price NUMERIC(12,2),
  sales_price NUMERIC(12,2),
  vat_percent NUMERIC(5,2),
  unit_type TEXT,
  category TEXT,
  description TEXT,
  manufacturer TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_products_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE IF NOT EXISTS hero_document_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_document_type_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  base_type TEXT NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_document_types_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE IF NOT EXISTS hero_calendar_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_calendar_category_id BIGINT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_calendar_categories_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE IF NOT EXISTS hero_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_calendar_event_id BIGINT NOT NULL UNIQUE,
  hero_project_match_id BIGINT,
  hero_calendar_category_id BIGINT,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  partner_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_calendar_events_partner_ids_is_array
    CHECK (jsonb_typeof(partner_ids) = 'array'),
  CONSTRAINT hero_calendar_events_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE IF NOT EXISTS hero_logbook_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_logbook_entry_id BIGINT NOT NULL UNIQUE,
  hero_project_match_id BIGINT,
  custom_text TEXT NOT NULL,
  created_on TIMESTAMPTZ,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_logbook_entries_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE IF NOT EXISTS hero_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_document_id BIGINT NOT NULL UNIQUE,
  hero_project_match_id BIGINT,
  hero_document_type_id BIGINT,
  type_name TEXT,
  is_published BOOLEAN NOT NULL DEFAULT FALSE,
  document_url TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT hero_documents_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE IF NOT EXISTS hero_document_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_document_id BIGINT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(12,2),
  unit_type TEXT,
  net_price NUMERIC(12,2),
  vat_percent NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS demo_trigger_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT,
  message TEXT NOT NULL,
  triggered_at TIMESTAMPTZ NOT NULL,
  affected_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT demo_trigger_events_affected_tasks_is_array
    CHECK (jsonb_typeof(affected_tasks) = 'array'),
  CONSTRAINT demo_trigger_events_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

ALTER TABLE hero_project_workflow_steps
  ADD CONSTRAINT hero_project_workflow_steps_type_fk
  FOREIGN KEY (hero_project_type_id)
  REFERENCES hero_project_types(hero_project_type_id)
  ON DELETE CASCADE;

ALTER TABLE hero_calendar_events
  ADD CONSTRAINT hero_calendar_events_project_fk
  FOREIGN KEY (hero_project_match_id)
  REFERENCES hero_project_matches(hero_project_match_id)
  ON DELETE SET NULL;

ALTER TABLE hero_calendar_events
  ADD CONSTRAINT hero_calendar_events_category_fk
  FOREIGN KEY (hero_calendar_category_id)
  REFERENCES hero_calendar_categories(hero_calendar_category_id)
  ON DELETE SET NULL;

ALTER TABLE hero_logbook_entries
  ADD CONSTRAINT hero_logbook_entries_project_fk
  FOREIGN KEY (hero_project_match_id)
  REFERENCES hero_project_matches(hero_project_match_id)
  ON DELETE SET NULL;

ALTER TABLE hero_documents
  ADD CONSTRAINT hero_documents_project_fk
  FOREIGN KEY (hero_project_match_id)
  REFERENCES hero_project_matches(hero_project_match_id)
  ON DELETE SET NULL;

ALTER TABLE hero_documents
  ADD CONSTRAINT hero_documents_type_fk
  FOREIGN KEY (hero_document_type_id)
  REFERENCES hero_document_types(hero_document_type_id)
  ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_hero_project_workflow_steps_type
  ON hero_project_workflow_steps(hero_project_type_id, sort_order);

CREATE INDEX IF NOT EXISTS idx_hero_calendar_events_project
  ON hero_calendar_events(hero_project_match_id, starts_at);

CREATE INDEX IF NOT EXISTS idx_hero_logbook_entries_project
  ON hero_logbook_entries(hero_project_match_id, created_on DESC);

CREATE INDEX IF NOT EXISTS idx_hero_documents_project
  ON hero_documents(hero_project_match_id);

CREATE INDEX IF NOT EXISTS idx_demo_trigger_events_type
  ON demo_trigger_events(event_type, triggered_at DESC);

CREATE TRIGGER trg_hero_project_types_updated_at
BEFORE UPDATE ON hero_project_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_project_workflow_steps_updated_at
BEFORE UPDATE ON hero_project_workflow_steps
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_measures_updated_at
BEFORE UPDATE ON hero_measures
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_products_updated_at
BEFORE UPDATE ON hero_products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_document_types_updated_at
BEFORE UPDATE ON hero_document_types
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_calendar_categories_updated_at
BEFORE UPDATE ON hero_calendar_categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_calendar_events_updated_at
BEFORE UPDATE ON hero_calendar_events
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_logbook_entries_updated_at
BEFORE UPDATE ON hero_logbook_entries
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_hero_documents_updated_at
BEFORE UPDATE ON hero_documents
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE hero_project_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_project_workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_measures ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_document_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_calendar_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_logbook_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_document_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_trigger_events ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- SOURCE: dashboard_views.sql
-- ------------------------------------------------------------

-- ============================================================
-- FILE: dashboard_views.sql
-- PURPOSE: Read models for dashboard and planner UI
-- RUN ORDER: 3
--
-- Depends on the base schema and core seed data.
-- Creates the app-facing views used for:
--   * active tasks
--   * technician workload
--   * project summary
--   * recent dispatch history
-- ============================================================


CREATE OR REPLACE VIEW dashboard_active_tasks AS
SELECT
  t.hero_task_id,
  t.title,
  t.comment,
  t.due_date,
  t.start_at,
  t.end_at,
  t.hero_target_user_id,
  u.full_name AS assigned_to_name,
  t.hero_target_project_match_id,
  pm.project_nr,
  pm.display_id,
  pm.name AS project_name,
  pm.project_title,
  c.company_name AS customer_name,
  a.city,
  a.zipcode,
  a.full_address,
  COALESCE(tover.business_value::text, 'medium') AS business_value,
  COALESCE(tover.is_flexible, TRUE) AS is_flexible,
  COALESCE(tover.required_skills, '[]'::jsonb) AS required_skills
FROM hero_tasks t
LEFT JOIN hero_users u
  ON u.hero_user_id = t.hero_target_user_id
LEFT JOIN hero_project_matches pm
  ON pm.hero_project_match_id = t.hero_target_project_match_id
LEFT JOIN hero_customers c
  ON c.hero_customer_id = pm.hero_customer_id
LEFT JOIN hero_addresses a
  ON a.hero_address_id = pm.hero_address_id
LEFT JOIN task_overrides tover
  ON tover.hero_task_id = t.hero_task_id
WHERE t.is_done = FALSE
  AND t.is_deleted = FALSE
  AND COALESCE(pm.is_deleted, FALSE) = FALSE;

ALTER VIEW dashboard_active_tasks SET (security_invoker = true);

CREATE OR REPLACE VIEW dashboard_technician_workload AS
SELECT
  u.hero_user_id,
  u.full_name,
  tp.status,
  tp.geographic_zone,
  tp.skills,
  COUNT(t.hero_task_id) FILTER (WHERE t.is_done = FALSE AND t.is_deleted = FALSE) AS open_task_count,
  COUNT(t.hero_task_id) FILTER (
    WHERE t.is_done = FALSE
      AND t.is_deleted = FALSE
      AND t.due_date < NOW()
  ) AS overdue_task_count,
  MIN(t.due_date) FILTER (WHERE t.is_done = FALSE AND t.is_deleted = FALSE) AS next_due_date,
  ARRAY_REMOVE(ARRAY_AGG(DISTINCT pm.display_id), NULL) AS active_project_codes
FROM hero_users u
LEFT JOIN technician_profiles tp
  ON tp.hero_user_id = u.hero_user_id
LEFT JOIN hero_tasks t
  ON t.hero_target_user_id = u.hero_user_id
LEFT JOIN hero_project_matches pm
  ON pm.hero_project_match_id = t.hero_target_project_match_id
GROUP BY
  u.hero_user_id,
  u.full_name,
  tp.status,
  tp.geographic_zone,
  tp.skills;

ALTER VIEW dashboard_technician_workload SET (security_invoker = true);

CREATE OR REPLACE VIEW dashboard_project_summary AS
SELECT
  pm.hero_project_match_id,
  pm.project_nr,
  pm.display_id,
  pm.name AS project_name,
  pm.project_title,
  pm.project_type,
  pm.status_name,
  c.company_name AS customer_name,
  a.city,
  a.full_address,
  COUNT(t.hero_task_id) FILTER (WHERE t.is_done = FALSE AND t.is_deleted = FALSE) AS open_task_count,
  COUNT(t.hero_task_id) FILTER (
    WHERE t.is_done = FALSE
      AND t.is_deleted = FALSE
      AND t.due_date < NOW()
  ) AS overdue_task_count,
  ARRAY_REMOVE(ARRAY_AGG(DISTINCT u.full_name), NULL) AS assigned_people
FROM hero_project_matches pm
LEFT JOIN hero_customers c
  ON c.hero_customer_id = pm.hero_customer_id
LEFT JOIN hero_addresses a
  ON a.hero_address_id = pm.hero_address_id
LEFT JOIN hero_tasks t
  ON t.hero_target_project_match_id = pm.hero_project_match_id
LEFT JOIN hero_users u
  ON u.hero_user_id = t.hero_target_user_id
WHERE pm.is_deleted = FALSE
GROUP BY
  pm.hero_project_match_id,
  pm.project_nr,
  pm.display_id,
  pm.name,
  pm.project_title,
  pm.project_type,
  pm.status_name,
  c.company_name,
  a.city,
  a.full_address;

ALTER VIEW dashboard_project_summary SET (security_invoker = true);

CREATE OR REPLACE VIEW dashboard_recent_dispatches AS
SELECT
  dr.id AS dispatch_run_id,
  dr.created_at,
  dr.status,
  dr.tasks_considered,
  dr.tasks_changed,
  dr.summary,
  de.event_type,
  de.message AS trigger_message,
  dd.hero_task_id,
  dd.action_type,
  dd.old_target_user_id,
  old_user.full_name AS old_target_user_name,
  dd.new_target_user_id,
  new_user.full_name AS new_target_user_name,
  dd.old_due_date,
  dd.new_due_date,
  dd.confidence,
  dd.reason,
  dd.applied,
  dd.applied_at
FROM dispatch_runs dr
LEFT JOIN dispatcher_events de
  ON de.id = dr.trigger_event_id
LEFT JOIN dispatch_decisions dd
  ON dd.dispatch_run_id = dr.id
LEFT JOIN hero_users old_user
  ON old_user.hero_user_id = dd.old_target_user_id
LEFT JOIN hero_users new_user
  ON new_user.hero_user_id = dd.new_target_user_id
ORDER BY dr.created_at DESC, dd.created_at DESC;

ALTER VIEW dashboard_recent_dispatches SET (security_invoker = true);


-- ------------------------------------------------------------
-- SOURCE: database_expansion.sql
-- ------------------------------------------------------------

-- ============================================================
-- FILE: database_expansion.sql
-- PURPOSE: Business and field-history schema expansion
-- RUN ORDER: 6
--
-- Extends the same Supabase database with:
--   * quotes and quote line items
--   * invoices and invoice line items
--   * payments
--   * time logs
--   * project notes
--   * materials used
--   * equipment assets
--
-- This is the foundation for broader builder-facing AI features.
-- ============================================================


CREATE TYPE quote_status AS ENUM (
  'draft',
  'sent',
  'approved',
  'rejected',
  'expired'
);

CREATE TYPE invoice_status AS ENUM (
  'draft',
  'sent',
  'partially_paid',
  'paid',
  'overdue',
  'cancelled'
);

CREATE TYPE payment_status AS ENUM (
  'pending',
  'received',
  'failed',
  'refunded'
);

CREATE TYPE payment_method AS ENUM (
  'bank_transfer',
  'direct_debit',
  'cash',
  'card'
);

CREATE TYPE note_type AS ENUM (
  'site_note',
  'issue',
  'customer_update',
  'handover',
  'safety'
);

CREATE TYPE asset_status AS ENUM (
  'available',
  'assigned',
  'maintenance_due',
  'out_of_service'
);

CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_number TEXT NOT NULL UNIQUE,
  hero_project_match_id BIGINT REFERENCES hero_project_matches(hero_project_match_id) ON DELETE SET NULL,
  hero_customer_id BIGINT REFERENCES hero_customers(hero_customer_id) ON DELETE SET NULL,
  created_by_user_id BIGINT REFERENCES hero_users(hero_user_id) ON DELETE SET NULL,
  status quote_status NOT NULL DEFAULT 'draft',
  title TEXT NOT NULL,
  description TEXT,
  valid_until DATE,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT quotes_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE quote_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  hero_product_id TEXT REFERENCES hero_products(hero_product_id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_type TEXT,
  unit_net_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_percent NUMERIC(5,2) NOT NULL DEFAULT 19,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT NOT NULL UNIQUE,
  quote_id UUID REFERENCES quotes(id) ON DELETE SET NULL,
  hero_project_match_id BIGINT REFERENCES hero_project_matches(hero_project_match_id) ON DELETE SET NULL,
  hero_customer_id BIGINT REFERENCES hero_customers(hero_customer_id) ON DELETE SET NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  issued_on DATE,
  due_on DATE,
  sent_at TIMESTAMPTZ,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  outstanding_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT invoices_raw_payload_is_object
    CHECK (jsonb_typeof(raw_payload) = 'object')
);

CREATE TABLE invoice_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  hero_product_id TEXT REFERENCES hero_products(hero_product_id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_type TEXT,
  unit_net_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  vat_percent NUMERIC(5,2) NOT NULL DEFAULT 19,
  line_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  status payment_status NOT NULL DEFAULT 'pending',
  method payment_method NOT NULL DEFAULT 'bank_transfer',
  amount NUMERIC(12,2) NOT NULL,
  received_on DATE,
  external_reference TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_user_id BIGINT NOT NULL REFERENCES hero_users(hero_user_id) ON DELETE CASCADE,
  hero_project_match_id BIGINT REFERENCES hero_project_matches(hero_project_match_id) ON DELETE SET NULL,
  hero_task_id BIGINT REFERENCES hero_tasks(hero_task_id) ON DELETE SET NULL,
  work_type TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL,
  is_billable BOOLEAN NOT NULL DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT time_logs_duration_positive
    CHECK (duration_minutes >= 0),
  CONSTRAINT time_logs_end_after_start
    CHECK (ended_at >= started_at)
);

CREATE TABLE project_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_project_match_id BIGINT NOT NULL REFERENCES hero_project_matches(hero_project_match_id) ON DELETE CASCADE,
  hero_user_id BIGINT REFERENCES hero_users(hero_user_id) ON DELETE SET NULL,
  note_type note_type NOT NULL DEFAULT 'site_note',
  title TEXT,
  content TEXT NOT NULL,
  is_urgent BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE materials_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_project_match_id BIGINT NOT NULL REFERENCES hero_project_matches(hero_project_match_id) ON DELETE CASCADE,
  hero_task_id BIGINT REFERENCES hero_tasks(hero_task_id) ON DELETE SET NULL,
  hero_product_id TEXT REFERENCES hero_products(hero_product_id) ON DELETE SET NULL,
  used_by_user_id BIGINT REFERENCES hero_users(hero_user_id) ON DELETE SET NULL,
  quantity NUMERIC(12,2) NOT NULL DEFAULT 1,
  unit_type TEXT,
  used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE equipment_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL,
  status asset_status NOT NULL DEFAULT 'available',
  assigned_user_id BIGINT REFERENCES hero_users(hero_user_id) ON DELETE SET NULL,
  geographic_zone TEXT,
  maintenance_due_on DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quotes_project
  ON quotes(hero_project_match_id, status);

CREATE INDEX idx_quotes_customer
  ON quotes(hero_customer_id, status);

CREATE INDEX idx_invoices_project
  ON invoices(hero_project_match_id, status);

CREATE INDEX idx_invoices_customer
  ON invoices(hero_customer_id, status);

CREATE INDEX idx_invoices_due_on
  ON invoices(due_on, status);

CREATE INDEX idx_payments_invoice
  ON payments(invoice_id, status);

CREATE INDEX idx_time_logs_project
  ON time_logs(hero_project_match_id, started_at DESC);

CREATE INDEX idx_time_logs_user
  ON time_logs(hero_user_id, started_at DESC);

CREATE INDEX idx_project_notes_project
  ON project_notes(hero_project_match_id, created_at DESC);

CREATE INDEX idx_materials_used_project
  ON materials_used(hero_project_match_id, used_at DESC);

CREATE INDEX idx_materials_used_task
  ON materials_used(hero_task_id, used_at DESC);

CREATE INDEX idx_equipment_assets_status
  ON equipment_assets(status, geographic_zone);

CREATE TRIGGER trg_quotes_updated_at
BEFORE UPDATE ON quotes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invoices_updated_at
BEFORE UPDATE ON invoices
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_payments_updated_at
BEFORE UPDATE ON payments
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_time_logs_updated_at
BEFORE UPDATE ON time_logs
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_project_notes_updated_at
BEFORE UPDATE ON project_notes
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_materials_used_updated_at
BEFORE UPDATE ON materials_used
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_equipment_assets_updated_at
BEFORE UPDATE ON equipment_assets
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_assets ENABLE ROW LEVEL SECURITY;


-- ------------------------------------------------------------
-- SOURCE: recommendation_api.sql
-- ------------------------------------------------------------

-- ============================================================
-- FILE: recommendation_api.sql
-- PURPOSE: Database-side recommendation helper
-- RUN ORDER: OPTIONAL
--
-- This is an optional SQL RPC that can be used to test a simple
-- database-grounded dispatch recommendation directly in Supabase.
--
-- Example:
--   select * from recommend_dispatch_action('7ec6a421-67dc-4f39-a97b-10c6f07f6f01');
-- ============================================================


CREATE OR REPLACE FUNCTION recommend_dispatch_action(p_event_id UUID)
RETURNS TABLE (
  event_id UUID,
  event_type TEXT,
  hero_task_id BIGINT,
  current_user_id BIGINT,
  current_user_name TEXT,
  suggested_action dispatch_action_type,
  suggested_user_id BIGINT,
  suggested_user_name TEXT,
  suggested_due_date TIMESTAMPTZ,
  confidence NUMERIC,
  reason TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_event dispatcher_events%ROWTYPE;
  v_task hero_tasks%ROWTYPE;
  v_override task_overrides%ROWTYPE;
  v_task_project hero_project_matches%ROWTYPE;
  v_current_name TEXT;
  v_action dispatch_action_type;
  v_suggested_due_date TIMESTAMPTZ;
  v_reason TEXT;
BEGIN
  SELECT *
  INTO v_event
  FROM dispatcher_events de
  WHERE de.id = p_event_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Dispatcher event % not found', p_event_id;
  END IF;

  SELECT *
  INTO v_task
  FROM hero_tasks ht
  WHERE ht.hero_task_id = COALESCE(
    (v_event.payload -> 'affected_task_ids' ->> 0)::BIGINT,
    (v_event.payload ->> 'hero_task_id')::BIGINT
  );

  IF NOT FOUND THEN
    RETURN QUERY
    SELECT
      v_event.id,
      v_event.event_type,
      NULL::BIGINT,
      NULL::BIGINT,
      NULL::TEXT,
      'manual_review'::dispatch_action_type,
      NULL::BIGINT,
      NULL::TEXT,
      NULL::TIMESTAMPTZ,
      0.25::NUMERIC,
      'No directly affected task could be resolved from the event payload.'::TEXT;
    RETURN;
  END IF;

  SELECT *
  INTO v_override
  FROM task_overrides tov
  WHERE tov.hero_task_id = v_task.hero_task_id;

  SELECT *
  INTO v_task_project
  FROM hero_project_matches hpm
  WHERE hpm.hero_project_match_id = v_task.hero_target_project_match_id;

  SELECT full_name
  INTO v_current_name
  FROM hero_users hu
  WHERE hu.hero_user_id = v_task.hero_target_user_id;

  IF v_event.event_type = 'weather_disruption'
     OR COALESCE(v_event.payload ->> 'reason', '') = 'weather' THEN
    v_action := 'delay';
    v_suggested_due_date := COALESCE(v_task.due_date, NOW()) + INTERVAL '4 hours';
    v_reason := 'Weather-related safety blocker detected, so delaying the task is safer than reassignment.';

    RETURN QUERY
    SELECT
      v_event.id,
      v_event.event_type,
      v_task.hero_task_id,
      v_task.hero_target_user_id,
      v_current_name,
      v_action,
      v_task.hero_target_user_id,
      v_current_name,
      v_suggested_due_date,
      0.86::NUMERIC,
      v_reason;
    RETURN;
  END IF;

  IF COALESCE(v_override.is_flexible, TRUE) = FALSE
     AND (v_event.event_type = 'traffic_delay'
       OR COALESCE(v_event.payload ->> 'reason', '') IN ('traffic', 'sick', 'unavailable')) THEN
    RETURN QUERY
    WITH candidate_pool AS (
      SELECT
        u.hero_user_id,
        u.full_name,
        tp.status,
        tp.geographic_zone,
        tp.skills,
        COUNT(t2.hero_task_id) FILTER (WHERE t2.is_done = FALSE AND t2.is_deleted = FALSE) AS active_tasks,
        CASE
          WHEN tp.skills @> COALESCE(v_override.required_skills, '[]'::jsonb) THEN 1
          ELSE 0
        END AS has_skill_match,
        CASE
          WHEN tp.geographic_zone = CASE
            WHEN v_task_project.project_type = 'solar' THEN 'south'
            WHEN v_task_project.project_type = 'hvac' THEN 'west'
            ELSE 'east'
          END THEN 1
          ELSE 0
        END AS zone_match
      FROM hero_users u
      JOIN technician_profiles tp
        ON tp.hero_user_id = u.hero_user_id
      LEFT JOIN hero_tasks t2
        ON t2.hero_target_user_id = u.hero_user_id
      WHERE u.hero_user_id <> v_task.hero_target_user_id
        AND tp.status = 'active'
      GROUP BY
        u.hero_user_id,
        u.full_name,
        tp.status,
        tp.geographic_zone,
        tp.skills
    ),
    ranked_candidates AS (
      SELECT
        cp.*,
        (
          cp.has_skill_match * 60 +
          cp.zone_match * 20 +
          GREATEST(0, 20 - (cp.active_tasks * 4))
        ) AS score
      FROM candidate_pool cp
      WHERE cp.has_skill_match = 1
    )
    SELECT
      v_event.id,
      v_event.event_type,
      v_task.hero_task_id,
      v_task.hero_target_user_id,
      v_current_name,
      'reassign'::dispatch_action_type,
      rc.hero_user_id,
      rc.full_name,
      COALESCE(v_task.due_date, NOW()) + INTERVAL '30 minutes',
      LEAST(0.95, 0.55 + (rc.score / 100.0))::NUMERIC,
      format(
        'Reassign to %s because the technician is active, matches the required skills, and has a lower current workload.',
        rc.full_name
      )::TEXT
    FROM ranked_candidates rc
    ORDER BY rc.score DESC, rc.active_tasks ASC, rc.full_name ASC
    LIMIT 1;

    IF FOUND THEN
      RETURN;
    END IF;
  END IF;

  v_action := CASE
    WHEN COALESCE(v_override.is_flexible, TRUE) THEN 'delay'
    ELSE 'manual_review'
  END;

  v_suggested_due_date := CASE
    WHEN v_action = 'delay' THEN COALESCE(v_task.due_date, NOW()) + INTERVAL '2 hours'
    ELSE NULL
  END;

  v_reason := CASE
    WHEN v_action = 'delay'
      THEN 'No better technician was found immediately, so the safest fallback is a short delay.'
    ELSE 'No safe recommendation was found automatically; manual review is required.'
  END;

  RETURN QUERY
  SELECT
    v_event.id,
    v_event.event_type,
    v_task.hero_task_id,
    v_task.hero_target_user_id,
    v_current_name,
    v_action,
    CASE WHEN v_action = 'delay' THEN v_task.hero_target_user_id ELSE NULL::BIGINT END,
    CASE WHEN v_action = 'delay' THEN v_current_name ELSE NULL::TEXT END,
    v_suggested_due_date,
    CASE WHEN v_action = 'delay' THEN 0.62::NUMERIC ELSE 0.40::NUMERIC END,
    v_reason;
END;
$$;


COMMIT;
