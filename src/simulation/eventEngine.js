/**
 * FlowCare AI — Event Engine Coordinator
 * 
 * Orchestrates:
 * 1. Modular Event Stream Ingestion (Simulated HIS/LIS/RIS)
 * 2. Workflow State Transitions (workflowEngine.js)
 * 3. Deterministic Bottleneck Detection (bottleneckDetector.js)
 * 4. Staging New Bottlenecks for AI Investigation (investigationStatus: PENDING)
 */

import { pollScheduledEvents, formatSimulatedTime } from './eventStream';
import { applyEventToWorkflow, tickWorkflowTime } from './workflowEngine';
import { runBottleneckDetection } from './bottleneckDetector';

let tickEventCounter = 2000;

export function processSimulationTick(workflows, simulatedMinutes) {
  const newEvents = [];
  let resolvedDelta = 0;
  const currentFormattedTime = formatSimulatedTime(simulatedMinutes);

  // STEP 1: Ingest newly arriving events from the Simulated HIS/LIS/RIS Event Stream
  const incomingStreamEvents = pollScheduledEvents(simulatedMinutes);

  let currentWorkflows = workflows.map((wf) => {
    // Check if any incoming event targets this patient
    const matchingEvent = incomingStreamEvents.find((evt) => evt.patientId === wf.patientId);
    if (matchingEvent) {
      tickEventCounter += 1;
      newEvents.push({
        id: `sim-evt-${tickEventCounter}`,
        type: 'received',
        title: `Event received: ${matchingEvent.eventType} for ${matchingEvent.patientId}`,
        description: matchingEvent.details || `Telemetry received from ${matchingEvent.department}. Stage: ${matchingEvent.stage}.`,
        patientId: matchingEvent.patientId,
        stage: matchingEvent.stage,
        timestamp: currentFormattedTime,
        agent: 'HIS/LIS Event Listener',
        severity: 'neutral'
      });

      // If workflow just completed
      if (matchingEvent.eventType === 'DOCTOR_REVIEW_COMPLETED') {
        resolvedDelta += 1;
        tickEventCounter += 1;
        newEvents.push({
          id: `sim-evt-${tickEventCounter}`,
          type: 'resumed',
          title: `Workflow completed: ${matchingEvent.patientId} sign-off finished`,
          description: `All operational diagnostic stages completed for ${matchingEvent.patientId}.`,
          patientId: matchingEvent.patientId,
          stage: 'Doctor Review',
          timestamp: currentFormattedTime,
          agent: 'Workflow Monitor',
          severity: 'success'
        });
      }

      return applyEventToWorkflow(wf, matchingEvent);
    }

    return wf;
  });

  // STEP 2: Advance workflow clock by 1 simulated minute
  currentWorkflows = currentWorkflows.map((wf) => tickWorkflowTime(wf, 1));

  // STEP 3: Run Deterministic Bottleneck Detection against Configurable Operational Rules
  const { updatedWorkflows, newAlertEvents } = runBottleneckDetection(currentWorkflows, currentFormattedTime);

  if (newAlertEvents.length > 0) {
    newEvents.push(...newAlertEvents);
  }

  // STEP 4: Stage any newly transitioned Bottlenecks for AI Investigation (Single Trigger Guard)
  const workflowsWithPendingInvestigations = updatedWorkflows.map((wf) => {
    if (wf.status === 'Bottleneck' && (!wf.investigationStatus || wf.investigationStatus === 'IDLE') && !wf.activeInvestigation) {
      return {
        ...wf,
        investigationStatus: 'PENDING'
      };
    }
    return wf;
  });

  return {
    updatedWorkflows: workflowsWithPendingInvestigations,
    newEvents,
    resolvedDelta
  };
}
