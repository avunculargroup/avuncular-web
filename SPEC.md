# Treasury Console — Claude Code Build Specification

**Internal platform for a two-person Bitcoin treasury training & consulting business.**

This document is the authoritative specification for Claude Code to build the web application from scratch. Read it fully before writing any code.

---

## 1. Project Context

Two founders run a Bitcoin treasury adoption consulting and training business targeting corporates, family offices, asset managers, and endowments. This internal tool is their operational nerve centre: CRM, client engagement tracking, content pipeline, and AI agent monitoring — all in one mobile-first interface.

**No clients or public users access this app.** It is strictly internal.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (Postgres + Auth + Realtime) |
| ORM/Query | `@supabase/supabase-js` v2 — typed client |
| Styling | Tailwind CSS v3 |
| UI Components | shadcn/ui (install as needed, do not pre-install all) |
| Icons | `lucide-react` |
| Forms | `react-hook-form` + `zod` |
| Date handling | `date-fns` |
| State | React Server Components where possible; `zustand` for client-side global state |
| Realtime | Supabase Realtime for agent activity updates |
| Auth | Supabase Auth — email/password only, no OAuth needed |

### Environment Variables (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # server-only, never expose to client
```

---

## 3. Database

The schema is already defined in `schema.sql` (provided separately). Do not recreate it — import it into Supabase directly.

### Key tables and their roles in the UI:

| Table | UI Role |
|---|---|
| `team_members` | Auth profile; avatar pair shown in header |
| `companies` | Parent records for contacts; shown in pipeline |
| `contacts` | Core CRM entity — each has `pipeline_stage` and `bitcoin_literacy` |
| `interactions` | Touchpoint log per contact — calls, emails, Signal, meetings |
| `tasks` | Action items, agent- or human-created, linked to contacts |
| `projects` | Grouping for client engagements |
| `content_items` | Drafts and published content pieces |
| `brand_assets` | Style guide and tone-of-voice assets (read-only in UI) |
| `forms` | Lead capture forms for public website |
| `form_submissions` | Submissions from public forms, linkable to contacts |
| `agent_activity` | Agent audit log with human-in-the-loop approval flow |

### Supabase Client Setup

Create two clients:

**`lib/supabase/client.ts`** — browser client (for use in Client Components)
```ts
import { createBrowserClient } from '@supabase/ssr'
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**`lib/supabase/server.ts`** — server client (for Server Components and Route Handlers)
```ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
export const createClient = () => {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name) => cookieStore.get(name)?.value } }
  )
}
```

Generate types from schema: `npx supabase gen types typescript --local > lib/database.types.ts`

---

## 4. Authentication

- Supabase Auth with email/password
- Middleware (`middleware.ts`) protects all routes under `/` — redirects unauthenticated users to `/login`
- `/login` is the only public route
- On successful login, redirect to `/`
- No sign-up page — founders are seeded directly in Supabase dashboard
- Session is managed via SSR cookies using `@supabase/ssr`

---

## 5. Visual Design System

### Aesthetic
**Institutional dark** — Bloomberg terminal meets modern SaaS. Dense with signal, typographically serious, zero decoration for decoration's sake. Every element earns its place.

### Fonts
Import via `next/font/google`:
- **Display/mono:** `IBM Plex Mono` — used for numbers, labels, badges, code, metadata
- **Body/UI:** `IBM Plex Sans` — used for prose, headings, navigation

### Colour Tokens (define in `globals.css` as CSS variables)
```css
:root {
  --bg:           #080c10;
  --surface:      #0d1318;
  --surface-2:    #121920;
  --border:       #1e2a35;
  --border-2:     #243040;
  --text:         #c8d8e8;
  --text-dim:     #5a7a90;
  --text-muted:   #334455;
  --accent:       #f7931a;   /* Bitcoin orange — primary brand colour */
  --accent-dim:   rgba(247,147,26,0.15);
  --green:        #00d4aa;
  --green-dim:    rgba(0,212,170,0.12);
  --red:          #ff4466;
  --blue:         #4488ff;
  --blue-dim:     rgba(68,136,255,0.12);
}
```

