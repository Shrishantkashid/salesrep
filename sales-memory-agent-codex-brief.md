# Sales Memory Agent — Codex Project Brief

> Read this entire document before writing a single line of code.
> Every decision about what to build, how to build it, and what to skip is documented here.

---

## 1. What This Project Is

A web application that gives sales reps a persistent, AI-powered memory layer for every prospect they interact with. Before a call, the rep gets a structured brief pulled from all past interactions. After a call, the rep logs what happened in plain text and it gets stored in memory permanently.

The core technology making this possible is **Hindsight** — an agent memory system that persists, recalls, and reflects across sessions. Without Hindsight, this is just another chatbot. With Hindsight, the agent gets genuinely smarter with every interaction logged.

This is a hackathon project built to demonstrate real startup potential. It must look and feel like a real product, not a demo toy.

---

## 2. The Problem Being Solved

Sales reps talk to the same prospects across weeks and months. Context — objections raised, budget signals, competitor mentions, personal details — lives in CRM notes nobody reads, or only in the rep's head.

Every call without memory context is a wasted opportunity. The rep re-introduces themselves. They miss that the prospect already said budget is frozen until Q3. They forget that onboarding speed was the deal-breaker last time.

This product fixes that. One lookup before the call. One note after. The agent remembers everything, forever.

---

## 3. The Core User Flows

There are exactly three flows. Build only these. Nothing else.

### Flow 1 — Pre-call Brief
1. Rep opens the app and types a prospect's name
2. App queries Hindsight memory for everything stored about that prospect
3. LLM generates a structured briefing card using the recalled context
4. Rep sees: key objections, budget/timeline signals, what to focus on today, how many past interactions exist

### Flow 2 — Post-call Logger
1. Rep types the prospect name
2. Rep types 2–5 sentences describing what happened on the call
3. Rep clicks "Save to memory"
4. App extracts key signals and stores them in Hindsight tied to that prospect name
5. Confirmation shown: "Stored — next brief for [Prospect] will include this"

### Flow 3 — Memory Timeline
1. Rep types a prospect name
2. App retrieves all stored interactions for that prospect from Hindsight
3. Displays a chronological timeline of every logged call, with date, summary, and a status badge (Objection logged / Positive signal / Deal progressed / First contact)

---

## 4. Tech Stack

### Frontend
- **React** (Vite)
- **Tailwind CSS** for styling
- Three views navigated by tabs: Pre-call Brief, Post-call Logger, Memory Timeline
- No routing library needed — tab state managed with `useState`
- Deploy to **Vercel** (`vercel deploy` from frontend folder)

### Backend
- **Python** with **FastAPI**
- Three endpoints (detailed in Section 6)
- Deploy to **Render** (free tier, connect GitHub repo)

### Memory
- **Hindsight** via the official Python SDK (`hindsight-client`)
- Used for all persist and recall operations
- No other database. Do not add PostgreSQL, SQLite, Redis, or any other storage layer.

### LLM
- **Groq** API (`groq` Python package)
- Model: `qwen/qwen3-32b`
- Used only for generating the pre-call brief from recalled memory context
- Do not call the LLM for post-call logging or the timeline — those are pure memory operations

### Environment variables (`.env` in backend root)
```
HINDSIGHT_API_KEY=your_key_here
GROQ_API_KEY=your_key_here
HINDSIGHT_PIPELINE_ID=your_pipeline_id_here
```

---

## 5. Project Structure

```
sales-memory-agent/
├── backend/
│   ├── main.py              # FastAPI app, CORS, endpoint registration
│   ├── agent.py             # Pre-call brief generation logic
│   ├── memory.py            # All Hindsight retain/recall calls
│   ├── prompts.py           # All LLM system and user prompts
│   ├── seed.py              # Script to seed synthetic prospect data
│   ├── requirements.txt
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Root component, tab state
│   │   ├── components/
│   │   │   ├── PreCallBrief.jsx
│   │   │   ├── PostCallLogger.jsx
│   │   │   └── MemoryTimeline.jsx
│   │   └── api.js           # All fetch calls to backend
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── data/
│   └── synthetic_prospects.json   # Seed data (see Section 8)
└── README.md
```

---

## 6. Backend API Endpoints

### POST `/brief`
Generates a pre-call brief for a given prospect.

Request body:
```json
{ "prospect_name": "Priya Sharma" }
```

Logic:
1. Call `memory.recall_prospect(prospect_name)` to retrieve all past interactions from Hindsight
2. If no memory found, return a response indicating this is a first interaction
3. If memory found, build a prompt with the recalled context and call Groq to generate a structured brief
4. Return the brief as structured JSON

