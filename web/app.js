// =============================================
// HERO Chaos Dashboard — app.js
// =============================================

let mockTasks = [];
let currentCalendarDate = new Date();
let selectedCalendarDate = null;
let fabOpen = false;
let sessionEmergencyInjected = false;

// =============================================
// ID Generation — collision-safe
// =============================================
/**
 * Returns a numeric ID that is guaranteed not to already exist in HERO_DATA.
 * Collects all project ids and task ids from the live data, then picks a
 * candidate from a high-range bucket and retries until it finds a free slot.
 *
 * @param {number} [rangeStart=90000000] - lower bound of candidate range
 * @returns {number}
 */
function generateUniqueId(rangeStart = 90000000) {
    const projects = window.HERO_DATA?.system_data?.projects || [];

    // Build a set of every id currently in use (project ids + task ids)
    const usedIds = new Set();
    projects.forEach(p => {
        if (p.id)        usedIds.add(p.id);
        if (p.task?.id)  usedIds.add(p.task.id);
    });

    // Also gather ids from extension mappings so we never clash there either
    const ext = window.HERO_DATA?.system_data?.custom_data_layer?.tasks_extension;
    if (ext?.business_value_schema?.mapping)
        ext.business_value_schema.mapping.forEach(m => usedIds.add(m.task_id));

    let candidate;
    do {
        // Spread over a 10-million range; timestamp adds entropy so two rapid
        // calls in the same millisecond still produce different base values.
        candidate = rangeStart + (Date.now() % 9000000) + Math.floor(Math.random() * 1000);
    } while (usedIds.has(candidate));

    return candidate;
}

// Bug 6 fix: sanitize user-supplied strings before inserting into innerHTML
function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// =============================================
// German Date Helpers
// =============================================
const DAYS_DE   = ['SONNTAG','MONTAG','DIENSTAG','MITTWOCH','DONNERSTAG','FREITAG','SAMSTAG'];
const MONTHS_DE = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

function formatDateHeader(dateObj) {
    const today    = new Date();
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const day = DAYS_DE[dateObj.getDay()];
    const dd  = String(dateObj.getDate()).padStart(2, '0');
    const mm  = String(dateObj.getMonth() + 1).padStart(2, '0');
    const yyyy = dateObj.getFullYear();
    const kw   = getISOWeek(dateObj);
    const datePart = `${dd}.${mm}.${yyyy} - KW${kw}`;
    if (isSameDay(dateObj, today))    return `HEUTE, ${datePart}`;
    if (isSameDay(dateObj, tomorrow)) return `MORGEN, ${datePart}`;
    return `${day}, ${datePart}`;
}

function isSameDay(a, b) {
    return a.getFullYear() === b.getFullYear() &&
           a.getMonth()    === b.getMonth()    &&
           a.getDate()     === b.getDate();
}

// =============================================
// Data Loading
// =============================================
function loadDataAndRender() {
    try {
        const data = window.HERO_DATA;
        if (!data) throw new Error('HERO_DATA not found.');

        const system   = data.system_data;
        const projects = system.projects || [];
        const ext      = system.custom_data_layer;

        mockTasks = projects.map(proj => {
            const task    = proj.task;
            const dateObj = new Date(task.due_date);

            let bValue = 'MED';
            if (ext?.tasks_extension?.business_value_schema) {
                const bmap = ext.tasks_extension.business_value_schema.mapping.find(m => m.task_id === task.id);
                if (bmap) bValue = bmap.business_value;
            }

            let reqSkills = [];
            if (ext?.tasks_extension?.required_skills_schema) {
                const smap = ext.tasks_extension.required_skills_schema.mapping.find(m => m.task_id === task.id);
                if (smap) reqSkills = smap.required_skills;
            }

            return {
                id:            'TSK-' + task.id,
                rawId:         task.id,
                title:         task.title,
                tech:          proj.partner_name,
                targetUserId:  task.target_user_id || null, // Bug 5 fix: store for trigger matching
                customer:      proj.customer_name,
                city:          proj.address ? proj.address.city : '',
                dateObj:       dateObj,
                status:        'active',
                businessValue: bValue,
                skills:        reqSkills
            };
        });

        renderListView();
        renderCalendar();
    } catch(err) {
        console.error('Error loading data:', err);
    }
}