### Tailwind Config
Extend Tailwind with the above tokens as custom colours so they are accessible as `bg-surface`, `text-accent`, etc.

### Layout Principles
- Mobile-first, max-width `480px` centred on desktop
- Sticky header + sticky bottom tab bar
- Content area scrolls independently
- Grid lines as background texture: subtle `1px` repeating grid in `--border` at 40px intervals
- No rounded corners above `6px` — keep it sharp and institutional
- Monospace font for all metadata, numbers, timestamps, badges, and status indicators

### Component Patterns

**Badge:** `font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]`

**Card row:** `flex items-start gap-3 p-3 border-b border-[--border] hover:bg-[--surface-2] cursor-pointer transition-colors`

**Section header:** `font-mono text-[9px] uppercase tracking-[0.12em] text-[--text-muted]`

**Input:** `bg-[--bg] border border-[--border-2] rounded font-mono text-xs text-[--text] focus:border-[--accent] outline-none`

---

## 6. App Structure

```
app/
  (auth)/
    login/
      page.tsx
  (app)/
    layout.tsx          ← AppShell: header + ticker + tab nav
    page.tsx            ← Home / Dashboard
    pipeline/
      page.tsx
      [id]/
        page.tsx        ← Contact detail
    clients/
      page.tsx
      [id]/
        page.tsx        ← Engagement detail
    content/
      page.tsx
      [id]/
        page.tsx
    agents/
      page.tsx
      [id]/
        page.tsx        ← Agent activity detail / approval
    tasks/
      page.tsx          ← Shared task inbox for both founders
    forms/
      page.tsx
      [slug]/
        page.tsx        ← Public form (unauthenticated)

components/
  shell/
    AppHeader.tsx
    TickerBar.tsx
    BottomNav.tsx
  crm/
    ContactCard.tsx
    ContactDetail.tsx
    PipelineStageBadge.tsx
    BitcoinLiteracyBadge.tsx
    InteractionItem.tsx
    InteractionFeed.tsx
  agents/
    AgentStatusRow.tsx
    AgentApprovalCard.tsx
    LiveLog.tsx
  content/
    ContentCard.tsx
    ContentStatusBadge.tsx
  tasks/
    TaskRow.tsx
    TaskPriorityBadge.tsx
  shared/
    Badge.tsx
    StatCard.tsx
    SectionHeader.tsx
    EmptyState.tsx
    LoadingRows.tsx

lib/
  supabase/
    client.ts
    server.ts
  database.types.ts
  queries/             ← All Supabase queries centralised here
    contacts.ts
    interactions.ts
    tasks.ts
    content.ts
    agents.ts
    pipeline.ts
```

---

## 7. Application Shell

### AppHeader (`components/shell/AppHeader.tsx`)
```
[₿ logo mark] [TREASURY / CONSOLE]        [● agent pulse] [YO] [CF]
```
- Logo mark: `28×28px` orange square with `₿` in black mono font
- Agent pulse: green dot `animate-pulse` — visible when any `agent_activity` row has `status = 'pending'` or an agent is running
- Avatar pair: initials of both team members pulled from `team_members` table, displayed as `28×28px` rounded-[4px] tiles
- Sticky, `backdrop-blur`, `z-50`

### TickerBar (`components/shell/TickerBar.tsx`)
Horizontal scrollable bar showing live data pills:
- **BTC/USD** — fetch from a public price API (CoinGecko free tier: `https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`). Refresh every 60 seconds via `setInterval`.
- **Pipeline Total** — sum of `value` across active opportunities (query `contacts` where `pipeline_stage IN ('warm','active')`)
- **Open Tasks** — count from `v_open_tasks`
- **Agents Online** — count from `agent_activity` where `status IN ('pending', 'auto')` created in the last hour

