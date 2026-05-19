import os
import json
from datetime import datetime
from groq import Groq
from dotenv import load_dotenv
from prompts import BRIEF_SYSTEM_PROMPT, build_brief_prompt, DIGEST_SYSTEM_PROMPT, build_digest_prompt

from memory import get_all_prospects, recall_prospect

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile" 

async def generate_brief(prospect_name: str, recalled_context: str, interaction_count: int):
    """Generate a structured brief using LLM and recalled context."""
    if not recalled_context.strip() or interaction_count == 0:
        return {
            "prospect_name": prospect_name,
            "interaction_count": 0,
            "key_objections": [],
            "focus_today": "No prior interactions found. This is a first contact — start fresh.",
            "last_contacted": None,
            "memory_backed": False,
            "deal_health": None
        }

    # Pass the actual interaction count to the prompt builder
    prompt = build_brief_prompt(prospect_name, recalled_context)
    prompt += f"\n\nIMPORTANT: The exact number of past interactions is {interaction_count}. Use this value for 'interaction_count' in your response."
    
    completion = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": BRIEF_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        response_format={"type": "json_object"}
    )
    
    raw = completion.choices[0].message.content.strip()
    
    # Strip markdown fences if model wraps in ```json
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()
    
    try:
        brief_data = json.loads(raw)
        brief_data["prospect_name"] = prospect_name
        brief_data["interaction_count"] = interaction_count # Override LLM guess with actual code count
        brief_data["memory_backed"] = True
        return brief_data
    except Exception as e:
        print(f"Error parsing LLM response: {e}")
        return {
            "prospect_name": prospect_name,
            "interaction_count": interaction_count,
            "key_objections": [],
            "focus_today": "Failed to parse generated brief details.",
            "last_contacted": None,
            "memory_backed": True,
            "deal_health": None
        }



async def generate_digest() -> dict:
    """
    Retrieve all known prospects from Hindsight, recall memory for each,
    and ask the LLM to categorise and prioritise them in a single call.
    """
    all_prospects = await get_all_prospects()

    if not all_prospects:
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "total_prospects": 0,
            "summary_line": "No prospect memory found yet. Log some calls first.",
            "needs_attention": [],
            "follow_up_this_week": [],
            "on_track": []
        }

    prospect_contexts = []
    for name in all_prospects:
        recalled_text, _interaction_count = await recall_prospect(name)
        if recalled_text:
            prospect_contexts.append({
                "name": name,
                "context": str(recalled_text)
            })

    if not prospect_contexts:
        return {
            "generated_at": datetime.utcnow().isoformat(),
            "total_prospects": 0,
            "summary_line": "Memory found but could not be recalled. Try again.",
            "needs_attention": [],
            "follow_up_this_week": [],
            "on_track": []
        }

    prompt = build_digest_prompt(prospect_contexts)

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": DIGEST_SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=1500
    )

    raw = response.choices[0].message.content.strip()

    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    raw = raw.strip()

    parsed = json.loads(raw)
    parsed["generated_at"] = datetime.utcnow().isoformat()
    parsed["total_prospects"] = len(prospect_contexts)
    return parsed
