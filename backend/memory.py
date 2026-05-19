import os
from datetime import datetime
from hindsight_client import Hindsight
from dotenv import load_dotenv

load_dotenv()

# Client initialization
client = Hindsight(
    base_url=os.getenv("HINDSIGHT_API_URL", "https://api.hindsight.vectorize.io"),
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

BANK_ID = os.getenv("HINDSIGHT_MEMORY_BANK_ID", "sales-memory-agent")

async def recall_prospect(prospect_name: str) -> tuple[str, int]:
    """Retrieve all past memory about a prospect. Returns (recalled_text, interaction_count)."""
    # Normalize name for tag matching
    tag_name = prospect_name.lower().strip()
    
    response = await client.arecall(
        bank_id=BANK_ID,
        query=f"all interactions and context about prospect {prospect_name}",
        # We use a filter to ensure we only get memories for this prospect
        tags=[f"prospect:{tag_name}"],
        tags_match="any_strict", # Ensure we ONLY get memories with this tag
        max_tokens=2000
    )
    
    # Calculate exact interaction count from metadata
    interactions_seen = set()
    for m in response.results:
        meta = m.metadata or {}
        if meta.get("type") == "call_log":
            doc_id = m.document_id or m.id
            interactions_seen.add(doc_id)
            
    interaction_count = len(interactions_seen)
    recalled_text = "\n".join([r.text for r in response.results])
    
    return recalled_text, interaction_count

async def retain_interaction(prospect_name: str, summary: str, outcome: str, timestamp: str = None, doc_id: str = None):
    """Store a single call interaction in Hindsight."""
    if not timestamp:
        timestamp = datetime.now().isoformat()
        
    content = f"""
    Prospect: {prospect_name}
    Date: {timestamp}
    Outcome: {outcome}
    Summary: {summary}
    """
    
    # Normalize name for tag matching
    tag_name = prospect_name.lower().strip()
    
    # Create a unique document_id for this interaction to avoid counting derived facts
    if not doc_id:
        doc_id = f"call_{tag_name}_{timestamp.replace(':', '-').replace('.', '-')}"
    
    await client.aretain(
        bank_id=BANK_ID,
        content=content,
        context="call_log",
        document_id=doc_id,
        tags=[f"prospect:{tag_name}", "type:call_log"],
        metadata={
            "prospect": prospect_name,
            "outcome": outcome,
            "timestamp": timestamp,
            "type": "call_log",
            "summary": summary # Store summary directly in metadata for faster retrieval
        }
    )

async def get_timeline(prospect_name: str) -> list:
    """Retrieve all interactions for a prospect."""
    # Normalize name for tag matching
    tag_name = prospect_name.lower().strip()
    
    # We use arecall with specific tags to filter for this prospect's call logs
    response = await client.arecall(
        bank_id=BANK_ID,
        query=f"all call logs for prospect {prospect_name}",
        tags=[f"prospect:{tag_name}", "type:call_log"],
        tags_match="all_strict", # Ensure we only get memories with BOTH tags
        max_tokens=4000
    )
    
    interactions_map = {}
    for m in response.results:
        # Extract data from metadata
        meta = m.metadata or {}
        
        # ONLY count original call logs, ignore derived facts/observations
        if meta.get("type") != "call_log":
            continue
            
        doc_id = m.document_id or m.id
        
        if doc_id not in interactions_map:
            interactions_map[doc_id] = {
                "date": meta.get("timestamp", "Unknown date"),
                "summary": meta.get("summary") or m.text.split("Summary:")[-1].strip(),
                "outcome": meta.get("outcome", "unknown")
            }
    
    interactions = list(interactions_map.values())
    
    # Sort by date descending
    interactions.sort(key=lambda x: x["date"], reverse=True)
    
    return interactions

async def get_all_prospects() -> list[str]:
    """Return all unique prospect names stored in Hindsight memory."""
    try:
        response = await client.arecall(
            bank_id=BANK_ID,
            query="prospect call log interaction summary",
            tags=["type:call_log"],
            tags_match="any_strict",
            max_tokens=4000
        )

        names = set()
        if response and response.results:
            for item in response.results:
                metadata = item.metadata or {}
                prospect = metadata.get("prospect")
                if prospect:
                    names.add(prospect)

        return list(names)
    except Exception:
        return []
