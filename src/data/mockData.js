const mockEvents = [
  {
    id: "7ec6a421-67dc-4f39-a97b-10c6f07f6f01",
    event_type: "traffic_delay",
    message: "Jonas Schmidt reports a 90-minute delay on the way to Dresden.",
    payload: {
      hero_user_id: 1003,
      affected_task_ids: [6016],
      reason: "traffic",
      delay_minutes: 90,
      source: "manager_voice",
    },
  },
  {
    id: "7ec6a421-67dc-4f39-a97b-10c6f07f6f03",
    event_type: "weather_disruption",
    message: "Mehmet Oezkan cannot access the roof safely due to heavy wind.",
    payload: {
      hero_user_id: 1015,
      affected_task_ids: [6014],
      reason: "weather",
      source: "manager_voice",
    },
  },
];

const mockTasks = [
  {
    hero_task_id: 6014,
    hero_target_user_id: 1015,
    hero_target_project_match_id: 5007,
    title: "Verify string voltage on roof combiner",
    due_date: "2026-04-09T10:30:00.000Z",
    is_done: false,
    is_deleted: false,
  },
  {
    hero_task_id: 6016,
    hero_target_user_id: 1003,
    hero_target_project_match_id: 5008,
    title: "Install replacement main switch",
    due_date: "2026-04-10T10:00:00.000Z",
    is_done: false,
    is_deleted: false,
  },
];

const mockProjectMatches = [
  {
    hero_project_match_id: 5007,
    project_type: "solar",
    display_id: "LEJ-007",
    name: "Leipzig Solar Inverter Fault",
  },
  {
    hero_project_match_id: 5008,
    project_type: "electrical",
    display_id: "DRS-008",
    name: "Dresden Mixed-Use Building Upgrade",
  },
];

const mockTaskOverrides = [
  {
    hero_task_id: 6014,
    business_value: "high",
    is_flexible: false,
    required_skills: ["solar", "site_safety"],
  },
  {
    hero_task_id: 6016,
    business_value: "high",
    is_flexible: false,
    required_skills: ["electrical", "distribution_boards"],
  },
];

const mockUsers = [
  { hero_user_id: 1002, full_name: "Max Mueller" },
  { hero_user_id: 1003, full_name: "Jonas Schmidt" },
  { hero_user_id: 1006, full_name: "Tobias Fischer" },
  { hero_user_id: 1010, full_name: "Miriam Koch" },
  { hero_user_id: 1012, full_name: "Nina Voigt" },
  { hero_user_id: 1013, full_name: "Jan Reiter" },
  { hero_user_id: 1015, full_name: "Mehmet Oezkan" },
];

const mockTechnicianProfiles = [
  {
    hero_user_id: 1002,
    name: "Max Mueller",
    status: "active",
    geographic_zone: "east",
    skills: ["electrical", "ev_charging", "troubleshooting"],
  },
  {
    hero_user_id: 1003,
    name: "Jonas Schmidt",
    status: "active",
    geographic_zone: "east",
    skills: ["electrical", "distribution_boards", "service_calls"],
  },
  {
    hero_user_id: 1006,
    name: "Tobias Fischer",
    status: "active",
    geographic_zone: "south",
    skills: ["solar", "electrical", "meter_cabinets"],
  },
  {
    hero_user_id: 1010,
    name: "Miriam Koch",
    status: "active",
    geographic_zone: "central",
    skills: ["electrical", "fire_safety", "inspection"],
  },
  {
    hero_user_id: 1012,
    name: "Nina Voigt",
    status: "active",
    geographic_zone: "south",
    skills: ["electrical", "backup_power", "inspection", "distribution_boards"],
  },
  {
    hero_user_id: 1013,
    name: "Jan Reiter",
    status: "active",
    geographic_zone: "east",
    skills: ["electrical", "thermal_imaging", "testing", "distribution_boards"],
  },
  {
    hero_user_id: 1015,
    name: "Mehmet Oezkan",
    status: "active",
    geographic_zone: "west",
    skills: ["solar", "site_safety", "testing"],
  },
];

const mockAllTasks = [
  { hero_task_id: 6001, hero_target_user_id: 1002, is_done: false, is_deleted: false, due_date: "2026-04-09T07:00:00.000Z" },
  { hero_task_id: 6002, hero_target_user_id: 1003, is_done: false, is_deleted: false, due_date: "2026-04-09T09:00:00.000Z" },
  { hero_task_id: 6005, hero_target_user_id: 1006, is_done: false, is_deleted: false, due_date: "2026-04-09T08:30:00.000Z" },
  { hero_task_id: 6009, hero_target_user_id: 1010, is_done: false, is_deleted: false, due_date: "2026-04-09T08:00:00.000Z" },
  { hero_task_id: 6011, hero_target_user_id: 1012, is_done: false, is_deleted: false, due_date: "2026-04-09T09:30:00.000Z" },
  { hero_task_id: 6012, hero_target_user_id: 1013, is_done: false, is_deleted: false, due_date: "2026-04-09T13:30:00.000Z" },
  { hero_task_id: 6014, hero_target_user_id: 1015, is_done: false, is_deleted: false, due_date: "2026-04-09T10:30:00.000Z" },
  { hero_task_id: 6016, hero_target_user_id: 1003, is_done: false, is_deleted: false, due_date: "2026-04-10T10:00:00.000Z" },
];

module.exports = {
  mockEvents,
  mockTasks,
  mockProjectMatches,
  mockTaskOverrides,
  mockUsers,
  mockTechnicianProfiles,
  mockAllTasks,
};