// =============================================
// LIST VIEW
// =============================================
function renderListView(dateFilter) {
    const list  = document.getElementById('taskList');
    const empty = document.getElementById('emptyState');
    list.innerHTML = '';

    let tasks = [...mockTasks];

    // Search filter
    const q = (document.getElementById('searchInput').value || '').toLowerCase();
    if (q) {
        tasks = tasks.filter(t =>
            t.title.toLowerCase().includes(q) ||
            (t.customer || '').toLowerCase().includes(q) ||
            (t.city || '').toLowerCase().includes(q)
        );
    }

    // Calendar day filter
    if (dateFilter) {
        tasks = tasks.filter(t => isSameDay(t.dateObj, dateFilter));
    }

    if (tasks.length === 0) {
        empty.classList.remove('hidden');
        return;
    }
    empty.classList.add('hidden');

    // Sort by date
    tasks.sort((a, b) => a.dateObj - b.dateObj);

    // Group by calendar day
    const groups = {};
    tasks.forEach(t => {
        const key = t.dateObj.toDateString();
        if (!groups[key]) groups[key] = { dateObj: t.dateObj, tasks: [] };
        groups[key].tasks.push(t);
    });

    let animIdx = 0;
    Object.values(groups).forEach(group => {
        // Date header
        const header = document.createElement('div');
        header.className = 'date-group-header';
        header.textContent = formatDateHeader(group.dateObj);
        list.appendChild(header);

        // Task items
        group.tasks.forEach(task => {
            const item = createTaskListItem(task);
            item.style.animationDelay = `${animIdx * 30}ms`;
            animIdx++;
            list.appendChild(item);
        });
    });
}

