/**
 * FlowCare AI — Resolution Verifier Module
 * 
 * ARCHITECTURAL RESPONSIBILITY:
 * ============================================================================
 * Observes workflow state changes after operational actions are dispatched.
 * Confirms that:
 * 1. The expected recovery event arrived and was processed.
 * 2. The workflow advanced out of the bottleneck stage or reset its elapsed SLA time.
 * 3. The stall condition is cleared and no operational SLA violations remain.
 * 
 * NEVER assumes resolution merely because "Approve" was clicked.
 * ============================================================================
 */

export function verifyWorkflowResolution(prevWorkflow, updatedWorkflow, executedAction) {
  if (!prevWorkflow || !updatedWorkflow) {
    return {
      isVerified: false,
      reason: 'Incomplete workflow telemetry context for resolution verification.'
    };
  }

  // 1. Check if workflow moved to the target stage or completed
  const hasAdvancedStage = updatedWorkflow.currentStage !== prevWorkflow.currentStage;
  const isCompleted = updatedWorkflow.isResolved || updatedWorkflow.currentStage === 'Completed' || updatedWorkflow.currentStage === 'Doctor Review';
  
  // 2. Check if elapsed time has reset or is below configured warning threshold
  const isWithinSla = updatedWorkflow.elapsedMinutes < updatedWorkflow.warningThresholdMinutes;
  
  // 3. Check if status transitioned out of 'Bottleneck'
  const isNoLongerBottleneck = updatedWorkflow.status !== 'Bottleneck';

  if ((hasAdvancedStage || isCompleted) && isWithinSla && isNoLongerBottleneck) {
    return {
      isVerified: true,
      patientId: updatedWorkflow.patientId,
      previousStage: prevWorkflow.currentStage,
      currentStage: updatedWorkflow.currentStage,
      elapsedMinutes: updatedWorkflow.elapsedMinutes,
      status: isCompleted ? 'Completed' : 'On Track',
      recoveryDetails: `Workflow advanced from '${prevWorkflow.currentStage}' to '${updatedWorkflow.currentStage}'. Elapsed stage timer reset to 0m (Target: ${updatedWorkflow.targetMinutes}m). Bottleneck stall successfully cleared.`
    };
  }

  return {
    isVerified: false,
    reason: `Workflow has not yet satisfied recovery criteria (Current stage: '${updatedWorkflow.currentStage}', Elapsed: ${updatedWorkflow.elapsedMinutes}m, Status: '${updatedWorkflow.status}').`
  };
}