Each pill: `[LABEL] [VALUE] [±CHANGE]` in mono font, 10px, colour-coded green/red.

### BottomNav (`components/shell/BottomNav.tsx`)
Five tabs, fixed to bottom, full-width:
| Tab | Route | Icon |
|---|---|---|
| Home | `/` | `Home` |
| Pipeline | `/pipeline` | `GitBranch` (or custom) |
| Clients | `/clients` | `Users` |
| Content | `/content` | `FileText` |
| Agents | `/agents` | `Bot` |

Active tab: `--accent` colour + border-top accent line. Inactive: `--text-muted`.

---

## 8. Pages — Detailed Specs

### 8.1 Home (`/`)

**Purpose:** At-a-glance operational summary for both founders.

**Sections (top to bottom):**

1. **Stats grid (2×2)**
   - Pipeline Value: sum of estimated value from `companies` table (see note below)
   - Active Clients: count of `projects` where `status = 'active'`
   - Content Drafts: count of `content_items` where `status IN ('idea', 'draft', 'review')`
   - Open Tasks: count from `v_open_tasks`

   > Note: `companies` doesn't have a `value` field — use `contacts` count per stage as a proxy, or add a `deal_value` field to companies. For now, display count of contacts in `warm`/`active`/`client` stages.

2. **Agent Approvals Needed** (only shown if `agent_activity` rows exist with `status = 'pending'`)
   - Each row: agent name, action description, `[Approve]` `[Reject]` buttons
   - Approving calls a PATCH to update `agent_activity.status = 'approved'` and sets `approved_by` + `approved_at`
   - This is the most important widget on the home screen — surface it prominently with an orange left border accent

3. **Recent Activity Feed**
   - Query `v_recent_interactions` ORDER BY `occurred_at DESC` LIMIT 8
   - Each row: timestamp (relative), contact name + company, interaction type icon, summary excerpt

4. **My Open Tasks**
   - Query `v_open_tasks` WHERE `assigned_to_name = current user` LIMIT 5
   - Each row: title, related contact, due date badge, priority badge

---

### 8.2 Pipeline (`/pipeline`)

**Purpose:** Relationship-level deal tracking. Note: pipeline stage lives on `contacts`, not `companies`.

**Top stats:**
- Count of contacts per stage (lead / warm / active / client / dormant)
- Render as a horizontal stage funnel — 5 columns, each with count and a subtle fill bar

**Contact list:**
- Default view: filter `pipeline_stage != 'dormant'` — show active relationships
- Grouped by `pipeline_stage` with collapsible sections
- Each card (query `v_contacts_overview`):
  ```
  [CO initials icon]  [Full Name]                    [Stage badge]
                      [Job Title · Company Name]      [Owner initials]
                      [bitcoin_literacy badge]         [open_tasks count]
  ```
- Tap → Contact Detail

**Filters (filter bar below stats):**
- Stage: All / Lead / Warm / Active / Client / Dormant
- Owner: All / Me / Cofounder
- Bitcoin Literacy: All / Unknown / None / Basic / Intermediate / Advanced

**+ New Contact** button → slide-up sheet with form:
- Fields: first_name, last_name, job_title, email, phone, linkedin_url
- Company: searchable select from `companies` table, with "Create new company" option
- pipeline_stage: select (default: lead)
- bitcoin_literacy: select (default: unknown)
- owner_id: select from team_members

---

### 8.3 Contact Detail (`/pipeline/[id]`)

This is the richest view in the app. Pull all data for a single contact.

**Header section:**
```
← Back
[Initials avatar]  [Full Name]
                   [Job Title]
                   [Company Name]  ·  [Industry]
[pipeline_stage badge]  [bitcoin_literacy badge]  [owner initials]
[email]  [phone]  [LinkedIn icon link]
[tags as small badges]
```