Response:
```json
{
  "prospect_name": "Priya Sharma",
  "interaction_count": 4,
  "key_objections": ["Budget freeze until Q3", "Onboarding under 2 weeks", "Comparing with Salesforce"],
  "focus_today": "She agreed to a pilot last time. Lead with onboarding timeline reassurance. Avoid re-explaining pricing.",
  "last_contacted": "6 days ago",
  "memory_backed": true
}
```

If no memory exists yet:
```json
{
  "prospect_name": "New Prospect",
  "interaction_count": 0,
  "key_objections": [],
  "focus_today": "No prior interactions found. This is a first contact — start fresh.",
  "last_contacted": null,
  "memory_backed": false
}
```

### POST `/log`
Stores a post-call summary into Hindsight memory.

Request body:
```json
{
  "prospect_name": "Priya Sharma",
  "summary": "She agreed to the 3-rep pilot starting next month. Budget approved after Q3. Concerned about data migration.",
  "outcome": "deal_progressed"
}
```

Outcome values: `"first_contact"` | `"objection_logged"` | `"positive_signal"` | `"deal_progressed"`

Logic:
1. Format the summary with metadata (prospect name, outcome, timestamp)
2. Call `memory.retain_interaction(prospect_name, summary, outcome, timestamp)`
3. Return confirmation

Response:
```json
{ "success": true, "message": "Stored in Hindsight. Next brief for Priya Sharma will include this interaction." }
```

### GET `/timeline/{prospect_name}`
Returns all stored interactions for a prospect in chronological order.

Logic:
1. Call `memory.get_timeline(prospect_name)` to retrieve all interactions
2. Sort by timestamp descending (most recent first)
3. Return structured list

Response:
```json
{
  "prospect_name": "Priya Sharma",
  "total_interactions": 4,
  "interactions": [
    {
      "date": "6 days ago",
      "call_number": 4,
      "summary": "Agreed to 3-rep pilot. Budget approved post-Q3. Concerned about data migration.",
      "outcome": "deal_progressed"
    }
  ]
}
```

---

## 7. Memory Layer — Hindsight Integration

All Hindsight operations live in `memory.py`. No other file should import the Hindsight client directly.

```python
# memory.py
import os
from hindsight import HindsightClient
from datetime import datetime

client = HindsightClient(api_key=os.getenv("HINDSIGHT_API_KEY"))
PIPELINE_ID = os.getenv("HINDSIGHT_PIPELINE_ID")

def recall_prospect(prospect_name: str) -> str:
    """Retrieve all past memory about a prospect. Returns raw recalled text."""
    results = client.recall(
        pipeline_id=PIPELINE_ID,
        query=f"prospect interactions with {prospect_name}",
        top_k=10
    )
    return results

def retain_interaction(prospect_name: str, summary: str, outcome: str, timestamp: str):
    """Store a single call interaction in Hindsight."""
    content = f"""
    Prospect: {prospect_name}
    Date: {timestamp}
    Outcome: {outcome}
    Summary: {summary}
    """
    client.retain(
        pipeline_id=PIPELINE_ID,
        content=content,
        metadata={
            "prospect": prospect_name,
            "outcome": outcome,
            "timestamp": timestamp,
            "type": "call_log"
        }
    )

def get_timeline(prospect_name: str) -> list:
    """Retrieve all interactions for a prospect ordered by time."""
    results = client.recall(
        pipeline_id=PIPELINE_ID,
        query=f"all call logs for prospect {prospect_name}",
        top_k=20,
        filter={"prospect": prospect_name}
    )
    return results
```

Note: Adjust the Hindsight SDK method names to match the actual SDK interface once installed. The logic and intent above is correct — method signatures may vary slightly.

---

## 8. LLM Prompt — Pre-call Brief Generation

All prompts live in `prompts.py`.

```python
BRIEF_SYSTEM_PROMPT = """
You are a sales intelligence assistant. Your job is to prepare a pre-call brief for a sales rep.

You will be given recalled memory from past interactions with a prospect.
Based on this memory, extract and return a structured JSON object with:
- key_objections: list of up to 4 specific objections the prospect has raised
- focus_today: 2-3 sentence actionable recommendation for what to prioritise on the call
- last_contacted: rough time since last interaction if inferable (e.g. "6 days ago")
- interaction_count: estimated number of past interactions

Be specific. Use exact details from the memory. Do not invent information not present in the recalled context.
Return ONLY valid JSON. No explanation, no markdown formatting, no code fences.
"""

def build_brief_prompt(prospect_name: str, recalled_context: str) -> str:
    return f"""
Prospect name: {prospect_name}

Recalled memory from past interactions:
{recalled_context}

Generate the pre-call brief JSON now.
"""
```

---

## 9. Synthetic Seed Data

File: `data/synthetic_prospects.json`

Create 5 realistic prospects. Each has 3–4 past interaction summaries that will be seeded into Hindsight at startup via `seed.py`. This ensures the demo has rich memory from the very first run.

