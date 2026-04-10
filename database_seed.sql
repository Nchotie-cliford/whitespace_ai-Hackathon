-- ============================================================
-- FILE: database_seed.sql
-- PURPOSE: Unified seed data for demo, business, and challenge datasets
-- GENERATED FROM THE PREVIOUS SPLIT SQL PACK
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- SOURCE: seed_sample_data.sql
-- ------------------------------------------------------------

-- ============================================================
-- FILE: seed_sample_data.sql
-- PURPOSE: Core operational seed for the first live demo
-- RUN ORDER: 2
--
-- Company profile:
--   VoltWerk Service GmbH
--   Small German field-service company with 15 people including 1 manager
--
-- Coverage:
--   * 15 HERO users
--   * 12 addresses
--   * 12 customers
--   * 12 project matches across Germany
--   * 24 tasks
--   * technician profiles, overrides, events, and input messages
-- ============================================================


-- ------------------------------------------------------------
-- HERO users
-- ------------------------------------------------------------

INSERT INTO hero_users (
  hero_user_id, hero_partner_id, email, role, first_name, last_name, full_name, partner_status
) VALUES
  (1001, 2001, 'anna.becker@voltwerk-service.de', 'manager', 'Anna', 'Becker', 'Anna Becker', 'active'),
  (1002, 2002, 'max.mueller@voltwerk-service.de', 'worker', 'Max', 'Mueller', 'Max Mueller', 'active'),
  (1003, 2003, 'jonas.schmidt@voltwerk-service.de', 'worker', 'Jonas', 'Schmidt', 'Jonas Schmidt', 'active'),
  (1004, 2004, 'leon.wagner@voltwerk-service.de', 'worker', 'Leon', 'Wagner', 'Leon Wagner', 'active'),
  (1005, 2005, 'emir.kaya@voltwerk-service.de', 'worker', 'Emir', 'Kaya', 'Emir Kaya', 'active'),
  (1006, 2006, 'tobias.fischer@voltwerk-service.de', 'worker', 'Tobias', 'Fischer', 'Tobias Fischer', 'active'),
  (1007, 2007, 'lukas.hoffmann@voltwerk-service.de', 'worker', 'Lukas', 'Hoffmann', 'Lukas Hoffmann', 'active'),
  (1008, 2008, 'paul.neumann@voltwerk-service.de', 'worker', 'Paul', 'Neumann', 'Paul Neumann', 'active'),
  (1009, 2009, 'ali.demir@voltwerk-service.de', 'worker', 'Ali', 'Demir', 'Ali Demir', 'active'),
  (1010, 2010, 'miriam.koch@voltwerk-service.de', 'worker', 'Miriam', 'Koch', 'Miriam Koch', 'active'),
  (1011, 2011, 'felix.krueger@voltwerk-service.de', 'worker', 'Felix', 'Krueger', 'Felix Krueger', 'active'),
  (1012, 2012, 'nina.voigt@voltwerk-service.de', 'worker', 'Nina', 'Voigt', 'Nina Voigt', 'active'),
  (1013, 2013, 'jan.reiter@voltwerk-service.de', 'worker', 'Jan', 'Reiter', 'Jan Reiter', 'active'),
  (1014, 2014, 'sarah.lenz@voltwerk-service.de', 'worker', 'Sarah', 'Lenz', 'Sarah Lenz', 'active'),
  (1015, 2015, 'mehmet.oezkan@voltwerk-service.de', 'worker', 'Mehmet', 'Oezkan', 'Mehmet Oezkan', 'active')
ON CONFLICT (hero_user_id) DO UPDATE SET
  hero_partner_id = EXCLUDED.hero_partner_id,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  full_name = EXCLUDED.full_name,
  partner_status = EXCLUDED.partner_status,
  last_synced_at = NOW();

-- ------------------------------------------------------------
-- HERO addresses
-- ------------------------------------------------------------

INSERT INTO hero_addresses (
  hero_address_id, street, line_1, line_2, city, zipcode, country_code, country_name,
  full_address, maps_link, latitude, longitude
) VALUES
  (3001, 'Frankfurter Allee 115', 'Frankfurter Allee 115', NULL, 'Berlin', '10365', 'DE', 'Germany', 'Frankfurter Allee 115, 10365 Berlin, Germany', 'https://maps.google.com/?q=52.5145,13.4924', 52.5145, 13.4924),
  (3002, 'Wendenstrasse 130', 'Wendenstrasse 130', NULL, 'Hamburg', '20537', 'DE', 'Germany', 'Wendenstrasse 130, 20537 Hamburg, Germany', 'https://maps.google.com/?q=53.5484,10.0327', 53.5484, 10.0327),
  (3003, 'Landsberger Strasse 302', 'Landsberger Strasse 302', NULL, 'Munich', '80687', 'DE', 'Germany', 'Landsberger Strasse 302, 80687 Munich, Germany', 'https://maps.google.com/?q=48.1377,11.5076', 48.1377, 11.5076),
  (3004, 'Oskar-Jaeger-Strasse 173', 'Oskar-Jaeger-Strasse 173', NULL, 'Cologne', '50825', 'DE', 'Germany', 'Oskar-Jaeger-Strasse 173, 50825 Cologne, Germany', 'https://maps.google.com/?q=50.9495,6.9127', 50.9495, 6.9127),
  (3005, 'Hanauer Landstrasse 291', 'Hanauer Landstrasse 291', NULL, 'Frankfurt am Main', '60314', 'DE', 'Germany', 'Hanauer Landstrasse 291, 60314 Frankfurt am Main, Germany', 'https://maps.google.com/?q=50.1166,8.7353', 50.1166, 8.7353),
  (3006, 'Zettachring 6', 'Zettachring 6', NULL, 'Stuttgart', '70567', 'DE', 'Germany', 'Zettachring 6, 70567 Stuttgart, Germany', 'https://maps.google.com/?q=48.7260,9.1615', 48.7260, 9.1615),
  (3007, 'Torgauer Strasse 231', 'Torgauer Strasse 231', NULL, 'Leipzig', '04347', 'DE', 'Germany', 'Torgauer Strasse 231, 04347 Leipzig, Germany', 'https://maps.google.com/?q=51.3645,12.4320', 51.3645, 12.4320),
  (3008, 'Washingtonstrasse 16', 'Washingtonstrasse 16', NULL, 'Dresden', '01139', 'DE', 'Germany', 'Washingtonstrasse 16, 01139 Dresden, Germany', 'https://maps.google.com/?q=51.0837,13.7098', 51.0837, 13.7098),
  (3009, 'Vahrenwalder Strasse 269A', 'Vahrenwalder Strasse 269A', NULL, 'Hanover', '30179', 'DE', 'Germany', 'Vahrenwalder Strasse 269A, 30179 Hanover, Germany', 'https://maps.google.com/?q=52.4141,9.7410', 52.4141, 9.7410),
  (3010, 'Hansator 5', 'Hansator 5', NULL, 'Bremen', '28217', 'DE', 'Germany', 'Hansator 5, 28217 Bremen, Germany', 'https://maps.google.com/?q=53.0966,8.7607', 53.0966, 8.7607),
  (3011, 'Regensburger Strasse 336', 'Regensburger Strasse 336', NULL, 'Nuremberg', '90480', 'DE', 'Germany', 'Regensburger Strasse 336, 90480 Nuremberg, Germany', 'https://maps.google.com/?q=49.4389,11.1232', 49.4389, 11.1232),
  (3012, 'Moskauer Strasse 23', 'Moskauer Strasse 23', NULL, 'Dortmund', '44269', 'DE', 'Germany', 'Moskauer Strasse 23, 44269 Dortmund, Germany', 'https://maps.google.com/?q=51.4978,7.5295', 51.4978, 7.5295)
ON CONFLICT (hero_address_id) DO UPDATE SET
  street = EXCLUDED.street,
  line_1 = EXCLUDED.line_1,
  line_2 = EXCLUDED.line_2,
  city = EXCLUDED.city,
  zipcode = EXCLUDED.zipcode,
  country_code = EXCLUDED.country_code,
  country_name = EXCLUDED.country_name,
  full_address = EXCLUDED.full_address,
  maps_link = EXCLUDED.maps_link,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  last_synced_at = NOW();

-- ------------------------------------------------------------
-- HERO customers
-- ------------------------------------------------------------

INSERT INTO hero_customers (
  hero_customer_id, hero_address_id, first_name, last_name, company_name, full_name, email,
  phone_home, phone_mobile, category, is_deleted
) VALUES
  (4001, 3001, NULL, NULL, 'Meyer Immobilien GmbH', 'Meyer Immobilien GmbH', 'technik@meyer-immobilien.de', '030-555100', '0171-555100', 'customer', FALSE),
  (4002, 3002, NULL, NULL, 'NordHafen Logistik GmbH', 'NordHafen Logistik GmbH', 'service@nordhafen-logistik.de', '040-555200', '0171-555200', 'customer', FALSE),
  (4003, 3003, NULL, NULL, 'Bauer Wohnbau KG', 'Bauer Wohnbau KG', 'objekte@bauer-wohnbau.de', '089-555300', '0171-555300', 'customer', FALSE),
  (4004, 3004, NULL, NULL, 'RheinCare Seniorenhaus', 'RheinCare Seniorenhaus', 'haustechnik@rheincare.de', '0221-555400', '0171-555400', 'customer', FALSE),
  (4005, 3005, NULL, NULL, 'MainTech Office Campus', 'MainTech Office Campus', 'facility@maintech-campus.de', '069-555500', '0171-555500', 'customer', FALSE),
  (4006, 3006, NULL, NULL, 'Schuster Produktions GmbH', 'Schuster Produktions GmbH', 'betrieb@schuster-produktion.de', '0711-555600', '0171-555600', 'customer', FALSE),
  (4007, 3007, NULL, NULL, 'Sachsen Solarpark Betrieb', 'Sachsen Solarpark Betrieb', 'dispatch@sachsen-solarpark.de', '0341-555700', '0171-555700', 'customer', FALSE),
  (4008, 3008, NULL, NULL, 'Elbtor Gewerbehof', 'Elbtor Gewerbehof', 'service@elbtor-gewerbehof.de', '0351-555800', '0171-555800', 'customer', FALSE),
  (4009, 3009, NULL, NULL, 'Hansa Schulen Hannover', 'Hansa Schulen Hannover', 'verwaltung@hansa-schulen.de', '0511-555900', '0171-555900', 'customer', FALSE),
  (4010, 3010, NULL, NULL, 'Bremer Kuehlhaus AG', 'Bremer Kuehlhaus AG', 'technik@bremer-kuehlhaus.de', '0421-556000', '0171-556000', 'customer', FALSE),
  (4011, 3011, NULL, NULL, 'Franken Klinikverbund', 'Franken Klinikverbund', 'objektleitung@franken-klinik.de', '0911-556100', '0171-556100', 'customer', FALSE),
  (4012, 3012, NULL, NULL, 'RuhrBau Projekte GmbH', 'RuhrBau Projekte GmbH', 'bauleitung@ruhrbau-projekte.de', '0231-556200', '0171-556200', 'customer', FALSE)
ON CONFLICT (hero_customer_id) DO UPDATE SET
  hero_address_id = EXCLUDED.hero_address_id,
  company_name = EXCLUDED.company_name,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone_home = EXCLUDED.phone_home,
  phone_mobile = EXCLUDED.phone_mobile,
  category = EXCLUDED.category,
  is_deleted = EXCLUDED.is_deleted,
  last_synced_at = NOW();

-- ------------------------------------------------------------
-- HERO project matches
-- ------------------------------------------------------------

