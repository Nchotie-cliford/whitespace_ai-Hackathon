# API Endpoints & Schemas

**Primary Endpoint:** `https://login.hero-software.de/api/external/v9/graphql`
**Headers:** `Authorization: Bearer [API_TOKEN]`

## Required Operations

### Data Retrieval (Queries)
- **`tasks(is_done: false)`**: Pulls the active/current workload.
- **`project_matches`**: Retrieves site addresses. Crucial to enable location-based optimization.

### Data Manipulation (Mutations)
- **`create_contact`**: Include unique address fields (`street`, `city`, `zipcode`) to lay the groundwork for travel-time math.
- **`create_project_match`**: Link base projects to `customer_id` and `address_id`. Also utilized to trigger new "Emergency Flood" tasks.
- **`update_task`**: The primary "Write" operation for reassigning workloads.
  - **Required variables:** `id` (The HERO Task ID), `target_user_id` / `target_user_ids` (To reassign the technician), `due_date` (To adjust the time). 
  - *Note: Can also update task comments to inject chaos like "EMERGENCY: Pipe burst, delayed by 3 hours".*
