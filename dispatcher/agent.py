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
def run_dispatcher(payload_json: str, task_id: str) -> str:
    """Takes the exact DispatcherInputPayload format and returns a SingleTaskDispatchResult format."""
    
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
    
    Calculate the optimal reroute specifically for the task with ID: {task_id}.
    Generate the structured JSON output with the assigned changed_user_id and a clear explanation.
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
    """Parses web/HERO_data.js (strips JS wrapper) into the dispatcher payload."""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read().strip()

    # Strip the JS wrapper: "window.HERO_DATA = {...};" → pure JSON
    if content.startswith('window.HERO_DATA'):
        # Remove everything up to and including the first '='
        content = content[content.index('=') + 1:].strip()
        # Remove trailing semicolon if present
        if content.endswith(';'):
            content = content[:-1].strip()

    raw_data = json.loads(content)["system_data"]
        
    custom = raw_data.get("custom_data_layer", {})
    
    # 2. Build Technicians driven strictly by HERO_data.json logic (No hardcoded Bobs)
    technicians = []
    # Merge basic user data with custom extensions safely
    tech_extensions = {
        ext["user_id"]: ext for ext in custom.get("technicians_extension", {}).get("skills_schema", {}).get("mapping", [])
    }
    status_ext = {
        ext["user_id"]: ext for ext in custom.get("technicians_extension", {}).get("status_schema", {}).get("mapping", [])
    }
    zone_ext = {
        ext["user_id"]: ext for ext in custom.get("technicians_extension", {}).get("geographic_zone_schema", {}).get("mapping", [])
    }
    
    for partner in raw_data.get("partners", []):
        uid = partner["user_id"]
        technicians.append({
            "id": str(uid),
            "name": partner.get("full_name", str(uid)),
            "status": status_ext.get(uid, {}).get("status", "unavailable"),
            "skills": tech_extensions.get(uid, {}).get("skills", []),
            "geographic_zone": zone_ext.get(uid, {}).get("current_zone", "Unknown")
        })
    
    # 3. Build Uncompleted Tasks driven strictly by HERO_data.json
    uncompleted_tasks = []
    biz_value_map = {m["task_id"]: m.get("business_value") for m in custom.get("tasks_extension", {}).get("business_value_schema", {}).get("mapping", [])}
    flex_map = {m["task_id"]: m.get("is_flexible") for m in custom.get("tasks_extension", {}).get("is_flexible_schema", {}).get("mapping", [])}
    skills_map = {m["task_id"]: m.get("required_skills") for m in custom.get("tasks_extension", {}).get("required_skills_schema", {}).get("mapping", [])}
    
    for proj in raw_data.get("projects", []):
        if "task" in proj:
            tid = proj["task"]["id"]
            uncompleted_tasks.append({
                "id": str(tid),
                "customer_id": str(proj.get("customer_id")),
                "description": proj["task"].get("title", "Unknown Task"),
                "required_skills": skills_map.get(tid, []),
                "business_value": biz_value_map.get(tid, "LOW"),
                "is_flexible": flex_map.get(tid, True),
                "scheduled_time": proj["task"].get("due_date", "None"),
                "geographic_zone": proj.get("address", {}).get("city", "Unknown"),
                "currently_assigned_to": str(proj["task"].get("target_user_id", "null"))
            })

    return {
        "trigger_event": "Dynamic event sent by UI or unprovided",
        "technicians": technicians,
        "uncompleted_tasks": uncompleted_tasks
    }

def run_dispatcher_with_mock(task_id: str) -> str:
    payload = build_payload_from_hero_data("web/HERO_data.js")
    return run_dispatcher(json.dumps(payload), task_id)

def run_dispatcher_for_single_task(task_id: str) -> str:
    """Isolates the AI reassignment specifically for one task."""
    payload = build_payload_from_hero_data("web/HERO_data.js")
    
    # Strip "TSK-" prefix just in case the UI passes it
    clean_task_id = str(task_id).replace("TSK-", "")
    
    # Filter the uncompleted_tasks down to only the requested one to verify it exists
    target_task = next((t for t in payload["uncompleted_tasks"] if str(t["id"]) == clean_task_id), None)
    
    if not target_task:
        return json.dumps({"error": f"Task {clean_task_id} not found."})
        
    # DO NOT wipe the rest of the schedule! We need the AI to see all tasks to check if tech is busy!
    payload["target_task_to_reassign"] = target_task
    payload["trigger_event"] = {"event_type": "manual_reassignment", "target_id": clean_task_id, "message": f"UI requests immediate reassignment of Task {clean_task_id}."}
    
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return json.dumps({"error": "GEMINI_API_KEY not configured"})
        
    client = genai.Client(api_key=api_key)
    
    system_prompt = """
    You are an expert dispatcher for a trades business. You are speaking directly to Emilio, your human dispatcher manager.
    A specific task needs immediate attention and reassignment.
    Look at the single task provided and the available technicians.
    Select the optimal technician to assign based on the following algorithm:
    1. Skill Checking: Do the technician's skills overlap with the required skills exactly? If not, compare the closest available technicians and provide a percentage (%) estimate of how high the possible fit is (e.g., '80% fit because they know electrical but not solar').
    2. Capacity Checking: Does the assigned technician actually have availability for this task, or are they marked 'sick', 'unavailable', or completely overloaded?
    3. Geographic Matching: Are they in the same zone?
    
    In the `human_explanation` field, structure your output strictly into **exactly two sentences**. 
    Sentence 1: A warm greeting to Emilio followed by the justification (Availability, Skill Fit %, Location).
    Sentence 2: A quick Risk Assessment detailing any constraints taken.
    """
    
    user_prompt = f"""
    Find the best technician for this dataset:
    {json.dumps(payload, indent=2)}
    
    Calculate the optimal reroute and generate the structured JSON format representing this single reassignment.
    """

    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[system_prompt, user_prompt],
             config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=DispatchResult,
                temperature=0.1
            )
        )
        return response.text
    except Exception as e:
        print(f"Task Dispatcher failed: {e}")
        return json.dumps({"error": str(e)})

# ---------------------------------------------------------
# Local Scenario Testing (The High-Stakes Breakdown MVP)
# ---------------------------------------------------------
if __name__ == "__main__":
    
    if os.getenv("GEMINI_API_KEY") and os.getenv("GEMINI_API_KEY") != "your_key_here":
        print("Parsing 'web/HERO_data.js' and running Dispatcher...")
        result = run_dispatcher_with_mock("1678518")
        print("\nFinal Output JSON (To be sent back to UI/HERO):")
        print(result)
    else:
        print("Skipping run. GEMINI_API_KEY environment variable is not configured.")
