'use client'

import { useEffect, useMemo, useState } from 'react'

// ── Helpers ────────────────────────────────────────────────────

function formatDayLabel(value) {
  if (!value) return 'No date'
  const d = new Date(value)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'short' })
}

function formatTime(value) {
  if (!value) return null
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getTaskTimestamp(task) {
  return task?.start_at || task?.due_date || task?.end_at || null
}

function getProjectName(task, project) {
  return task?.project_title || task?.project_name ||
    project?.project_title || project?.project_name || 'Unnamed project'
}

function getCustomerName(task, project) {
  return task?.customer_name || project?.customer_name || null
}

function getAddress(task, project) {
  return task?.full_address || project?.full_address || task?.city || project?.city || null
}

function getAssignedWorker(task) {
  return task?.assigned_to_name || null
}

// ── Skeleton ───────────────────────────────────────────────────

function Skeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-line" style={{ width: '60%' }} />
          <div className="skeleton-line short" />
        </div>
      ))}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────

export default function BoardDrawer({ open, snapshot, resolution, phase, onClose }) {
  const tasks        = snapshot?.activeTasks    || []
  const projectSummary = snapshot?.projectSummary || []
  const loading      = snapshot === null

  // Invite is sent once the dispatcher confirms a reassignment
  const inviteSent =
    phase === 'confirmed' &&
    resolution?.recommendedAction?.type === 'reassign'

  const invitedTaskId    = inviteSent ? resolution?.matchedTask?.hero_task_id : null
  const invitedWorkerName = inviteSent ? resolution?.recommendedAction?.targetUserName : null

  // ── Group tasks into projects ────────────────────────────────
  const projectEntries = useMemo(() => {
    const map = new Map()
    tasks.forEach(task => {
      const projId = String(task.hero_target_project_match_id || 'no-project')
      if (!map.has(projId)) {
        const project = projectSummary.find(
          p => Number(p.hero_project_match_id) === Number(task.hero_target_project_match_id)
        ) || null
        map.set(projId, { projId, project, tasks: [], earliestTime: null })
      }
      const entry = map.get(projId)
      entry.tasks.push(task)
      const t = getTaskTimestamp(task)
      if (t && (!entry.earliestTime || new Date(t) < new Date(entry.earliestTime))) {
        entry.earliestTime = t
      }
    })
    return Array.from(map.values())
  }, [tasks, projectSummary])

  // ── Group projects by day ────────────────────────────────────
  const days = useMemo(() => {
    const groups = {}
    projectEntries.forEach(entry => {
      const key = entry.earliestTime
        ? new Date(entry.earliestTime).toISOString().slice(0, 10)
        : 'undated'
      if (!groups[key]) {
        groups[key] = {
          key,
          label: key === 'undated' ? 'No date set' : formatDayLabel(entry.earliestTime),
          entries: [],
        }
      }
      groups[key].entries.push(entry)
    })
    return Object.values(groups)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map(g => ({
        ...g,
        entries: g.entries.sort(
          (a, b) => new Date(a.earliestTime || 0) - new Date(b.earliestTime || 0)
        ),
      }))
  }, [projectEntries])

  // ── Selected project ─────────────────────────────────────────
  const [selectedProjId, setSelectedProjId] = useState(null)

  useEffect(() => {
    if (!open) return
    // Auto-select the project that just got an invite, or the first one
    if (invitedTaskId) {
      const t = tasks.find(t => Number(t.hero_task_id) === Number(invitedTaskId))
      if (t) { setSelectedProjId(String(t.hero_target_project_match_id || 'no-project')); return }
    }
    if (projectEntries.length > 0) {
      setSelectedProjId(cur =>
        cur && projectEntries.some(e => e.projId === cur) ? cur : projectEntries[0].projId
      )
    }
  }, [open, invitedTaskId, tasks, projectEntries])

  const selected = projectEntries.find(e => e.projId === selectedProjId) || null
  const selectedHasInvite =
    selected && invitedTaskId &&
    selected.tasks.some(t => Number(t.hero_task_id) === Number(invitedTaskId))

  const totalProjects = projectEntries.length

  return (
    <>
      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />

      <div className={`drawer planner-drawer ${open ? 'open' : ''}`} aria-hidden={!open} role="dialog" aria-label="Schedule">
        <div className="drawer-inner planner-shell">

          {/* ── Header ─────────────────────────────────────────── */}
          <div className="drawer-head planner-head">
            <div>
              <p className="drawer-eyebrow">Schedule</p>
              <h3 className="drawer-title">
                {loading ? 'Loading…' : totalProjects === 0 ? 'No jobs scheduled' : `${totalProjects} job${totalProjects === 1 ? '' : 's'} on the board`}
              </h3>
            </div>
            <div className="planner-head-actions">
              <button className="close-btn" onClick={onClose} aria-label="Close">&#x2715;</button>
            </div>
          </div>

          {/* ── Body ───────────────────────────────────────────── */}
          <div className="planner-layout">

            {/* Left: project list by day */}
            <section className="planner-board">
              {loading ? (
                <Skeleton />
              ) : days.length === 0 ? (
                <p className="detail-empty" style={{ padding: '24px 0' }}>No scheduled jobs found.</p>
              ) : (
                days.map(day => (
                  <div key={day.key} className="sched-day">
                    <div className="sched-day-label">{day.label}</div>

                    <div className="planner-card-stack">
                      {day.entries.map(entry => {
                        const { projId, project, tasks: et, earliestTime } = entry
                        const isActive = projId === selectedProjId
                        const hasInvite =
                          invitedTaskId &&
                          et.some(t => Number(t.hero_task_id) === Number(invitedTaskId))
                        const worker = getAssignedWorker(et[0])
                        const projectName = getProjectName(et[0], project)
                        const customerName = getCustomerName(et[0], project)

                        return (
                          <button
                            key={projId}
                            type="button"
                            className={`sched-card ${isActive ? 'sched-card-active' : ''} ${hasInvite ? 'sched-card-pending' : ''}`}
                            onClick={() => setSelectedProjId(projId)}
                          >
                            {/* Pending invite banner */}
                            {hasInvite && (
                              <div className="sched-invite-banner">
                                <span className="pending-dot" />
                                Waiting for confirmation
                              </div>
                            )}

                            <div className="sched-card-name">{projectName}</div>
                            {customerName && (
                              <div className="sched-card-customer">{customerName}</div>
                            )}
                            <div className="sched-card-footer">
                              <span className="sched-card-worker">
                                {worker || 'No one assigned'}
                              </span>
                              {earliestTime && (
                                <span className="sched-card-time">{formatTime(earliestTime)}</span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))
              )}
            </section>

            {/* Right: project detail */}
            <aside className="planner-detail-panel">
              {loading ? (
                <Skeleton />
              ) : selected ? (
                <ProjectDetail
                  entry={selected}
                  hasInvite={selectedHasInvite}
                  invitedWorkerName={invitedWorkerName}
                  invitedTaskId={invitedTaskId}
                />
              ) : (
                <div className="planner-empty-state">
                  <p className="empty-detail-title">Tap a job to see the details.</p>
                </div>
              )}
            </aside>

          </div>
        </div>
      </div>
    </>
  )
}

// ── Project detail panel ───────────────────────────────────────

function ProjectDetail({ entry, hasInvite, invitedWorkerName, invitedTaskId }) {
  const { project, tasks, earliestTime } = entry
  const firstTask = tasks[0]

  const projectName  = getProjectName(firstTask, project)
  const customerName = getCustomerName(firstTask, project)
  const address      = getAddress(firstTask, project)
  const status       = project?.status_name || 'In progress'

  return (
    <div className="planner-detail-card">

      {/* Waiting-for-confirmation notice */}
      {hasInvite && (
        <div className="sched-confirmation-notice">
          <div className="sched-notice-icon">
            <span className="pending-dot pending-dot-lg" />
          </div>
          <div>
            <div className="sched-notice-title">Waiting for confirmation</div>
            <div className="sched-notice-body">
              {invitedWorkerName
                ? `${invitedWorkerName} has been sent an invite and hasn't confirmed yet.`
                : 'An invite has been sent. Waiting for the worker to confirm.'}
            </div>
          </div>
        </div>
      )}

      {/* Project name */}
      <div className="sched-detail-name">{projectName}</div>
      {customerName && <div className="sched-detail-customer">{customerName}</div>}

      {/* Key facts */}
      <div className="sched-facts">
        {earliestTime && (
          <div className="sched-fact">
            <span className="sched-fact-label">When</span>
            <span className="sched-fact-value">
              {new Date(earliestTime).toLocaleDateString([], {
                weekday: 'short', day: 'numeric', month: 'short',
              })}{' '}at {formatTime(earliestTime)}
            </span>
          </div>
        )}
        {address && (
          <div className="sched-fact">
            <span className="sched-fact-label">Where</span>
            <span className="sched-fact-value">{address}</span>
          </div>
        )}
        <div className="sched-fact">
          <span className="sched-fact-label">Status</span>
          <span className="sched-fact-value">{status}</span>
        </div>
      </div>

      {/* Tasks */}
      <div className="sched-section-label">
        Tasks <span className="section-count">{tasks.length}</span>
      </div>
      <div className="planner-task-list">
        {tasks.map(task => {
          const isInvited = invitedTaskId && Number(task.hero_task_id) === Number(invitedTaskId)
          const time = formatTime(getTaskTimestamp(task))
          return (
            <div key={task.hero_task_id} className={`planner-task-row ${isInvited ? 'task-highlighted' : ''}`}>
              <div className="planner-task-row-left">
                <div>
                  <div className="planner-task-title">{task.title || 'Untitled'}</div>
                  {time && <div className="planner-task-time">{time}</div>}
                </div>
              </div>
              <div className="planner-task-row-right">
                {isInvited && invitedWorkerName
                  ? <span className="planner-pending-tag"><span className="pending-dot" />{invitedWorkerName}</span>
                  : <span className="planner-task-worker">{task.assigned_to_name || 'Unassigned'}</span>
                }
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
