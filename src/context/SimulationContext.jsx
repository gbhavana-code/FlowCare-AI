import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { getInitialWorkflows, getInitialAgentEvents } from '../simulation/initialWorkflows';
import { processSimulationTick } from '../simulation/eventEngine';
import { runAgentInvestigation } from '../agent/investigationEngine';
import { resetDeduplicationState } from '../agent/aiAgentService';
import { formatSimulatedTime } from '../simulation/eventStream';
import { executeOperationalAction } from '../agent/actionExecutionEngine';
import { verifyWorkflowResolution } from '../agent/resolutionVerifier';
import { applyEventToWorkflow } from '../simulation/workflowEngine';

const SimulationContext = createContext(null);

export function SimulationProvider({ children }) {
  const [workflows, setWorkflows] = useState(getInitialWorkflows);
  const [events, setEvents] = useState(getInitialAgentEvents);
  const [isRunning, setIsRunning] = useState(true);
  const [simulatedMinutes, setSimulatedMinutes] = useState(0);
  const [resolvedCount, setResolvedCount] = useState(34); // Starting baseline of resolved cases today
  const investigatingRef = useRef(new Set());
  const resolvedBottleneckIdsRef = useRef(new Set());

  // Reset simulation to initial baseline state
  const resetSimulation = useCallback(() => {
    investigatingRef.current.clear();
    resolvedBottleneckIdsRef.current.clear();
    resetDeduplicationState();        // clear the module-level dedup set & pending queue
    setWorkflows(getInitialWorkflows());
    setEvents(getInitialAgentEvents());
    setSimulatedMinutes(0);
    setResolvedCount(34);
    setIsRunning(true);
  }, []);

  // Toggle pause / play for demo control
  const toggleSimulation = useCallback(() => {
    setIsRunning((prev) => !prev);
  }, []);

  // Action Authorization & Resolution Execution Loop
  const approveAndExecuteAction = useCallback((patientId, actionToApprove) => {
    const currentFormattedTime = formatSimulatedTime(simulatedMinutes);

    setWorkflows((prevWorkflows) => {
      const targetWorkflow = prevWorkflows.find((w) => w.patientId === patientId);
      if (!targetWorkflow) {
        console.warn(`[FlowCare AI] Workflow for patient ${patientId} not found.`);
        return prevWorkflows;
      }

      const activeInvestigation = targetWorkflow.activeInvestigation;
      const approvedAction = actionToApprove || activeInvestigation?.recommendedAction;
      const actionDesc = approvedAction?.description || approvedAction?.id || 'Operational Directive';
      const actionKey = approvedAction?.id || 'APPROVED_ACTION';

      // 1. Stage Activity: Human Approval Authorized
      const approvalEvent = {
        id: `evt-approval-${Date.now()}-${patientId}`,
        type: 'approval',
        title: `Coordinator authorized: ${actionKey}`,
        description: `Human Operations Coordinator approved: "${actionDesc}" for ${patientId}. Dispatching operational directive.`,
        patientId,
        stage: targetWorkflow.currentStage,
        timestamp: currentFormattedTime,
        agent: 'Hospital Operations Coordinator',
        severity: 'warning'
      };

      // 2. Dispatch via Action Execution Engine
      const executionResult = executeOperationalAction({
        patientId,
        workflow: targetWorkflow,
        bottleneckId: activeInvestigation?.bottleneckId || `BN-${patientId}`,
        action: approvedAction,
        timestamp: currentFormattedTime
      });

      if (!executionResult.success) {
        const failureEvent = {
          id: `evt-fail-${Date.now()}-${patientId}`,
          type: 'bottleneck',
          title: `Action execution failed for ${patientId}`,
          description: executionResult.error || 'Failed to dispatch operational directive.',
          patientId,
          stage: targetWorkflow.currentStage,
          timestamp: currentFormattedTime,
          agent: 'Action Dispatch Engine',
          severity: 'danger'
        };
        setEvents((prev) => [failureEvent, approvalEvent, ...prev].slice(0, 40));
        return prevWorkflows;
      }

      // 3. Stage Activity: Action Dispatched
      const dispatchEvent = {
        id: `evt-dispatch-${Date.now()}-${patientId}`,
        type: 'resumed',
        title: `Action dispatched: ${executionResult.actionKey}`,
        description: `${executionResult.actionDescription} Directing downstream operational telemetry.`,
        patientId,
        stage: targetWorkflow.currentStage,
        timestamp: currentFormattedTime,
        agent: 'Action Dispatch Engine',
        severity: 'neutral'
      };

      // 4. Ingest and Apply Emitted Downstream Events through Workflow Engine
      let stateAfterEvents = { ...targetWorkflow };
      const simulatedTelemetryEvents = [];

      for (const streamEvent of executionResult.emittedEvents) {
        simulatedTelemetryEvents.push({
          id: `evt-telemetry-${Date.now()}-${streamEvent.eventId}`,
          type: 'received',
          title: `Event received: ${streamEvent.eventType} for ${patientId}`,
          description: streamEvent.details,
          patientId,
          stage: streamEvent.stage,
          timestamp: streamEvent.timestamp,
          agent: 'Simulated Stream Listener',
          severity: 'neutral'
        });

        stateAfterEvents = applyEventToWorkflow(stateAfterEvents, streamEvent);
      }

      // 5. Verification Phase via Resolution Verifier
      const verification = verifyWorkflowResolution(targetWorkflow, stateAfterEvents, executionResult);

      if (verification.isVerified) {
        // Clear bottleneck and set recovery status
        const verifiedWorkflow = {
          ...stateAfterEvents,
          status: verification.status === 'Completed' ? 'On Track' : 'On Track',
          isBlocked: false,
          investigationStatus: 'RESOLVED',
          activeInvestigation: null,
          alertedStates: {
            atRisk: false,
            bottleneck: false
          }
        };

        // Increment Resolved Today metric exactly once per workflow
        if (!resolvedBottleneckIdsRef.current.has(patientId)) {
          resolvedBottleneckIdsRef.current.add(patientId);
          setResolvedCount((prev) => prev + 1);
        }

        // 6. Log Resolution Verified Event
        const resolutionEvent = {
          id: `evt-res-${Date.now()}-${patientId}`,
          type: 'resumed',
          title: `Resolution verified: ${patientId} bottleneck cleared`,
          description: verification.recoveryDetails,
          patientId,
          stage: verifiedWorkflow.currentStage,
          timestamp: currentFormattedTime,
          agent: 'Resolution Verifier',
          severity: 'success'
        };

        setEvents((prev) => [
          resolutionEvent,
          ...simulatedTelemetryEvents.reverse(),
          dispatchEvent,
          approvalEvent,
          ...prev
        ].slice(0, 40));

        return prevWorkflows.map((item) =>
          item.patientId === patientId ? verifiedWorkflow : item
        );
      } else {
        // Resolution not yet verified: maintain state and log monitoring alert
        const monitoringEvent = {
          id: `evt-mon-${Date.now()}-${patientId}`,
          type: 'analysis',
          title: `Monitoring recovery: ${patientId}`,
          description: verification.reason,
          patientId,
          stage: targetWorkflow.currentStage,
          timestamp: currentFormattedTime,
          agent: 'Resolution Verifier',
          severity: 'warning'
        };

        setEvents((prev) => [
          monitoringEvent,
          ...simulatedTelemetryEvents.reverse(),
          dispatchEvent,
          approvalEvent,
          ...prev
        ].slice(0, 40));

        return prevWorkflows.map((item) =>
          item.patientId === patientId ? stateAfterEvents : item
        );
      }
    });
  }, [simulatedMinutes]);

  // Simulation Clock Tick Effect (1 real second = 1 simulated minute)
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSimulatedMinutes((prevMinutes) => {
        const nextMinutes = prevMinutes + 1;

        setWorkflows((currentWorkflows) => {
          const { updatedWorkflows, newEvents, resolvedDelta } = processSimulationTick(currentWorkflows, nextMinutes);

          if (resolvedDelta > 0) {
            setResolvedCount((prev) => prev + resolvedDelta);
          }

          if (newEvents.length > 0) {
            setEvents((prevEvents) => [...newEvents, ...prevEvents].slice(0, 40));
          }

          return updatedWorkflows;
        });

        return nextMinutes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Asynchronous AI Investigation Dispatch Effect
  // Collects PENDING workflows and dispatches them sequentially (one at a time)
  // through the serialized queue in aiAgentService.  The investigatingRef guard
  // prevents the same patient from being dispatched twice even if this effect
  // re-runs due to state updates.
  useEffect(() => {
    const pendingWorkflows = workflows.filter(
      (w) => w.investigationStatus === 'PENDING' && !investigatingRef.current.has(w.patientId)
    );

    if (pendingWorkflows.length === 0) return;

    // Immediately mark ALL pending patients in the ref so subsequent effect
    // invocations (triggered by the setWorkflows below) won't re-dispatch them.
    for (const wf of pendingWorkflows) {
      investigatingRef.current.add(wf.patientId);
    }

    // Batch-set all of them to INVESTIGATING in a single state update to
    // minimise re-renders (one update instead of N).
    setWorkflows((prevWorkflows) => {
      const pendingIds = new Set(pendingWorkflows.map((w) => w.patientId));
      return prevWorkflows.map((item) =>
        pendingIds.has(item.patientId)
          ? { ...item, investigationStatus: 'INVESTIGATING' }
          : item
      );
    });

    // Dispatch each investigation.  The calls enter the serial queue inside
    // aiAgentService and are executed one-at-a-time with a cooldown gap.
    // We do NOT await them sequentially here — the queue handles ordering.
    const currentTime = formatSimulatedTime(simulatedMinutes);

    for (const wf of pendingWorkflows) {
      runAgentInvestigation(wf, currentTime)
        .then((investigationResult) => {
          setWorkflows((prevWorkflows) =>
            prevWorkflows.map((item) =>
              item.patientId === wf.patientId
                ? {
                    ...item,
                    investigationStatus: 'COMPLETED',
                    activeInvestigation: investigationResult
                  }
                : item
            )
          );

          // Append structured AI investigation recommendation to the activity feed
          setEvents((prevEvents) => [
            {
              id: `agent-rec-${Date.now()}-${wf.patientId}`,
              type: 'recommendation',
              title: `AI Investigation: ${wf.patientId} · ${wf.workflowType} · ${wf.currentStage}`,
              description: `Likely cause: ${investigationResult.likelyCause}. Recommended action: ${investigationResult.recommendedAction.description}`,
              patientId: wf.patientId,
              stage: wf.currentStage,
              timestamp: currentTime,
              agent: investigationResult.source === 'AI_AGENT' ? 'FlowCare AI Agent' : 'Operational Reasoning Agent',
              severity: 'warning',
              investigation: investigationResult
            },
            ...prevEvents
          ].slice(0, 40));
        })
        .catch((err) => {
          console.error('[FlowCare AI] Investigation error:', err);
          setWorkflows((prevWorkflows) =>
            prevWorkflows.map((item) =>
              item.patientId === wf.patientId
                ? { ...item, investigationStatus: 'FAILED' }
                : item
            )
          );
        });
    }
  }, [workflows, simulatedMinutes]);

  // Derived KPI metrics calculated directly from active workflow states
  const atRiskCount = workflows.filter((w) => w.status === 'At Risk' && !w.isResolved).length;
  const bottleneckCount = workflows.filter((w) => w.status === 'Bottleneck' && !w.isResolved).length;

  const kpis = {
    networkWorkflows: {
      title: 'Network Workflows',
      value: 142,
      subtext: 'Simulated hospital-wide streams',
      badgeText: '142 Active in Stream',
      trend: 'neutral',
      description: 'Total active workflows monitored across simulated HIS/LIS/RIS event streams'
    },
    atRisk: {
      title: 'At Risk',
      value: atRiskCount,
      subtext: atRiskCount > 0 ? `${atRiskCount} Near Target SLA` : 'All within SLA',
      badgeText: `${atRiskCount} Flagged At Risk`,
      trend: 'warning',
      description: 'Workflows nearing target turnaround time limits in simulated queue'
    },
    bottlenecks: {
      title: 'Bottlenecks',
      value: bottleneckCount,
      subtext: bottleneckCount > 0 ? 'Requires coordinator action' : 'No active stalls',
      badgeText: `${bottleneckCount} Stalls Active`,
      trend: 'danger',
      description: 'Active stalls identified by deterministic bottleneck detection rules'
    },
    resolvedToday: {
      title: 'Resolved Today',
      value: resolvedCount,
      subtext: 'Completed workflows today',
      badgeText: `${resolvedCount} Resolved Today`,
      trend: 'positive',
      description: 'Diagnostic workflows successfully completed and signed off'
    }
  };

  const value = {
    workflows,
    events,
    isRunning,
    simulatedMinutes,
    kpis,
    toggleSimulation,
    resetSimulation,
    approveAndExecuteAction
  };

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

