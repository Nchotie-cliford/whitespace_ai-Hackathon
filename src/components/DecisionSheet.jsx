'use client'

import { useState, useEffect } from 'react'

function formatTime(val) {
  if (!val) return ''
  const raw = String(val)
  const date = new Date(val)
  if (Number.isNaN(date.getTime())) return ''

  if (/T00:00:00(?:\.000)?(?:Z|[+-]\d{2}:\d{2})?$/.test(raw)) {
    return date.toLocaleDateString([], {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    })
  }

  return date.toLocaleString([], {
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getProjectLabel(resolution) {
  return (
    resolution?.matchedTask?.customer_name ||
    resolution?.matchedTask?.project_name ||
    resolution?.matchedTask?.project_title ||
    resolution?.matchedTask?.title ||
    'this job'
  )
}

function getDisplayMode(resolution) {
  return resolution?.displayMode || resolution?.requestMode || 'action'
}

function buildHeadline(resolution) {
  const action = resolution?.recommendedAction || {}
  const display = resolution?.display || null
  const brief = String(display?.headline || resolution?.dispatcherBrief || '')
  const projectLabel = getProjectLabel(resolution)
  const displayMode = getDisplayMode(resolution)

  if (display?.headline) {
    return display.headline
  }

  if (displayMode === 'planning') {
    const affectedCount = resolution?.affectedProjects?.length || 0
    if (affectedCount > 0) {
      return `${affectedCount} project${affectedCount === 1 ? '' : 's'} need attention.`
    }
    return 'Planning update ready.'
  }

  if (displayMode === 'summary') {
    return `${projectLabel} summary ready.`
  }

  if (displayMode === 'status') {
    return `${projectLabel} staffing update.`
  }

  if (action.type === 'reassign' && action.targetUserName) {
    return `Send ${action.targetUserName} to ${projectLabel}.`
  }

  if (action.type === 'delay') {
    return `Delay ${projectLabel}.`
  }

  if (action.type === 'manual_review') {
    return `${projectLabel} needs review.`
  }

  const first = brief.split(/[.!?]/)[0]?.trim()
  return first ? first + '.' : brief
}

function buildSubline(resolution) {
  const action = resolution?.recommendedAction || {}
  const display = resolution?.display || null
  const parts = []
  const displayMode = getDisplayMode(resolution)
  const labels = {
    reassign: 'Recommended move',
    delay: 'Recommended delay',
    manual_review: 'Manual review',
  }

  if (display?.subline || display?.meta) {
    return [display?.subline, display?.meta].filter(Boolean).join(' - ')
  }

  if (displayMode === 'planning') {
    parts.push('Planning view')
  } else if (displayMode === 'summary') {
    parts.push('Project summary')
  } else if (displayMode === 'status') {
    parts.push('Staffing view')
  } else if (action.type) {
    parts.push(labels[action.type] || action.type.replace(/_/g, ' '))
  }

  if (action.dueDate) parts.push(formatTime(action.dueDate))
  if (resolution?.matchedTask?.display_id || resolution?.matchedTask?.project_nr) {
    parts.push('#' + (resolution.matchedTask.display_id || resolution.matchedTask.project_nr))
  }

  return parts.join(' · ')
}

function getReasonLabel(resolution) {
  return resolution?.display?.helperLabel || 'What matters now'
}

function getRiskLabel(resolution) {
  return resolution?.display?.riskLabel || 'Watch-out'
}

function getModeBadgeText(resolution, isAI) {
  if (!isAI) return 'Offline'

  const mode = getDisplayMode(resolution)
  const labels = {
    handover_summary: 'Worker handover',
    arrival_brief: 'Arrival brief',
    daily_brief: 'Daily brief',
    planning: 'Planning',
    summary: 'Summary',
    status: 'Status',
    action: 'AI decision',
  }

  return labels[mode] || 'AI'
}

function buildReason(resolution) {
  const action = resolution?.recommendedAction || {}
  const projectLabel = getProjectLabel(resolution)
  const fallbackReason = Array.isArray(resolution?.why) ? resolution.why[0] : ''
  const displayMode = getDisplayMode(resolution)
  const display = resolution?.display || null

  if (display?.reason) {
    return display.reason
  }

  if (displayMode === 'planning') {
    const affected = resolution?.affectedProjects || []
    if (affected.length > 0) {
      return `Most exposed: ${affected[0].customerName || affected[0].projectName}.`
    }
  }

  if (displayMode === 'summary' || displayMode === 'status') {
    return fallbackReason || resolution?.problemSummary || ''
  }

  if (action.type === 'reassign' && action.targetUserName) {
    return `The best person to cover ${projectLabel} is ${action.targetUserName}.`
  }

  if (action.type === 'delay') {
    return `Delaying ${projectLabel} causes less disruption than pulling another technician off a live job.`
  }

  if (action.type === 'manual_review') {
    return fallbackReason || `No reliable replacement was confirmed for ${projectLabel}.`
  }

  return fallbackReason || resolution?.cascadeRisk?.explanation || ''
}

function buildRiskNote(resolution) {
  const display = resolution?.display || null
  if (display?.risk) {
    return display.risk
  }

  if (getDisplayMode(resolution) === 'planning') {
    const action = resolution?.recommendedAction || {}
    if (action.type === 'delay' && action.dueDate) {
      return `Best move: delay the first exposed visit to ${formatTime(action.dueDate)}.`
    }
  }

  const risk = String(resolution?.residualRisk || '').trim()
  if (!risk) return ''

  if (risk.length <= 120) return risk

  const firstSentence = risk.split(/[.!?]/)[0]?.trim()
  return firstSentence ? firstSentence + '.' : risk
}

function buildAltText(resolution) {
  const fb = resolution?.fallbackRecommendation
  if (!fb) return null
  const parts = []

  if (fb.type === 'reassign' && fb.targetUserName) parts.push(`Reassign to ${fb.targetUserName}`)
  if (fb.type === 'delay') parts.push('Delay the task')
  if (fb.dueDate) parts.push(`by ${formatTime(fb.dueDate)}`)
  if (!parts.length) return null

  return parts.join(' · ') + '.'
}

function buildConfirmLabel(resolution, confidence) {
  const action = resolution?.recommendedAction || {}
  const targetName = action.targetUserName
  const projectLabel = getProjectLabel(resolution)
  const display = resolution?.display || null

  if (display?.primaryActionLabel) {
    return display.primaryActionLabel
  }

  if (action.type === 'reassign' && targetName) {
    return `Send ${targetName}`
  }

  if (action.type === 'delay') {
    if (action.dueDate) {
      return `Delay to ${formatTime(action.dueDate)}`
    }
    return `Delay ${projectLabel}`
  }

  if (action.type === 'manual_review') {
    return 'Review needed - manual action required'
  }

  return confidence ? `Confirm next step (${confidence}%)` : 'Confirm next step'
}

export default function DecisionSheet({ phase, resolution, heroResult, onConfirm, onReplay, onCancel }) {
  const [showAlt, setShowAlt] = useState(false)

  useEffect(() => {
    setShowAlt(false)
  }, [resolution])

  const isVisible = phase === 'ready' || phase === 'confirmed'
  const isConfirmed = phase === 'confirmed'
  const isManualReview = resolution?.recommendedAction?.type === 'manual_review'
  const risk = resolution?.cascadeRisk?.severity || 'low'
  const confidence = Math.round((resolution?.confidence || 0) * 100)
  const isAI = resolution?.mode === 'ai'
  const displayMode = getDisplayMode(resolution)
  const altText = buildAltText(resolution)
  const heroSynced = heroResult?.heroSync && !heroResult.heroSync.skipped && !heroResult.heroSync.error
  const heroTaskId = resolution?.matchedTask?.hero_task_id || resolution?.matchedTask?.display_id
  const primaryReason = buildReason(resolution)
  const riskNote = buildRiskNote(resolution)
  const isActionable = displayMode === 'action' && !isManualReview
  const reasonLabel = getReasonLabel(resolution)
  const riskLabel = getRiskLabel(resolution)

  return (
    <div className="sheet" role="dialog" aria-label="Dispatch decision" aria-hidden={!isVisible}>
      <div className="sheet-handle" />
      <div className="sheet-body">
        <div className="sheet-toprow">
          <span className={`mode-badge ${isAI ? 'ai' : 'offline'}`}>
            {getModeBadgeText(resolution, isAI)}
          </span>
          <span className={`risk-chip ${risk}`}>{risk} risk</span>
        </div>

        {isConfirmed ? (
          <>
            <div className="hero-confirm-card">
              <div className="hero-confirm-eyebrow">
                {heroSynced ? 'Confirmed in HERO' : 'Confirmed locally'}
              </div>
              <div className="hero-confirm-title">{buildHeadline(resolution)}</div>
              {heroTaskId && (
                <div className="hero-confirm-ref">
                  Task #{heroTaskId}
                  {heroSynced ? ' · synced to HERO' : ''}
                </div>
              )}
            </div>
            <div className="sheet-actions">
              <button className="new-call-btn" onClick={onCancel}>New call</button>
            </div>
          </>
        ) : (
          <>
            <h2 className="decision-headline">{buildHeadline(resolution)}</h2>

            {buildSubline(resolution) && (
              <p className="decision-subline">{buildSubline(resolution)}</p>
            )}

            {primaryReason && (
              <div className="decision-block">
                <div className="decision-label">{reasonLabel}</div>
                <p className="decision-why">{primaryReason}</p>
              </div>
            )}

            {riskNote && (
              <div className="decision-block decision-block-muted">
                <div className="decision-label">{riskLabel}</div>
                <p className="decision-residual">{riskNote}</p>
              </div>
            )}

            {showAlt && altText && (
              <div className="alt-card">
                <div className="alt-label">Alternative</div>
                <p className="alt-text">{altText}</p>
                <button
                  className="alt-use-btn"
                  onClick={() => {
                    setShowAlt(false)
                    if (resolution?.fallbackRecommendation) onCancel()
                  }}
                >
                  Re-record with this context
                </button>
              </div>
            )}

            {showAlt && !altText && (
              <div className="alt-card">
                <div className="alt-label">Running in offline mode</div>
                <p className="alt-text">The AI engine was unavailable. This recommendation came from the built-in rules engine.</p>
              </div>
            )}

            <div className="sheet-actions">
              {isActionable && (
                <button className="confirm-btn" onClick={onConfirm}>
                  {buildConfirmLabel(resolution, confidence)}
                </button>
              )}
              <div className="sheet-secondary">
                <button className="secondary-btn" onClick={onReplay}>Replay</button>
                <button className="secondary-btn" onClick={() => setShowAlt(v => !v)}>
                  {showAlt ? 'Hide alt' : 'Not right?'}
                </button>
                <button className="secondary-btn" onClick={onCancel}>Cancel</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