INSERT INTO hero_project_matches (
  hero_project_match_id, hero_customer_id, hero_contact_id, hero_address_id, name, project_title,
  project_nr, display_id, partner_notes, project_type, type_id, current_status_id, status_name, is_deleted
) VALUES
  (5001, 4001, 4001, 3001, 'Berlin Lichtenberg Retrofit', 'EV charging + subpanel upgrade', 'VW-2026-001', 'BER-001', 'Customer requests quiet work before 8am.', 'electrical', 1, 11, 'in_progress', FALSE),
  (5002, 4002, 4002, 3002, 'Hamburg Warehouse LED Conversion', 'Lighting modernization hall B', 'VW-2026-002', 'HAM-002', 'Loading zone access only after 09:30.', 'electrical', 1, 11, 'in_progress', FALSE),
  (5003, 4003, 4003, 3003, 'Munich Residential Solar Prep', 'Meter cabinet and inverter prep', 'VW-2026-003', 'MUC-003', 'Roof team starts after electrical prep is complete.', 'solar', 2, 10, 'scheduled', FALSE),
  (5004, 4004, 4004, 3004, 'Cologne Nursing Home HVAC Service', 'Heat pump diagnostics and service', 'VW-2026-004', 'CGN-004', 'Avoid interruption during lunch service.', 'hvac', 3, 11, 'in_progress', FALSE),
  (5005, 4005, 4005, 3005, 'Frankfurt Office Fire Safety Check', 'Emergency lighting and panel inspection', 'VW-2026-005', 'FRA-005', 'Building access badge required.', 'electrical', 1, 10, 'scheduled', FALSE),
  (5006, 4006, 4006, 3006, 'Stuttgart Factory Maintenance', 'Monthly preventive electrical maintenance', 'VW-2026-006', 'STR-006', 'Production line stop window 14:00 to 16:00.', 'electrical', 1, 11, 'in_progress', FALSE),
  (5007, 4007, 4007, 3007, 'Leipzig Solar Inverter Fault', 'Urgent inverter diagnostics', 'VW-2026-007', 'LEJ-007', 'Feed-in issue reported by customer this morning.', 'solar', 2, 12, 'urgent', FALSE),
  (5008, 4008, 4008, 3008, 'Dresden Mixed-Use Building Upgrade', 'Basement distribution board replacement', 'VW-2026-008', 'DRS-008', 'Tenant communication already sent.', 'electrical', 1, 10, 'scheduled', FALSE),
  (5009, 4009, 4009, 3009, 'Hanover School Ventilation Check', 'Classroom ventilation troubleshooting', 'VW-2026-009', 'HAJ-009', 'School break window 12:30 to 13:15.', 'hvac', 3, 10, 'scheduled', FALSE),
  (5010, 4010, 4010, 3010, 'Bremen Cold Storage Sensors', 'Sensor replacement in cooling area', 'VW-2026-010', 'BRE-010', 'Protective clothing mandatory.', 'electrical', 1, 11, 'in_progress', FALSE),
  (5011, 4011, 4011, 3011, 'Nuremberg Clinic Backup Power', 'Backup circuit inspection', 'VW-2026-011', 'NUE-011', 'High priority clinical loads.', 'electrical', 1, 12, 'urgent', FALSE),
  (5012, 4012, 4012, 3012, 'Dortmund Construction Trailer Power', 'Temporary supply and safety check', 'VW-2026-012', 'DTM-012', 'Site foreman only on site until 15:00.', 'electrical', 1, 10, 'scheduled', FALSE)
ON CONFLICT (hero_project_match_id) DO UPDATE SET
  hero_customer_id = EXCLUDED.hero_customer_id,
  hero_contact_id = EXCLUDED.hero_contact_id,
  hero_address_id = EXCLUDED.hero_address_id,
  name = EXCLUDED.name,
  project_title = EXCLUDED.project_title,
  project_nr = EXCLUDED.project_nr,
  display_id = EXCLUDED.display_id,
  partner_notes = EXCLUDED.partner_notes,
  project_type = EXCLUDED.project_type,
  type_id = EXCLUDED.type_id,
  current_status_id = EXCLUDED.current_status_id,
  status_name = EXCLUDED.status_name,
  is_deleted = EXCLUDED.is_deleted,
  last_synced_at = NOW();

-- ------------------------------------------------------------
-- HERO tasks
-- ------------------------------------------------------------

INSERT INTO hero_tasks (
  hero_task_id, hero_author_user_id, hero_target_user_id, hero_target_project_match_id,
  title, comment, due_date, start_at, end_at, done_date, is_done, is_deleted
) VALUES
  (6001, 1001, 1002, 5001, 'Inspect existing subpanel', 'Confirm spare capacity before EV charger install.', '2026-04-09T09:00:00+02:00', '2026-04-09T08:00:00+02:00', '2026-04-09T09:30:00+02:00', NULL, FALSE, FALSE),
  (6002, 1001, 1003, 5001, 'Install EV charger mounting rail', 'Coordinate with tenant parking access.', '2026-04-09T11:00:00+02:00', '2026-04-09T09:45:00+02:00', '2026-04-09T12:00:00+02:00', NULL, FALSE, FALSE),
  (6003, 1001, 1004, 5002, 'Replace hall B LED drivers', 'Needs scissor lift on site.', '2026-04-09T13:00:00+02:00', '2026-04-09T10:00:00+02:00', '2026-04-09T13:30:00+02:00', NULL, FALSE, FALSE),
  (6004, 1001, 1005, 5002, 'Check emergency egress lighting', 'Customer requested photo proof.', '2026-04-09T15:00:00+02:00', '2026-04-09T13:45:00+02:00', '2026-04-09T15:15:00+02:00', NULL, FALSE, FALSE),
  (6005, 1001, 1006, 5003, 'Prepare inverter connection point', 'Wait for roofing team confirmation before energizing.', '2026-04-09T10:30:00+02:00', '2026-04-09T08:30:00+02:00', '2026-04-09T11:30:00+02:00', NULL, FALSE, FALSE),
  (6006, 1001, 1007, 5003, 'Upgrade meter cabinet labeling', 'Take before and after photos.', '2026-04-09T14:00:00+02:00', '2026-04-09T12:00:00+02:00', '2026-04-09T14:30:00+02:00', NULL, FALSE, FALSE),
  (6007, 1001, 1008, 5004, 'Run heat pump diagnostics', 'Customer reports intermittent alarms.', '2026-04-09T09:30:00+02:00', '2026-04-09T08:00:00+02:00', '2026-04-09T10:15:00+02:00', NULL, FALSE, FALSE),
  (6008, 1001, 1009, 5004, 'Replace circulation pump sensor', 'Take spare from van stock.', '2026-04-09T12:00:00+02:00', '2026-04-09T10:30:00+02:00', '2026-04-09T12:15:00+02:00', NULL, FALSE, FALSE),
  (6009, 1001, 1010, 5005, 'Inspect emergency panel', 'Building manager available until 16:00.', '2026-04-09T10:00:00+02:00', '2026-04-09T08:30:00+02:00', '2026-04-09T10:30:00+02:00', NULL, FALSE, FALSE),
  (6010, 1001, 1011, 5005, 'Test escape route lighting', 'Must not block reception corridor.', '2026-04-09T16:00:00+02:00', '2026-04-09T14:15:00+02:00', '2026-04-09T16:00:00+02:00', NULL, FALSE, FALSE),
  (6011, 1001, 1012, 5006, 'Inspect switchgear cabinet', 'Production team escort required.', '2026-04-09T11:30:00+02:00', '2026-04-09T09:00:00+02:00', '2026-04-09T11:45:00+02:00', NULL, FALSE, FALSE),
  (6012, 1001, 1013, 5006, 'Thermal imaging of feeder lines', 'Upload images after site visit.', '2026-04-09T15:30:00+02:00', '2026-04-09T14:00:00+02:00', '2026-04-09T15:30:00+02:00', NULL, FALSE, FALSE),
  (6013, 1001, 1014, 5007, 'Diagnose inverter shutdown', 'Customer flags zero feed-in since 07:20.', '2026-04-09T10:00:00+02:00', '2026-04-09T08:15:00+02:00', '2026-04-09T10:30:00+02:00', NULL, FALSE, FALSE),
  (6014, 1001, 1015, 5007, 'Verify string voltage on roof combiner', 'Safety harness required.', '2026-04-09T12:30:00+02:00', '2026-04-09T10:45:00+02:00', '2026-04-09T12:45:00+02:00', NULL, FALSE, FALSE),
  (6015, 1001, 1002, 5008, 'Shut down basement distribution board', 'Notify tenants 30 minutes before power cut.', '2026-04-10T09:00:00+02:00', '2026-04-10T08:00:00+02:00', '2026-04-10T09:30:00+02:00', NULL, FALSE, FALSE),
  (6016, 1001, 1003, 5008, 'Install replacement main switch', 'Two-person task preferred.', '2026-04-10T12:00:00+02:00', '2026-04-10T09:45:00+02:00', '2026-04-10T12:15:00+02:00', NULL, FALSE, FALSE),
  (6017, 1001, 1008, 5009, 'Check classroom air handling unit', 'Perform during school break.', '2026-04-10T11:00:00+02:00', '2026-04-10T10:00:00+02:00', '2026-04-10T11:15:00+02:00', NULL, FALSE, FALSE),
  (6018, 1001, 1009, 5009, 'Replace clogged intake filter', 'Bring extra filter set.', '2026-04-10T13:30:00+02:00', '2026-04-10T12:15:00+02:00', '2026-04-10T13:45:00+02:00', NULL, FALSE, FALSE),
  (6019, 1001, 1010, 5010, 'Replace freezer room sensor set', 'Cold area PPE required.', '2026-04-10T10:30:00+02:00', '2026-04-10T08:30:00+02:00', '2026-04-10T10:45:00+02:00', NULL, FALSE, FALSE),
  (6020, 1001, 1011, 5010, 'Calibrate alarm relay outputs', 'Customer requests same-day completion.', '2026-04-10T14:30:00+02:00', '2026-04-10T11:00:00+02:00', '2026-04-10T14:30:00+02:00', NULL, FALSE, FALSE),
  (6021, 1001, 1012, 5011, 'Inspect backup power switchover', 'Hospital site, no interruption tolerated.', '2026-04-09T09:00:00+02:00', '2026-04-09T08:00:00+02:00', '2026-04-09T09:45:00+02:00', NULL, FALSE, FALSE),
  (6022, 1001, 1013, 5011, 'Test emergency socket circuits', 'Coordinate with clinic technician on site.', '2026-04-09T13:00:00+02:00', '2026-04-09T10:00:00+02:00', '2026-04-09T13:15:00+02:00', NULL, FALSE, FALSE),
  (6023, 1001, 1014, 5012, 'Check temporary distribution board', 'Construction crew leaves at 15:00.', '2026-04-10T09:30:00+02:00', '2026-04-10T08:30:00+02:00', '2026-04-10T09:45:00+02:00', NULL, FALSE, FALSE),
  (6024, 1001, 1015, 5012, 'Verify RCD protection on trailers', 'Document all test values for foreman.', '2026-04-10T12:30:00+02:00', '2026-04-10T10:15:00+02:00', '2026-04-10T12:45:00+02:00', NULL, FALSE, FALSE)
ON CONFLICT (hero_task_id) DO UPDATE SET
  hero_author_user_id = EXCLUDED.hero_author_user_id,
  hero_target_user_id = EXCLUDED.hero_target_user_id,
  hero_target_project_match_id = EXCLUDED.hero_target_project_match_id,
  title = EXCLUDED.title,
  comment = EXCLUDED.comment,
  due_date = EXCLUDED.due_date,
  start_at = EXCLUDED.start_at,
  end_at = EXCLUDED.end_at,
  done_date = EXCLUDED.done_date,
  is_done = EXCLUDED.is_done,
  is_deleted = EXCLUDED.is_deleted,
  last_synced_at = NOW();

-- ------------------------------------------------------------
-- Technician profiles
-- ------------------------------------------------------------

INSERT INTO technician_profiles (
  hero_user_id, name, status, geographic_zone, skills, notes
) VALUES
  (1001, 'Anna Becker', 'active', 'berlin', '["dispatch","operations","electrical"]'::jsonb, 'Manager and dispatcher. Usually not assigned to field tasks.'),
  (1002, 'Max Mueller', 'active', 'berlin', '["electrical","ev_charging","troubleshooting"]'::jsonb, 'Senior electrical technician.'),
  (1003, 'Jonas Schmidt', 'active', 'east', '["electrical","distribution_boards","service_calls"]'::jsonb, 'Reliable for retrofit and troubleshooting jobs.'),
  (1004, 'Leon Wagner', 'active', 'north', '["lighting","electrical","warehouse"]'::jsonb, 'Strong on industrial lighting retrofits.'),
  (1005, 'Emir Kaya', 'active', 'north', '["lighting","documentation","electrical"]'::jsonb, 'Good on customer-facing follow-up tasks.'),
  (1006, 'Tobias Fischer', 'active', 'south', '["solar","electrical","meter_cabinets"]'::jsonb, 'Solar prep specialist.'),
  (1007, 'Lukas Hoffmann', 'active', 'south', '["solar","labeling","commissioning_support"]'::jsonb, 'Often paired with solar and inverter prep teams.'),
  (1008, 'Paul Neumann', 'active', 'west', '["hvac","diagnostics","service_calls"]'::jsonb, 'HVAC service specialist.'),
  (1009, 'Ali Demir', 'active', 'west', '["hvac","pumps","maintenance"]'::jsonb, 'Best for component replacement and maintenance.'),
  (1010, 'Miriam Koch', 'active', 'central', '["electrical","fire_safety","inspection"]'::jsonb, 'Strong on inspections and compliance work.'),
  (1011, 'Felix Krueger', 'active', 'north', '["electrical","sensors","cold_storage"]'::jsonb, 'Handles sensors and sensitive environments.'),
  (1012, 'Nina Voigt', 'active', 'south', '["electrical","backup_power","inspection"]'::jsonb, 'High-trust technician for critical sites.'),
  (1013, 'Jan Reiter', 'active', 'south', '["electrical","thermal_imaging","testing"]'::jsonb, 'Often supports diagnostics and reporting.'),
  (1014, 'Sarah Lenz', 'active', 'east', '["solar","electrical","urgent_response"]'::jsonb, 'Strong under urgent-response conditions.'),
  (1015, 'Mehmet Oezkan', 'active', 'west', '["solar","site_safety","testing"]'::jsonb, 'Good on safety-sensitive field checks.')