function createTaskListItem(task) {
    const item = document.createElement('div');
    item.className = 'task-list-item animate-in';
    item.onclick = () => openAiModal(task.id);

    let statusClass = 'status-active';
    let statusText  = 'Aktiv';
    if (task.status === 'emergency')  { statusClass = 'status-emergency'; statusText = 'Notfall'; }
    else if (task.status === 'delayed')   { statusClass = 'status-delayed';   statusText = 'Verzögert'; }
    else if (task.status === 'reassigned') { statusClass = 'status-active';    statusText = 'KI Zugeteilt'; }

    const bv = (task.businessValue || 'med').toLowerCase();
    const valBadge    = `<span class="badge badge-${bv}">${escapeHtml(task.businessValue)}</span>`;
    const skillBadges = (task.skills || []).slice(0, 2).map(s => `<span class="badge badge-skill">${escapeHtml(s)}</span>`).join('');

    // Technician initials (Bug 6: escape before use in attribute/content)
    const techSafe   = escapeHtml(task.tech || '??');
    const initials   = (task.tech || '??').split(' ').map(n => n[0] || '').join('').slice(0, 2).toUpperCase();

    // Time display
    const timeStart = task.dateObj.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const timeEnd   = new Date(task.dateObj.getTime() + 3600000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    const cityPart  = task.city ? ` · ${escapeHtml(task.city)}` : '';

    item.innerHTML = `
        <div class="task-item-left">
            <div class="task-item-title">${escapeHtml(task.title)}</div>
            <div class="task-item-time">${timeStart} – ${timeEnd}${task.customer ? ' · ' + escapeHtml(task.customer) : ''}${cityPart}</div>
            <div class="task-item-meta">
                <span class="status-tag ${statusClass}">${statusText}</span>
                ${valBadge}
                ${skillBadges}
            </div>
        </div>
        <div class="task-item-right">
            <div class="tech-avatar" title="${techSafe}">${initials}</div>
        </div>
    `;
    return item;
}

// =============================================
// CALENDAR
// =============================================
function renderCalendar() {
    const widget = document.getElementById('calendarWidget');
    const year   = currentCalendarDate.getFullYear();
    const month  = currentCalendarDate.getMonth();
    const today  = new Date();

    // Map of task dates
    const taskDates = {};
    mockTasks.forEach(t => {
        const key = `${t.dateObj.getFullYear()}-${t.dateObj.getMonth()}-${t.dateObj.getDate()}`;
        if (!taskDates[key]) taskDates[key] = [];
        taskDates[key].push(t);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);

    // Monday-based offset (0=Mon … 6=Sun)
    let startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    let endOffset   = lastDay.getDay()   === 0 ? 6 : lastDay.getDay()  - 1;

    widget.innerHTML = `
        <div class="cal-header">
            <button class="cal-nav-btn" id="calPrev">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
            <span class="cal-title">${MONTHS_DE[month]} ${year}</span>
            <button class="cal-nav-btn" id="calNext">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
        </div>
        <div class="cal-grid" id="calGrid">
            <div class="cal-day-header">Mo.</div>
            <div class="cal-day-header">Di.</div>
            <div class="cal-day-header">Mi.</div>
            <div class="cal-day-header">Do.</div>
            <div class="cal-day-header">Fr.</div>
            <div class="cal-day-header">Sa.</div>
            <div class="cal-day-header">So.</div>
        </div>
    `;

    document.getElementById('calPrev').onclick = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
        renderCalendar();
    };
    document.getElementById('calNext').onclick = () => {
        currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
        renderCalendar();
    };

    const grid = document.getElementById('calGrid');

    // Leading filler
    for (let i = 0; i < startOffset; i++) {
        const prevDate = new Date(year, month, -startOffset + i + 1);
        const cell = document.createElement('div');
        cell.className = 'cal-day other-month';
        cell.innerHTML = `<span class="day-num">${prevDate.getDate()}</span>`;
        grid.appendChild(cell);
    }

    // Actual days
    for (let d = 1; d <= lastDay.getDate(); d++) {
        const cellDate = new Date(year, month, d);
        const key      = `${year}-${month}-${d}`;
        const dayTasks = taskDates[key] || [];

        const cell = document.createElement('div');
        cell.className = 'cal-day';
        if (isSameDay(cellDate, today)) cell.classList.add('today');
        if (selectedCalendarDate && isSameDay(cellDate, selectedCalendarDate)) cell.classList.add('selected');

        let eventHtml = '';
        if (dayTasks.length === 1) {
            eventHtml = `<span class="cal-event-pill">${dayTasks[0].title.substring(0, 10)}</span>`;
        } else if (dayTasks.length > 1) {
            eventHtml = `<span class="cal-event-pill">${dayTasks.length} Termine</span>`;
        }

        cell.innerHTML = `<span class="day-num">${d}</span>${eventHtml}`;
        cell.onclick = () => {
            selectedCalendarDate = (selectedCalendarDate && isSameDay(cellDate, selectedCalendarDate)) ? null : cellDate;
            renderCalendar();
            renderCalendarDayTasks(selectedCalendarDate ? dayTasks : []);
        };

        grid.appendChild(cell);
    }

    // Trailing filler
    const trailingCount = 6 - endOffset;
    for (let i = 1; i <= trailingCount; i++) {
        const cell = document.createElement('div');
        cell.className = 'cal-day other-month';
        cell.innerHTML = `<span class="day-num">${i}</span>`;
        grid.appendChild(cell);
    }
}

function renderCalendarDayTasks(tasks) {
    const container = document.getElementById('calendarDayTasks');
    container.innerHTML = '';
    if (!tasks || tasks.length === 0) return;

    const header = document.createElement('div');
    header.className = 'date-group-header';
    header.textContent = formatDateHeader(tasks[0].dateObj);
    container.appendChild(header);

    tasks.forEach(task => container.appendChild(createTaskListItem(task)));
}

// =============================================
// TAB SWITCHING
// =============================================
document.getElementById('tabListe').addEventListener('click', () => {
    document.getElementById('tabListe').classList.add('active');
    document.getElementById('tabKalender').classList.remove('active');
    document.getElementById('listeView').classList.remove('hidden');
    document.getElementById('kalenderView').classList.add('hidden');
});

document.getElementById('tabKalender').addEventListener('click', () => {
    document.getElementById('tabKalender').classList.add('active');
    document.getElementById('tabListe').classList.remove('active');
    document.getElementById('kalenderView').classList.remove('hidden');
    document.getElementById('listeView').classList.add('hidden');
});

// =============================================
// SEARCH
// =============================================
document.getElementById('searchInput').addEventListener('input', () => renderListView());

// =============================================
// REFRESH — resets in-memory state and re-renders from current window.HERO_DATA
// =============================================
document.getElementById('btnRefresh').addEventListener('click', async () => {
    // Also reset the persisted JSON to the clean backup so the next page load is fresh
    try {
        await fetch('http://localhost:8000/api/reset', { method: 'POST' });
    } catch(_) { /* offline – just re-render in-memory */ }
    sessionEmergencyInjected = false;
    loadDataAndRender();
});

// =============================================
// FAB SPEED DIAL
// =============================================
function openFab() {
    fabOpen = true;
    document.getElementById('fabMain').classList.add('open');
    document.getElementById('fabMenu').classList.add('open');
}

function closeFab() {
    fabOpen = false;
    document.getElementById('fabMain').classList.remove('open');
    document.getElementById('fabMenu').classList.remove('open');
}

document.getElementById('fabMain').addEventListener('click', (e) => {
    e.stopPropagation();
    fabOpen ? closeFab() : openFab();
});

document.addEventListener('click', (e) => {
    if (fabOpen && !document.getElementById('fabContainer').contains(e.target)) closeFab();
});

document.getElementById('fabNewTask').addEventListener('click', () => {
    closeFab();
    openAddTaskModal();
});

document.getElementById('fabChaosOption').addEventListener('click', () => {
    closeFab();
    openChaosSheet();
});

// =============================================
// CHAOS TRIGGERS SHEET
// =============================================
// Original labels so we can restore them after feedback
const TRIGGER_LABELS = {
    btnSickUser: 'Kranker Mitarbeiter',
    btnOverrun:  'Zeitüberschreitung',
    btnFlood:    'Notfall-Einsatz'
};

function resetTriggerButtons() {
    Object.entries(TRIGGER_LABELS).forEach(([id, label]) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.classList.remove('triggered');
        btn.querySelector('strong').textContent = label;
    });
}

