/**
 * FlowCare AI — Workflow State Engine
 * 
 * Responsibilities:
 * 1. Ingests normalized hospital workflow events (from simulated or real streams).
 * 2. Updates workflow state machine:
 *    - Current Stage & Previous Stage
 *    - Expected Next Event
 *    - Timestamps & Elapsed Time
 *    - Workflow Configuration (SLA target & warning thresholds)
 *    - Comprehensive Event Trace History
 *    - AI Investigation Lifecycle (IDLE | PENDING | INVESTIGATING | COMPLETED | FAILED)
 * 3. Advances time deterministically across all active workflows.
 */

import { getStageConfig, EVENT_TO_STAGE_MAP, ORDERED_STAGES } from './workflowConfig';

/**
 * Creates an initial workflow state object
 */
export function createWorkflowState({
  patientId,
  workflowType,
  workflowTitle,
  department,
  initialStage = 'Test Ordered',
  initialElapsedMinutes = 0,
  stageStartedTimestamp = '10:00',
  priority = 'Standard',
  eventHistory = [],
  isBlocked = false
}) {
  const config = getStageConfig(workflowType, initialStage);

  return {
    patientId,
    workflowType,
    workflowTitle: workflowTitle || config.workflowName,
    department: department || config.department,
    currentStage: initialStage,
    previousStage: null,
    expectedNextEvent: config.expectedNextEvent,
    stageStartedTimestamp,
    elapsedMinutes: initialElapsedMinutes,
    targetMinutes: config.targetMinutes,
    warningThresholdMinutes: config.warningThresholdMinutes,
    expectedDurationMinutes: config.targetMinutes, // for backward-compatible table UI
    priority,
    status: 'On Track', // 'On Track' | 'At Risk' | 'Bottleneck'
    isBlocked,
    isResolved: initialStage === 'Completed',
    alertedStates: {
      atRisk: false,
      bottleneck: false
    },
    investigationStatus: 'IDLE', // 'IDLE' | 'PENDING' | 'INVESTIGATING' | 'COMPLETED' | 'FAILED'
    activeInvestigation: null,
    eventHistory: eventHistory.length > 0 ? eventHistory : [
      {
        eventId: 'EVT-INIT',
        type: 'initial',
        stage: initialStage,
        timestamp: stageStartedTimestamp,
        message: `Workflow initiated at stage: ${initialStage}`
      }
    ]
  };
}

/**
 * Applies a newly received hospital event to the corresponding workflow state
 */
export function applyEventToWorkflow(workflow, event) {
  if (workflow.patientId !== event.patientId) {
    return workflow;
  }

  const newStage = EVENT_TO_STAGE_MAP[event.eventType] || event.stage || workflow.currentStage;
  const isCompleted = newStage === 'Completed' || event.eventType === 'DOCTOR_REVIEW_COMPLETED';
  const config = getStageConfig(workflow.workflowType, newStage);

  const historyEntry = {
    eventId: event.eventId,
    eventType: event.eventType,
    stage: newStage,
    timestamp: event.timestamp || 'just now',
    message: event.details || `Event ${event.eventType} received for ${event.patientId}`
  };

  return {
    ...workflow,
    previousStage: workflow.currentStage,
    currentStage: isCompleted ? 'Doctor Review' : newStage,
    expectedNextEvent: isCompleted ? 'NONE' : config.expectedNextEvent,
    stageStartedTimestamp: event.timestamp || workflow.stageStartedTimestamp,
    elapsedMinutes: 0, // Reset elapsed time for the newly entered stage
    targetMinutes: config.targetMinutes,
    warningThresholdMinutes: config.warningThresholdMinutes,
    expectedDurationMinutes: config.targetMinutes,
    status: 'On Track',
    isResolved: isCompleted,
    alertedStates: {
      atRisk: false,
      bottleneck: false
    },
    investigationStatus: 'IDLE',
    activeInvestigation: null,
    eventHistory: [historyEntry, ...workflow.eventHistory]
  };
}

/**
 * Advances the elapsed time for an active workflow by deltaMinutes
 */
export function tickWorkflowTime(workflow, deltaMinutes = 1) {
  if (workflow.isResolved) {
    return workflow;
  }

  return {
    ...workflow,
    elapsedMinutes: workflow.elapsedMinutes + deltaMinutes
  };
}
