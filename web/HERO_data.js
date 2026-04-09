window.HERO_DATA = {
  "system_data": {
    "project_types": [
      {
        "id": 56962,
        "name": "🔍 Wartung",
        "is_active": true,
        "workflow_steps": [
          { "id": 684129, "name": "🚩 Wartung fällig", "is_active": true },
          { "id": 684130, "name": "✔️ Abgeschlossen", "is_active": true },
          { "id": 684131, "name": "📂 Archiviert", "is_active": true },
          { "id": 684132, "name": "📅 Terminiert", "is_active": true },
          { "id": 684133, "name": "✅ Erledigt", "is_active": true },
          { "id": 684134, "name": "💰 Rechnung", "is_active": true }
        ]
      },
      {
        "id": 56961,
        "name": "🛠️ Service",
        "is_active": true,
        "workflow_steps": [
          { "id": 684123, "name": "🆕 Offen", "is_active": true },
          { "id": 684124, "name": "✔️ Abgeschlossen", "is_active": true },
          { "id": 684125, "name": "📂 Archiviert", "is_active": true },
          { "id": 684126, "name": "📅 Terminiert", "is_active": true },
          { "id": 684127, "name": "✅ Erledigt", "is_active": true },
          { "id": 684128, "name": "💰 Rechnung", "is_active": true }
        ]
      },
      {
        "id": 56960,
        "name": "🧱 Projekte",
        "is_active": true,
        "workflow_steps": [
          { "id": 684112, "name": "🆕 Neue Projekte", "is_active": true },
          { "id": 684113, "name": "👀 Begehung / Aufmaß", "is_active": true },
          { "id": 684114, "name": "✍🏼 Angebotserstellung", "is_active": true },
          { "id": 684115, "name": "✉️ Angebot verschickt", "is_active": true },
          { "id": 684116, "name": "✅ Auftrag bestätigt", "is_active": true },
          { "id": 684117, "name": "📅 Montageplanung", "is_active": true },
          { "id": 684118, "name": "⚙️ In Umsetzung", "is_active": true },
          { "id": 684119, "name": "📄 Schlussrechnung", "is_active": true },
          { "id": 684120, "name": "✔️ Abgeschlossen", "is_active": true },
          { "id": 684121, "name": "📂 Archiviert", "is_active": true },
          { "id": 684122, "name": "‼️ Reklamation", "is_active": true }
        ]
      }
    ],
    "measures": [
      {
        "id": 6464,
        "name": "Projekt",
        "short": "PRJ",
        "skill_mapping": ["installation", "maintenance", "repair", "solar", "electrical", "heat_pump"]
      }
    ],
    "partners": [
      {
        "id": 163178,
        "user_id": 315139,
        "first_name": "Cliford",
        "last_name": "Nchotie",
        "full_name": "Cliford Nchotie",
        "technician_extension": {
          "status": "active",
          "skills": ["electrical", "solar", "heat_pump", "installation", "maintenance"],
          "skill_level": "master",
          "geographic_zone": { "current_zone": "Berlin-Mitte", "last_task_address": "Berliner Straße 42, 10115 Berlin", "last_updated": "2025-08-01T09:00:00+00:00" }
        }
      },
      {
        "id": 163179,
        "user_id": 315140,
        "first_name": "Lukas",
        "last_name": "Weber",
        "full_name": "Lukas Weber",
        "technician_extension": {
          "status": "active",
          "skills": ["installation", "solar"],
          "skill_level": "senior",
          "geographic_zone": { "current_zone": "Hamburg-Nord", "last_task_address": "Mönckebergstraße 7, 20095 Hamburg", "last_updated": "2025-08-01T10:00:00+00:00" }
        }
      },
      {
        "id": 163180,
        "user_id": 315141,
        "first_name": "Sarah",
        "last_name": "König",
        "full_name": "Sarah König",
        "technician_extension": {
          "status": "active",
          "skills": ["electrical", "repair"],
          "skill_level": "master",
          "geographic_zone": { "current_zone": "Berlin-Pankow", "last_task_address": "Berliner Straße 42, 10115 Berlin", "last_updated": "2025-08-01T08:30:00+00:00" }
        }
      },
      {
        "id": 163181,
        "user_id": 315142,
        "first_name": "Marco",
        "last_name": "Rossi",
        "full_name": "Marco Rossi",
        "technician_extension": {
          "status": "active",
          "skills": ["heat_pump", "maintenance"],
          "skill_level": "junior",
          "geographic_zone": { "current_zone": "Hamburg-Altona", "last_task_address": "Mönckebergstraße 7, 20095 Hamburg", "last_updated": "2025-08-01T11:00:00+00:00" }
        }
      },
      {
        "id": 163182,
        "user_id": 315143,
        "first_name": "Elena",
        "last_name": "Petrova",
        "full_name": "Elena Petrova",
        "technician_extension": {
          "status": "active",
          "skills": ["solar", "electrical", "installation"],
          "skill_level": "senior",
          "geographic_zone": { "current_zone": "Berlin-Mitte", "last_task_address": "Berliner Straße 42, 10115 Berlin", "last_updated": "2025-08-01T07:45:00+00:00" }
        }
      },
      {
        "id": 163183,
        "user_id": 315144,
        "first_name": "Sven",
        "last_name": "Hansen",
        "full_name": "Sven Hansen",
        "technician_extension": {
          "status": "active",
          "skills": ["repair", "maintenance"],
          "skill_level": "master",
          "geographic_zone": { "current_zone": "Hamburg-Mitte", "last_task_address": "Mönckebergstraße 7, 20095 Hamburg", "last_updated": "2025-08-01T12:15:00+00:00" }
        }
      }
    ],
    "products": [
      {
        "product_id": "HAy3gTgoMAA",
        "nr": "1000",
        "name": "Artikel 1",
        "base_price": 50.00,
        "list_price": 0.00,
        "sales_price": 50.00,
        "vat_percent": 19.0,
        "unit_type": "Stk",
        "category": "",
        "description": "Dies ist eine Beschreibung.",
        "manufacturer": ""
      },
      {
        "product_id": "HAzz7aj6wAA",
        "nr": "2000",
        "name": "Mock Artikel",
        "base_price": 75.00,
        "list_price": 90.00,
        "sales_price": 90.00,
        "vat_percent": 19.0,
        "unit_type": "Stk",
        "category": "Material",
        "description": "Mock product for testing purposes",
        "manufacturer": "Mock Manufacturer"
      }
    ],
    "document_types": [
      { "id": 1227203, "name": "Kalkulation", "base_type": "calculation" },
      { "id": 1227204, "name": "Auftragsbestätigung", "base_type": "confirmation" },
      { "id": 1227205, "name": "Lieferschein", "base_type": "delivery_note" },
      { "id": 1227206, "name": "Arbeitsbericht", "base_type": "delivery_note" },
      { "id": 1227207, "name": "Mahnung", "base_type": "dunning" },
      { "id": 1227208, "name": "Allgemein", "base_type": "generic" },
      { "id": 1227209, "name": "Baustellenbericht", "base_type": "information" },
      { "id": 1227210, "name": "Rechnung", "base_type": "invoice" },
      { "id": 1227211, "name": "Rechnung §13b", "base_type": "invoice" },
      { "id": 1227212, "name": "Gutschrift", "base_type": "invoice" },
      { "id": 1227214, "name": "Brief", "base_type": "letter" },
      { "id": 1227215, "name": "Aufmaßdokument", "base_type": "measurement" },
      { "id": 1227216, "name": "Angebot", "base_type": "offer" },
      { "id": 1227217, "name": "Bestellschein", "base_type": "order_form" },
      { "id": 1227218, "name": "Reparaturauftrag", "base_type": "repair" },
      { "id": 1227219, "name": "Wartungsauftrag", "base_type": "repair" },
      { "id": 1227220, "name": "Stornorechnung", "base_type": "reversal_invoice" }
    ],
    "calendar_categories": [
      { "id": 419149, "name": "Umsetzung" },
      { "id": 419150, "name": "Vor-Ort-Termin" },
      { "id": 419151, "name": "Schlechtwetter" },
      { "id": 419152, "name": "Büro" },
      { "id": 419153, "name": "Besprechung" },
      { "id": 419154, "name": "Schule" }
    ],
    "contacts": [
      {
        "id": 6803533,
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "email": "john.doe@example.com",
        "category": "customer",
        "address": { "street": "Berliner Straße 42", "zipcode": "10115", "city": "Berlin" }
      },
      {
        "id": 6803553,
        "first_name": "Jane",
        "last_name": "Smith",
        "full_name": "Jane Smith",
        "email": "jane.smith@example.com",
        "category": "customer",
        "address": { "street": "Mönckebergstraße 7", "zipcode": "20095", "city": "Hamburg" }
      }
    ],
    "projects": [
      {
        "id": 10050014,
        "name": "Projekt – John Doe",
        "project_nr": "10050014",
        "type_id": 56960,
        "partner_id": 163179,
        "customer_id": 6803533,
        "task": {
          "id": 1678518,
          "title": "Solar Mount - Lukas",
          "due_date": "2025-08-01T00:00:00+00:00",
          "target_user_id": 315140,
          "business_value": "HIGH",
          "is_flexible": false
        },
        "calendar_event": {
          "id": 5107633,
          "title": "Installation Block",
          "start": "2025-08-01T09:00:00+00:00",
          "end": "2025-08-01T17:00:00+00:00",
          "category_id": 419149,
          "partner_ids": [163179]
        }
      },
      {
        "id": 10050048,
        "name": "Projekt – Jane Smith",
        "project_nr": "10050048",
        "type_id": 56960,
        "partner_id": 163180,
        "customer_id": 6803553,
        "task": {
          "id": 1678532,
          "title": "Electrical Prep - Sarah",
          "due_date": "2025-08-15T00:00:00+00:00",
          "target_user_id": 315141,
          "business_value": "HIGH",
          "is_flexible": true
        },
        "calendar_event": {
          "id": 5107666,
          "title": "Site Prep",
          "start": "2025-08-15T08:00:00+00:00",
          "end": "2025-08-15T12:00:00+00:00",
          "category_id": 419150,
          "partner_ids": [163180]
        }
      },
      {
        "id": 10050049,
        "name": "Service – Jane Smith",
        "project_nr": "10050049",
        "type_id": 56961,
        "partner_id": 163181,
        "customer_id": 6803553,
        "task": {
          "id": 1678533,
          "title": "Heat Pump Check - Marco",
          "due_date": "2025-08-16T00:00:00+00:00",
          "target_user_id": 315142,
          "business_value": "MED",
          "is_flexible": true
        },
        "calendar_event": {
          "id": 5107667,
          "title": "Service Check",
          "start": "2025-08-16T10:00:00+00:00",
          "end": "2025-08-16T11:30:00+00:00",
          "category_id": 419150,
          "partner_ids": [163181]
        }
      }
    ],
    "custom_data_layer": {
      "tasks_extension": {
        "business_value_schema": {
          "mapping": [
            { "task_id": 1678518, "business_value": "HIGH" },
            { "task_id": 1678532, "business_value": "HIGH" },
            { "task_id": 1678533, "business_value": "MED" }
          ]
        },
        "required_skills_schema": {
          "mapping": [
            { "task_id": 1678518, "required_skills": ["solar", "installation"] },
            { "task_id": 1678532, "required_skills": ["electrical"] },
            { "task_id": 1678533, "required_skills": ["heat_pump", "maintenance"] }
          ]
        }
      },
      "technicians_extension": {
        "status_schema": {
          "mapping": [
            { "user_id": 315139, "status": "active" },
            { "user_id": 315140, "status": "active" },
            { "user_id": 315141, "status": "active" },
            { "user_id": 315142, "status": "active" },
            { "user_id": 315143, "status": "active" },
            { "user_id": 315144, "status": "active" }
          ]
        },
        "skills_schema": {
          "mapping": [
            { "user_id": 315139, "skills": ["electrical", "solar", "heat_pump"] },
            { "user_id": 315140, "skills": ["installation", "solar"] },
            { "user_id": 315141, "skills": ["electrical", "repair"] },
            { "user_id": 315142, "skills": ["heat_pump", "maintenance"] },
            { "user_id": 315143, "skills": ["solar", "installation"] },
            { "user_id": 315144, "skills": ["repair", "maintenance"] }
          ]
        }
      },
      "trigger_events": {
        "mock_events": [
          {
            "event_id": "EVT-001",
            "event_type": "technician_sick",
            "target_id": 315139,
            "message": "Cliford Nchotie sick. Re-dispatch required.",
            "triggered_at": "2025-08-01T07:15:00+00:00",
            "affected_tasks": [1678518]
          }
        ]
      }
    }
  }
};
