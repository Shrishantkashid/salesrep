from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import memory
import agent
from agent import generate_digest

app = FastAPI(title="Sales Memory Agent API")

# CORS setup for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BriefRequest(BaseModel):
    prospect_name: str
    use_memory: bool = True

class LogRequest(BaseModel):
    prospect_name: str
    summary: str
    outcome: str

class DealHealth(BaseModel):
    score: int                  # 0–100
    label: str                  # "Cold" | "Warming up" | "Engaged" | "Hot" | "At risk"
    momentum: str               # "improving" | "stalling" | "declining" | "new"
    risk: Optional[str]         # single biggest risk, plain English
    recommended_action: str     # one sentence, what to do on this call
    confidence: str             # "low" | "medium" | "high"

class BriefResponse(BaseModel):
    prospect_name: str
    interaction_count: int
    key_objections: list[str]
    focus_today: str
    last_contacted: Optional[str] = None
    memory_backed: bool
    memory_disabled: Optional[bool] = False
    deal_health: Optional[DealHealth] = None

@app.post("/brief", response_model=BriefResponse)
async def get_brief(request: BriefRequest):
    if not request.prospect_name:
        raise HTTPException(status_code=400, detail="Prospect name is required")
    
    try:
        if request.use_memory:
            recalled_context, interaction_count = await memory.recall_prospect(request.prospect_name)
        else:
            recalled_context, interaction_count = "", 0
            
        brief = await agent.generate_brief(request.prospect_name, recalled_context, interaction_count)
        
        # Inject explicit flag to distinguish bypassed memory vs genuine new prospect
        if not request.use_memory:
            brief["memory_backed"] = False
            brief["memory_disabled"] = True
        else:
            brief["memory_disabled"] = False
            
        return brief
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/log")
async def log_call(request: LogRequest):
    if not request.prospect_name:
        raise HTTPException(status_code=400, detail="Prospect name is required")
    
    try:
        await memory.retain_interaction(request.prospect_name, request.summary, request.outcome)
        return {
            "success": True, 
            "message": f"Stored in Hindsight. Next brief for {request.prospect_name} will include this interaction."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/timeline/{prospect_name}")
async def get_timeline(prospect_name: str):
    if not prospect_name:
        raise HTTPException(status_code=400, detail="Prospect name is required")
    
    try:
        interactions = await memory.get_timeline(prospect_name)
        return {
            "prospect_name": prospect_name,
            "total_interactions": len(interactions),
            "interactions": interactions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    # Asynchronous heartbeat check
    try:
        # Use arecall with 1 token as a lightweight heartbeat
        await memory.client.arecall(
            bank_id=memory.BANK_ID,
            query="heartbeat",
            max_tokens=1
        )
        return {"status": "ok", "hindsight": "connected"}
    except Exception as e:
        return {"status": "error", "hindsight": "disconnected", "detail": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)


@app.get("/digest")
async def get_weekly_digest():
    try:
        result = await generate_digest()
        return result
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=500,
            detail="Digest generation failed — LLM returned malformed JSON. Try again."
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Digest generation failed: {str(e)}"
        )
