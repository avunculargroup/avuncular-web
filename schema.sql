-- ============================================================
-- INTERNAL BUSINESS PLATFORM — SUPABASE SCHEMA
-- Bitcoin Treasury Training & Consulting
-- ============================================================
-- Assumes Supabase Auth is already configured.
-- auth.users is referenced but not created here.
-- Run this in the Supabase SQL editor in order.
-- ============================================================


-- ============================================================
-- UTILITIES
-- ============================================================

-- Auto-update updated_at on any table that has it
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- TEAM MEMBERS
-- A lightweight profile linked to auth.users.
-- Keeps agent context aware of who is who.
-- ============================================================

CREATE TABLE team_members (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'founder',   -- e.g. 'founder', 'cofounder'
  signal_number TEXT,                            -- for routing Signal notifications
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================================
-- CRM
-- ============================================================

-- Companies — the organisations you target
CREATE TABLE companies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  industry      TEXT,                            -- e.g. 'Asset Management', 'Family Office'
  size          TEXT,                            -- e.g. 'SME', 'Mid-market', 'Enterprise'
  country       TEXT,
  website       TEXT,
  linkedin_url  TEXT,
  notes         TEXT,
  created_by    UUID REFERENCES team_members(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- Contacts — individuals, linked to a company
CREATE TABLE contacts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID REFERENCES companies(id) ON DELETE SET NULL,
  first_name      TEXT NOT NULL,
  last_name       TEXT NOT NULL,
  job_title       TEXT,
  email           TEXT,
  phone           TEXT,
  linkedin_url    TEXT,

  -- Pipeline stage for this individual relationship
  pipeline_stage  TEXT NOT NULL DEFAULT 'lead'
                  CHECK (pipeline_stage IN ('lead', 'warm', 'active', 'client', 'dormant')),

  -- Bitcoin literacy level — useful for tailoring content/outreach
  bitcoin_literacy TEXT DEFAULT 'unknown'
                  CHECK (bitcoin_literacy IN ('unknown', 'none', 'basic', 'intermediate', 'advanced')),

  -- Which team member owns this relationship
  owner_id        UUID REFERENCES team_members(id),

  notes           TEXT,
  tags            TEXT[],                        -- flexible labels e.g. ['speaker', 'warm-intro']
  created_by      UUID REFERENCES team_members(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_contacts_company ON contacts(company_id);
CREATE INDEX idx_contacts_pipeline ON contacts(pipeline_stage);
CREATE INDEX idx_contacts_owner ON contacts(owner_id);


-- Interactions — every touchpoint: calls, emails, meetings, Signal messages
CREATE TABLE interactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id      UUID REFERENCES contacts(id) ON DELETE CASCADE,
  company_id      UUID REFERENCES companies(id) ON DELETE SET NULL,

  type            TEXT NOT NULL
                  CHECK (type IN ('call', 'email', 'meeting', 'signal', 'linkedin', 'note', 'other')),

  direction       TEXT CHECK (direction IN ('inbound', 'outbound', 'internal')),
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Raw content — transcript, email body, notes
  raw_content     TEXT,

  -- Agent-generated summary
  summary         TEXT,

  -- Structured extraction — stored as JSONB for agent querying
  extracted_data  JSONB DEFAULT '{}',
  -- Shape: { decisions: [], action_items: [], topics: [], sentiment: 'positive|neutral|negative' }

  -- Source tracing
  source          TEXT DEFAULT 'manual'
                  CHECK (source IN ('manual', 'coordinator_agent', 'signal', 'call_transcript')),

  created_by      UUID REFERENCES team_members(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER interactions_updated_at
  BEFORE UPDATE ON interactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_interactions_contact ON interactions(contact_id);
CREATE INDEX idx_interactions_occurred ON interactions(occurred_at DESC);
CREATE INDEX idx_interactions_type ON interactions(type);


-- ============================================================
-- TASKS & PROJECTS
-- ============================================================

CREATE TABLE projects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'active'
                CHECK (status IN ('active', 'on_hold', 'completed', 'archived')),
  related_company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_by    UUID REFERENCES team_members(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


CREATE TABLE tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID REFERENCES projects(id) ON DELETE SET NULL,

  title           TEXT NOT NULL,
  description     TEXT,

  status          TEXT NOT NULL DEFAULT 'todo'
                  CHECK (status IN ('todo', 'in_progress', 'blocked', 'done', 'cancelled')),

  priority        TEXT NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('low', 'medium', 'high', 'urgent')),

  assigned_to     UUID REFERENCES team_members(id),
  due_date        DATE,
  completed_at    TIMESTAMPTZ,

  -- Link tasks back to what generated them
  source          TEXT DEFAULT 'manual'
                  CHECK (source IN ('manual', 'coordinator_agent', 'signal')),
  source_interaction_id UUID REFERENCES interactions(id) ON DELETE SET NULL,

  -- Link to a contact if relevant (e.g. "Follow up with Marcus")
  related_contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,

  tags            TEXT[],
  created_by      UUID REFERENCES team_members(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due ON tasks(due_date);
CREATE INDEX idx_tasks_project ON tasks(project_id);


-- ============================================================
-- CONTENT PIPELINE
-- Social media posts, newsletters, ideas
-- ============================================================

CREATE TABLE content_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  title           TEXT,
  body            TEXT,                          -- draft content

  type            TEXT NOT NULL
                  CHECK (type IN ('linkedin', 'twitter_x', 'newsletter', 'blog', 'idea')),

  status          TEXT NOT NULL DEFAULT 'idea'
                  CHECK (status IN ('idea', 'draft', 'review', 'approved', 'scheduled', 'published', 'archived')),

  -- Bitcoin topic classification — helps the content agent stay on-brand
  topic_tags      TEXT[],                        -- e.g. ['treasury', 'regulation', 'education']

  scheduled_for   TIMESTAMPTZ,
  published_at    TIMESTAMPTZ,
  published_url   TEXT,

  -- Agent provenance
  source          TEXT DEFAULT 'manual'
                  CHECK (source IN ('manual', 'coordinator_agent', 'content_agent')),
  source_interaction_id UUID REFERENCES interactions(id) ON DELETE SET NULL,

  assigned_to     UUID REFERENCES team_members(id),
  created_by      UUID REFERENCES team_members(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER content_items_updated_at
  BEFORE UPDATE ON content_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX idx_content_status ON content_items(status);
CREATE INDEX idx_content_type ON content_items(type);


-- ============================================================
-- BRAND HUB
-- Style guide, assets, tone of voice.
-- This feeds agent context so everything stays on-brand.
-- ============================================================

CREATE TABLE brand_assets (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,                  -- e.g. 'Primary Logo', 'Tone of Voice Guide'
  type          TEXT NOT NULL
                CHECK (type IN ('logo', 'colour_palette', 'typography', 'tone_of_voice',
                                'style_guide', 'template', 'image', 'other')),
  description   TEXT,
  file_url      TEXT,                           -- Supabase Storage URL
  content       TEXT,                           -- For text-based assets like tone guides
  is_active     BOOLEAN DEFAULT TRUE,
  created_by    UUID REFERENCES team_members(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER brand_assets_updated_at
  BEFORE UPDATE ON brand_assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================================
-- FORMS
-- Simple forms published to the public website
-- ============================================================

CREATE TABLE forms (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT UNIQUE NOT NULL,            -- public URL slug
  description   TEXT,
  schema        JSONB NOT NULL DEFAULT '{}',     -- field definitions
  is_published  BOOLEAN DEFAULT FALSE,
  created_by    UUID REFERENCES team_members(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER forms_updated_at
  BEFORE UPDATE ON forms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


CREATE TABLE form_submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  form_id       UUID NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  data          JSONB NOT NULL DEFAULT '{}',     -- submitted field values
  submitted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address    TEXT,

  -- Optional: if submission is linked to a known contact
  contact_id    UUID REFERENCES contacts(id) ON DELETE SET NULL
);

CREATE INDEX idx_form_submissions_form ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_submitted ON form_submissions(submitted_at DESC);


-- ============================================================
-- AGENT ACTIVITY LOG
-- Audit trail of everything the coordinator and specialist
-- agents do. Essential for trust-building and debugging.
-- ============================================================

CREATE TABLE agent_activity (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_name      TEXT NOT NULL,                -- 'coordinator', 'crm', 'tasks', 'content'
  action          TEXT NOT NULL,                -- 'extracted', 'proposed', 'dispatched', 'clarified'
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'approved', 'rejected', 'auto')),

  -- What triggered this activity
  trigger_type    TEXT CHECK (trigger_type IN ('call_transcript', 'signal_message', 'manual', 'scheduled')),
  trigger_ref     TEXT,                         -- e.g. interaction id, signal message id

  -- The workflow run for tracing suspend/resume
  workflow_run_id TEXT,

  -- What the agent proposed
  proposed_actions  JSONB DEFAULT '[]',

  -- What was actually approved and executed
  approved_actions  JSONB DEFAULT '[]',

  -- Who approved (if human-in-the-loop)
  approved_by     UUID REFERENCES team_members(id),
  approved_at     TIMESTAMPTZ,

  -- Any clarification exchange
  clarifications  JSONB DEFAULT '[]',
  -- Shape: [{ question, answer, resolved_at }]

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agent_activity_agent ON agent_activity(agent_name);
CREATE INDEX idx_agent_activity_status ON agent_activity(status);
CREATE INDEX idx_agent_activity_created ON agent_activity(created_at DESC);


-- ============================================================
-- ROW LEVEL SECURITY
-- Both founders can see everything. Lock down to authenticated users.
-- ============================================================

ALTER TABLE team_members       ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects           ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks              ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_assets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE forms              ENABLE ROW LEVEL SECURITY;
ALTER TABLE form_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_activity     ENABLE ROW LEVEL SECURITY;

-- Authenticated team members can read and write everything
-- (You're a two-person team — no need for complex ownership rules yet)

CREATE POLICY "team_members_all" ON team_members
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "companies_all" ON companies
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "contacts_all" ON contacts
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "interactions_all" ON interactions
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "projects_all" ON projects
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "tasks_all" ON tasks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "content_items_all" ON content_items
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "brand_assets_all" ON brand_assets
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "forms_all" ON forms
  FOR ALL USING (auth.role() = 'authenticated');

-- Form submissions: authenticated users can read all, public can insert (for website forms)
CREATE POLICY "form_submissions_read" ON form_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "form_submissions_insert" ON form_submissions
  FOR INSERT WITH CHECK (TRUE);               -- public can submit forms

CREATE POLICY "agent_activity_all" ON agent_activity
  FOR ALL USING (auth.role() = 'authenticated');


-- ============================================================
-- USEFUL VIEWS FOR AGENT CONTEXT QUERIES
-- The coordinator agent will hit these to build its working context
-- ============================================================

-- Open tasks with assignee and related contact names
CREATE VIEW v_open_tasks AS
  SELECT
    t.id,
    t.title,
    t.description,
    t.status,
    t.priority,
    t.due_date,
    t.source,
    tm.full_name AS assigned_to_name,
    c.first_name || ' ' || c.last_name AS related_contact_name,
    p.name AS project_name
  FROM tasks t
  LEFT JOIN team_members tm ON tm.id = t.assigned_to
  LEFT JOIN contacts c ON c.id = t.related_contact_id
  LEFT JOIN projects p ON p.id = t.project_id
  WHERE t.status NOT IN ('done', 'cancelled');


-- Recent interactions with contact and company context
CREATE VIEW v_recent_interactions AS
  SELECT
    i.id,
    i.type,
    i.direction,
    i.occurred_at,
    i.summary,
    i.extracted_data,
    i.source,
    c.first_name || ' ' || c.last_name AS contact_name,
    c.pipeline_stage,
    co.name AS company_name
  FROM interactions i
  LEFT JOIN contacts c ON c.id = i.contact_id
  LEFT JOIN companies co ON co.id = i.company_id
  ORDER BY i.occurred_at DESC;


-- Contacts with their company and open task count
CREATE VIEW v_contacts_overview AS
  SELECT
    c.id,
    c.first_name || ' ' || c.last_name AS full_name,
    c.job_title,
    c.pipeline_stage,
    c.bitcoin_literacy,
    c.tags,
    co.name AS company_name,
    co.industry,
    tm.full_name AS owner_name,
    COUNT(t.id) FILTER (WHERE t.status NOT IN ('done', 'cancelled')) AS open_tasks
  FROM contacts c
  LEFT JOIN companies co ON co.id = c.company_id
  LEFT JOIN team_members tm ON tm.id = c.owner_id
  LEFT JOIN tasks t ON t.related_contact_id = c.id
  GROUP BY c.id, co.name, co.industry, tm.full_name;
