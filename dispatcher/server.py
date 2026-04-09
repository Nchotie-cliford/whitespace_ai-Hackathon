from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dispatcher.agent import run_dispatcher_with_mock
import json

app = FastAPI()

# Allow the frontend to access this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/dispatch")
def execute_dispatcher(taskId: str = None):
    """Reads the JSON file, calculates the new schedule, and returns it to the UI."""
    try:
        if not taskId:
            return {"error": "taskId query parameter is required"}
        # Calls the function we built in agent.py which parses HERO_data.json
        result_json = run_dispatcher_with_mock("data/HERO_data.json", taskId)
        return json.loads(result_json)
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    # Start the server on port 8000
    uvicorn.run(app, host="0.0.0.0", port=8000)
