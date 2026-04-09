# Dispatcher Data Requirements

To execute the targeted "High-Stakes Chaos" scenario—and successfully perform routing, priority scoring, and financial protection—the Dispatcher team requires specific contextual data from the **Data Layer team**.

Without this context, the Dispatcher cannot make intelligent decisions. It operates blindly. 

## 1. Technician Data (The Resources)
The dispatcher needs to know *who* is available, *where* they are, and *what* they can do.
* **Core ID & Status:** So we know who to assign jobs to and if they are active, busy, or broken down.
* **Skills Array:** `["plumbing", "master"]`. The AI will use this to prevent placing an unqualified worker on a complex job.
* **Current Geographic Zone:** For geographic clustering, the AI needs to know where the tech is currently located (e.g., "Zone_North" or exact lat/long) to minimize travel time.

## 2. Task & Project Data (The Demand)
The dispatcher needs to understand the work queue, but more importantly, the *business context* behind the work.
* **Financial/Priority Value:** This is critical for our scenario. A tag like `priority: "High (Commercial)"` vs `priority: "Low (Residential)"` allows the AI to sacrifice small jobs to save big ones.
* **Required Skills:** To match the technician's capabilities.
* **Time Constraints:** Is the job fixed at 9:00 AM, or is it flexible and able to be pushed to tomorrow?
* **Location:** To map the job against the technicians' current geographic zones.

## 3. The Trigger Event (The Chaos)
The Dispatcher does not run on a loop; it is triggered by an API call when something goes wrong. We need to know:
* **The Event Type:** e.g., `worker_breakdown`, `emergency_lead`, `job_overrun`.
* **The Target:** Who or what broke? (e.g., `Tech_A` is unavailable).

*The precise technical structure of this contract is defined in `data_schema.json`.*
