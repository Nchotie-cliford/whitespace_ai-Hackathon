// Array to hold the parsed tasks
let mockTasks = [];

const container = document.getElementById('taskContainer');
const countSpan = document.getElementById('taskCount');

function renderTasks(tasks) {
    container.innerHTML = '';
    countSpan.textContent = `(${tasks.length})`;
    
    tasks.forEach((task, index) => {
        const card = document.createElement('div');
        card.className = `glass-panel task-card animate-in`;
        card.style.animationDelay = `${index * 50}ms`;
        card.onclick = () => openAiModal(task.id);
        
        let statusClass = 'status-active';
        let statusText = 'On Track';
        
        if(task.status === 'emergency') {
            statusClass = 'status-emergency';
            statusText = 'Emergency';
        } else if (task.status === 'delayed') {
            statusClass = 'status-delayed';
            statusText = 'Delayed';
        } else if (task.status === 'reassigned') {
            statusClass = 'status-active';
            statusText = 'AI Reassigned';
        }

        let valBadge = '';
        if (task.businessValue) {
            const lowVal = task.businessValue.toLowerCase();
            valBadge = `<span class="badge badge-${lowVal}">Value: ${task.businessValue}</span>`;
        }
        
        let skillsBadge = '';
        if (task.skills && task.skills.length > 0) {
            skillsBadge = task.skills.map(s => `<span class="badge badge-skill">${s}</span>`).join('');
        }

        card.innerHTML = `
            <div class="task-header">
                <span class="task-id">${task.id}</span>
                <span class="task-status ${statusClass}">${statusText}</span>
            </div>
            <h3 class="task-title">${task.title}</h3>
            <div class="task-customer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                ${task.customer} &bull; ${task.city}
            </div>
            <div class="task-details">
                <div class="task-meta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 9.36l-7.1 7.1a1 1 0 0 1-1.4 0l-2.83-2.83a1 1 0 0 1 0-1.4l7.1-7.1a6 6 0 0 1 9.36-7.94l-3.77 3.77z"></path></svg>
                    <strong>Tech:</strong> ${task.tech}
                </div>
                <div class="task-meta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <strong>Due:</strong> ${task.date}
                </div>
            </div>
            <div class="badge-container">
                ${valBadge}
                ${skillsBadge}
            </div>
        `;
        container.appendChild(card);
    });
}

function loadDataAndRender() {
    try {
        const data = window.HERO_DATA;
        if (!data) throw new Error('HERO_DATA not found. Did you include HERO_data.js?');
        
        const system = data.system_data;
        const projects = system.projects || [];
        const ext = system.custom_data_layer;
        
        mockTasks = projects.map(proj => {
            const task = proj.task;
            
            // Format date
            const dateObj = new Date(task.due_date);
            const formattedDate = dateObj.toLocaleDateString('en-US', { 
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            });

            // Extract extended data if available
            let bValue = "MED";
            if (ext && ext.tasks_extension && ext.tasks_extension.business_value_schema) {
                const bmap = ext.tasks_extension.business_value_schema.mapping.find(m => m.task_id === task.id);
                if (bmap) bValue = bmap.business_value;
            }
            
            let reqSkills = [];
            if (ext && ext.tasks_extension && ext.tasks_extension.required_skills_schema) {
                const smap = ext.tasks_extension.required_skills_schema.mapping.find(m => m.task_id === task.id);
                if (smap) reqSkills = smap.required_skills;
            }

            return {
                id: 'TSK-' + task.id,
                rawId: task.id, // Keep raw purely for logic checks
                title: task.title,
                tech: proj.partner_name,
                customer: proj.customer_name,
                city: proj.address ? proj.address.city : '',
                date: formattedDate,
                status: 'active',
                businessValue: bValue,
                skills: reqSkills
            };
        });
        
        renderTasks(mockTasks);
    } catch(err) {
        console.error('Error fetching data:', err);
    }
}

// Initial Render from window.HERO_DATA
loadDataAndRender();

// Box Triggers powered by HERO_data.json simulated events
const triggers = window.HERO_DATA?.system_data?.custom_data_layer?.trigger_events?.mock_events || [];

document.getElementById('btnSickUser').addEventListener('click', (e) => {
    e.target.style.border = '1px solid var(--danger)';
    e.target.style.color = 'var(--danger)';
    
    // Find sick event
    const evt = triggers.find(t => t.event_type === 'technician_sick');
    if (evt) {
        document.getElementById('btnSickUser').innerText = 'Triggered: Tech Sick';
        mockTasks = mockTasks.map(t => {
            if (evt.affected_tasks.includes(t.rawId) || t.tech === 'Cliford Nchotie') {
                const proj = window.HERO_DATA.system_data.projects.find(p => p.task && p.task.id === t.rawId);
                if (proj) {
                    proj.partner_name = 'UNASSIGNED (Sick)';
                    // Update extension logic offline
                    const ext = window.HERO_DATA.system_data.custom_data_layer.technicians_extension;
                    if(ext && ext.status_schema && ext.status_schema.mapping[0]) {
                        ext.status_schema.mapping[0].status = 'sick';
                    }
                }
                return { ...t, status: 'delayed', tech: 'UNASSIGNED (Sick)' };
            }
            return t;
        });
        saveToServer();
        renderTasks(mockTasks);
    }
});

