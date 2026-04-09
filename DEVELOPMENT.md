DEVELOPMENT.md
API Specifications

Official Endpoint: https://login.hero-software.de/api/external/v9/graphql.


Authentication: All requests require Authorization: Bearer [API_TOKEN] .

Data Schemas & Operations

Fetching Tasks: Use the tasks(is_done: false) query to pull the current workload .


Project Context: Use project_matches to retrieve site addresses for location-based optimization .


The "Write" Operation: Use the update_task mutation to reassign workers and times .


Required Variable: id (The HERO Task ID).


Target Variable: target_user_id (To reassign the technician).


Schedule Variable: due_date (To adjust the time).

Core Objects

ProjectMatch: High-level project container including address and trade type.


Task: The individual unit of work assigned to a user.


Customer: Customer-specific data linked to project matches.
