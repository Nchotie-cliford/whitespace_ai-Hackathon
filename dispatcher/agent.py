import os
import json
from pydantic import BaseModel, Field
from typing import List, Optional
from openai import OpenAI

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
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    
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
        response = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format=DispatchResult
        )

        return response.choices[0].message.parsed.json()

    except Exception as e:
        print(f"Dispatcher failed: {e}")
        return json.dumps({"error": str(e)})

# ---------------------------------------------------------
# Local Scenario Testing (The High-Stakes Breakdown MVP)
# ---------------------------------------------------------
if __name__ == "__main__":
    
    # Matching the exact schema defined in data_schema.json + scenario.md
    mock_payload = {
        "trigger_event": {
            "event_type": "worker_breakdown",
            "target_id": "TECH_A",
            "message": "URGENT: Tech A's van broke down. Out for the rest of the day."
        },
        "technicians": [
            {
                "id": "TECH_A", "name": "Master Plumber Alice", "status": "unavailable",
                "skills": ["plumbing", "master"], "geographic_zone": "Zone_North"
            },
            {
                "id": "TECH_B", "name": "Junior Plumber Bob", "status": "active",
                "skills": ["plumbing"], "geographic_zone": "Zone_North"
            }
        ],
        "uncompleted_tasks": [
            {
                "id": "TASK_COMMERCIAL", "description": "High-rise pipe burst", "customer_id": "CUST_01",
                "required_skills": ["plumbing"], "business_value": "HIGH", "is_flexible": False, 
                "geographic_zone": "Zone_North", "currently_assigned_to": "TECH_A"
            },
            {
                "id": "TASK_RESIDENTIAL_1", "description": "Leaky faucet", "customer_id": "CUST_02",
                "required_skills": ["plumbing"], "business_value": "LOW", "is_flexible": True,
                "geographic_zone": "Zone_North", "currently_assigned_to": "TECH_A"
            },
            {
                 "id": "TASK_BOB_MAINTENANCE", "description": "Routine check", "customer_id": "CUST_03",
                 "required_skills": ["plumbing"], "business_value": "LOW", "is_flexible": True,
                 "geographic_zone": "Zone_North", "currently_assigned_to": "TECH_B"
            }
        ]
    }
    
    if os.getenv("OPENAI_API_KEY") and os.getenv("OPENAI_API_KEY") != "your_key_here":
        print("Running High-Stakes Chaos Protocol with OpenAI Engine...\n")
        result = run_dispatcher(json.dumps(mock_payload))
        print("Final Output JSON (To be sent back to UI/HERO):")
        print(json.dumps(json.loads(result), indent=2))
    else:
        print("Skipping run. OPENAI_API_KEY environment variable is not configured.")
