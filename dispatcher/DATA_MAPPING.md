# Data Mapping: HERO API vs. Custom Data Source

To build a reliable dispatcher for the Hackathon, we must distinguish between data inherently provided by the HERO GraphQL API, and data that requires a custom secondary database (or mocked JSON mapping) built specifically for this "Builder for Builders" AI feature.

The following table maps the Dispatcher's required schema against native HERO API capabilities, clearly highlighting the capability gaps where the Data Layer team must construct custom inputs.

## 1. Tasks (The Work Queue)

| Dispatcher Field | Source Typology | HERO API Mapping | Architecture Gap to Fill |
| :--- | :--- | :--- | :--- |
| `id` | ✅ Native API | `Task.id` | None. |
| `currently_assigned_to` | ✅ Native API | `Task.target_user_id` | None. |
| `scheduled_time` | ✅ Native API | `Task.due_date` | None. |
| `customer_id` | ✅ Native API | `ProjectMatch` -> `Customer` | None. |
| `description` | ✅ Native API | `Task` object | None. |
| `geographic_zone`| ✅ Native API | `ProjectMatch` address fields | None. |
| `business_value` | ❌ **GAP** | *Unavailable* | The Hero API calculates invoices, but has no strict "HIGH/MED/LOW" strategic AI priority flag. This must be modeled in our secondary DB or computed on the fly via UI inputs. |
| `is_flexible` | ❌ **GAP** | *Unavailable* | We cannot determine if a task is "locked" vs "moveable" natively. A custom flag field must be added to the secondary DB. |
| `required_skills`| ⚠️ **RESTRICTED**| `ProjectMatch` trade type | We map the broad trade type (e.g. "electrical") to `required_skills`. Nuanced skill subsets require a custom data patch. |

## 2. Technicians (The Workforce)

| Dispatcher Field | Source Typology | HERO API Mapping | Architecture Gap to Fill |
| :--- | :--- | :--- | :--- |
| `id` | ✅ Native API | `target_user_id` | None. |
| `name` | ✅ Native API | User Profile | None. |
| `status` (Active/Sick) | ❌ **GAP** | *Unavailable* | HERO doesn't track live intraday toggles like "called in sick at 8 AM". This state variable must belong to our external dispatcher state server. |
| `skills` | ❌ **GAP** | *Unavailable* | We need an internal mapping database matching a `user_id` to an array of explicit skills to prevent assigning an apprentice to a master's job. |
| `geographic_zone` | ❌ **GAP** | *Unavailable* | Unless HERO tracks live van GPS, we must mock/track their "current zone" independently based on the address of the task they just completed. |

## 3. The Trigger Event (Chaos Injection)

| Dispatcher Field | Source Typology | HERO API Mapping | Architecture Gap to Fill |
| :--- | :--- | :--- | :--- |
| `event_type` | ❌ **GAP** | *Unavailable* | The Dispatcher needs to be explicitly pinged by our Custom UI ("Chaos Button") to initiate the reason for the re-dispatch. This entire event object is custom to our app. |
| `target_id` | ❌ **GAP** | *Unavailable* | N/A |
| `message` | ❌ **GAP** | *Unavailable* | N/A |

---

> [!NOTE] 
> **Conclusion for the Data Team**
> The Data Layer needs to pull base objects via `https://login.hero-software.de/api/external/v9/graphql`. However, it **must** inject an augmentation layer (Supabase, MongoDB, or simple JSON memory store) to provide `skills`, `business_value`, `flexibility`, and `status_flags` to cross-reference against the raw HERO tasks before sending the payload to the Dispatcher.