**Quick action bar:**
- `[Log Interaction]` — opens sheet to log a call/email/meeting/note
- `[Add Task]` — opens task creation sheet pre-linked to this contact
- `[Edit]` — edit contact fields inline

**Bitcoin Literacy indicator:**
Render as a 5-step progress bar: `Unknown → None → Basic → Intermediate → Advanced`
This is a key field — make it visually prominent. Use it to suggest which content modules are appropriate for this contact (display a hint: "Recommended: Board Basics Module").

**Interaction Feed** (query `interactions` WHERE `contact_id = id` ORDER BY `occurred_at DESC`):
Each item:
```
[type icon]  [occurred_at relative]       [direction badge: inbound/outbound]
             [summary]
             [extracted_data.topics as small tags]
             [sentiment dot: green=positive, grey=neutral, red=negative]
             ▼ (expand to show raw_content)
```
Type icons: phone=`Phone`, email=`Mail`, meeting=`Calendar`, signal=`MessageCircle`, linkedin=`Linkedin`, note=`StickyNote`

**Open Tasks for this contact** (from `tasks` WHERE `related_contact_id = id` AND status not done/cancelled):
Simple list with status/priority badges and assignee initials.

**Log Interaction Sheet:**
Fields: type (select), direction (select), occurred_at (datetime, default now), raw_content (textarea), summary (textarea — agent will fill this, but user can pre-fill)
On save: INSERT into `interactions`, then optionally trigger agent processing (see Section 9).

---

### 8.4 Clients (`/clients`)

**Purpose:** Active engagement management — ongoing consulting and training projects.

**List view** (query `projects` WHERE `status = 'active'` with `related_company_id` joined):
Each card:
```
[Company initials]  [Project Name]               [Status badge]
                    [Company Name]
                    [Progress bar: % tasks done]
                    [Next task: title · due date]
```

**+ New Engagement** → form: name, description, related_company_id (select)

**Engagement Detail (`/clients/[id]`):**
- Project metadata header
- Task list for this project (grouped by status: todo / in_progress / blocked / done)
- Each task: title, assigned_to initials, due_date, priority badge, source badge (if agent-generated, show a small `⚡` indicator)
- `[+ Add Task]` button
- Related company link → opens company overview in a side sheet

---

### 8.5 Content (`/content`)

**Purpose:** Manage the content pipeline from idea to published.

**Filter tabs:** `All` · `Ideas` · `Drafts` · `Review` · `Published`

**List** (query `content_items` ordered by `updated_at DESC`):
Each card:
```
[type badge]  [title]                     [status badge]
              [topic_tags as small pills]  [updated_at]
              [assigned_to initials]
```

**Status flow badge colours:**
- idea → `--text-muted` bg
- draft → `--blue-dim`
- review → `--accent-dim`
- approved → `--green-dim`
- scheduled → `--green-dim`
- published → `--green`

**Content Detail (`/content/[id]`):**
- Title (editable inline)
- Type badge + Status dropdown (click to advance status)
- Topic tags (editable)
- Body: rendered as markdown preview with toggle to raw edit textarea
- `scheduled_for` datetime picker
- `published_url` text field
- Source badge — if `source = 'content_agent'`, show "Generated by Agent" label
- `[Assign to Agent]` button — creates an `agent_activity` row with `agent_name = 'content'` and `status = 'pending'`, passing the content item ID in `trigger_ref`

**+ New Content** → sheet with: type, title, topic_tags (multi-select with presets: treasury, regulation, education, macro, case-study, how-to), initial body

---

### 8.6 Agents (`/agents`)

**Purpose:** Monitor agent server status and manage the human-in-the-loop approval queue.

**Agent Status Panel:**
Query `agent_activity` GROUP BY `agent_name` to derive current state.
Show 4 agent rows (coordinator, crm, tasks, content):
```
[●]  [Agent Name]         [Last action description]    [time since]
     [current task]
```
Indicator: green pulse if activity in last 5 minutes, orange if pending approval, grey if idle.

