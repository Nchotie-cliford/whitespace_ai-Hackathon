# Hackathon Scenario: The High-Stakes Chaos

To build a compelling hackathon MVP, we cannot build every skill at once. Instead, we focus the Dispatcher on one highly relatable, high-value scenario that specifically demonstrates its **Core**, **Operational**, and **Trust & Safety** skills in action. 

## The Scenario Setup
It is 8:30 AM. The schedule is fully booked and optimized.
* **Tech A (Master Plumber)** has three jobs today:
  1. A high-value commercial installation (High financial impact / strict SLA).
  2. Two low-value residential maintenance checks (Low impact / flexible).
* **Tech B (Apprentice Plumber)** is near the commercial job site on a different minor task.

## The Trigger (The Unexpected Issue)
**"Tech A's van breaks down, making them unavailable for the next 4 hours."**

Without an AI dispatcher, a human would panic, randomly cancel Tech A's jobs, and likely lose the high-value commercial contract for the day, costing the business thousands of dollars.

## The AI Dispatcher's Reaction

Instead of guessing, the Dispatcher activates and performs the following sequence to **minimize business impact**:

1. **Context Joining & Priority Scoring:**
   The agent reads the open tasks and immediately recognizes that the commercial job has the highest financial consequence. The residential tasks are flagged as low priority.

2. **Geographic Clustering & Dispatch Reasoning:**
   The agent scans the map and sees Tech B is located close to the commercial site. Tech B has the required skill ("plumbing"), even if they are junior. 

3. **Schedule Optimization & Conflict Detection:**
   The agent realizes Tech B cannot do both their current job *and* the commercial job. The agent pushes Tech B's current low-value job, and Tech A's residential jobs, to the "Unassigned / Reschedule for Tomorrow" queue.

4. **Explainability & Human-in-the-Loop:**
   Instead of just mutating the database silently, the Dispatcher generates a **Confidence Score** and a clear **Explanation** for the human manager to review:

   * *Re-assigned Commercial Job to Tech B.* 
   * *Confidence:* `High (92%)`
   * *Reasoning:* *"Tech A is broken down. Commercial Job has high financial impact. Tech B is 2 miles away and has the required plumbing skill. Rescheduled 3 low-value residential jobs to tomorrow to accommodate this move."*

## Why This Scenario Wins the Hackathon
This single, focused "Chaos Event" proves everything the judges want to see:
* **Business Value:** It explicitly saves the company money by protecting high-value contracts.
* **Technical Depth:** It proves the agent isn't just shuffling blocks, but actually understanding constraints (geography, skills, finance).
* **Trust:** By using the "Human-in-the-Loop" and Explainability skills, you show judges you understand the real-world anxieties of trades managers handing control over to AI.
