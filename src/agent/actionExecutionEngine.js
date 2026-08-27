/**
 * FlowCare AI — Modular Action Execution Engine
 * 
 * ARCHITECTURAL PRINCIPLE:
 * ============================================================================
 * FlowCare AI is an operational orchestration layer.
 * When a hospital operations coordinator authorizes an AI-recommended action,
 * this engine dispatches the operational directive and produces the corresponding
 * simulated hospital workflow events (which would come from HIS/LIS/RIS or logistics
 * in production).
 * 
 * It NEVER alters clinical treatments or bypasses the workflow engine.
 * ============================================================================
 */

import { generateEventId, EVENT_TYPES } from '../simulation/eventStream';

let actionIdCounter = 100;

export function generateActionId() {
  actionIdCounter += 1;
  return `ACT-${actionIdCounter}`;
}

/**
 * Maps approved operational actions to simulated downstream hospital events.
 * 
 * Supported Action IDs:
 * - ASSIGN_COLLECTION_STAFF: Phlebotomy staff assigned -> Specimen collection completed (SAMPLE_COLLECTED)
 * - DISPATCH_RUNNER: Dedicated priority courier dispatched -> Sample delivered to lab (SAMPLE_RECEIVED)
 * - REROUTE_SECONDARY_BAY: Specimen routed to secondary analyzer -> Processing completed (RESULT_READY)
 * - PRIORITIZE_REVIEW: Review packet prioritized for attending -> Review started & completed (DOCTOR_REVIEW_STARTED / DOCTOR_REVIEW_COMPLETED)
 * - Fallback / Generic: Maps based on current stage
 */
export function executeOperationalAction({
  patientId,
  workflow,
  bottleneckId,
  action,
  timestamp = 'just now'
}) {
  if (!patientId || !workflow) {
    return {
      success: false,
      error: 'Missing patient or workflow context for operational action dispatch.'
    };
  }

  const actionId = generateActionId();
  const actionKey = (action?.id || action || '').toString().toUpperCase();
  const currentStage = workflow.currentStage;
  const workflowType = workflow.workflowType || 'CBC';
  const department = workflow.department || 'Diagnostics';

  const emittedEvents = [];
  let actionDescription = action?.description || 'Operational action dispatched';
  let targetNextStage = currentStage;

  // 1. Phlebotomy & Sample Collection Backlog Resolution
  if (actionKey === 'ASSIGN_COLLECTION_STAFF' || currentStage === 'Sample Collection') {
    actionDescription = action?.description || 'Assign available collection staff to the pending collection queue.';
    targetNextStage = 'Sample Transport';
    
    // Generates the event that resolves the collection stall
    emittedEvents.push({
      eventId: generateEventId(),
      patientId,
      workflowType,
      eventType: EVENT_TYPES.SAMPLE_COLLECTED,
      timestamp,
      department,
      stage: 'Sample Transport',
      details: `Specimen collected by newly assigned phlebotomist. Barcode scanned and queued for transit.`
    });
  }
  // 2. Logistics Transit Delay Resolution
  else if (actionKey === 'DISPATCH_RUNNER' || actionKey === 'REROUTE_LOGISTICS_PATH' || currentStage === 'Sample Transport') {
    actionDescription = action?.description || 'Dispatch dedicated priority runner for immediate specimen transit.';
    targetNextStage = 'Lab Processing';

    emittedEvents.push({
      eventId: generateEventId(),
      patientId,
      workflowType,
      eventType: EVENT_TYPES.SAMPLE_RECEIVED,
      timestamp,
      department,
      stage: 'Lab Processing',
      details: `Specimen delivered directly to lab receiving bench via dedicated runner. Logged into analyzer queue.`
    });
  }
  // 3. Analyzer Processing Congestion Resolution
  else if (actionKey === 'REROUTE_SECONDARY_BAY' || actionKey === 'PRIORITIZE_SPECIMEN_RUN' || currentStage === 'Lab Processing') {
    actionDescription = action?.description || 'Reroute urgent specimen batch to Secondary Analyzer Bay B.';
    targetNextStage = 'Result Ready';

    emittedEvents.push({
      eventId: generateEventId(),
      patientId,
      workflowType,
      eventType: EVENT_TYPES.RESULT_READY,
      timestamp,
      department,
      stage: 'Result Ready',
      details: `Specimen completed run on Secondary Analyzer Bay B. Diagnostic telemetry published to LIS.`
    });
  }
  // 4. Review Sign-off Backlog Resolution
  else if (actionKey === 'PRIORITIZE_REVIEW' || actionKey === 'ESCALATE_COORDINATOR' || currentStage === 'Result Ready' || currentStage === 'Doctor Review') {
    actionDescription = action?.description || 'Prioritize the pending review packet for attending physician.';
    targetNextStage = 'Completed';

    emittedEvents.push({
      eventId: generateEventId(),
      patientId,
      workflowType,
      eventType: EVENT_TYPES.DOCTOR_REVIEW_STARTED,
      timestamp,
      department,
      stage: 'Doctor Review',
      details: `Physician opened prioritized review packet in clinical viewer.`
    });

    emittedEvents.push({
      eventId: generateEventId(),
      patientId,
      workflowType,
      eventType: EVENT_TYPES.DOCTOR_REVIEW_COMPLETED,
      timestamp,
      department,
      stage: 'Completed',
      details: `Physician completed electronic sign-off. Report finalized and transmitted to EHR.`
    });
  }
  // Generic Fallback
  else {
    actionDescription = action?.description || 'Execute coordinator operational directive.';
    emittedEvents.push({
      eventId: generateEventId(),
      patientId,
      workflowType,
      eventType: workflow.expectedNextEvent || 'OPERATIONAL_STEP_COMPLETED',
      timestamp,
      department,
      stage: currentStage,
      details: `Operational action applied. Awaiting next diagnostic lifecycle event.`
    });
  }

  return {
    success: true,
    actionId,
    bottleneckId,
    patientId,
    actionKey,
    actionDescription,
    targetNextStage,
    emittedEvents
  };
}
