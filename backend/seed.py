import json
import os
from datetime import datetime, timedelta
import memory
from dotenv import load_dotenv

load_dotenv()

async def seed_data():
    data_path = os.path.join(os.path.dirname(__file__), "..", "data", "synthetic_prospects.json")
    
    with open(data_path, "r") as f:
        prospects = json.load(f)
        
    print("[INFO] Clearing existing memories in the Hindsight bank for a clean slate...")
    try:
        await memory.client.memory.clear_bank_memories(bank_id=memory.BANK_ID)
        print("[SUCCESS] Bank memories cleared successfully!")
    except Exception as e:
        print(f"[WARN] Note: Clear bank memories command returned: {e}")
        
    print(f"[INFO] Seeding {len(prospects)} prospects...")
    
    # Use today's midnight as a stable base date for deterministic seeding timestamps
    base_date = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    
    for prospect in prospects:
        name = prospect["name"]
        tag_name = name.lower().strip()
        print(f"Seeding interactions for {name}...")
        
        for idx, interaction in enumerate(prospect["interactions"]):
            days_ago = interaction["days_ago"]
            timestamp = (base_date - timedelta(days=days_ago)).isoformat()
            
            # Generate a completely stable, deterministic doc_id for this synthetic call log
            doc_id = f"seed_{tag_name}_{idx}"
            
            await memory.retain_interaction(
                prospect_name=name,
                summary=interaction["summary"],
                outcome=interaction["outcome"],
                timestamp=timestamp,
                doc_id=doc_id
            )
            print(f"  - Stored interaction from {days_ago} days ago (ID: {doc_id})")
            
    print("[SUCCESS] Seeding complete and verified!")

if __name__ == "__main__":
    import asyncio
    asyncio.run(seed_data())