ON CONFLICT (hero_user_id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  geographic_zone = EXCLUDED.geographic_zone,
  skills = EXCLUDED.skills,
  notes = EXCLUDED.notes;

-- ------------------------------------------------------------
-- Task overrides
-- ------------------------------------------------------------

INSERT INTO task_overrides (
  hero_task_id, business_value, is_flexible, required_skills, notes
) VALUES
  (6001, 'high', FALSE, '["electrical","ev_charging"]'::jsonb, 'Anchor task for Berlin morning visit.'),
  (6002, 'medium', TRUE, '["electrical","ev_charging"]'::jsonb, 'Can be moved within same day.'),
  (6003, 'medium', TRUE, '["lighting","electrical"]'::jsonb, 'Can shift by 2 to 3 hours.'),
  (6004, 'low', TRUE, '["lighting","documentation"]'::jsonb, 'Good candidate for reassignment.'),
  (6005, 'high', FALSE, '["solar","meter_cabinets"]'::jsonb, 'Blocks downstream roof work.'),
  (6006, 'medium', TRUE, '["solar","labeling"]'::jsonb, 'Flexible if customer informed.'),
  (6007, 'high', FALSE, '["hvac","diagnostics"]'::jsonb, 'Nursing home comfort issue.'),
  (6008, 'high', FALSE, '["hvac","pumps"]'::jsonb, 'Should stay same day.'),
  (6009, 'high', FALSE, '["electrical","fire_safety"]'::jsonb, 'Compliance-related check.'),
  (6010, 'medium', TRUE, '["electrical","fire_safety"]'::jsonb, 'Can move to later same day.'),
  (6011, 'medium', TRUE, '["electrical","inspection"]'::jsonb, 'Depends on production escort.'),
  (6012, 'medium', TRUE, '["thermal_imaging","testing"]'::jsonb, 'Can be delayed if line stop changes.'),
  (6013, 'high', FALSE, '["solar","urgent_response"]'::jsonb, 'Urgent feed-in loss.'),
  (6014, 'high', FALSE, '["solar","site_safety"]'::jsonb, 'Must pair with inverter diagnosis timing.'),
  (6015, 'high', FALSE, '["electrical","distribution_boards"]'::jsonb, 'Power cut window already announced.'),
  (6016, 'high', FALSE, '["electrical","distribution_boards"]'::jsonb, 'Two-person capable task.'),
  (6017, 'medium', TRUE, '["hvac","diagnostics"]'::jsonb, 'Fit into school break only.'),
  (6018, 'low', TRUE, '["hvac","maintenance"]'::jsonb, 'Low risk if moved to afternoon.'),
  (6019, 'medium', TRUE, '["electrical","sensors","cold_storage"]'::jsonb, 'Same day preferred.'),
  (6020, 'high', FALSE, '["electrical","sensors"]'::jsonb, 'Customer requires completion today.'),
  (6021, 'high', FALSE, '["electrical","backup_power"]'::jsonb, 'Critical hospital system.'),
  (6022, 'high', TRUE, '["electrical","testing"]'::jsonb, 'Can move only if clinic approves.'),
  (6023, 'medium', TRUE, '["electrical","site_safety"]'::jsonb, 'Can reassign if foreman informed.'),
  (6024, 'medium', TRUE, '["electrical","testing","site_safety"]'::jsonb, 'Documentation required.')
ON CONFLICT (hero_task_id) DO UPDATE SET
  business_value = EXCLUDED.business_value,
  is_flexible = EXCLUDED.is_flexible,
  required_skills = EXCLUDED.required_skills,
  notes = EXCLUDED.notes;

-- ------------------------------------------------------------
-- Dispatcher events
-- ------------------------------------------------------------

INSERT INTO dispatcher_events (
  id, event_type, target_id, message, payload, created_by, created_at
) VALUES
  ('7ec6a421-67dc-4f39-a97b-10c6f07f6f01', 'traffic_delay', '1003', 'Jonas Schmidt reports a 90-minute delay on the way to Dresden.', '{"hero_user_id":1003,"affected_task_ids":[6016],"reason":"traffic","delay_minutes":90,"source":"manager_voice"}'::jsonb, 'anna.becker@voltwerk-service.de', '2026-04-09T08:05:00+02:00'),
  ('7ec6a421-67dc-4f39-a97b-10c6f07f6f02', 'urgent_task_inserted', '5007', 'Customer reports solar inverter failure in Leipzig with production impact.', '{"hero_project_match_id":5007,"priority":"high","reason":"inverter_failure","source":"dispatcher_ui"}'::jsonb, 'anna.becker@voltwerk-service.de', '2026-04-09T08:12:00+02:00'),
  ('7ec6a421-67dc-4f39-a97b-10c6f07f6f03', 'weather_disruption', '1015', 'Mehmet Oezkan cannot access the roof safely due to heavy wind.', '{"hero_user_id":1015,"affected_task_ids":[6014],"reason":"weather","source":"manager_voice"}'::jsonb, 'anna.becker@voltwerk-service.de', '2026-04-09T09:10:00+02:00')
ON CONFLICT (id) DO UPDATE SET
  event_type = EXCLUDED.event_type,
  target_id = EXCLUDED.target_id,
  message = EXCLUDED.message,
  payload = EXCLUDED.payload,
  created_by = EXCLUDED.created_by,
  created_at = EXCLUDED.created_at;

-- ------------------------------------------------------------
-- Dispatch runs
-- ------------------------------------------------------------

INSERT INTO dispatch_runs (
  id, trigger_event_id, status, tasks_considered, tasks_changed, summary, created_at, finished_at
) VALUES
  ('95d35ac0-13f5-4f64-bfe7-4d0dfd7ce101', '7ec6a421-67dc-4f39-a97b-10c6f07f6f01', 'completed', 3, 1, 'Reassigned delayed Dresden switch installation to Jan Reiter.', '2026-04-09T08:06:00+02:00', '2026-04-09T08:07:30+02:00'),
  ('95d35ac0-13f5-4f64-bfe7-4d0dfd7ce102', '7ec6a421-67dc-4f39-a97b-10c6f07f6f03', 'completed', 2, 1, 'Suggested postponing roof combiner check because of unsafe wind conditions.', '2026-04-09T09:11:00+02:00', '2026-04-09T09:12:10+02:00')
ON CONFLICT (id) DO UPDATE SET
  trigger_event_id = EXCLUDED.trigger_event_id,
  status = EXCLUDED.status,
  tasks_considered = EXCLUDED.tasks_considered,
  tasks_changed = EXCLUDED.tasks_changed,
  summary = EXCLUDED.summary,
  created_at = EXCLUDED.created_at,
  finished_at = EXCLUDED.finished_at;

-- ------------------------------------------------------------
-- Dispatch decisions
-- ------------------------------------------------------------

INSERT INTO dispatch_decisions (
  id, dispatch_run_id, hero_task_id, action_type, old_target_user_id, new_target_user_id,
  old_due_date, new_due_date, confidence, reason, applied, applied_at, created_at
) VALUES
  ('f1ae0ec7-b202-4fd3-a17e-d4f59da4d201', '95d35ac0-13f5-4f64-bfe7-4d0dfd7ce101', 6016, 'reassign', 1003, 1013, '2026-04-10T12:00:00+02:00', '2026-04-10T12:30:00+02:00', 0.9100, 'Jonas is delayed and Jan Reiter has the required switchgear skills, lower workload, and closer follow-up availability.', TRUE, '2026-04-09T08:07:15+02:00', '2026-04-09T08:07:00+02:00'),
  ('f1ae0ec7-b202-4fd3-a17e-d4f59da4d202', '95d35ac0-13f5-4f64-bfe7-4d0dfd7ce102', 6014, 'delay', 1015, 1015, '2026-04-09T12:30:00+02:00', '2026-04-09T16:30:00+02:00', 0.8600, 'Wind conditions make roof access unsafe. Delay is lower risk than reassignment because the paired solar diagnosis remains on site.', FALSE, NULL, '2026-04-09T09:12:00+02:00')
ON CONFLICT (id) DO UPDATE SET
  dispatch_run_id = EXCLUDED.dispatch_run_id,
  hero_task_id = EXCLUDED.hero_task_id,
  action_type = EXCLUDED.action_type,
  old_target_user_id = EXCLUDED.old_target_user_id,
  new_target_user_id = EXCLUDED.new_target_user_id,
  old_due_date = EXCLUDED.old_due_date,
  new_due_date = EXCLUDED.new_due_date,
  confidence = EXCLUDED.confidence,
  reason = EXCLUDED.reason,
  applied = EXCLUDED.applied,
  applied_at = EXCLUDED.applied_at,
  created_at = EXCLUDED.created_at;

-- ------------------------------------------------------------
-- Input messages
-- ------------------------------------------------------------

INSERT INTO input_messages (
  id, source, session_key, raw_text, normalized_text, parsed_intent, extracted_entities,
  hero_project_match_id, hero_task_id, hero_user_id, created_at
) VALUES
  ('3f3e9e4b-fc18-4f90-9378-fdc5fcad7001', 'audio_transcript', 'demo-session-anna-001', 'Jonas is stuck in traffic and will not make the Dresden switch install on time. What is the best option?', 'jonas is stuck in traffic and will not make the dresden switch install on time what is the best option', 'technician_delayed', '{"hero_user_id":1003,"hero_task_id":6016,"hero_project_match_id":5008,"reason":"traffic","delay_minutes":90}'::jsonb, 5008, 6016, 1003, '2026-04-09T08:05:30+02:00'),
  ('3f3e9e4b-fc18-4f90-9378-fdc5fcad7002', 'audio_transcript', 'demo-session-anna-002', 'Mehmet says the roof is too dangerous because of the wind. Should we reassign or delay?', 'mehmet says the roof is too dangerous because of the wind should we reassign or delay', 'weather_blocker', '{"hero_user_id":1015,"hero_task_id":6014,"hero_project_match_id":5007,"reason":"weather"}'::jsonb, 5007, 6014, 1015, '2026-04-09T09:10:15+02:00'),
  ('3f3e9e4b-fc18-4f90-9378-fdc5fcad7003', 'text', 'demo-session-anna-003', 'Who can take over urgent Leipzig solar work if Sarah is overloaded?', 'who can take over urgent leipzig solar work if sarah is overloaded', 'find_best_reassignment', '{"hero_user_id":1014,"hero_project_match_id":5007,"project_type":"solar","priority":"high"}'::jsonb, 5007, NULL, 1014, '2026-04-09T09:40:00+02:00')
ON CONFLICT (id) DO UPDATE SET
  source = EXCLUDED.source,
  session_key = EXCLUDED.session_key,
  raw_text = EXCLUDED.raw_text,
  normalized_text = EXCLUDED.normalized_text,
  parsed_intent = EXCLUDED.parsed_intent,
  extracted_entities = EXCLUDED.extracted_entities,
  hero_project_match_id = EXCLUDED.hero_project_match_id,
  hero_task_id = EXCLUDED.hero_task_id,
  hero_user_id = EXCLUDED.hero_user_id,
  created_at = EXCLUDED.created_at;

-- ------------------------------------------------------------
-- Knowledge chunks (optional pgvector-ready content)
-- ------------------------------------------------------------

INSERT INTO knowledge_chunks (
  id, source_type, source_key, title, content, metadata
) VALUES
  ('d3f7f7ac-cc95-48e8-90cf-66a9a39f8001', 'policy', 'dispatch_rules_v1', 'Dispatch priority policy', 'Prioritize customer impact first, then skill fit, then travel reduction, then workload balancing. Never move tasks marked as non-flexible unless no safe same-day option exists.', '{"category":"policy","locale":"de-DE"}'::jsonb),
  ('d3f7f7ac-cc95-48e8-90cf-66a9a39f8002', 'policy', 'weather_rule_roof_work', 'Roof weather safety rule', 'Do not recommend roof-based electrical or solar work when the manager reports unsafe wind or storm conditions. Prefer delay over reassignment unless another safe indoor task can be swapped in.', '{"category":"safety","locale":"de-DE"}'::jsonb),
  ('d3f7f7ac-cc95-48e8-90cf-66a9a39f8003', 'company', 'voltwerk_profile', 'VoltWerk Service GmbH profile', 'VoltWerk Service GmbH is a 15-person field-service company focused on electrical service, solar support, HVAC diagnostics, and maintenance jobs across Germany. Anna Becker manages dispatch and customer escalations.', '{"category":"company_profile"}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  source_type = EXCLUDED.source_type,
  source_key = EXCLUDED.source_key,
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata;


-- ------------------------------------------------------------
-- SOURCE: seed_demo_extension.sql
-- ------------------------------------------------------------

-- ============================================================
-- FILE: seed_demo_extension.sql
-- PURPOSE: Rich demo data for planner, project context, and AI
-- RUN ORDER: 5
--
-- Seeds the richer HERO-style demo entities created in
-- demo_extension_schema.sql.
-- ============================================================


INSERT INTO hero_project_types (hero_project_type_id, name, is_active, raw_payload)
VALUES
  (56962, 'Wartung', TRUE, '{"source":"demo_extension"}'::jsonb),
  (56961, 'Service', TRUE, '{"source":"demo_extension"}'::jsonb),
  (56960, 'Projekte', TRUE, '{"source":"demo_extension"}'::jsonb)
ON CONFLICT (hero_project_type_id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  raw_payload = EXCLUDED.raw_payload;

INSERT INTO hero_project_workflow_steps (
  hero_workflow_step_id, hero_project_type_id, name, is_active, sort_order, raw_payload
)
VALUES
  (684129, 56962, 'Wartung faellig', TRUE, 1, '{}'::jsonb),
  (684130, 56962, 'Abgeschlossen', TRUE, 2, '{}'::jsonb),
  (684131, 56962, 'Archiviert', TRUE, 3, '{}'::jsonb),
  (684132, 56962, 'Terminiert', TRUE, 4, '{}'::jsonb),
  (684133, 56962, 'Erledigt', TRUE, 5, '{}'::jsonb),
  (684134, 56962, 'Rechnung', TRUE, 6, '{}'::jsonb),
  (684123, 56961, 'Offen', TRUE, 1, '{}'::jsonb),
  (684124, 56961, 'Abgeschlossen', TRUE, 2, '{}'::jsonb),
  (684125, 56961, 'Archiviert', TRUE, 3, '{}'::jsonb),
  (684126, 56961, 'Terminiert', TRUE, 4, '{}'::jsonb),
  (684127, 56961, 'Erledigt', TRUE, 5, '{}'::jsonb),
  (684128, 56961, 'Rechnung', TRUE, 6, '{}'::jsonb),
  (684112, 56960, 'Neue Projekte', TRUE, 1, '{}'::jsonb),
  (684113, 56960, 'Begehung / Aufmass', TRUE, 2, '{}'::jsonb),
  (684114, 56960, 'Angebotserstellung', TRUE, 3, '{}'::jsonb),
  (684115, 56960, 'Angebot verschickt', TRUE, 4, '{}'::jsonb),
  (684116, 56960, 'Auftrag bestaetigt', TRUE, 5, '{}'::jsonb),
  (684117, 56960, 'Montageplanung', TRUE, 6, '{}'::jsonb),
  (684118, 56960, 'In Umsetzung', TRUE, 7, '{}'::jsonb),
  (684119, 56960, 'Schlussrechnung', TRUE, 8, '{}'::jsonb),
  (684120, 56960, 'Abgeschlossen', TRUE, 9, '{}'::jsonb),
  (684121, 56960, 'Archiviert', TRUE, 10, '{}'::jsonb),
  (684122, 56960, 'Reklamation', TRUE, 11, '{}'::jsonb)
ON CONFLICT (hero_workflow_step_id) DO UPDATE SET
  hero_project_type_id = EXCLUDED.hero_project_type_id,
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;

INSERT INTO hero_measures (hero_measure_id, name, short_code, skill_mapping, raw_payload)
VALUES
  (
    6464,
    'Projekt',
    'PRJ',
    '["installation","maintenance","repair","solar","electrical","heat_pump"]'::jsonb,
    '{"source":"demo_extension"}'::jsonb
  )
ON CONFLICT (hero_measure_id) DO UPDATE SET
  name = EXCLUDED.name,
  short_code = EXCLUDED.short_code,
  skill_mapping = EXCLUDED.skill_mapping;

INSERT INTO hero_products (
  hero_product_id, nr, name, base_price, list_price, sales_price, vat_percent, unit_type,
  category, description, manufacturer, raw_payload
)
VALUES
  (
    'HAy3gTgoMAA',
    '1000',
    'Artikel 1',
    50.00,
    0.00,
    50.00,
    19.00,
    'Stk',
    '',
    'Dies ist eine Beschreibung.',
    '',
    '{"source":"demo_extension"}'::jsonb
  ),
  (
    'HAzz7aj6wAA',
    '2000',
    'Mock Artikel',
    75.00,
    90.00,
    90.00,
    19.00,
    'Stk',
    'Material',
    'Mock product for testing purposes',
    'Mock Manufacturer',
    '{"source":"demo_extension"}'::jsonb
  )
ON CONFLICT (hero_product_id) DO UPDATE SET
  nr = EXCLUDED.nr,
  name = EXCLUDED.name,
  base_price = EXCLUDED.base_price,
  list_price = EXCLUDED.list_price,
  sales_price = EXCLUDED.sales_price,
  vat_percent = EXCLUDED.vat_percent,
  unit_type = EXCLUDED.unit_type,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  manufacturer = EXCLUDED.manufacturer;

INSERT INTO hero_document_types (hero_document_type_id, name, base_type, raw_payload)
VALUES
  (1227203, 'Kalkulation', 'calculation', '{}'::jsonb),
  (1227204, 'Auftragsbestaetigung', 'confirmation', '{}'::jsonb),
  (1227205, 'Lieferschein', 'delivery_note', '{}'::jsonb),
  (1227206, 'Arbeitsbericht', 'delivery_note', '{}'::jsonb),
  (1227207, 'Mahnung', 'dunning', '{}'::jsonb),
  (1227208, 'Allgemein', 'generic', '{}'::jsonb),
  (1227209, 'Baustellenbericht', 'information', '{}'::jsonb),
  (1227210, 'Rechnung', 'invoice', '{}'::jsonb),
  (1227211, 'Rechnung 13b', 'invoice', '{}'::jsonb),
  (1227212, 'Gutschrift', 'invoice', '{}'::jsonb),
  (1227214, 'Brief', 'letter', '{}'::jsonb),
  (1227215, 'Aufmassdokument', 'measurement', '{}'::jsonb),
  (1227216, 'Angebot', 'offer', '{}'::jsonb),
  (1227217, 'Bestellschein', 'order_form', '{}'::jsonb),
  (1227218, 'Reparaturauftrag', 'repair', '{}'::jsonb),
  (1227219, 'Wartungsauftrag', 'repair', '{}'::jsonb),
  (1227220, 'Stornorechnung', 'reversal_invoice', '{}'::jsonb)
ON CONFLICT (hero_document_type_id) DO UPDATE SET
  name = EXCLUDED.name,
  base_type = EXCLUDED.base_type;

INSERT INTO hero_calendar_categories (hero_calendar_category_id, name, raw_payload)
VALUES
  (419149, 'Umsetzung', '{}'::jsonb),
  (419150, 'Vor-Ort-Termin', '{}'::jsonb),
  (419151, 'Schlechtwetter', '{}'::jsonb),
  (419152, 'Buero', '{}'::jsonb),
  (419153, 'Besprechung', '{}'::jsonb),
  (419154, 'Schule', '{}'::jsonb)
ON CONFLICT (hero_calendar_category_id) DO UPDATE SET
  name = EXCLUDED.name;

INSERT INTO hero_users (
  hero_user_id, hero_partner_id, email, role, first_name, last_name, full_name, partner_status, raw_payload
)
VALUES
  (
    315139,
    163178,
    'cliford.nchotie@example.com',
    'worker',
    'Cliford',
    'Nchotie',
    'Cliford Nchotie',
    'active',
    '{"source":"demo_extension"}'::jsonb
  )
ON CONFLICT (hero_user_id) DO UPDATE SET
  hero_partner_id = EXCLUDED.hero_partner_id,
  email = EXCLUDED.email,
  role = EXCLUDED.role,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  full_name = EXCLUDED.full_name,
  partner_status = EXCLUDED.partner_status,
  raw_payload = EXCLUDED.raw_payload,
  last_synced_at = NOW();

INSERT INTO technician_profiles (
  hero_user_id, name, status, geographic_zone, skills, notes
)
VALUES
  (
    315139,
    'Cliford Nchotie',
    'sick',
    'Berlin-Mitte',
    '["electrical","solar","heat_pump","installation","maintenance","repair"]'::jsonb,
    'Master technician for the richer demo scenarios.'
  )
ON CONFLICT (hero_user_id) DO UPDATE SET
  name = EXCLUDED.name,
  status = EXCLUDED.status,
  geographic_zone = EXCLUDED.geographic_zone,
  skills = EXCLUDED.skills,
  notes = EXCLUDED.notes;

INSERT INTO hero_addresses (
  hero_address_id, street, line_1, city, zipcode, country_code, country_name, full_address, raw_payload
)
VALUES
  (
    6803533,
    'Berliner Strasse 42',
    'Berliner Strasse 42',
    'Berlin',
    '10115',
    'DE',
    'Germany',
    'Berliner Strasse 42, 10115 Berlin, Germany',
    '{"source":"demo_extension"}'::jsonb
  ),
  (
    6803553,
    'Moeckebergstrasse 7',
    'Moeckebergstrasse 7',
    'Hamburg',
    '20095',
    'DE',
    'Germany',
    'Moeckebergstrasse 7, 20095 Hamburg, Germany',
    '{"source":"demo_extension"}'::jsonb
  )
ON CONFLICT (hero_address_id) DO UPDATE SET
  street = EXCLUDED.street,
  line_1 = EXCLUDED.line_1,
  city = EXCLUDED.city,
  zipcode = EXCLUDED.zipcode,
  country_code = EXCLUDED.country_code,
  country_name = EXCLUDED.country_name,
  full_address = EXCLUDED.full_address,
  raw_payload = EXCLUDED.raw_payload,
  last_synced_at = NOW();

INSERT INTO hero_customers (
  hero_customer_id, hero_address_id, first_name, last_name, full_name, email, phone_home, phone_mobile,
  category, raw_payload
)
VALUES
  (
    6803533,
    6803533,
    'John',
    'Doe',
    'John Doe',
    'john.doe@example.com',
    '+49 30 123456',
    '+49 170 9876543',
    'customer',
    '{"type":"private","source":"demo_extension"}'::jsonb
  ),
  (
    6803553,
    6803553,
    'Jane',
    'Smith',
    'Jane Smith',
    'jane.smith@example.com',
    '+49 30 987654',
    '+49 171 1234567',
    'customer',
    '{"type":"private","source":"demo_extension"}'::jsonb
  )
ON CONFLICT (hero_customer_id) DO UPDATE SET
  hero_address_id = EXCLUDED.hero_address_id,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone_home = EXCLUDED.phone_home,
  phone_mobile = EXCLUDED.phone_mobile,
  category = EXCLUDED.category,
  raw_payload = EXCLUDED.raw_payload,
  last_synced_at = NOW();

INSERT INTO hero_project_matches (
  hero_project_match_id, hero_customer_id, hero_contact_id, hero_address_id, name, project_title,
  project_nr, display_id, partner_notes, project_type, type_id, current_status_id, status_name, raw_payload
)
VALUES
  (
    10050014,
    6803533,
    6803533,
    6803533,
    'Projekt - John Doe',
    'Projekt Erstaufnahme',
    '10050014',
    'PRJ-014',
    'Demo project from richer HERO-style payload.',
    'project',
    56960,
    684112,
    'Neue Projekte',
    '{"measure_id":6464,"partner_id":163178,"partner_name":"Cliford Nchotie"}'::jsonb
  ),
  (
    10050048,
    6803553,
    6803553,
    6803553,
    'Projekt - Jane Smith',
    'Projekt Aufnahme Jane Smith',
    '10050048',
    'PRJ-048',
    'Demo project from richer HERO-style payload.',
    'project',
    56960,
    684112,
    'Neue Projekte',
    '{"measure_id":6464,"partner_id":163178,"partner_name":"Cliford Nchotie"}'::jsonb
  ),
  (
    10050049,
    6803553,
    6803553,
    6803553,
    'Service - Jane Smith',
    'Serviceeinsatz Jane Smith',
    '10050049',
    'SRV-049',
    'Emergency service demo scenario.',
    'service',
    56961,
    684123,
    'Offen',
    '{"measure_id":6464,"partner_id":163178,"partner_name":"Cliford Nchotie"}'::jsonb
  ),
  (
    10050050,
    6803553,
    6803553,
    6803553,
    'Wartung - Jane Smith',
    'Wartungstermin Jane Smith',
    '10050050',
    'WAR-050',
    'Weather and delay demo scenario.',
    'maintenance',
    56962,
    684129,
    'Wartung faellig',
    '{"measure_id":6464,"partner_id":163178,"partner_name":"Cliford Nchotie"}'::jsonb
  )
ON CONFLICT (hero_project_match_id) DO UPDATE SET
  hero_customer_id = EXCLUDED.hero_customer_id,
  hero_contact_id = EXCLUDED.hero_contact_id,
  hero_address_id = EXCLUDED.hero_address_id,
  name = EXCLUDED.name,
  project_title = EXCLUDED.project_title,
  project_nr = EXCLUDED.project_nr,
  display_id = EXCLUDED.display_id,
  partner_notes = EXCLUDED.partner_notes,
  project_type = EXCLUDED.project_type,
  type_id = EXCLUDED.type_id,
  current_status_id = EXCLUDED.current_status_id,
  status_name = EXCLUDED.status_name,
  raw_payload = EXCLUDED.raw_payload,
  last_synced_at = NOW();

INSERT INTO hero_tasks (
  hero_task_id, hero_author_user_id, hero_target_user_id, hero_target_project_match_id, title, comment,
  due_date, is_done, is_deleted, raw_payload
)
VALUES
  (
    1678518,
    1001,
    315139,
    10050014,
    'Follow up with John Doe',
    'High-value project follow-up.',
    '2025-08-01T00:00:00+00:00',
    FALSE,
    FALSE,
    '{"source":"demo_extension"}'::jsonb
  ),
  (
    1678532,
    1001,
    315139,
    10050048,
    'Follow up - Projekte Project',
    'High-value project follow-up.',
    '2025-08-15T00:00:00+00:00',
    FALSE,
    FALSE,
    '{"source":"demo_extension"}'::jsonb
  ),
  (
    1678533,
    1001,
    315139,
    10050049,
    'Service Check - Jane Smith',
    'Service call task.',
    '2025-08-16T00:00:00+00:00',
    FALSE,
    FALSE,
    '{"source":"demo_extension"}'::jsonb
  ),
  (
    1678534,
    1001,
    315139,
    10050050,
    'Wartung Faellig - Jane Smith',
    'Maintenance appointment task.',
    '2025-08-17T00:00:00+00:00',
    FALSE,
    FALSE,
    '{"source":"demo_extension"}'::jsonb
  )
ON CONFLICT (hero_task_id) DO UPDATE SET
  hero_author_user_id = EXCLUDED.hero_author_user_id,
  hero_target_user_id = EXCLUDED.hero_target_user_id,
  hero_target_project_match_id = EXCLUDED.hero_target_project_match_id,
  title = EXCLUDED.title,
  comment = EXCLUDED.comment,
  due_date = EXCLUDED.due_date,
  is_done = EXCLUDED.is_done,
  is_deleted = EXCLUDED.is_deleted,
  raw_payload = EXCLUDED.raw_payload,
  last_synced_at = NOW();

INSERT INTO task_overrides (
  hero_task_id, business_value, is_flexible, required_skills, notes
)
VALUES
  (1678518, 'high', FALSE, '["installation","electrical"]'::jsonb, 'High-value new project follow-up.'),
  (1678532, 'high', TRUE, '["installation","solar"]'::jsonb, 'Flexible but high-value project follow-up.'),
  (1678533, 'medium', TRUE, '["repair","electrical"]'::jsonb, 'Service repair demo task.'),
  (1678534, 'low', FALSE, '["maintenance","heat_pump"]'::jsonb, 'Maintenance visit with low value but fixed timing.')
ON CONFLICT (hero_task_id) DO UPDATE SET
  business_value = EXCLUDED.business_value,
  is_flexible = EXCLUDED.is_flexible,
  required_skills = EXCLUDED.required_skills,
  notes = EXCLUDED.notes;

INSERT INTO hero_logbook_entries (
  hero_logbook_entry_id, hero_project_match_id, custom_text, created_on, raw_payload
)
VALUES
  (108012644, 10050014, 'Project created for John Doe with full details', '2025-07-01T08:00:00+00:00', '{}'::jsonb),
  (108013159, 10050048, 'Project created for Jane Smith - Projekte type', '2025-07-01T08:30:00+00:00', '{}'::jsonb),
  (108013160, 10050049, 'Service project created for Jane Smith', '2025-07-01T09:00:00+00:00', '{}'::jsonb),
  (108013162, 10050050, 'Wartung project created for Jane Smith', '2025-07-01T09:30:00+00:00', '{}'::jsonb)
ON CONFLICT (hero_logbook_entry_id) DO UPDATE SET
  hero_project_match_id = EXCLUDED.hero_project_match_id,
  custom_text = EXCLUDED.custom_text,
  created_on = EXCLUDED.created_on,
  raw_payload = EXCLUDED.raw_payload;

INSERT INTO hero_calendar_events (
  hero_calendar_event_id, hero_project_match_id, hero_calendar_category_id, title, starts_at, ends_at,
  partner_ids, raw_payload
)
VALUES
  (
    5107633,
    10050014,
    419150,
    'Initial Site Visit - John Doe',
    '2025-08-01T09:00:00+00:00',
    '2025-08-01T10:00:00+00:00',
    '[163178]'::jsonb,
    '{}'::jsonb
  ),
  (
    5107666,
    10050048,
    419150,
    'Initial Site Visit - Jane Smith',
    '2025-08-15T09:00:00+00:00',
    '2025-08-15T10:00:00+00:00',
    '[163178]'::jsonb,
    '{}'::jsonb
  ),
  (
    5107667,
    10050049,
    419153,
    'Service Appointment - Jane Smith',
    '2025-08-16T10:00:00+00:00',
    '2025-08-16T11:00:00+00:00',
    '[163178]'::jsonb,
    '{}'::jsonb
  ),
  (
    5107668,
    10050050,
    419150,
    'Wartungstermin - Jane Smith',
    '2025-08-17T11:00:00+00:00',
    '2025-08-17T12:00:00+00:00',
    '[163178]'::jsonb,
    '{}'::jsonb
  )
ON CONFLICT (hero_calendar_event_id) DO UPDATE SET
  hero_project_match_id = EXCLUDED.hero_project_match_id,
  hero_calendar_category_id = EXCLUDED.hero_calendar_category_id,
  title = EXCLUDED.title,
  starts_at = EXCLUDED.starts_at,
  ends_at = EXCLUDED.ends_at,
  partner_ids = EXCLUDED.partner_ids,
  raw_payload = EXCLUDED.raw_payload;

INSERT INTO hero_documents (
  hero_document_id, hero_project_match_id, hero_document_type_id, type_name, is_published, document_url, raw_payload
)
VALUES
  (
    17487142,
    10050014,
    1227216,
    'Angebot',
    TRUE,
    'https://login.hero-software.de/files/document/offer/yppycpfewggccsw0.pdf',
    '{}'::jsonb
  ),
  (
    17487238,
    10050048,
    1227216,
    'Angebot',
    TRUE,
    'https://login.hero-software.de/files/document/offer/tn71dmk0liscwokc.pdf',
    '{}'::jsonb
  ),
  (
    17487239,
    10050049,
    1227218,
    'Reparaturauftrag',
    TRUE,
    'https://login.hero-software.de/files/document/repair/27wvf8rsinggcow0g.pdf',
    '{}'::jsonb
  ),
  (
    17487242,
    10050050,
    1227219,
    'Wartungsauftrag',
    TRUE,
    'https://login.hero-software.de/files/document/repair/1djedfztvjfo0cgkg.pdf',
    '{}'::jsonb
  )
ON CONFLICT (hero_document_id) DO UPDATE SET
  hero_project_match_id = EXCLUDED.hero_project_match_id,
  hero_document_type_id = EXCLUDED.hero_document_type_id,
  type_name = EXCLUDED.type_name,
  is_published = EXCLUDED.is_published,
  document_url = EXCLUDED.document_url,
  raw_payload = EXCLUDED.raw_payload;

DELETE FROM hero_document_line_items
WHERE hero_document_id IN (17487142, 17487238, 17487239, 17487242);

INSERT INTO hero_document_line_items (
  hero_document_id, sort_order, name, description, quantity, unit_type, net_price, vat_percent
)
VALUES
  (17487142, 1, 'Installation Service', 'Full installation service', 1, 'pauschal', 1500, 19),
  (17487142, 2, 'Material Supply', 'Supply of materials', 10, 'Stk', 250, 19),
  (17487238, 1, 'Installation Service', 'Full installation service', 1, 'pauschal', 1500, 19),
  (17487239, 1, 'Service Labour', 'On-site service labour', 2, 'Std', 95, 19),
  (17487242, 1, 'Wartung Pauschal', 'Annual maintenance check', 1, 'pauschal', 199, 19);

INSERT INTO demo_trigger_events (
  external_event_id, event_type, target_id, target_type, message, triggered_at, affected_tasks, raw_payload
)
VALUES
  (
    'EVT-001',
    'technician_sick',
    '315139',
    'technician',
    'Cliford Nchotie called in sick. All tasks for 2025-08-01 need re-dispatch.',
    '2025-08-01T07:15:00+00:00',
    '[1678518,1678532]'::jsonb,
    '{}'::jsonb
  ),
  (
    'EVT-002',
    'new_urgent_task',
    '10050049',
    'project',
    'Emergency service call raised for Jane Smith. Immediate dispatch required.',
    '2025-08-16T08:00:00+00:00',
    '[1678533]'::jsonb,
    '{}'::jsonb
  ),
  (
    'EVT-003',
    'delay',
    '1678534',
    'task',
    'Wartung appointment delayed by 2 hours due to traffic.',
    '2025-08-17T09:00:00+00:00',
    '[1678534]'::jsonb,
    '{}'::jsonb
  ),
  (
    'EVT-004',
    'weather_block',
    '5107668',
    'calendar_event',
    'Heavy rain forecast. Outdoor Wartung appointment may need rescheduling.',
    '2025-08-17T06:00:00+00:00',
    '[1678534]'::jsonb,
    '{}'::jsonb
  )
ON CONFLICT (external_event_id) DO UPDATE SET
  event_type = EXCLUDED.event_type,
  target_id = EXCLUDED.target_id,
  target_type = EXCLUDED.target_type,
  message = EXCLUDED.message,
  triggered_at = EXCLUDED.triggered_at,
  affected_tasks = EXCLUDED.affected_tasks,
  raw_payload = EXCLUDED.raw_payload;


-- ------------------------------------------------------------
-- SOURCE: seed_business_expansion.sql
-- ------------------------------------------------------------

-- ============================================================
-- FILE: seed_business_expansion.sql
-- PURPOSE: Commercial and field-history seed data
-- RUN ORDER: 7
--
-- Seeds the business-expansion layer with:
--   * quotes
--   * invoices
--   * payments
--   * time logs
--   * project notes
--   * materials usage
--   * equipment assets
-- ============================================================


INSERT INTO quotes (
  quote_number, hero_project_match_id, hero_customer_id, created_by_user_id, status,
  title, description, valid_until, subtotal, vat_total, total, notes
) VALUES
  ('Q-2026-001', 5001, 4001, 1001, 'approved', 'Berlin retrofit package', 'EV charger and subpanel upgrade for residential property.', '2026-04-25', 2850.00, 541.50, 3391.50, 'Approved after second revision.'),
  ('Q-2026-002', 5003, 4003, 1001, 'sent', 'Solar preparation scope', 'Meter cabinet and inverter prep before roof installation.', '2026-04-30', 4200.00, 798.00, 4998.00, 'Customer waiting on investor sign-off.'),
  ('Q-2026-003', 5007, 4007, 1001, 'approved', 'Urgent inverter recovery', 'Rapid-response diagnostics and replacement allowance.', '2026-04-15', 1850.00, 351.50, 2201.50, 'Urgent approval by dispatch contact.'),
  ('Q-2026-004', 5010, 4010, 1001, 'approved', 'Cold storage sensor package', 'Sensor replacement and control calibration.', '2026-04-18', 3100.00, 589.00, 3689.00, 'Bundled with same-day testing.'),
  ('Q-2026-005', 5012, 4012, 1001, 'draft', 'Temporary power safety package', 'Trailer supply checks and RCD documentation.', '2026-05-05', 1650.00, 313.50, 1963.50, 'Draft for site foreman review.')
ON CONFLICT (quote_number) DO UPDATE SET
  hero_project_match_id = EXCLUDED.hero_project_match_id,
  hero_customer_id = EXCLUDED.hero_customer_id,
  created_by_user_id = EXCLUDED.created_by_user_id,
  status = EXCLUDED.status,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  valid_until = EXCLUDED.valid_until,
  subtotal = EXCLUDED.subtotal,
  vat_total = EXCLUDED.vat_total,
  total = EXCLUDED.total,
  notes = EXCLUDED.notes,
  updated_at = NOW();

INSERT INTO quote_line_items (
  quote_id, sort_order, hero_product_id, name, description, quantity, unit_type,
  unit_net_price, vat_percent, line_total
)
SELECT q.id, items.sort_order, items.hero_product_id, items.name, items.description, items.quantity,
       items.unit_type, items.unit_net_price, items.vat_percent, items.line_total
FROM (
  VALUES
    ('Q-2026-001', 1, 'HAzz7aj6wAA', 'EV charger hardware', 'Wallbox and mounting accessories', 1.00, 'set', 950.00, 19.00, 950.00),
    ('Q-2026-001', 2, NULL, 'Installation labour', 'Site wiring, breaker changes, commissioning', 16.00, 'hour', 95.00, 19.00, 1520.00),
    ('Q-2026-002', 1, 'HAy3gTgoMAA', 'Meter cabinet preparation', 'Cabinet modification and labeling', 1.00, 'lot', 1200.00, 19.00, 1200.00),
    ('Q-2026-002', 2, NULL, 'Inverter prep labour', 'Electrical prep before roof completion', 24.00, 'hour', 125.00, 19.00, 3000.00),
    ('Q-2026-003', 1, NULL, 'Urgent diagnostics labour', 'Same-day inverter diagnostics', 8.00, 'hour', 110.00, 19.00, 880.00),
    ('Q-2026-003', 2, 'HAzz7aj6wAA', 'Replacement control components', 'Rapid replacement stock allowance', 1.00, 'set', 970.00, 19.00, 970.00),
    ('Q-2026-004', 1, 'HAzz7aj6wAA', 'Sensor replacement set', 'Cold-storage compatible sensors', 1.00, 'set', 1450.00, 19.00, 1450.00),
    ('Q-2026-004', 2, NULL, 'Calibration labour', 'Alarm relay calibration and verification', 14.00, 'hour', 117.86, 19.00, 1650.04),
    ('Q-2026-005', 1, NULL, 'Temporary power inspection', 'Inspection and reporting for all trailers', 10.00, 'hour', 105.00, 19.00, 1050.00),
    ('Q-2026-005', 2, NULL, 'Documentation package', 'RCD protocol and foreman handover notes', 1.00, 'lot', 600.00, 19.00, 600.00)
) AS items(quote_number, sort_order, hero_product_id, name, description, quantity, unit_type, unit_net_price, vat_percent, line_total)
JOIN quotes q
  ON q.quote_number = items.quote_number
ON CONFLICT DO NOTHING;

INSERT INTO invoices (
  invoice_number, quote_id, hero_project_match_id, hero_customer_id, status,
  issued_on, due_on, sent_at, subtotal, vat_total, total, outstanding_amount, notes
)
SELECT
  data.invoice_number,
  q.id,
  data.hero_project_match_id,
  data.hero_customer_id,
  data.status::invoice_status,
  data.issued_on,
  data.due_on,
  data.sent_at,
  data.subtotal,
  data.vat_total,
  data.total,
  data.outstanding_amount,
  data.notes
FROM (
  VALUES
    ('INV-2026-041', 'Q-2026-001', 5001, 4001, 'sent', '2026-04-08'::date, '2026-04-22'::date, '2026-04-08T10:00:00+02:00'::timestamptz, 2850.00, 541.50, 3391.50, 3391.50, 'Awaiting customer transfer.'),
    ('INV-2026-042', 'Q-2026-003', 5007, 4007, 'partially_paid', '2026-04-09'::date, '2026-04-19'::date, '2026-04-09T16:20:00+02:00'::timestamptz, 1850.00, 351.50, 2201.50, 1100.75, 'Customer paid first half same day.'),
    ('INV-2026-043', 'Q-2026-004', 5010, 4010, 'overdue', '2026-04-01'::date, '2026-04-08'::date, '2026-04-01T09:10:00+02:00'::timestamptz, 3100.00, 589.00, 3689.00, 3689.00, 'Follow-up call planned for this week.')
) AS data(invoice_number, quote_number, hero_project_match_id, hero_customer_id, status, issued_on, due_on, sent_at, subtotal, vat_total, total, outstanding_amount, notes)
JOIN quotes q
  ON q.quote_number = data.quote_number
ON CONFLICT (invoice_number) DO UPDATE SET
  quote_id = EXCLUDED.quote_id,
  hero_project_match_id = EXCLUDED.hero_project_match_id,
  hero_customer_id = EXCLUDED.hero_customer_id,
  status = EXCLUDED.status,
  issued_on = EXCLUDED.issued_on,
  due_on = EXCLUDED.due_on,
  sent_at = EXCLUDED.sent_at,
  subtotal = EXCLUDED.subtotal,
  vat_total = EXCLUDED.vat_total,
  total = EXCLUDED.total,
  outstanding_amount = EXCLUDED.outstanding_amount,
  notes = EXCLUDED.notes,
  updated_at = NOW();

INSERT INTO invoice_line_items (
  invoice_id, sort_order, hero_product_id, name, description, quantity, unit_type,
  unit_net_price, vat_percent, line_total
)
SELECT i.id, items.sort_order, items.hero_product_id, items.name, items.description, items.quantity,
       items.unit_type, items.unit_net_price, items.vat_percent, items.line_total
FROM (
  VALUES
    ('INV-2026-041', 1, 'HAzz7aj6wAA', 'EV charger hardware', 'Wallbox and mounting accessories', 1.00, 'set', 950.00, 19.00, 950.00),
    ('INV-2026-041', 2, NULL, 'Installation labour', 'Site wiring, breaker changes, commissioning', 16.00, 'hour', 95.00, 19.00, 1520.00),
    ('INV-2026-042', 1, NULL, 'Urgent diagnostics labour', 'Same-day inverter diagnostics', 8.00, 'hour', 110.00, 19.00, 880.00),
    ('INV-2026-042', 2, 'HAzz7aj6wAA', 'Replacement control components', 'Rapid replacement stock allowance', 1.00, 'set', 970.00, 19.00, 970.00),
    ('INV-2026-043', 1, 'HAzz7aj6wAA', 'Sensor replacement set', 'Cold-storage compatible sensors', 1.00, 'set', 1450.00, 19.00, 1450.00),
    ('INV-2026-043', 2, NULL, 'Calibration labour', 'Alarm relay calibration and verification', 14.00, 'hour', 117.86, 19.00, 1650.04)
) AS items(invoice_number, sort_order, hero_product_id, name, description, quantity, unit_type, unit_net_price, vat_percent, line_total)
JOIN invoices i
  ON i.invoice_number = items.invoice_number
ON CONFLICT DO NOTHING;

INSERT INTO payments (
  invoice_id, status, method, amount, received_on, external_reference, notes
)
SELECT i.id, data.status::payment_status, data.method::payment_method, data.amount, data.received_on,
       data.external_reference, data.notes
FROM (
  VALUES
    ('INV-2026-042', 'received', 'bank_transfer', 1100.75, '2026-04-10'::date, 'PAY-778142', 'Partial upfront payment received.'),
    ('INV-2026-043', 'pending', 'bank_transfer', 3689.00, NULL::date, 'PAY-PENDING-043', 'Reminder due tomorrow.')
) AS data(invoice_number, status, method, amount, received_on, external_reference, notes)
JOIN invoices i
  ON i.invoice_number = data.invoice_number
ON CONFLICT DO NOTHING;

INSERT INTO time_logs (
  hero_user_id, hero_project_match_id, hero_task_id, work_type, started_at, ended_at,
  duration_minutes, is_billable, notes
) VALUES
  (1002, 5001, 6001, 'inspection', '2026-04-09T08:05:00+02:00', '2026-04-09T09:22:00+02:00', 77, TRUE, 'Panel check took longer due to tenant coordination.'),
  (1003, 5001, 6002, 'installation', '2026-04-09T09:48:00+02:00', '2026-04-09T12:07:00+02:00', 139, TRUE, 'Mounting rail installed and cabling route marked.'),
  (1006, 5003, 6005, 'solar_prep', '2026-04-09T08:34:00+02:00', '2026-04-09T11:26:00+02:00', 172, TRUE, 'Inverter connection point prepared.'),
  (1008, 5004, 6007, 'diagnostics', '2026-04-09T08:02:00+02:00', '2026-04-09T10:11:00+02:00', 129, TRUE, 'Alarm history downloaded from controller.'),
  (1014, 5007, 6013, 'urgent_response', '2026-04-09T08:18:00+02:00', '2026-04-09T10:24:00+02:00', 126, TRUE, 'Inverter shutdown traced to faulty board component.'),
  (1011, 5010, 6020, 'calibration', '2026-04-10T11:04:00+02:00', '2026-04-10T14:31:00+02:00', 207, TRUE, 'Relay outputs recalibrated and tested.')
ON CONFLICT DO NOTHING;

INSERT INTO project_notes (
  hero_project_match_id, hero_user_id, note_type, title, content, is_urgent
) VALUES
  (5001, 1001, 'customer_update', 'Tenant noise window', 'Work before 08:00 creates noise complaints. Keep drilling after 08:15 if possible.', FALSE),
  (5003, 1006, 'site_note', 'Roof team dependency', 'Roofing subcontractor requested electrical prep completion before inverter handoff.', FALSE),
  (5007, 1014, 'issue', 'Feed-in stopped', 'Customer reports lost feed-in revenue while inverter remains down. Treat as urgent until restored.', TRUE),
  (5008, 1003, 'safety', 'Tenant notification', 'Tenant communication already sent for the board shutdown window. Keep the outage within agreed slot.', TRUE),
  (5010, 1011, 'handover', 'Calibration follow-up', 'Cold storage manager wants a signed calibration summary before release.', FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO materials_used (
  hero_project_match_id, hero_task_id, hero_product_id, used_by_user_id, quantity, unit_type, used_at, notes
) VALUES
  (5001, 6002, 'HAzz7aj6wAA', 1003, 1.00, 'set', '2026-04-09T11:10:00+02:00', 'Used mounting and protection accessories from van stock.'),
  (5007, 6013, 'HAzz7aj6wAA', 1014, 1.00, 'set', '2026-04-09T09:58:00+02:00', 'Installed replacement control module during urgent call.'),
  (5010, 6020, 'HAy3gTgoMAA', 1011, 2.00, 'Stk', '2026-04-10T13:45:00+02:00', 'Used sensor accessories for final calibration.')
ON CONFLICT DO NOTHING;

INSERT INTO equipment_assets (
  asset_code, name, asset_type, status, assigned_user_id, geographic_zone, maintenance_due_on, notes
) VALUES
  ('VAN-01', 'Sprinter Service Van 01', 'vehicle', 'assigned', 1002, 'berlin', '2026-05-12', 'Primary Berlin electrical van.'),
  ('VAN-02', 'Sprinter Service Van 02', 'vehicle', 'assigned', 1003, 'east', '2026-05-18', 'Carries distribution board tooling.'),
  ('THERM-01', 'Thermal Camera FLIR', 'diagnostic_tool', 'assigned', 1013, 'south', '2026-06-01', 'Used for factory feeder diagnostics.'),
  ('LIFT-01', 'Compact Scissor Lift', 'access_equipment', 'available', NULL, 'north', '2026-05-28', 'Reserved for warehouse lighting work.'),
  ('PPE-COLD-01', 'Cold Storage PPE Kit', 'safety_kit', 'assigned', 1011, 'north', '2026-07-10', 'Required for freezer room service.'),
  ('HARNESS-01', 'Solar Roof Harness Kit', 'safety_kit', 'assigned', 1015, 'west', '2026-06-15', 'Used for roof combiner and inverter checks.')
ON CONFLICT (asset_code) DO UPDATE SET
  name = EXCLUDED.name,
  asset_type = EXCLUDED.asset_type,
  status = EXCLUDED.status,
  assigned_user_id = EXCLUDED.assigned_user_id,
  geographic_zone = EXCLUDED.geographic_zone,
  maintenance_due_on = EXCLUDED.maintenance_due_on,
  notes = EXCLUDED.notes,
  updated_at = NOW();


-- ------------------------------------------------------------
-- SOURCE: seed_challenge_dataset.sql
-- ------------------------------------------------------------

-- ============================================================
-- FILE: seed_challenge_dataset.sql
-- PURPOSE: Challenge-scale historical data expansion
-- RUN ORDER: 8
--
-- Adds approximately:
--   * 50 additional customers
--   * 90 historical projects across 6 months
--   * 180 historical tasks
--   * 60 quotes
--   * 45 invoices
--   * payment history
--   * time logs
--   * project notes
--   * materials usage
--
-- Use this when you want the database to feel large enough for
-- richer AI features and a stronger hackathon dataset story.
-- ============================================================


-- ------------------------------------------------------------
-- 50 extra addresses and customers
-- ------------------------------------------------------------

WITH address_seed AS (
  SELECT
    n,
    3500 + n AS hero_address_id,
    CASE ((n - 1) % 10)
      WHEN 0 THEN 'Berlin'
      WHEN 1 THEN 'Hamburg'
      WHEN 2 THEN 'Munich'
      WHEN 3 THEN 'Cologne'
      WHEN 4 THEN 'Frankfurt am Main'
      WHEN 5 THEN 'Stuttgart'
      WHEN 6 THEN 'Leipzig'
      WHEN 7 THEN 'Dresden'
      WHEN 8 THEN 'Hanover'
      ELSE 'Dortmund'
    END AS city,
    CASE ((n - 1) % 10)
      WHEN 0 THEN '10'
      WHEN 1 THEN '20'
      WHEN 2 THEN '80'
      WHEN 3 THEN '50'
      WHEN 4 THEN '60'
      WHEN 5 THEN '70'
      WHEN 6 THEN '04'
      WHEN 7 THEN '01'
      WHEN 8 THEN '30'
      ELSE '44'
    END AS zipcode_prefix
  FROM generate_series(1, 50) AS n
)
INSERT INTO hero_addresses (
  hero_address_id,
  street,
  line_1,
  city,
  zipcode,
  country_code,
  country_name,
  full_address,
  maps_link,
  latitude,
  longitude
)
SELECT
  hero_address_id,
  FORMAT('Werkstrasse %s', 20 + n),
  FORMAT('Werkstrasse %s', 20 + n),
  city,
  FORMAT('%s%03s', zipcode_prefix, n),
  'DE',
  'Germany',
  FORMAT('Werkstrasse %s, %s%03s %s, Germany', 20 + n, zipcode_prefix, n, city),
  FORMAT('https://maps.google.com/?q=%s,%s', 50 + (n * 0.01), 8 + (n * 0.01)),
  50 + (n * 0.01),
  8 + (n * 0.01)
FROM address_seed
ON CONFLICT (hero_address_id) DO UPDATE SET
  street = EXCLUDED.street,
  line_1 = EXCLUDED.line_1,
  city = EXCLUDED.city,
  zipcode = EXCLUDED.zipcode,
  country_code = EXCLUDED.country_code,
  country_name = EXCLUDED.country_name,
  full_address = EXCLUDED.full_address,
  maps_link = EXCLUDED.maps_link,
  latitude = EXCLUDED.latitude,
  longitude = EXCLUDED.longitude,
  last_synced_at = NOW();

WITH customer_seed AS (
  SELECT
    n,
    4500 + n AS hero_customer_id,
    3500 + n AS hero_address_id,
    CASE (n % 6)
      WHEN 0 THEN 'Solar'
      WHEN 1 THEN 'Elektro'
      WHEN 2 THEN 'Bau'
      WHEN 3 THEN 'Service'
      WHEN 4 THEN 'Technik'
      ELSE 'Energie'
    END AS prefix,
    CASE ((n - 1) % 10)
      WHEN 0 THEN 'Berlin'
      WHEN 1 THEN 'Hamburg'
      WHEN 2 THEN 'Muenchen'
      WHEN 3 THEN 'Koeln'
      WHEN 4 THEN 'Frankfurt'
      WHEN 5 THEN 'Stuttgart'
      WHEN 6 THEN 'Leipzig'
      WHEN 7 THEN 'Dresden'
      WHEN 8 THEN 'Hannover'
      ELSE 'Dortmund'
    END AS city_token
  FROM generate_series(1, 50) AS n
)
INSERT INTO hero_customers (
  hero_customer_id,
  hero_address_id,
  company_name,
  full_name,
  email,
  phone_home,
  phone_mobile,
  category,
  is_deleted
)
SELECT
  hero_customer_id,
  hero_address_id,
  FORMAT('%s %s GmbH', prefix, city_token),
  FORMAT('%s %s GmbH', prefix, city_token),
  LOWER(FORMAT('office%s@%s-%s.de', n, prefix, city_token)),
  FORMAT('0%s-55%04s', 200 + ((n - 1) % 10), n),
  FORMAT('0171-77%04s', n),
  'customer',
  FALSE
FROM customer_seed
ON CONFLICT (hero_customer_id) DO UPDATE SET
  hero_address_id = EXCLUDED.hero_address_id,
  company_name = EXCLUDED.company_name,
  full_name = EXCLUDED.full_name,
  email = EXCLUDED.email,
  phone_home = EXCLUDED.phone_home,
  phone_mobile = EXCLUDED.phone_mobile,
  category = EXCLUDED.category,
  is_deleted = EXCLUDED.is_deleted,
  last_synced_at = NOW();

-- ------------------------------------------------------------
-- 90 historical projects across 6 months
-- ------------------------------------------------------------

WITH project_seed AS (
  SELECT
    n,
    5200 + n AS hero_project_match_id,
    4500 + (((n - 1) % 50) + 1) AS hero_customer_id,
    3500 + (((n - 1) % 50) + 1) AS hero_address_id,
    CASE (n % 4)
      WHEN 0 THEN 'electrical'
      WHEN 1 THEN 'solar'
      WHEN 2 THEN 'hvac'
      ELSE 'maintenance'
    END AS project_type,
    CURRENT_DATE - (((n - 1) % 180)) * INTERVAL '1 day' AS project_day
  FROM generate_series(1, 90) AS n
)
INSERT INTO hero_project_matches (
  hero_project_match_id,
  hero_customer_id,
  hero_contact_id,
  hero_address_id,
  name,
  project_title,
  project_nr,
  display_id,
  partner_notes,
  project_type,
  type_id,
  current_status_id,
  status_name,
  is_deleted
)
SELECT
  hero_project_match_id,
  hero_customer_id,
  hero_customer_id,
  hero_address_id,
  FORMAT('Challenge Project %s', LPAD(n::text, 3, '0')),
  CASE project_type
    WHEN 'electrical' THEN 'Switchboard and safety upgrade'
    WHEN 'solar' THEN 'PV prep and inverter package'
    WHEN 'hvac' THEN 'Heat pump and airflow optimization'
    ELSE 'Recurring maintenance and compliance visit'
  END,
  FORMAT('VW-CH-%s', LPAD(n::text, 3, '0')),
  FORMAT('CH-%s', LPAD(n::text, 3, '0')),
  FORMAT('Generated challenge project seeded for month %s.', TO_CHAR(project_day, 'YYYY-MM')),
  project_type,
  CASE project_type
    WHEN 'electrical' THEN 1
    WHEN 'solar' THEN 2
    WHEN 'hvac' THEN 3
    ELSE 4
  END,
  CASE
    WHEN project_day < CURRENT_DATE - INTERVAL '21 days' THEN 20
    WHEN project_day < CURRENT_DATE - INTERVAL '2 days' THEN 11
    ELSE 10
  END,
  CASE
    WHEN project_day < CURRENT_DATE - INTERVAL '21 days' THEN 'completed'
    WHEN project_day < CURRENT_DATE - INTERVAL '2 days' THEN 'in_progress'
    ELSE 'scheduled'
  END,
  FALSE
FROM project_seed
ON CONFLICT (hero_project_match_id) DO UPDATE SET
  hero_customer_id = EXCLUDED.hero_customer_id,
  hero_contact_id = EXCLUDED.hero_contact_id,
  hero_address_id = EXCLUDED.hero_address_id,
  name = EXCLUDED.name,
  project_title = EXCLUDED.project_title,
  project_nr = EXCLUDED.project_nr,
  display_id = EXCLUDED.display_id,
  partner_notes = EXCLUDED.partner_notes,
  project_type = EXCLUDED.project_type,
  type_id = EXCLUDED.type_id,
  current_status_id = EXCLUDED.current_status_id,
  status_name = EXCLUDED.status_name,
  is_deleted = EXCLUDED.is_deleted,
  last_synced_at = NOW();

-- ------------------------------------------------------------
-- 180 historical tasks with overrides
-- ------------------------------------------------------------

WITH task_seed AS (
  SELECT
    n,
    6100 + n AS hero_task_id,
    5200 + (((n - 1) % 90) + 1) AS hero_project_match_id,
    1002 + (((n - 1) % 14)) AS hero_target_user_id,
    CURRENT_DATE - (((n - 1) % 180)) * INTERVAL '1 day' + (((n - 1) % 7) + 7) * INTERVAL '1 hour' AS start_at,
    CURRENT_DATE - (((n - 1) % 180)) * INTERVAL '1 day' + (((n - 1) % 7) + 9) * INTERVAL '1 hour' AS due_at
  FROM generate_series(1, 180) AS n
)
INSERT INTO hero_tasks (
  hero_task_id,
  hero_author_user_id,
  hero_target_user_id,
  hero_target_project_match_id,
  title,
  comment,
  due_date,
  start_at,
  end_at,
  done_date,
  is_done,
  is_deleted
)
SELECT
  hero_task_id,
  1001,
  hero_target_user_id,
  hero_project_match_id,
  CASE (n % 6)
    WHEN 0 THEN 'Install protection device'
    WHEN 1 THEN 'Site inspection and handover prep'
    WHEN 2 THEN 'Inverter and control check'
    WHEN 3 THEN 'Replace faulty sensor assembly'
    WHEN 4 THEN 'Run compliance and safety test'
    ELSE 'Customer follow-up and final commissioning'
  END,
  FORMAT('Generated task %s for challenge history.', hero_task_id),
  due_at,
  start_at,
  start_at + INTERVAL '2 hours',
  CASE
    WHEN due_at < NOW() - INTERVAL '7 days' THEN due_at + INTERVAL '90 minutes'
    ELSE NULL
  END,
  (due_at < NOW() - INTERVAL '7 days'),
  FALSE
FROM task_seed
ON CONFLICT (hero_task_id) DO UPDATE SET
  hero_author_user_id = EXCLUDED.hero_author_user_id,
  hero_target_user_id = EXCLUDED.hero_target_user_id,
  hero_target_project_match_id = EXCLUDED.hero_target_project_match_id,
  title = EXCLUDED.title,
  comment = EXCLUDED.comment,
  due_date = EXCLUDED.due_date,
  start_at = EXCLUDED.start_at,
  end_at = EXCLUDED.end_at,
  done_date = EXCLUDED.done_date,
  is_done = EXCLUDED.is_done,
  is_deleted = EXCLUDED.is_deleted,
  last_synced_at = NOW();

WITH task_override_seed AS (
  SELECT
    hero_task_id,
    CASE (hero_task_id % 3)
      WHEN 0 THEN 'high'::business_value_level
      WHEN 1 THEN 'medium'::business_value_level
      ELSE 'low'::business_value_level
    END AS business_value,
    (hero_task_id % 4 <> 0) AS is_flexible,
    CASE (hero_task_id % 4)
      WHEN 0 THEN '["electrical","installation"]'::jsonb
      WHEN 1 THEN '["solar","electrical"]'::jsonb
      WHEN 2 THEN '["hvac","maintenance"]'::jsonb
      ELSE '["inspection","electrical"]'::jsonb
    END AS required_skills
  FROM hero_tasks
  WHERE hero_task_id BETWEEN 6101 AND 6280
)
INSERT INTO task_overrides (
  hero_task_id,
  business_value,
  is_flexible,
  required_skills,
  notes
)
SELECT
  hero_task_id,
  business_value,
  is_flexible,
  required_skills,
  'Challenge-generated historical override.'
FROM task_override_seed
ON CONFLICT (hero_task_id) DO UPDATE SET
  business_value = EXCLUDED.business_value,
  is_flexible = EXCLUDED.is_flexible,
  required_skills = EXCLUDED.required_skills,
  notes = EXCLUDED.notes,
  updated_at = NOW();

-- ------------------------------------------------------------
-- 60 quotes and 45 invoices
-- ------------------------------------------------------------

WITH quote_seed AS (
  SELECT
    n,
    FORMAT('QH-%s', LPAD(n::text, 4, '0')) AS quote_number,
    5200 + n AS hero_project_match_id,
    pm.hero_customer_id,
    CURRENT_DATE - (n * 3) * INTERVAL '1 day' AS quote_day
  FROM generate_series(1, 60) AS n
  JOIN hero_project_matches pm
    ON pm.hero_project_match_id = 5200 + n
)
INSERT INTO quotes (
  quote_number,
  hero_project_match_id,
  hero_customer_id,
  created_by_user_id,
  status,
  title,
  description,
  valid_until,
  subtotal,
  vat_total,
  total,
  notes
)
SELECT
  quote_number,
  hero_project_match_id,
  hero_customer_id,
  1001,
  CASE
    WHEN n % 6 = 0 THEN 'draft'::quote_status
    WHEN n % 6 = 1 THEN 'sent'::quote_status
    WHEN n % 6 = 2 THEN 'approved'::quote_status
    WHEN n % 6 = 3 THEN 'approved'::quote_status
    WHEN n % 6 = 4 THEN 'rejected'::quote_status
    ELSE 'expired'::quote_status
  END,
  FORMAT('Challenge quote package %s', LPAD(n::text, 3, '0')),
  'Generated quote for challenge-scale commercial history.',
  (quote_day::date + 21),
  1500 + (n * 55),
  ROUND((1500 + (n * 55)) * 0.19, 2),
  ROUND((1500 + (n * 55)) * 1.19, 2),
  'Created to support quote and conversion AI features.'
FROM quote_seed
ON CONFLICT (quote_number) DO UPDATE SET
  hero_project_match_id = EXCLUDED.hero_project_match_id,
  hero_customer_id = EXCLUDED.hero_customer_id,
  created_by_user_id = EXCLUDED.created_by_user_id,
  status = EXCLUDED.status,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  valid_until = EXCLUDED.valid_until,
  subtotal = EXCLUDED.subtotal,
  vat_total = EXCLUDED.vat_total,
  total = EXCLUDED.total,
  notes = EXCLUDED.notes,
  updated_at = NOW();

INSERT INTO quote_line_items (
  quote_id,
  sort_order,
  hero_product_id,
  name,
  description,
  quantity,
  unit_type,
  unit_net_price,
  vat_percent,
  line_total
)
SELECT
  q.id,
  item.sort_order,
  item.hero_product_id,
  item.name,
  item.description,
  item.quantity,
  item.unit_type,
  item.unit_net_price,
  item.vat_percent,
  item.line_total
FROM quotes q
JOIN LATERAL (
  VALUES
    (1, 'HAzz7aj6wAA'::text, 'Primary material package', 'Generated material bundle', 1.00::numeric, 'set'::text, 650.00::numeric, 19.00::numeric, 650.00::numeric),
    (2, NULL::text, 'Field labour', 'Installation and testing labour', 8.00::numeric, 'hour'::text, 120.00::numeric, 19.00::numeric, 960.00::numeric)
) AS item(sort_order, hero_product_id, name, description, quantity, unit_type, unit_net_price, vat_percent, line_total)
  ON TRUE
WHERE q.quote_number LIKE 'QH-%'
ON CONFLICT DO NOTHING;

WITH invoice_seed AS (
  SELECT
    n,
    FORMAT('INVH-%s', LPAD(n::text, 4, '0')) AS invoice_number,
    FORMAT('QH-%s', LPAD(n::text, 4, '0')) AS quote_number
  FROM generate_series(1, 45) AS n
)
INSERT INTO invoices (
  invoice_number,
  quote_id,
  hero_project_match_id,
  hero_customer_id,
  status,
  issued_on,
  due_on,
  sent_at,
  subtotal,
  vat_total,
  total,
  outstanding_amount,
  notes
)
SELECT
  s.invoice_number,
  q.id,
  q.hero_project_match_id,
  q.hero_customer_id,
  CASE
    WHEN s.n % 5 = 0 THEN 'paid'::invoice_status
    WHEN s.n % 5 = 1 THEN 'sent'::invoice_status
    WHEN s.n % 5 = 2 THEN 'partially_paid'::invoice_status
    WHEN s.n % 5 = 3 THEN 'overdue'::invoice_status
    ELSE 'paid'::invoice_status
  END,
  (CURRENT_DATE - (s.n * 3)),
  (CURRENT_DATE - (s.n * 3) + 14),
  (CURRENT_DATE - (s.n * 3))::timestamptz + INTERVAL '10 hours',
  q.subtotal,
  q.vat_total,
  q.total,
  CASE
    WHEN s.n % 5 = 0 THEN 0
    WHEN s.n % 5 = 1 THEN q.total
    WHEN s.n % 5 = 2 THEN ROUND(q.total * 0.4, 2)
    WHEN s.n % 5 = 3 THEN q.total
    ELSE 0
  END,
  'Generated invoice history for commercial AI features.'
FROM invoice_seed s
JOIN quotes q
  ON q.quote_number = s.quote_number
ON CONFLICT (invoice_number) DO UPDATE SET
  quote_id = EXCLUDED.quote_id,
  hero_project_match_id = EXCLUDED.hero_project_match_id,
  hero_customer_id = EXCLUDED.hero_customer_id,
  status = EXCLUDED.status,
  issued_on = EXCLUDED.issued_on,
  due_on = EXCLUDED.due_on,
  sent_at = EXCLUDED.sent_at,
  subtotal = EXCLUDED.subtotal,
  vat_total = EXCLUDED.vat_total,
  total = EXCLUDED.total,
  outstanding_amount = EXCLUDED.outstanding_amount,
  notes = EXCLUDED.notes,
  updated_at = NOW();

INSERT INTO invoice_line_items (
  invoice_id,
  sort_order,
  hero_product_id,
  name,
  description,
  quantity,
  unit_type,
  unit_net_price,
  vat_percent,
  line_total
)
SELECT
  i.id,
  item.sort_order,
  item.hero_product_id,
  item.name,
  item.description,
  item.quantity,
  item.unit_type,
  item.unit_net_price,
  item.vat_percent,
  item.line_total
FROM invoices i
JOIN LATERAL (
  VALUES
    (1, 'HAy3gTgoMAA'::text, 'Materials used', 'Auto-generated materials line', 4.00::numeric, 'Stk'::text, 50.00::numeric, 19.00::numeric, 200.00::numeric),
    (2, NULL::text, 'Labour and commissioning', 'Auto-generated labour line', 10.00::numeric, 'hour'::text, 135.00::numeric, 19.00::numeric, 1350.00::numeric)
) AS item(sort_order, hero_product_id, name, description, quantity, unit_type, unit_net_price, vat_percent, line_total)
  ON TRUE
WHERE i.invoice_number LIKE 'INVH-%'
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Payment history
-- ------------------------------------------------------------

INSERT INTO payments (
  invoice_id,
  status,
  method,
  amount,
  received_on,
  external_reference,
  notes
)
SELECT
  i.id,
  CASE
    WHEN i.status = 'paid' THEN 'received'::payment_status
    WHEN i.status = 'partially_paid' THEN 'received'::payment_status
    ELSE 'pending'::payment_status
  END,
  CASE
    WHEN (ROW_NUMBER() OVER (ORDER BY i.invoice_number)) % 4 = 0 THEN 'direct_debit'::payment_method
    WHEN (ROW_NUMBER() OVER (ORDER BY i.invoice_number)) % 4 = 1 THEN 'bank_transfer'::payment_method
    WHEN (ROW_NUMBER() OVER (ORDER BY i.invoice_number)) % 4 = 2 THEN 'card'::payment_method
    ELSE 'cash'::payment_method
  END,
  CASE
    WHEN i.status = 'paid' THEN i.total
    WHEN i.status = 'partially_paid' THEN ROUND(i.total * 0.6, 2)
    ELSE i.outstanding_amount
  END,
  CASE
    WHEN i.status IN ('paid', 'partially_paid') THEN (i.issued_on + 5)
    ELSE NULL
  END,
  FORMAT('PAY-%s', REPLACE(i.invoice_number, 'INVH-', '')),
  'Generated payment history row.'
FROM invoices i
WHERE i.invoice_number LIKE 'INVH-%'
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Time logs across 6 months
-- ------------------------------------------------------------

INSERT INTO time_logs (
  hero_user_id,
  hero_project_match_id,
  hero_task_id,
  work_type,
  started_at,
  ended_at,
  duration_minutes,
  is_billable,
  notes
)
SELECT
  t.hero_target_user_id,
  t.hero_target_project_match_id,
  t.hero_task_id,
  CASE (t.hero_task_id % 5)
    WHEN 0 THEN 'installation'
    WHEN 1 THEN 'inspection'
    WHEN 2 THEN 'service'
    WHEN 3 THEN 'maintenance'
    ELSE 'commissioning'
  END,
  t.start_at,
  COALESCE(t.end_at, t.start_at + INTERVAL '90 minutes'),
  GREATEST(30, FLOOR(EXTRACT(EPOCH FROM (COALESCE(t.end_at, t.start_at + INTERVAL '90 minutes') - t.start_at)) / 60))::integer,
  TRUE,
  'Generated time log for challenge history.'
FROM hero_tasks t
WHERE t.hero_task_id BETWEEN 6101 AND 6280
ON CONFLICT DO NOTHING;

-- ------------------------------------------------------------
-- Site history and materials
-- ------------------------------------------------------------

INSERT INTO project_notes (
  hero_project_match_id,
  hero_user_id,
  note_type,
  title,
  content,
  is_urgent
)
SELECT
  5200 + (((n - 1) % 90) + 1),
  1002 + (((n - 1) % 14)),
  CASE (n % 5)
    WHEN 0 THEN 'issue'::note_type
    WHEN 1 THEN 'site_note'::note_type
    WHEN 2 THEN 'customer_update'::note_type
    WHEN 3 THEN 'handover'::note_type
    ELSE 'safety'::note_type
  END,
  FORMAT('Challenge note %s', n),
  CASE (n % 5)
    WHEN 0 THEN 'Customer flagged a timing concern after the first visit.'
    WHEN 1 THEN 'Site access was available only through the side gate after 09:00.'
    WHEN 2 THEN 'Customer requested status call before final handover.'
    WHEN 3 THEN 'Follow-up handover note created for the next crew.'
    ELSE 'Safety checklist completed with one observation logged.'
  END,
  (n % 7 = 0)
FROM generate_series(1, 120) AS n
ON CONFLICT DO NOTHING;

INSERT INTO materials_used (
  hero_project_match_id,
  hero_task_id,
  hero_product_id,
  used_by_user_id,
  quantity,
  unit_type,
  used_at,
  notes
)
SELECT
  t.hero_target_project_match_id,
  t.hero_task_id,
  CASE WHEN t.hero_task_id % 2 = 0 THEN 'HAzz7aj6wAA' ELSE 'HAy3gTgoMAA' END,
  t.hero_target_user_id,
  CASE WHEN t.hero_task_id % 3 = 0 THEN 2 ELSE 1 END,
  'Stk',
  COALESCE(t.end_at, t.start_at + INTERVAL '90 minutes'),
  'Generated historical material usage.'
FROM hero_tasks t
WHERE t.hero_task_id BETWEEN 6101 AND 6180
ON CONFLICT DO NOTHING;


COMMIT;
