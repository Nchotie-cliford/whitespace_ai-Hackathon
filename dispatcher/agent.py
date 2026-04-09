import os
import json
from pydantic import BaseModel
from typing import List, Optional
from openai import OpenAI

# ---------------------------------------------------------
# Define the Output Contract (What we return to Data Layer)
# ---------------------------------------------------------
class AssignedTask(BaseModel):
    task_id: str
    assigned_to: str # worker_id
    scheduled_time: str # e.g. "09:00-11:00"
    reasoning: str # Why the AI made this choice

class DispatchResult(BaseModel):
    assignments: List[AssignedTask]
    unassigned_tasks: List[str] # Tasks that couldn't fit
    summary: str # High-level summary for the UI team

# ---------------------------------------------------------
# Dispatcher Logic
# ---------------------------------------------------------
def run_dispatcher(current_state_json: str, chaos_trigger: str) -> str:
    """
    Takes the JSON from the data layer and a trigger message, 
    returns a JSON string of assignments.
    """
    
    # In a real setup, we'd check os.getenv("OPENAI_API_KEY")
    api_key = os.getenv("OPENAI_API_KEY")
    client = OpenAI(api_key=api_key)
    
    system_prompt = """
    You are an expert master dispatcher for a trades business. 
    Your goal is to optimize the daily schedule. 
    Assign tasks to available technicians based on their skills and the required time slots.
    If constraints prevent a task from being assigned today, put its ID in the unassigned_tasks list.
    """
    
    user_prompt = f"""
    Here is the current state of resources and tasks:
    {current_state_json}
    
    The following event has occurred, requiring re-dispatching:
    {chaos_trigger}
    
    Please provide the new optimal schedule.
    """

    try:
        # We use strict Pydantic parsing (Beta feature in OpenAI library) to guarantee our JSON response format
        response = client.beta.chat.completions.parse(
            model="gpt-4o-2024-08-06", # Ensure a model that natively supports output parsing
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format=DispatchResult
        )

        dispatch_output = response.choices[0].message.parsed
        return dispatch_output.json()

    except Exception as e:
        print(f"Dispatcher failed: {e}")
        return json.dumps({"error": str(e)})


# ---------------------------------------------------------
# Local Testing / Mocks (Assuming Data layer isn't ready)
# ---------------------------------------------------------
if __name__ == "__main__":
    
    # Mock Data Layer Input
    mock_state = {
        "technicians": [
            {"id": "TECH_01", "name": "Mario", "skills": ["plumbing"], "status": "available"},
            {"id": "TECH_02", "name": "Luigi", "skills": ["electrical", "plumbing"], "status": "available"}
        ],
        "tasks": [
            {"id": "TASK_101", "description": "Install new sink", "required_skill": "plumbing", "duration_hours": 2},
            {"id": "TASK_102", "description": "Rewire kitchen", "required_skill": "electrical", "duration_hours": 4}
        ]
    }
    
    # Mock Trigger from UI
    mock_trigger = "URGENT: TECH_01 just called in sick. Re-route his jobs."
    
    print("Running Dispatcher Engine...")
    print(f"Trigger Context: {mock_trigger}\n")
    
    # ONLY RUN if you have set OPENAI_API_KEY in your env
    if os.getenv("OPENAI_API_KEY"):
        result_json = run_dispatcher(json.dumps(mock_state), mock_trigger)
        print("Dispatcher Result JSON:")
        print(json.dumps(json.loads(result_json), indent=2))
    else:
        print("Warning: OPENAI_API_KEY not set. Dispatcher simulation bypassed. Please set key to test real LLM reasoning.")
