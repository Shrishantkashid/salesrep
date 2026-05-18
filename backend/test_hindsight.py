from hindsight_client import Hindsight
import os
from dotenv import load_dotenv

load_dotenv()

client = Hindsight(
    base_url=os.getenv("HINDSIGHT_API_URL", "https://api.hindsight.vectorize.io"),
    api_key=os.getenv("HINDSIGHT_API_KEY")
)

# Test retain
client.retain(
    bank_id=os.getenv("HINDSIGHT_MEMORY_BANK_ID"),
    content="Test: Priya Sharma called. Budget approved.",
    metadata={"prospect": "Priya Sharma", "type": "test"}
)

print("Retain: OK")

# Test recall
results = client.recall(
    bank_id=os.getenv("HINDSIGHT_MEMORY_BANK_ID"),
    query="Priya Sharma budget"
)

print("Recall: OK")
print(results)

# Proper cleanup
if hasattr(client, "close"):
    client.close()