document.getElementById('btnOverrun').addEventListener('click', (e) => {
    e.target.style.border = '1px solid var(--warning)';
    e.target.style.color = 'var(--warning)';
    
    const evt = triggers.find(t => t.event_type === 'delay');
    if (evt) {
        document.getElementById('btnOverrun').innerText = 'Triggered: Delay Event';
        mockTasks = mockTasks.map(t => {
            if (evt.affected_tasks.includes(t.rawId)) {
                const proj = window.HERO_DATA.system_data.projects.find(p => p.task && p.task.id === t.rawId);
                if(proj && proj.task) proj.task.title = proj.task.title + ' [DELAYED]';
                
                return { ...t, title: t.title + ' [DELAYED]', status: 'delayed', date: t.date + ' (+2h)' };
            }
            return t;
        });
        saveToServer();
        renderTasks(mockTasks);
    }
});

document.getElementById('btnFlood').addEventListener('click', (e) => {
    e.target.style.border = '1px solid var(--danger)';
    e.target.style.color = 'var(--danger)';
    
    const evt = triggers.find(t => t.event_type === 'new_urgent_task');
    if (evt) {
        document.getElementById('btnFlood').innerText = 'Triggered: Urgent Task';
        
        // Avoid adding multiple times
        if(!window.HERO_DATA.system_data.projects.find(p => p.task && p.task.id === 999)) {
            const newProject = {
                id: 10050999,
                name: "Service – Jane Smith (EMERGENCY)",
                project_nr: "10050999",
                type_id: 56961,
                type_name: "🛠️ Service",
                step_id: 684123,
                step_name: "🆕 Offen",
                measure_id: 6464,
                measure_name: "Projekt",
                partner_id: null,
                partner_name: "UNASSIGNED",
                customer_id: 6803553,
                customer_name: "Jane Smith",
                address: {
                    street: "Mönckebergstraße 7",
                    zipcode: "20095",
                    city: "Hamburg"
                },
                task: {
                    id: 999,
                    title: "EMERGENCY: Immediate Repair",
                    due_date: new Date().toISOString()
                }
            };
            
            // Push to core models
            window.HERO_DATA.system_data.projects.unshift(newProject); // add to top
            
            // Push to Schema models
            const ext = window.HERO_DATA.system_data.custom_data_layer.tasks_extension;
            if (ext) {
                if (ext.business_value_schema) ext.business_value_schema.mapping.push({ task_id: 999, business_value: 'HIGH' });
                if (ext.required_skills_schema) ext.required_skills_schema.mapping.push({ task_id: 999, required_skills: ['repair', 'electrical'] });
            }
            
            saveToServer();
            loadDataAndRender();
        }
    }
});

// AI Modal Handling
const aiOverlay = document.getElementById('aiModalOverlay');
const stateLoading = document.getElementById('aiLoading');
const stateResolution = document.getElementById('aiResolution');
const actionContainer = document.getElementById('aiActions');

let currentActiveTaskId = null;
let currentAiSuggestion = null;
let rejectCounter = 0;

function openAiModal(taskId) {
    currentActiveTaskId = taskId;
    rejectCounter = 0;
    
    aiOverlay.classList.remove('hidden');
    triggerAiCalculation();
}

function closeModal() {
    aiOverlay.classList.add('hidden');
}

async function triggerAiCalculation() {
    // Reset UI to loading
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
        
        if (data.assignments && data.assignments.length > 0) {
            resolveAiSuggestion(data.assignments[0]);
        } else {
            resolveAiSuggestion({
                new_technician_id: "UNASSIGNED",
                scheduled_time: "No Slot Available",
                human_explanation: "The AI could not find a viable assignment for this task."
            });
        }
    } catch(err) {
        console.error("AI Dispatch failed:", err);
        // Fallback for UI testing if server is down
        resolveAiSuggestion({
            new_technician_id: "Fallback Tech B",
            scheduled_time: "Oct 24, 05:00 PM",
            human_explanation: "Server offline - showing fallback mock assignment."
        });
    }
}