function openChaosSheet() {
    resetTriggerButtons(); // always start with fresh button state
    document.getElementById('chaosOverlay').classList.remove('hidden');
    document.getElementById('chaosSheet').classList.remove('hidden');
}

function closeChaosSheet() {
    document.getElementById('chaosOverlay').classList.add('hidden');
    document.getElementById('chaosSheet').classList.add('hidden');
}

document.getElementById('chaosOverlay').addEventListener('click', closeChaosSheet);
document.getElementById('closeChaosSheet').addEventListener('click', closeChaosSheet);

const triggers = window.HERO_DATA?.system_data?.custom_data_layer?.trigger_events?.mock_events || [];

// Helper: show feedback on a trigger button then re-enable it after a delay
function triggerFeedback(btn, label, feedbackClass, delay = 2000) {
    btn.classList.add('triggered', feedbackClass);
    btn.querySelector('strong').textContent = '✓ Ausgelöst: ' + label;
    setTimeout(() => {
        btn.classList.remove('triggered', feedbackClass);
        btn.querySelector('strong').textContent = label;
    }, delay);
}

document.getElementById('btnSickUser').addEventListener('click', () => {
    const btn = document.getElementById('btnSickUser');
    if (btn.classList.contains('triggered')) return; // debounce during feedback window
    triggerFeedback(btn, 'Kranker Mitarbeiter', 'chaos-danger');

    const evt = triggers.find(t => t.event_type === 'technician_sick');
    if (evt) {
        const sickUserId = evt.target_id;
        mockTasks = mockTasks.map(t => {
            const isAffected = evt.affected_tasks.includes(t.rawId) ||
                               (t.targetUserId && t.targetUserId === sickUserId);
            if (isAffected) {
                const proj = window.HERO_DATA.system_data.projects.find(p => p.task?.id === t.rawId);
                if (proj) {
                    proj.partner_name = 'NICHT ZUGEWIESEN (Krank)';
                    const ext = window.HERO_DATA.system_data.custom_data_layer.technicians_extension;
                    if (ext?.status_schema?.mapping[0]) ext.status_schema.mapping[0].status = 'sick';
                }
                return { ...t, status: 'delayed', tech: 'NICHT ZUGEWIESEN (Krank)' };
            }
            return t;
        });
        renderListView();
        renderCalendar();
    }
    setTimeout(closeChaosSheet, 1400);
});

document.getElementById('btnOverrun').addEventListener('click', () => {
    const btn = document.getElementById('btnOverrun');
    if (btn.classList.contains('triggered')) return;
    triggerFeedback(btn, 'Zeitüberschreitung', 'chaos-warning');

    const evt = triggers.find(t => t.event_type === 'delay');
    if (evt) {
        mockTasks = mockTasks.map(t => {
            if (evt.affected_tasks.includes(t.rawId)) {
                const alreadyDelayed = t.title.includes('[VERZÖGERT]');
                const newTitle = alreadyDelayed ? t.title : t.title + ' [VERZÖGERT]';
                const proj = window.HERO_DATA.system_data.projects.find(p => p.task?.id === t.rawId);
                if (proj?.task && !alreadyDelayed) proj.task.title = newTitle;
                return { ...t, title: newTitle, status: 'delayed' };
            }
            return t;
        });
        renderListView();
        renderCalendar();
    }
    setTimeout(closeChaosSheet, 1400);
});

