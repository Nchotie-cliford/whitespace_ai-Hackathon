'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

function formatDayLabel(value) {
  if (!value) return 'No date'
  return new Date(value).toLocaleDateString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function formatTimeOnly(value) {
  if (!value) return 'Open'
  return new Date(value).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateTime(value) {
  if (!value) return 'Not scheduled'
  return new Date(value).toLocaleString([], {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatTimeRange(task) {
  const start = task?.start_at || task?.due_date
  const end = task?.end_at
  if (!start) return 'Time open'
  if (!end) return formatTimeOnly(start)
  return `${formatTimeOnly(start)} - ${formatTimeOnly(end)}`
}

function getTaskTimestamp(task) {
  return task?.start_at || task?.due_date || task?.end_at || null
}

function getDayKey(task) {
  const value = getTaskTimestamp(task)
  if (!value) return 'undated'
  return new Date(value).toISOString().slice(0, 10)
}

function normalizePriority(value) {
  const text = String(value || 'medium').toLowerCase()
  if (text === 'high') return 'high'
  if (text === 'low') return 'low'
  return 'medium'
}

function buildJobMeta(task, project) {
  const assignedPeople = project?.assigned_people?.filter(Boolean) || []

  return {
    projectName:
      task?.project_title ||
      task?.project_name ||
      project?.project_title ||
      project?.project_name ||
      'Project not linked',
    projectCode:
      task?.display_id ||
      project?.display_id ||
      task?.project_nr ||
      project?.project_nr ||
      'No code',
    customerName: task?.customer_name || project?.customer_name || 'Customer not linked',
    assignedPeople,
    address:
      task?.full_address ||
      project?.full_address ||
      task?.city ||
      project?.city ||
      'Address not available',
    projectType: project?.project_type || 'Project',
    projectStatus: project?.status_name || 'In progress',
    openTaskCount: project?.open_task_count || 0,
  }
}

function getChangeType(task, previousTask) {
  if (!previousTask) return 'new'
  if (previousTask.hero_target_user_id !== task.hero_target_user_id) return 'worker'
  if ((previousTask.start_at || previousTask.due_date) !== (task.start_at || task.due_date)) return 'time'
  if ((previousTask.end_at || null) !== (task.end_at || null)) return 'time'
  return null
}

function getChangeLabel(changeType) {
  if (changeType === 'worker') return 'Worker moved'
  if (changeType === 'time') return 'Time changed'
  if (changeType === 'new') return 'New on board'
  return ''
}

function SkeletonColumn() {
  return (
    <div className="planner-day planner-day-skeleton">
      <div className="skeleton-line short" />
      <div className="planner-card-stack">
        <div className="skeleton-card">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
          <div className="skeleton-line xshort" />
        </div>
        <div className="skeleton-card">
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
          <div className="skeleton-line xshort" />
        </div>
      </div>
    </div>
  )
}

export default function BoardDrawer({ open, snapshot, resolution, onClose }) {
  const tasks = snapshot?.activeTasks || []
  const crew = snapshot?.technicianWorkload || []
  const projectSummary = snapshot?.projectSummary || []
  const loading = snapshot === null

  const highlightTask = resolution?.matchedTask?.hero_task_id
  const highlightCrew = resolution?.recommendedAction?.targetUserId
  const previousTasksRef = useRef(new Map())

  const taskChanges = useMemo(() => {
    const previous = previousTasksRef.current
    const next = new Map()
    const changes = new Map()

    tasks.forEach((task) => {
      const previousTask = previous.get(task.hero_task_id)
      const changeType = getChangeType(task, previousTask)
      next.set(task.hero_task_id, {
        hero_target_user_id: task.hero_target_user_id,
        start_at: task.start_at,
        due_date: task.due_date,
        end_at: task.end_at,
      })
      if (changeType) {
        changes.set(task.hero_task_id, changeType)
      }
    })

    return { changes, next }
  }, [tasks])

  useEffect(() => {
    previousTasksRef.current = taskChanges.next
  }, [taskChanges])

  const groupedDays = useMemo(() => {
    const groups = tasks.reduce((acc, task) => {
      const key = getDayKey(task)
      if (!acc[key]) {
        acc[key] = {
          key,
          label:
            key === 'undated'
              ? 'No date'
              : formatDayLabel(getTaskTimestamp(task)),
          tasks: [],
        }
      }
      acc[key].tasks.push(task)
      return acc
    }, {})

    return Object.values(groups)
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((group) => ({
        ...group,
        tasks: group.tasks.sort((left, right) => {
          const leftTime = new Date(getTaskTimestamp(left) || 0).getTime()
          const rightTime = new Date(getTaskTimestamp(right) || 0).getTime()
          return leftTime - rightTime
        }),
      }))
  }, [tasks])

  const [selectedTaskId, setSelectedTaskId] = useState(null)

  useEffect(() => {
    if (!open) return
    const preferredTaskId = highlightTask || tasks[0]?.hero_task_id || null
    setSelectedTaskId((current) => {
      if (current && tasks.some((task) => Number(task.hero_task_id) === Number(current))) {
        return current
      }
      return preferredTaskId
    })
  }, [open, tasks, highlightTask])

  const selectedTask =
    tasks.find((task) => Number(task.hero_task_id) === Number(selectedTaskId)) || null
  const selectedProject =
    projectSummary.find(
      (project) => Number(project.hero_project_match_id) === Number(selectedTask?.hero_target_project_match_id),
    ) || null
  const selectedMeta = buildJobMeta(selectedTask, selectedProject)
  const recommendedCrewName =
    crew.find((member) => Number(member.hero_user_id) === Number(highlightCrew))?.full_name || null

  return (
    <>
      <div className={`drawer-overlay ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />

      <div className={`drawer planner-drawer ${open ? 'open' : ''}`} aria-hidden={!open} role="dialog" aria-label="Schedule board">
        <div className="drawer-inner planner-shell">
          <div className="drawer-head planner-head">
            <div>
              <p className="drawer-eyebrow">Dispatch planner</p>
              <h3 className="drawer-title">
                {loading ? 'Loading...' : `${tasks.length} scheduled jobs across ${groupedDays.length || 1} day${groupedDays.length === 1 ? '' : 's'}`}
              </h3>
            </div>
            <div className="planner-head-actions">
              <span className="planner-status-pill">Live updates</span>
              <button className="close-btn planner-close" onClick={onClose} aria-label="Close">
                &#x2715;
              </button>
            </div>
          </div>

          <div className="planner-layout">
            <section className="planner-board">
              <div className="section-topline planner-topline">
                <div className="col-label">Calendar view</div>
                <div className="section-note">Project cards update when timing or assignments change.</div>
              </div>

              <div className="planner-grid">
                {loading
                  ? [1, 2, 3].map((i) => <SkeletonColumn key={i} />)
                  : groupedDays.map((group) => (
                      <section key={group.key} className="planner-day">
                        <header className="planner-day-head">
                          <div>
                            <div className="planner-day-label">{group.label}</div>
                            <div className="planner-day-subtitle">{group.tasks.length} projects in motion</div>
                          </div>
                        </header>

                        <div className="planner-card-stack">
                          {group.tasks.map((task) => {
                            const isActive = Number(task.hero_task_id) === Number(selectedTaskId)
                            const isHighlighted = Number(task.hero_task_id) === Number(highlightTask)
                            const changeType = taskChanges.changes.get(task.hero_task_id)
                            const project = projectSummary.find(
                              (entry) => Number(entry.hero_project_match_id) === Number(task.hero_target_project_match_id),
                            )
                            const meta = buildJobMeta(task, project)
                            const priority = normalizePriority(task.business_value)

                            return (
                              <button
                                key={task.hero_task_id || task.id}
                                type="button"
                                className={`planner-card priority-${priority} ${isActive ? 'active' : ''} ${isHighlighted ? 'highlight' : ''} ${changeType ? 'changed' : ''}`}
                                onClick={() => setSelectedTaskId(task.hero_task_id)}
                              >
                                <div className="planner-card-frame" />
                                <div className="planner-card-top">
                                  <span className="planner-time-pill">{formatTimeRange(task)}</span>
                                  {changeType ? <span className="planner-change-pill">{getChangeLabel(changeType)}</span> : null}
                                </div>

                                <div className="planner-card-title">{meta.projectName}</div>
                                <div className="planner-card-subtitle">{task.title}</div>

                                <div className="planner-card-meta">
                                  <span>{task.assigned_to_name || 'Unassigned'}</span>
                                  <span>{meta.projectCode}</span>
                                </div>

                                <div className="planner-card-footer">
                                  <span>{meta.customerName}</span>
                                  <span>{task.city || 'No city'}</span>
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </section>
                    ))}
              </div>
            </section>

            <aside className="planner-detail-panel">
              <div className="section-topline planner-topline">
                <div className="col-label">Project detail</div>
                {selectedTask ? <div className="section-note">{selectedMeta.projectCode}</div> : null}
              </div>

              {loading ? (
                <SkeletonColumn />
              ) : selectedTask ? (
                <div className="planner-detail-card">
                  <div className="planner-detail-header">
                    <div>
                      <h4 className="planner-detail-title">{selectedMeta.projectName}</h4>
                      <p className="planner-detail-subtitle">{selectedTask.title}</p>
                    </div>
                    <span className={`planner-priority-chip ${normalizePriority(selectedTask.business_value)}`}>
                      {normalizePriority(selectedTask.business_value)} priority
                    </span>
                  </div>

                  <div className="planner-detail-grid">
                    <div className="planner-detail-block">
                      <span className="detail-label">Timeframe</span>
                      <span className="detail-value">{formatDateTime(selectedTask.start_at || selectedTask.due_date)}</span>
                      <span className="detail-muted">
                        {selectedTask.end_at ? `Ends ${formatTimeOnly(selectedTask.end_at)}` : 'End time not fixed'}
                      </span>
                    </div>

                    <div className="planner-detail-block">
                      <span className="detail-label">Assigned now</span>
                      <span className="detail-value">{selectedTask.assigned_to_name || 'Not assigned yet'}</span>
                      <span className="detail-muted">{selectedMeta.projectStatus}</span>
                    </div>

                    <div className="planner-detail-block planner-detail-block-wide">
                      <span className="detail-label">Site</span>
                      <span className="detail-value">{selectedMeta.customerName}</span>
                      <span className="detail-muted">{selectedMeta.address}</span>
                    </div>
                  </div>

                  <div className="planner-detail-stack">
                    <div className="planner-detail-section">
                      <div className="planner-detail-section-title">Project team</div>
                      <div className="planner-assignee-list">
                        {selectedMeta.assignedPeople.length ? (
                          selectedMeta.assignedPeople.map((person) => (
                            <span
                              key={person}
                              className={`planner-assignee-chip ${person === selectedTask.assigned_to_name ? 'active' : ''} ${recommendedCrewName && person === recommendedCrewName ? 'recommended' : ''}`}
                            >
                              {person}
                            </span>
                          ))
                        ) : (
                          <span className="detail-empty">No team assigned yet.</span>
                        )}
                      </div>
                    </div>

                    <div className="planner-detail-section">
                      <div className="planner-detail-section-title">Required skills</div>
                      <div className="planner-skill-list">
                        {(selectedTask.required_skills || []).length ? (
                          selectedTask.required_skills.map((skill) => (
                            <span key={skill} className="planner-skill-chip">{skill}</span>
                          ))
                        ) : (
                          <span className="detail-empty">No required skills listed.</span>
                        )}
                      </div>
                    </div>

                    <div className="planner-detail-section">
                      <div className="planner-detail-section-title">Crew availability</div>
                      <div className="planner-crew-table">
                        {crew.slice(0, 6).map((member) => {
                          const isRecommended = Number(member.hero_user_id) === Number(highlightCrew)
                          const isAssigned = member.full_name === selectedTask.assigned_to_name
                          return (
                            <div key={member.hero_user_id} className={`planner-crew-row ${isRecommended ? 'recommended' : ''} ${isAssigned ? 'assigned' : ''}`}>
                              <div>
                                <div className="planner-crew-name">{member.full_name}</div>
                                <div className="planner-crew-zone">{member.geographic_zone || 'Zone not set'}</div>
                              </div>
                              <div className="planner-crew-load">{member.open_task_count} active</div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="empty-detail-card planner-empty-state">
                  <p className="empty-detail-title">Pick a project card to inspect it.</p>
                  <p className="empty-detail-copy">
                    You will see the project timeframe, current worker, linked site, and the rest of the crew on that project.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