```json
[
  {
    "name": "Priya Sharma",
    "company": "Rentokil",
    "title": "VP Sales",
    "interactions": [
      { "summary": "Initial discovery call. Priya flagged a budget freeze until Q3. Interested but non-committal. Comparing with Salesforce.", "outcome": "first_contact", "days_ago": 42 },
      { "summary": "Second call. Pushed back on onboarding timeline — wants setup complete in under 2 weeks. Raised Salesforce again as a benchmark. Asked for a case study from a similar company.", "outcome": "objection_logged", "days_ago": 21 },
      { "summary": "Demo call. Loved the ROI calculator — asked to keep access. Requested a pilot with 3 reps before committing. Onboarding timeline still a concern.", "outcome": "positive_signal", "days_ago": 14 },
      { "summary": "Follow-up. Agreed to the 3-rep pilot starting next month. Budget approved post-Q3. New concern: data migration from their current CRM.", "outcome": "deal_progressed", "days_ago": 6 }
    ]
  },
  {
    "name": "James Okafor",
    "company": "Paysend",
    "title": "Head of Revenue",
    "interactions": [
      { "summary": "Cold outreach converted to a call. James is evaluating 3 vendors. Primary concern is API reliability — they had a bad experience with their last provider going down during peak hours.", "outcome": "first_contact", "days_ago": 30 },
      { "summary": "Technical deep dive. His engineering lead joined. They grilled us on uptime SLAs. Positive reaction to the 99.9% guarantee. James asked for a security audit report.", "outcome": "positive_signal", "days_ago": 18 },
      { "summary": "Sent the security report. James liked it but legal is reviewing. He mentioned one competitor offered a lower price. May need a discounted pilot to move forward.", "outcome": "objection_logged", "days_ago": 7 }
    ]
  },
  {
    "name": "Sarah Linden",
    "company": "Fetch Rewards",
    "title": "Director of Partnerships",
    "interactions": [
      { "summary": "First call. Sarah was warm but distracted. Her team is mid-reorg. She asked to reconnect in 6 weeks when things settle. No objections raised — just bad timing.", "outcome": "first_contact", "days_ago": 50 },
      { "summary": "Reconnect as scheduled. Reorg is done. New focus on scaling partner integrations. Very interested in our API. Asked for pricing for 10 seats.", "outcome": "positive_signal", "days_ago": 8 }
    ]
  },
  {
    "name": "Marcus Webb",
    "company": "Trainline",
    "title": "Commercial Director",
    "interactions": [
      { "summary": "Intro call via LinkedIn referral. Marcus is looking for a solution to replace spreadsheet-based pipeline tracking. Budget is there, timeline is Q4. Main concern is change management — his team resists new tools.", "outcome": "first_contact", "days_ago": 15 },
      { "summary": "Second call. Showed him the onboarding flow. He appreciated the simplicity. Still worried about team adoption. Asked if we could do a lunch-and-learn session with his 8 reps.", "outcome": "positive_signal", "days_ago": 5 }
    ]
  },
  {
    "name": "Anika Patel",
    "company": "GoCardless",
    "title": "VP Growth",
    "interactions": [
      { "summary": "First call. Anika is highly technical and asked detailed questions about our data model. She flagged GDPR compliance as a hard requirement — they process EU customer data. Needs a DPA signed before moving forward.", "outcome": "first_contact", "days_ago": 10 }
    ]
  }
]
```

`seed.py` should loop through this file and call `memory.retain_interaction()` for each entry, setting the timestamp to `(today - days_ago)`.

---

## 10. Frontend — Component Specs

### App.jsx
- Three tabs: "Pre-call brief", "Post-call logger", "Memory timeline"
- Active tab state managed with `useState`
- No routing. Render the active component based on tab state.
- Top navbar with app name "SalesMemory" and a small green dot + "Hindsight connected" indicator

### PreCallBrief.jsx
- Text input for prospect name with a "Brief me" button
- On submit: POST to `/brief`, show loading state
- Result renders as a structured card:
  - Prospect name + company (parsed from input)
  - Badge showing interaction count (e.g. "4th interaction")
  - Section: "Key objections (remembered)" — renders each objection as a pill/tag
  - Section: "What to focus on today" — renders the `focus_today` text
  - If `memory_backed` is false: show a neutral notice "No prior interactions found. This is a first contact."
  - If `memory_backed` is true: show a blue info bar "Hindsight recalled X past interactions to generate this brief"

### PostCallLogger.jsx
- Text input for prospect name
- Textarea for call notes (placeholder: "What happened? Objections raised, decisions made, next steps...")
- Dropdown for outcome: First contact / Objection logged / Positive signal / Deal progressed
- "Save to memory" button
- On submit: POST to `/log`, show loading state
- On success: show green confirmation bar with the message from the API response
- Clear the textarea after successful save (keep prospect name filled)

