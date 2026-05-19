# 3-Minute Screen-Recorded Demo Script (SalesMemory)

## 1) Quick intro — ~30 sec

**Narration (conversational):**
“Hey, I’m Shrishant. I built SalesMemory, a sales copilot that gives reps persistent memory across calls. Instead of starting every conversation cold, it pulls historical context, key objections, and next-step guidance before the call. Then after each call, reps can log notes in plain English, and that becomes memory for future briefings.”

**On-screen cues:**
- Open the app home screen and let the header + tabs sit for 2–3 seconds.
- Point out the three tabs: **Pre-call brief**, **Post-call logger**, **Memory timeline**.
- Briefly hover over the memory status badge (“Hindsight connected” / “Memory Offline”).
- Optional split-screen or terminal pop-in: show backend endpoints in `backend/main.py` (`/brief`, `/log`, `/timeline/{prospect_name}`).

---

## 2) Show the problem — ~30 sec

**Narration:**
“Let me show what goes wrong when the agent has no memory. I’ll go to Pre-call brief, keep the same prospect name, but switch Memory OFF. Now the system can’t recall prior objections, budget signals, or competitor context. It falls back to generic discovery advice, which is exactly how reps waste cycles and repeat questions.”

**On-screen cues:**
- In **Pre-call brief**, enter a known prospect (example: `Priya Sharma`).
- Toggle from **Memory ON** to **Memory OFF**.
- Click **Brief me**.
- Pause on the warning UI: “Entering Blind — Memory Disabled,” “Objections Bypassed,” “Budget Context Locked.”
- Highlight that this behavior is triggered via `use_memory: false` in the `/brief` request.

---

## 3) Live demo (before/after) — ~2 min

### Part A — Seed or confirm historical memory (~30 sec)

**Narration:**
“I’ll quickly log a real interaction so we have fresh memory to work with.”

**On-screen cues:**
1. Switch to **Post-call logger** tab.
2. Use:
   - Prospect Name: `Priya Sharma`
   - Outcome: `deal_progressed`
   - Call Notes: “Approved a 3-seat pilot for June. Budget clears after Q3. Main risk is CRM migration timeline.”
3. Click **Save to memory** and pause on success message:
   - “Stored in Hindsight. Next brief for Priya Sharma will include this interaction.”

> Optional terminal cutaway (if you want API-level proof):
>
> ```bash
> curl -X POST http://localhost:8000/log \
>   -H "Content-Type: application/json" \
>   -d '{"prospect_name":"Priya Sharma","summary":"Approved a 3-seat pilot for June. Budget clears after Q3. Main risk is CRM migration timeline.","outcome":"deal_progressed"}'
> ```

### Part B — Before vs after in Pre-call brief (~55 sec)

**Narration:**
“Now watch the exact same prospect with memory ON. This is the before/after moment.”

**On-screen cues:**
1. Go back to **Pre-call brief**.
2. Keep prospect as `Priya Sharma`.
3. First, briefly show **Memory OFF** result again (generic, blind guidance).
4. Toggle to **Memory ON** and click **Brief me**.
5. Pause on:
   - interaction count badge
   - “Hindsight recalled X past interactions” banner
   - key objections chips
   - focus recommendation
   - deal health card (if present)
6. Verbally call out that the backend path is:
   - `memory.recall_prospect(...)` → `agent.generate_brief(...)` → `/brief` response.

> Optional terminal proof:
>
> ```bash
> curl -X POST http://localhost:8000/brief \
>   -H "Content-Type: application/json" \
>   -d '{"prospect_name":"Priya Sharma","use_memory":true}'
> ```

### Part C — Show persistent timeline (~35 sec)

**Narration:**
“And this isn’t just one response—it’s persistent. Every interaction is retrievable as a timeline, so reps can see momentum and context over time.”

**On-screen cues:**
1. Open **Memory timeline** tab.
2. Search `Priya Sharma`.
3. Click **Load timeline**.
4. Scroll through entries and point at outcome badges (`first_contact`, `objection_logged`, `positive_signal`, `deal_progressed`).

> Optional API proof:
>
> ```bash
> curl http://localhost:8000/timeline/Priya%20Sharma
> ```

---

## 4) One key takeaway — ~30 sec

**Narration:**
“What surprised me most is how dramatic the quality jump is from one toggle: memory OFF sounds like a generic assistant, memory ON sounds like a teammate who actually remembers the account history. The important part is this is not prompt trickery—there’s a real memory layer behind it, and every new call compounds value.”

**On-screen cues:**
- End on a side-by-side pause:
  - Left: Memory OFF brief (generic)
  - Right: Memory ON brief (context-aware)
- Final freeze frame on app header + “Powered by Hindsight Agent Memory.”

---

## Suggested run order (for your recording)

1. Start backend: `cd backend && uvicorn main:app --reload`
2. Start frontend: `cd frontend && npm run dev`
3. Record in this sequence:
   - Intro in app shell
   - Problem with Memory OFF
   - Log interaction
   - Before/after in Pre-call brief
   - Timeline persistence
   - Closing takeaway
