// Mock Data for the Chaos Environment
let mockTasks = [
    { id: 'TSK-101', title: 'Boiler Repair', tech: 'Technician A', date: 'Oct 24, 09:00 AM', status: 'active' },
    { id: 'TSK-102', title: 'HVAC Maintenance', tech: 'Technician B', date: 'Oct 24, 11:30 AM', status: 'active' },
    { id: 'TSK-103', title: 'Filter Replacement', tech: 'Technician A', date: 'Oct 24, 02:00 PM', status: 'active' },
    { id: 'TSK-104', title: 'Thermostat Wiring', tech: 'Technician C', date: 'Oct 24, 10:00 AM', status: 'active' },
    { id: 'TSK-105', title: 'System Diagnostics', tech: 'Technician B', date: 'Oct 24, 03:00 PM', status: 'active' }
];

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

        card.innerHTML = `
            <div class="task-header">
                <span class="task-id">${task.id}</span>
                <span class="task-status ${statusClass}">${statusText}</span>
            </div>
            <h3 class="task-title">${task.title}</h3>
            <div class="task-details">
                <div class="task-meta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    <strong>Tech:</strong> ${task.tech}
                </div>
                <div class="task-meta">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    <strong>Due:</strong> ${task.date}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// Initial Render
renderTasks(mockTasks);

// Box Triggers
document.getElementById('btnSickUser').addEventListener('click', (e) => {
    e.target.style.border = '1px solid var(--danger)';
    e.target.style.color = 'var(--danger)';
    document.getElementById('btnSickUser').innerText = 'Triggered: Technician A Sick';
    
    mockTasks = mockTasks.map(t => {
        if(t.tech === 'Technician A') return { ...t, status: 'delayed', tech: 'UNASSIGNED (Sick)' };
        return t;
    });
    renderTasks(mockTasks);
});

document.getElementById('btnOverrun').addEventListener('click', (e) => {
    e.target.style.border = '1px solid var(--warning)';
    e.target.style.color = 'var(--warning)';
    document.getElementById('btnOverrun').innerText = 'Triggered: Pipeline Burst Event';
    
    mockTasks[1] = { ...mockTasks[1], title: 'EMERGENCY: Pipe Burst', status: 'delayed', date: 'Oct 24, (Delayed by 3h)' };
    renderTasks(mockTasks);
});

document.getElementById('btnFlood').addEventListener('click', (e) => {
    e.target.style.border = '1px solid var(--danger)';
    e.target.style.color = 'var(--danger)';
    document.getElementById('btnFlood').innerText = 'Triggered: Emergency Lead Recieved';
    
    const newEmergency = {
        id: 'TSK-999',
        title: 'Emergency Flood Mitigation',
        tech: 'UNASSIGNED',
        date: 'ASAP',
        status: 'emergency'
    };
    mockTasks = [newEmergency, ...mockTasks];
    renderTasks(mockTasks);
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