document.getElementById('btnFlood').addEventListener('click', () => {
    const btn = document.getElementById('btnFlood');
    if (btn.classList.contains('triggered')) return;
    triggerFeedback(btn, 'Notfall-Einsatz', 'chaos-danger');

    // Each click injects a fresh emergency task with a new unique id
    // so the flood trigger can be fired multiple times to simulate repeated emergencies
    sessionEmergencyInjected = true;
    const emergencyProjectId = generateUniqueId();
    const emergencyTaskId    = generateUniqueId();
    const newProject = {
        id: emergencyProjectId, name: "Service – Jane Smith (NOTFALL)", project_nr: String(emergencyProjectId),
        type_id: 56961, type_name: "🛠️ Service", step_id: 684123, step_name: "🆕 Offen",
        measure_id: 6464, measure_name: "Projekt",
        partner_id: null, partner_name: "NICHT ZUGEWIESEN",
        customer_id: 6803553, customer_name: "Jane Smith",
        address: { street: "Mönckebergstraße 7", zipcode: "20095", city: "Hamburg" },
        task: { id: emergencyTaskId, title: "NOTFALL: Sofortreparatur", due_date: new Date().toISOString(), target_user_id: null }
    };
    window.HERO_DATA.system_data.projects.unshift(newProject);

    const ext = window.HERO_DATA.system_data.custom_data_layer.tasks_extension;
    if (ext) {
        if (ext.business_value_schema)  ext.business_value_schema.mapping.push({ task_id: emergencyTaskId, business_value: 'HIGH' });
        if (ext.required_skills_schema) ext.required_skills_schema.mapping.push({ task_id: emergencyTaskId, required_skills: ['repair', 'electrical'] });
    }
    loadDataAndRender();
    setTimeout(closeChaosSheet, 1400);
});

// =============================================
// AI DISPATCH MODAL
// =============================================
const aiOverlay       = document.getElementById('aiModalOverlay');
const stateLoading    = document.getElementById('aiLoading');
const stateResolution = document.getElementById('aiResolution');
const actionContainer = document.getElementById('aiActions');

let currentActiveTaskId = null;
let currentAiSuggestion = null;

function openAiModal(taskId) {
    currentActiveTaskId = taskId;
    aiOverlay.classList.remove('hidden');
    triggerAiCalculation();
}

function closeAiModal() { aiOverlay.classList.add('hidden'); }

