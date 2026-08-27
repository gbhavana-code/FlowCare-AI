/**
 * FlowCare AI — Deterministic Bottleneck Detection Module
 * 
 * CORE RESPONSIBILITY:
 * Evaluates active hospital workflows against configured operational rules:
 * 1. Expected next event
 * 2. Actual workflow state & elapsed duration
 * 3. Latest event timestamp
 * 4. Configurable demo operational SLA thresholds
 * 
 * Emits state transitions (ON_TRACK -> AT_RISK -> BOTTLENECK) and ensures
 * EXACTLY ONE alert event is generated per transition.
 */

let alertCounter = 500;

export function generateAlertId() {
  alertCounter += 1;
  return `alert-evt-${alertCounter}`;
}

/**
 * Evaluates the status of a single workflow state against configured thresholds
 * 
 * Rules:
 * - If elapsedMinutes >= warningThresholdMinutes -> BOTTLENECK
 * - Else if elapsedMinutes >= targetMinutes -> AT_RISK
 * - Otherwise -> ON_TRACK
 */
export function evaluateWorkflowStatus(workflow) {
  if (workflow.isResolved) {
    return {
      status: 'On Track',
      reason: 'Workflow completed successfully.',
      severity: 'success'
    };
  }

  const { elapsedMinutes, targetMinutes, warningThresholdMinutes, expectedNextEvent, currentStage, patientId } = workflow;

  if (elapsedMinutes >= warningThresholdMinutes) {
    return {
      status: 'Bottleneck',
      reason: `${patientId} in ${currentStage} has elapsed ${elapsedMinutes}m (exceeded operational warning limit of ${warningThresholdMinutes}m). Expected next event '${expectedNextEvent}' has not arrived.`,
      severity: 'danger'
    };
  }

  if (elapsedMinutes >= targetMinutes) {
    return {
      status: 'At Risk',
      reason: `${patientId} in ${currentStage} has elapsed ${elapsedMinutes}m (reached operational target SLA of ${targetMinutes}m). Awaiting '${expectedNextEvent}'.`,
      severity: 'warning'
    };
  }

  return {
    status: 'On Track',
    reason: `${patientId} within target operational threshold (${elapsedMinutes}m / ${targetMinutes}m).`,
    severity: 'neutral'
  };
}

/**
 * Runs bottleneck detection across all workflows, updates workflow status,
 * and generates single-emission coordinator alert events for new threshold breaches.
 */
export function runBottleneckDetection(workflows, currentSimulatedTime = 'just now') {
  const newAlertEvents = [];

  const updatedWorkflows = workflows.map((wf) => {
    if (wf.isResolved) {
      return wf;
    }

    const evaluation = evaluateWorkflowStatus(wf);
    const updatedAlertedStates = { ...(wf.alertedStates || { atRisk: false, bottleneck: false }) };

    // Check for transition into AT_RISK (Generate exactly ONE warning event)
    if (evaluation.status === 'At Risk' && !updatedAlertedStates.atRisk) {
      updatedAlertedStates.atRisk = true;
      newAlertEvents.push({
        id: generateAlertId(),
        type: 'analysis',
        title: `Operational SLA reached: ${wf.patientId} ${wf.currentStage}`,
        description: `Elapsed ${wf.elapsedMinutes}m in ${wf.currentStage} (Target: ${wf.targetMinutes}m). Awaiting event '${wf.expectedNextEvent}'.`,
        patientId: wf.patientId,
        stage: wf.currentStage,
        timestamp: currentSimulatedTime,
        agent: 'Workflow State Engine',
        severity: 'warning'
      });
    }

    // Check for transition into BOTTLENECK (Generate exactly ONE bottleneck event)
    if (evaluation.status === 'Bottleneck' && !updatedAlertedStates.bottleneck) {
      updatedAlertedStates.bottleneck = true;
      newAlertEvents.push({
        id: generateAlertId(),
        type: 'bottleneck',
        title: `Bottleneck detected: ${wf.patientId} ${wf.currentStage} exceeded operational threshold`,
        description: `Critical operational delay: ${wf.elapsedMinutes}m elapsed in ${wf.currentStage} without '${wf.expectedNextEvent}' (Warning limit: ${wf.warningThresholdMinutes}m).`,
        patientId: wf.patientId,
        stage: wf.currentStage,
        timestamp: currentSimulatedTime,
        agent: 'Bottleneck Detection Engine',
        severity: 'danger'
      });
    }

    return {
      ...wf,
      status: evaluation.status,
      alertedStates: updatedAlertedStates
    };
  });

  return {
    updatedWorkflows,
    newAlertEvents
  };
}
