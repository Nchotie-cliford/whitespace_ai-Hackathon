📁 1. Project Types
Column	Type	Example Value
id	Int	56960
name	String	🧱 Projekte
is_active	Boolean	true
📦 Total Records: 3

🔀 2. Workflow Steps
Column	Type	Example Value
id	Int	684112
name	String	🆕 Neue Projekte
is_active	Boolean	true
project_type_id (FK)	Int	56960
📦 Total Records: 23 (6 + 6 + 11)

🔧 3. Measures / Gewerke
Column	Type	Example Value
id	Int	6464
name	String	Projekt
short	String	PRJ
skill_mapping	Array<String>	["installation", "solar", ...]
📦 Total Records: 1

👥 4. Partners / Technicians
Column	Type	Example Value
id	Int	163178
user_id	Int	315139
first_name	String	Cliford
last_name	String	Nchotie
full_name	String	Cliford Nchotie
📦 Total Records: 1

🔑 5. Technicians Extension (Custom Data Layer)
Column	Type	Example Value
user_id (FK)	Int	315139
partner_id (FK)	Int	163178
status	Enum	active
status_last_updated	DateTime	2025-08-01T07:00:00+00:00
skill_level	String	master
skills	Array<String>	["electrical", "solar", ...]
current_zone	String	Berlin-Mitte
last_task_address	String	Berliner Straße 42, 10115 Berlin
last_updated	DateTime	2025-08-01T09:00:00+00:00
📦 Total Records: 1

👤 6. Contacts
Column	Type	Example Value
id	Int	6803533
first_name	String	John
last_name	String	Doe
full_name	String	John Doe
email	String	john.doe@example.com
phone_home	String	+49 30 123456
phone_mobile	String	+49 170 9876543
category	String	customer
type	String	private
street	String	Berliner Straße 42
zipcode	String	10115
city	String	Berlin
country_id	Int	1
📦 Total Records: 2

🧱 7. Projects
Column	Type	Example Value
id	Int	10050014
name	String	Projekt – John Doe
project_nr	String	10050014
type_id (FK)	Int	56960
type_name	String	🧱 Projekte
step_id (FK)	Int	684112
step_name	String	🆕 Neue Projekte
measure_id (FK)	Int	6464
measure_name	String	Projekt
partner_id (FK)	Int	163178
partner_name	String	Cliford Nchotie
customer_id (FK)	Int	6803533
customer_name	String	John Doe
street	String	Berliner Straße 42
zipcode	String	10115
city	String	Berlin
📦 Total Records: 4

✅ 8. Tasks
Column	Type	Example Value
id	Int	1678518
title	String	Follow up with John Doe
due_date	DateTime	2025-08-01T00:00:00+00:00
target_user_id (FK)	Int	315139
project_id (FK)	Int	10050014
business_value (Custom)	Enum	HIGH
is_flexible (Custom)	Boolean	false
required_skills (Custom)	Array<String>	["installation", "electrical"]
📦 Total Records: 4

📝 9. Logbook Entries
Column	Type	Example Value
id	Int	108012644
custom_text	String	Project created for John Doe...
created	DateTime	2025-07-01T08:00:00+00:00
project_id (FK)	Int	10050014
📦 Total Records: 4

📅 10. Calendar Events
Column	Type	Example Value
id	Int	5107633
title	String	Initial Site Visit - John Doe
start	DateTime	2025-08-01T09:00:00+00:00
end	DateTime	2025-08-01T10:00:00+00:00
category_id (FK)	Int	419150
category_name	String	Vor-Ort-Termin
project_id (FK)	Int	10050014
partner_ids (FK)	Array<Int>	[163178]
📦 Total Records: 4

🗂️ 11. Calendar Categories
Column	Type	Example Value
id	Int	419150
name	String	Vor-Ort-Termin
📦 Total Records: 6

📄 12. Document Types
Column	Type	Example Value
id	Int	1227216
name	String	Angebot
base_type	String	offer
📦 Total Records: 17

🧾 13. Documents
Column	Type	Example Value
id	Int	17487142
type_id (FK)	Int	1227216
type_name	String	Angebot
project_id (FK)	Int	10050014
published	Boolean	true
url	String	https://login.hero-software.de/...
📦 Total Records: 4

📦 14. Document Line Items
Column	Type	Example Value
document_id (FK)	Int	17487142
name	String	Installation Service
description	String	Full installation service
quantity	Float	1.0
unit_type	String	pauschal
net_price	Float	1500.00
vat_percent	Float	19.0
📦 Total Records: 6 (across all 4 documents)

📦 15. Products
Column	Type	Example Value
product_id	String	HAy3gTgoMAA
nr	String	1000
name	String	Artikel 1
base_price	Float	50.00
list_price	Float	0.00
sales_price	Float	50.00
vat_percent	Float	19.0
unit_type	String	Stk
category	String	``
description	String	Dies ist eine Beschreibung.
manufacturer	String	``
📦 Total Records: 2

⚡ 16. Trigger Events (Custom Data Layer)
Column	Type	Example Value
event_id	String	EVT-001
event_type	Enum	technician_sick
target_id	Int	315139
target_type	String	technician
message	String	Cliford called in sick...
triggered_at	DateTime	2025-08-01T07:15:00+00:00
affected_tasks	Array<Int>	[1678518, 1678532]
📦 Total Records: 4

🏁 Grand Total Summary
#	Table	Records
1	📁 Project Types	3
2	🔀 Workflow Steps	23
3	🔧 Measures / Gewerke	1
4	👥 Partners / Technicians	1
5	🔑 Technicians Extension	1
6	👤 Contacts	2
7	🧱 Projects	4
8	✅ Tasks	4
9	📝 Logbook Entries	4
10	📅 Calendar Events	4
11	🗂️ Calendar Categories	6
12	📄 Document Types	17
13	🧾 Documents	4
14	📦 Document Line Items	6
15	📦 Products	2
16	⚡ Trigger Events	4
—	🏆 GRAND TOTAL	86 Records