function resolveAiSuggestion(aiData) {
    stateLoading.classList.remove('active');
    stateLoading.classList.add('hidden');
    
    // Store globally so Approve button can access it
    // Wait, the API returns a string ID for the tech, we will look up the name offline for visuals.
    let techName = "UNKNOWN TECH";
    // Usually we would join this from HERO_DATA, but we'll try to find it
    const allPartners = window.HERO_DATA?.system_data?.partners || [];
    const p = allPartners.find(x => String(x.user_id) === String(aiData.new_technician_id));
    if (p) techName = p.full_name;
    else if (aiData.new_technician_id) techName = "Technician ID: " + aiData.new_technician_id;
    else techName = "None";
    
    currentAiSuggestion = {
        tech: techName,
        date: aiData.scheduled_time
    };
    
    // Fill Dom
    document.getElementById('modalTaskId').innerText = currentActiveTaskId;
    document.getElementById('modalTech').innerText = currentAiSuggestion.tech;
    document.getElementById('modalTime').innerText = currentAiSuggestion.date;
    
    const reasonDOM = document.getElementById('modalReasoning');
    if (reasonDOM) {
        reasonDOM.innerText = aiData.human_explanation || "No explanation provided.";
    }
    
    stateResolution.classList.remove('hidden');
    stateResolution.classList.add('active');
    actionContainer.classList.remove('hidden');
}

document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('btnReject').addEventListener('click', () => {
    rejectCounter++;
    triggerAiCalculation();
});
document.getElementById('btnApprove').addEventListener('click', async () => {
    // 1. Mutate core HERO_DATA
    const rawTaskId = parseInt(currentActiveTaskId.replace('TSK-', ''));
    const proj = window.HERO_DATA.system_data.projects.find(p => p.task && p.task.id === rawTaskId);
    if (proj) {
        proj.partner_name = currentAiSuggestion.tech;
        // In a real app we'd convert the "Oct 24, 04:15 PM" string string back to ISO, but for the hackathon we simply mutate.
    }
    
    // 2. Save directly to Python server
    await saveToServer();
    
    // 3. Reactively update UI
    loadDataAndRender();
    closeModal();
});

// ==========================================
// API Helper & Add Task Modal
// ==========================================

const addModalOverlay = document.getElementById('addTaskModalOverlay');
if (addModalOverlay) {
    document.getElementById('btnOpenAddTask').addEventListener('click', () => {
        addModalOverlay.classList.remove('hidden');
    });
    document.getElementById('closeAddModalBtn').addEventListener('click', () => {
        addModalOverlay.classList.add('hidden');
    });
    document.getElementById('btnCancelAdd').addEventListener('click', () => {
        addModalOverlay.classList.add('hidden');
    });
}

async function saveToServer() {
    try {
        await fetch('http://localhost:8000/api/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(window.HERO_DATA)
        });
        console.log('Successfully saved to HERO_data.json via Python backend!');
    } catch(err) {
        console.error('Failed to save to python server:', err);
    }
}

document.getElementById('btnSaveTask').addEventListener('click', async () => {
    const title = document.getElementById('newTaskTitle').value || 'New Task';
    const customer = document.getElementById('newTaskCustomer').value || 'Unknown';
    const city = document.getElementById('newTaskCity').value || '';
    const bValue = document.getElementById('newTaskValue').value || 'MED';
    const skillsRaw = document.getElementById('newTaskSkills').value || '';
    const skills = skillsRaw.split(',').map(s => s.trim()).filter(s => s);
    
    // Generate new unique ID for hackathon speed
    const newId = 20000000 + Math.floor(Math.random() * 10000);
    const newTaskId = 200000 + Math.floor(Math.random() * 10000);
    
    const newProject = {
        id: newId,
        name: "Projekt - " + customer,
        project_nr: newId.toString(),
        type_id: 56960,
        type_name: "🧱 Projekte",
        step_id: 684112,
        step_name: "🆕 Neue Projekte",
        measure_id: 6464,
        measure_name: "Projekt",
        partner_id: 163178,
        partner_name: "Cliford Nchotie",
        customer_name: customer,
        address: { city: city },
        task: {
            id: newTaskId,
            title: title,
            due_date: new Date().toISOString()
        }
    };
    
    // Update core payload
    if (!window.HERO_DATA.system_data.projects) window.HERO_DATA.system_data.projects = [];
    window.HERO_DATA.system_data.projects.push(newProject);
    
    // Update extended custom layers correctly
    const ext = window.HERO_DATA.system_data.custom_data_layer.tasks_extension;
    if (ext) {
        if (ext.business_value_schema) ext.business_value_schema.mapping.push({ task_id: newTaskId, business_value: bValue });
        if (ext.required_skills_schema) ext.required_skills_schema.mapping.push({ task_id: newTaskId, required_skills: skills });
    }
    
    await saveToServer();
    loadDataAndRender();
    addModalOverlay.classList.add('hidden');
});