### MemoryTimeline.jsx
- Text input for prospect name with a "Load timeline" button
- On submit: GET `/timeline/{prospect_name}`
- Renders a vertical timeline:
  - Each entry shows: call number, rough date, summary text, outcome badge
  - Badge colours: first_contact = gray, objection_logged = amber, positive_signal = blue, deal_progressed = green
  - Most recent interaction at the top
- If no interactions found: "No memory found for this prospect yet."

### api.js
Centralise all API calls here. Base URL read from `import.meta.env.VITE_API_URL` with fallback to `http://localhost:8000`.

```javascript
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function getBrief(prospectName) {
  const res = await fetch(`${BASE}/brief`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prospect_name: prospectName })
  });
  return res.json();
}

export async function logCall(prospectName, summary, outcome) {
  const res = await fetch(`${BASE}/log`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prospect_name: prospectName, summary, outcome })
  });
  return res.json();
}

export async function getTimeline(prospectName) {
  const res = await fetch(`${BASE}/timeline/${encodeURIComponent(prospectName)}`);
  return res.json();
}
```

---

## 11. Design Rules

- Clean, minimal UI. White cards on a light gray background.
- Font: system sans-serif stack
- No dark mode required
- No animations except simple loading spinners on API calls
- Use Tailwind utility classes throughout — no custom CSS files
- Responsive down to 768px — this is a desktop-first product but should not break on tablet
- The three-tab layout is fixed — do not change the navigation structure
- Colour for outcome badges:
  - `first_contact` → gray
  - `objection_logged` → amber/yellow
  - `positive_signal` → blue
  - `deal_progressed` → green

---

## 12. What NOT to Build

Read this carefully. These are explicit exclusions.

- **No authentication or login system** — single user, no sessions, no JWT
- **No database** — Hindsight is the only persistence layer
- **No CRM integration** — no Salesforce, HubSpot, or any external CRM API
- **No email or calendar integration**
- **No mobile app** — web only
- **No phone/SMS/WhatsApp integration**
- **No multi-user or team features**
- **No dashboard with aggregate stats** (total calls, win rate, etc.)
- **No search or filtering** on the timeline beyond fetching by prospect name
- **No edit or delete of past memory entries**
- **No user preferences or settings page**
- **No dark mode**
- **No pagination** — fetch up to 20 interactions max, display all
- **No file uploads**
- **No streaming LLM responses** — standard request/response is fine

---

## 13. Error Handling

- If Hindsight returns no results: handle gracefully, do not crash — return the "no memory found" response format
- If Groq API fails: return a 500 with message "Brief generation failed — try again"
- If prospect name is empty: return 400 with message "Prospect name is required"
- Frontend: show inline error messages below the relevant input, not alerts or popups
- All API errors should be caught and displayed to the user as a red inline notice

---

## 14. Setup & Run Instructions

Include these in the README.

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in API keys
python seed.py         # seeds synthetic prospect data into Hindsight (run once)
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
echo "VITE_API_URL=http://localhost:8000" > .env.local
npm run dev
```

### Deploy
- Frontend: `vercel deploy` from the frontend folder
- Backend: push to GitHub, connect to Render, set env vars in Render dashboard

---

## 15. Hindsight Setup (Run First)

Before running the app, set up Hindsight using the official skills repo:

```bash
git clone --depth 1 https://github.com/vectorize-io/hindsight-skills.git ~/hindsight-skills
cd ~/hindsight-skills && ./setup
```

Then in a new Claude Code or Codex session inside the project repo, run:
```
/hindsight-architect
```

This will scaffold the Hindsight pipeline and populate `HINDSIGHT_PIPELINE_ID` in your `.env`.

Use promo code `MEMHACK515` on https://ui.hindsight.vectorize.io to get $50 free credits.

---

## 16. Key Links

- Hindsight docs: https://hindsight.vectorize.io/
- Hindsight GitHub: https://github.com/vectorize-io/hindsight
- Hindsight Cloud: https://ui.hindsight.vectorize.io
- Agent memory overview: https://vectorize.io/what-is-agent-memory
- Groq console: https://console.groq.com

---

## 17. The Demo Story (For Reference)

When demonstrating this product to judges, the story is:

1. Open the Pre-call Brief tab. Type "Priya Sharma".
2. Show the generated brief — 4 past interactions, specific objections, actionable focus.
3. Say: "Without Hindsight, this is a blank page. With it, every call starts with everything you need to know."
4. Switch to Memory Timeline. Show Priya's 4-interaction history — the progression from cold to pilot agreed.
5. Switch to Post-call Logger. Type a new note. Save it.
6. Go back to Pre-call Brief. Search Priya again. Show the brief now includes the new interaction.
7. Say: "The memory compounds. Every rep who calls this prospect from now on starts smarter."

This is the before/after that makes the project stand out.