**Approval Queue** (query `agent_activity` WHERE `status = 'pending'` ORDER BY `created_at ASC`):
This is the most critical section. Each pending item is a card:

```
┌─────────────────────────────────────────────────────┐
│ ⚡ COORDINATOR AGENT · 3 minutes ago                  │
│ Triggered by: call_transcript                         │
├─────────────────────────────────────────────────────┤
│ Proposed Actions:                                     │
│  1. Create task: "Send BTC policy template to James"  │
│  2. Update contact James Okafor → stage: warm         │
│  3. Log interaction: meeting, 2025-02-24              │
│                                                       │
│ Clarification needed:                                 │
│  Q: "Should I schedule a follow-up call for next week │
│      or leave it to you?"                             │
│  [____________________________] [Answer]              │
├─────────────────────────────────────────────────────┤
│             [✗ Reject]    [✓ Approve All]             │
└─────────────────────────────────────────────────────┘
```

- `proposed_actions` is a JSONB array — render each action as a readable description
- `clarifications` array — show unanswered questions with an input to respond
- On Approve: PATCH `agent_activity` → `status = 'approved'`, `approved_by = current_user.id`, `approved_at = now()`
- On Reject: PATCH → `status = 'rejected'`
- Use Supabase Realtime subscription on `agent_activity` so new pending items appear instantly without refresh

**Activity Log** (all `agent_activity` regardless of status, paginated, last 50):
```
[timestamp]  [agent_name]  [action]  [status badge]  [approved_by initials]
```
Click to expand: show `proposed_actions` and `approved_actions` JSON in a readable format.

**Agent Detail (`/agents/[id]`):**
Full detail of a single `agent_activity` record:
- All fields displayed
- Raw JSONB for `proposed_actions`, `approved_actions`, `clarifications` rendered as formatted JSON
- Linked `workflow_run_id` displayed (for cross-referencing agent server logs)

---

### 8.7 Tasks (`/tasks`)

Shared task inbox — all open tasks for both founders.

**View toggle:** My Tasks / All Tasks / By Contact

**List** (query `v_open_tasks`):
Each row:
```
[priority dot]  [title]                          [due date]
                [related_contact_name · project]  [assigned_to initials]
                [source badge if agent-generated]
```

Priority dots: urgent=red, high=orange, medium=blue, low=muted.

**Filter bar:** Status · Priority · Assigned To · Due (overdue / today / this week)

Tap task → inline expand to show description + `[Mark Done]` `[Reassign]` `[Edit]` actions.

**+ Add Task** → sheet form: title, description, project (select), assigned_to (select), due_date, priority, related_contact (searchable select)

---

### 8.8 Public Forms (`/forms/[slug]`)

- Unauthenticated route
- Render form fields from `forms.schema` JSONB
- On submit: INSERT into `form_submissions` with `form_id`, `data`, and IP address
- Show success state with brand-appropriate styling (use lighter theme — white background, not dark)
- This route must work without auth middleware

---

## 9. Agent Integration Points

The app does not run the agent server itself — it is the **UI surface** for an external agent server. Integration is via the `agent_activity` and `interactions` tables.

### How the agent server communicates with the UI:
1. Agent server writes to `agent_activity` with `status = 'pending'`
2. UI subscribes via Supabase Realtime and shows the approval card
3. User approves/rejects via UI → UI writes back to `agent_activity`
4. Agent server polls or subscribes to status changes and proceeds accordingly

### How the UI triggers agent actions:
The UI can initiate agent runs by inserting into `agent_activity`:
```ts
await supabase.from('agent_activity').insert({
  agent_name: 'content',
  action: 'generate',
  status: 'pending',
  trigger_type: 'manual',
  trigger_ref: contentItemId,
  proposed_actions: [],
})
```
The agent server watches this table and picks up new rows.

