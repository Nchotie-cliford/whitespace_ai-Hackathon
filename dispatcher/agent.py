import os
import json
from dotenv import load_dotenv
load_dotenv() # Load variables from .env
from pydantic import BaseModel, Field
from typing import List, Optional

# Import Google GenAI SDK (google-genai)
from google import genai
from google.genai import types

# ---------------------------------------------------------
# Output Contract: Sent back to UI/Data Layer
# ---------------------------------------------------------
class ReassignedTask(BaseModel):
    task_id: str
    new_technician_id: Optional[str] = Field(description="The ID of the new tech, or null if unassigned")
    scheduled_time: str
    human_explanation: str = Field(description="A plain-english justification for why this move happened")
    is_rescheduled_to_tomorrow: bool = Field(description="True if dropping low-priority tasks off today's schedule")

class DispatchResult(BaseModel):
    assignments: List[ReassignedTask]
    confidence_score_percent: int = Field(description="0-100 score of how confident AI is in this plan")
    needs_human_review: bool = Field(description="True if confidence is low, or high financial assets are affected")
    executive_summary: str = Field(description="One paragraph summarizing the overall strategy chosen")

# ---------------------------------------------------------
# Dispatcher Logic Engine
# ---------------------------------------------------------
def run_dispatcher(payload_json: str) -> str:
    """Takes the exact DispatcherInputPayload format and returns a DispatchResult format."""
    
    # Intialize Google GenAI client (Retrieves GEMINI_API_KEY from environment)
    api_key = os.getenv("GEMINI_API_KEY")
    client = genai.Client(api_key=api_key)
    
    system_prompt = """
    You are an expert dispatcher for a trades business executing the High-Stakes Chaos protocol.
    Your goals:
    1. Minimize financial impact. HIGH business value tasks must be saved at all costs.
    2. Geographic clustering. Prefer technicians in the same zone.
    3. Skill matching. You must not send unqualified technicians. 
    4. Trust & Safety. Explain every change clearly. If a low-value task cannot be completed, flag it to be rescheduled to tomorrow.
    """
    
    user_prompt = f"""
    Here is the incoming JSON payload from the data layer containing the chaos trigger, tech status, and tasks:
    {payload_json}
    
    Calculate the optimal reroute and generate the structured JSON output.
    """

    try:
        # Utilize Gemini with strict JSON Structured Outputs
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[system_prompt, user_prompt],
             config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=DispatchResult,
                temperature=0.1 # Keep logic extremely rigid 
            )
        )
        # response.text is automatically formatted as a JSON string matching DispatchResult
        return response.text

    except Exception as e:
        print(f"Dispatcher failed: {e}")
        return json.dumps({"error": str(e)})

# ---------------------------------------------------------
# Dynamic Parsing from HERO_data.json
# ---------------------------------------------------------
def build_payload_from_hero_data(filepath: str) -> dict:
    """Parses the dense mock data file into our focused DispatcherInputPayload."""
    with open(filepath, 'r') as f:
        raw_data = json.load(f)["system_data"]
        
    custom = raw_data["custom_data_layer"]
    
    # 1. Grab specifically the sick technician event for the MVP
    trigger = custom["trigger_events"]["mock_events"][0]
    payload_trigger = {
        "event_type": "worker_breakdown",
        "target_id": str(trigger["target_id"]),
        "message": trigger["message"]
    }
    
    # 2. Build Technicians
    technicians = []
    # Merge basic user data with custom extensions
    tech_extensions = {
        ext["user_id"]: ext for ext in custom["technicians_extension"]["skills_schema"]["mapping"]
    }
    status_ext = {
        ext["user_id"]: ext for ext in custom["technicians_extension"]["status_schema"]["mapping"]
    }
    zone_ext = {
        ext["user_id"]: ext for ext in custom["technicians_extension"]["geographic_zone_schema"]["mapping"]
    }
    
    for partner in raw_data["partners"]:
        uid = partner["user_id"]
        # Add tech_B purely to have capacity to re-assign
        technicians.append({
            "id": str(uid),
            "name": partner["full_name"],
            "status": status_ext.get(uid, {}).get("status", "unavailable"),
            "skills": tech_extensions.get(uid, {}).get("skills", []),
            "geographic_zone": zone_ext.get(uid, {}).get("current_zone", "Unknown")
        })
    # Hardcode a "Tech B" based on our scenario, as only Cliford is in partners
    technicians.append({
        "id": "315140", "name": "Junior Plumber Bob", "status": "active",
        "skills": ["plumbing", "electrical"], "geographic_zone": "Berlin-Mitte"
    })
    
    # 3. Build Uncompleted Tasks
    uncompleted_tasks = []
    biz_value_map = {m["task_id"]: m["business_value"] for m in custom["tasks_extension"]["business_value_schema"]["mapping"]}
    flex_map = {m["task_id"]: m["is_flexible"] for m in custom["tasks_extension"]["is_flexible_schema"]["mapping"]}
    skills_map = {m["task_id"]: m["required_skills"] for m in custom["tasks_extension"]["required_skills_schema"]["mapping"]}
    
    for proj in raw_data.get("projects", []):
        if "task" in proj:
            tid = proj["task"]["id"]
            uncompleted_tasks.append({
                "id": str(tid),
                "customer_id": str(proj["customer_id"]),
                "description": proj["task"]["title"],
                "required_skills": skills_map.get(tid, []),
                "business_value": biz_value_map.get(tid, "LOW"),
                "is_flexible": flex_map.get(tid, True),
                "scheduled_time": proj["task"]["due_date"],
                "geographic_zone": proj["address"]["city"],
                "currently_assigned_to": str(proj["task"]["target_user_id"])
            })

    return {
        "trigger_event": payload_trigger,
        "technicians": technicians,
        "uncompleted_tasks": uncompleted_tasks
    }

def run_dispatcher_with_mock(filepath: str) -> str:
    payload = build_payload_from_hero_data(filepath)
    return run_dispatcher(json.dumps(payload))

# ---------------------------------------------------------
# Local Scenario Testing (The High-Stakes Breakdown MVP)
# ---------------------------------------------------------
if __name__ == "__main__":
    
    if os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_key_here":
        print("Parsing 'data/HERO_data.json' and running Dispatcher...")
        result = run_dispatcher_with_mock("data/HERO_data.json")
        print("\nFinal Output JSON (To be sent back to UI/HERO):")
        print(result) # Result is already a validated JSON string
    else:
        print("Skipping run. GEMINI_API_KEY environment variable is not configured.")
