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
                return { ...t, status: 'delayed', tech: 'UNASSIGNED (Sick)' };
            }
            return t;
        });
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
                return { ...t, title: t.title + ' [DELAYED]', status: 'delayed', date: t.date + ' (+2h)' };
            }
            return t;
        });
        renderTasks(mockTasks);
    }
});

document.getElementById('btnFlood').addEventListener('click', (e) => {
    e.target.style.border = '1px solid var(--danger)';
    e.target.style.color = 'var(--danger)';
    
    const evt = triggers.find(t => t.event_type === 'new_urgent_task');
    if (evt) {
        document.getElementById('btnFlood').innerText = 'Triggered: Urgent Task';
        const newEmergency = {
            id: 'TSK-999',
            rawId: 999,
            title: 'EMERGENCY: Immediate Repair',
            tech: 'UNASSIGNED',
            customer: 'Jane Smith',
            city: 'Hamburg',
            date: 'ASAP',
            status: 'emergency',
            businessValue: 'HIGH',
            skills: ['repair', 'electrical']
        };
        // Avoid adding multiple times
        if(!mockTasks.find(t => t.id === 'TSK-999')) {
            mockTasks = [newEmergency, ...mockTasks];
        }
        renderTasks(mockTasks);
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

function triggerAiCalculation() {
    // Reset UI to loading
    stateLoading.classList.add('active');
    stateLoading.classList.remove('hidden');
    stateResolution.classList.add('hidden');
    stateResolution.classList.remove('active');
    actionContainer.classList.add('hidden');
    
    // Simulate AI Latency
    setTimeout(() => {
        resolveAiSuggestion();
    }, 1500);
}

function resolveAiSuggestion() {
    stateLoading.classList.remove('active');
    stateLoading.classList.add('hidden');
    
    // Generate simulated Mock AI Data based on iterations
    const techOptions = ['Technician D (Rerouted)', 'Technician B (Overtime)', 'Technician C (Emergency dispatch)'];
    const timeOptions = ['Oct 24, 04:15 PM', 'Oct 24, 05:00 PM', 'Oct 25, 08:00 AM (Next Day)'];
    
    // Pick based on how many times user tapped "Reject"
    const selectionIdx = rejectCounter % techOptions.length;
    
    currentAiSuggestion = {
        tech: techOptions[selectionIdx],
        date: timeOptions[selectionIdx]
    };
    
    // Fill Dom
    document.getElementById('modalTaskId').innerText = currentActiveTaskId;
    document.getElementById('modalTech').innerText = currentAiSuggestion.tech;
    document.getElementById('modalTime').innerText = currentAiSuggestion.date;
    
    stateResolution.classList.remove('hidden');
    stateResolution.classList.add('active');
    actionContainer.classList.remove('hidden');
}

document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('btnReject').addEventListener('click', () => {
    rejectCounter++;
    triggerAiCalculation();
});
document.getElementById('btnApprove').addEventListener('click', () => {
    // Apply changes map to the master data
    mockTasks = mockTasks.map(t => {
        if(t.id === currentActiveTaskId) {
            return {
                ...t,
                tech: currentAiSuggestion.tech,
                date: currentAiSuggestion.date,
                status: 'reassigned'
            };
        }
        return t;
    });
    
    renderTasks(mockTasks);
    closeModal();
});