async function triggerAiCalculation() {
    stateLoading.classList.add('active');
    stateLoading.classList.remove('hidden');
    stateResolution.classList.add('hidden');
    stateResolution.classList.remove('active');
    actionContainer.classList.add('hidden');

    try {
        const response = await fetch('http://localhost:8000/api/dispatch_task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ task_id: currentActiveTaskId })
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        if (data.assignments?.length > 0) resolveAiSuggestion(data.assignments[0]);
        else resolveAiSuggestion({
            new_technician_id: 'UNASSIGNED',
            scheduled_time: 'Kein Slot verfügbar',
            human_explanation: 'Die KI konnte keine passende Zuweisung finden.'
        });
    } catch(err) {
        resolveAiSuggestion({
            new_technician_id: 'Fallback Tech B',
            scheduled_time: 'Demnächst',
            human_explanation: 'Server offline – Fallback-Zuweisung wird angezeigt.'
        });
    }
}

function resolveAiSuggestion(aiData) {
    stateLoading.classList.remove('active');
    stateLoading.classList.add('hidden');

    let techName = 'UNBEKANNT';
    const allPartners = window.HERO_DATA?.system_data?.partners || [];
    const p = allPartners.find(x => String(x.user_id) === String(aiData.new_technician_id));
    if (p) techName = p.full_name;
    else if (aiData.new_technician_id && aiData.new_technician_id !== 'UNASSIGNED')
        techName = 'Techniker ID: ' + aiData.new_technician_id;

    currentAiSuggestion = { tech: techName, date: aiData.scheduled_time };

    document.getElementById('modalTaskId').innerText = currentActiveTaskId;
    document.getElementById('modalTech').innerText   = currentAiSuggestion.tech;
    document.getElementById('modalTime').innerText   = currentAiSuggestion.date;

    const reasonDOM = document.getElementById('modalReasoning');
    if (reasonDOM) reasonDOM.innerText = aiData.human_explanation || 'Keine Begründung angegeben.';

    stateResolution.classList.remove('hidden');
    stateResolution.classList.add('active');
    actionContainer.classList.remove('hidden');
}

document.getElementById('closeModalBtn').addEventListener('click', closeAiModal);
aiOverlay.addEventListener('click', (e) => { if (e.target === aiOverlay) closeAiModal(); });

document.getElementById('btnReject').addEventListener('click', () => triggerAiCalculation());

document.getElementById('btnApprove').addEventListener('click', async () => {
    const rawTaskId = parseInt(currentActiveTaskId.replace('TSK-', ''));
    const proj = window.HERO_DATA.system_data.projects.find(p => p.task?.id === rawTaskId);
    if (proj) proj.partner_name = currentAiSuggestion.tech;

    await saveToServer();
    loadDataAndRender();
    closeAiModal();
});

// =============================================
// ADD TASK MODAL
// =============================================
function openAddTaskModal() {
    const overlay = document.getElementById('addTaskModalOverlay');
    overlay.classList.remove('hidden');

    // Pre-fill datetime
    const now = new Date();
    const fmt = d => d.toISOString().slice(0, 16);
    document.getElementById('newTaskStart').value = fmt(now);
    document.getElementById('newTaskEnd').value   = fmt(new Date(now.getTime() + 3600000));
}

function closeAddTaskModal() {
    document.getElementById('addTaskModalOverlay').classList.add('hidden');
}

document.getElementById('closeAddModalBtn').addEventListener('click', closeAddTaskModal);
document.getElementById('addTaskModalOverlay').addEventListener('click', (e) => {
    if (e.target === document.getElementById('addTaskModalOverlay')) closeAddTaskModal();
});

document.getElementById('btnSaveTask').addEventListener('click', async () => {
    const title    = document.getElementById('newTaskTitle').value.trim()    || 'Neuer Termin';
    const customer = document.getElementById('newTaskCustomer').value.trim() || 'Unbekannt';
    const city     = document.getElementById('newTaskCity').value.trim()     || '';
    const bValue   = document.getElementById('newTaskValue').value           || 'MED';
    const skillsRaw = document.getElementById('newTaskSkills').value         || '';
    const skills   = skillsRaw.split(',').map(s => s.trim()).filter(s => s);
    const startVal = document.getElementById('newTaskStart').value;
    const dueDate  = startVal ? new Date(startVal).toISOString() : new Date().toISOString();

    const newId     = generateUniqueId();
    const newTaskId = generateUniqueId();

    const newProject = {
        id: newId, name: 'Projekt – ' + customer, project_nr: newId.toString(),
        type_id: 56960, type_name: '🧱 Projekte',
        step_id: 684112, step_name: '🆕 Neue Projekte',
        measure_id: 6464, measure_name: 'Projekt',
        partner_id: 163178, partner_name: 'Cliford Nchotie',
        customer_name: customer, address: { city: city },
        task: { id: newTaskId, title: title, due_date: dueDate }
    };

    if (!window.HERO_DATA.system_data.projects) window.HERO_DATA.system_data.projects = [];
    window.HERO_DATA.system_data.projects.push(newProject);

    const ext = window.HERO_DATA.system_data.custom_data_layer?.tasks_extension;
    if (ext) {
        if (ext.business_value_schema)  ext.business_value_schema.mapping.push({ task_id: newTaskId, business_value: bValue });
        if (ext.required_skills_schema) ext.required_skills_schema.mapping.push({ task_id: newTaskId, required_skills: skills });
    }

    await saveToServer();
    loadDataAndRender();
    closeAddTaskModal();

    // Clear fields
    ['newTaskTitle','newTaskCustomer','newTaskCity','newTaskSkills','newTaskDesc'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
    });
});

// =============================================
// SAVE TO SERVER
// =============================================
async function saveToServer() {
    try {
        await fetch('http://localhost:8000/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.HERO_DATA)
        });
    } catch(err) {
        console.warn('Save to server failed (offline?):', err);
    }
}

// =============================================
// BOOT
// =============================================
loadDataAndRender();