### Log Interaction → Trigger Agent:
When a user logs an interaction with `raw_content` (e.g. pastes a call transcript), show a prompt:
> "Run coordinator agent on this transcript?" `[Yes, Run]` `[Skip]`

If Yes: insert an `agent_activity` row with `trigger_type = 'call_transcript'` and `trigger_ref = interaction.id`.

---

## 10. Data Fetching Patterns

- **Server Components** for initial page load data (no loading flicker)
- **Client Components** for interactive sections (filtering, real-time, forms)
- All Supabase queries go in `lib/queries/` — never inline in components
- Use `React.Suspense` + `loading.tsx` for streaming
- Optimistic updates for task status changes and stage changes

### Example query pattern (`lib/queries/contacts.ts`):
```ts
import { createClient } from '@/lib/supabase/server'

export async function getContactsOverview(filters?: {
  stage?: string
  owner?: string
  literacy?: string
}) {
  const supabase = createClient()
  let query = supabase
    .from('v_contacts_overview')
    .select('*')
    .order('open_tasks', { ascending: false })

  if (filters?.stage) query = query.eq('pipeline_stage', filters.stage)
  if (filters?.owner) query = query.eq('owner_name', filters.owner)
  if (filters?.literacy) query = query.eq('bitcoin_literacy', filters.literacy)

  const { data, error } = await query
  if (error) throw error
  return data
}
```

---

## 11. Error Handling & Loading States

- Every data-fetching Server Component gets a corresponding `loading.tsx` with `LoadingRows` skeleton component
- Every `error.tsx` uses a minimal error card with a retry button
- Form submissions: disable button on submit, show inline error from Supabase on failure
- Realtime disconnects: show a subtle "Reconnecting..." banner in the ticker bar area

---

## 12. Build Order for Claude Code

Build in this sequence to maintain momentum and test incrementally:

1. **Project scaffolding** — Next.js + Tailwind + Supabase clients + type generation + font setup + CSS variables
2. **Auth** — Login page, middleware, session handling
3. **App shell** — AppHeader, TickerBar (static data first), BottomNav
4. **Home page** — Stats grid + recent activity feed (no agent approvals yet)
5. **Pipeline list** — Contact list with filters, `v_contacts_overview` query
6. **Contact detail** — Full detail view, interaction feed, literacy bar
7. **Log Interaction sheet** — Form + insert to `interactions`
8. **Clients / Engagements** — Projects list + detail with task list
9. **Tasks page** — Shared task inbox
10. **Content pipeline** — List + detail + status transitions
11. **Agents page** — Status panel + approval queue + Realtime subscription
12. **TickerBar live data** — Wire up BTC price API
13. **Public forms** — `/forms/[slug]` unauthenticated route
14. **Polish** — Loading states, error boundaries, empty states, mobile QA

---

## 13. Key Constraints & Notes

- **Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.** It is only used in Route Handlers or Server Actions when bypassing RLS is explicitly needed (e.g. seeding).
- **`bitcoin_literacy` is a first-class UI field** — it must be prominently displayed everywhere a contact appears, not buried. It is central to the business logic (content tailoring).
- **`pipeline_stage` lives on `contacts`, not `companies`** — this is intentional. The founders track relationships with individuals, not just organisations.
- **Agent-generated items get a visual marker** — any task, interaction, or content item with `source = 'coordinator_agent'` or `source = 'content_agent'` should show a small `⚡` badge so founders always know what came from an agent vs. a human.
- **Two founders, no permissions complexity** — RLS is already set to `authenticated = full access`. Do not add role-based restrictions in the UI.
- **No pagination needed initially** — both founders are the only users; dataset will be small for months. Use `LIMIT` where sensible but no paginator UI yet.
- **Mobile-first layout** — test on 375px viewport. The `480px` max-width container must feel natural on iPhone, not like a shrunken desktop.
