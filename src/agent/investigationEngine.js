/**
 * FlowCare AI — Agentic Investigation Engine & Context Builder
 * 
 * PRODUCT & SAFETY BOUNDARIES:
 * FlowCare AI is strictly an OPERATIONAL orchestration layer for hospital operations coordinators.
 * It analyzes workflow bottlenecks and generates operational coordination options.
 * It DOES NOT provide medical diagnosis or alter clinical treatments.
 */

import { queryAIAgent } from './aiAgentService';

let investigationIdCounter = 100;

export function generateInvestigationId() {
  investigationIdCounter += 1;
  return `INV-${investigationIdCounter}`;
}

/**
 * Departmental Operational Capacity and Telemetry Snapshots
 */
export const SYNTHETIC_DEPARTMENT_RESOURCES = {
  'Hematology Lab': {
    pendingWorkCount: 8,
    availableOperationalResources: 1,
    queueName: 'Ward 3 Phlebotomy Queue',
    recentVolume: 'High (+45% above baseline)'
  },
  'Biochemistry Lab': {
    pendingWorkCount: 6,
    availableOperationalResources: 2,
    queueName: 'Central Biochemistry Intake',
    recentVolume: 'Normal'
  },
  'Diagnostic Radiology': {
    pendingWorkCount: 5,
    availableOperationalResources: 2,
    queueName: '3T MRI Suite Prep Bay',
    recentVolume: 'Moderate'
  },
  'Emergency Imaging': {
    pendingWorkCount: 3,
    availableOperationalResources: 3,
    queueName: 'Trauma CT Scanner Bay',
    recentVolume: 'High'
  },
  'Surgical Pathology': {
    pendingWorkCount: 7,
    availableOperationalResources: 1,
    queueName: 'Histology Sectioning Station',
    recentVolume: 'High'
  },
  'Cardiology Diagnostics': {
    pendingWorkCount: 4,
    availableOperationalResources: 2,
    queueName: 'Echocardiogram Review Pool',
    recentVolume: 'Normal'
  }
};

/**
 * Builds the strict structured BottleneckContext object required by the AI Agent
 */
export function buildBottleneckContext(workflow, timestamp = 'just now') {
  const deptResources = SYNTHETIC_DEPARTMENT_RESOURCES[workflow.department] || SYNTHETIC_DEPARTMENT_RESOURCES['Hematology Lab'];

  return {
    bottleneckId: `BN-${workflow.patientId}-${workflow.currentStage.replace(/\s+/g, '').toUpperCase()}`,
    patientId: workflow.patientId,
    workflowType: workflow.workflowTitle || workflow.workflowType,
    department: workflow.department,
    currentStage: workflow.currentStage,
    expectedNextEvent: workflow.expectedNextEvent,
    elapsedMinutes: workflow.elapsedMinutes,
    configuredTargetMinutes: workflow.targetMinutes || 15,
    warningThresholdMinutes: workflow.warningThresholdMinutes || 25,
    eventHistory: (workflow.eventHistory || []).slice(0, 5),
    pendingWorkCount: deptResources.pendingWorkCount,
    availableOperationalResources: deptResources.availableOperationalResources,
    priority: workflow.priority || 'Standard',
    timestamp
  };
}

/**
 * Deterministic Investigation Fallback (used when LLM key is absent or network fails)
 */
export function getDeterministicInvestigation(context) {
  const stage = context.currentStage;

  if (stage === 'Sample Collection') {
    return {
      bottleneckId: context.bottleneckId,
      patientId: context.patientId,
      workflowType: context.workflowType,
      department: context.department,
      stage: context.currentStage,
      expectedNextEvent: context.expectedNextEvent,
      timestamp: context.timestamp || 'just now',
      likelyCause: 'Collection queue congestion',
      evidence: [
        `${context.pendingWorkCount} pending collection requisitions queued across ward floor`,
        `${context.availableOperationalResources} active collector available on current shift`,
        `Recent sample collection volume is high (+45% above typical baseline)`
      ],
      possibleActions: [
        {
          id: 'ASSIGN_COLLECTION_STAFF',
          description: 'Assign available collection staff to the pending collection queue',
          impact: 'HIGH'
        },
        {
          id: 'NOTIFY_FLOOR_COORDINATOR',
          description: 'Alert the floor coordinator regarding specimen draw backlog',
          impact: 'MEDIUM'
        },
        {
          id: 'EXTEND_SLA_WINDOW',
          description: 'Log operational exception and defer non-urgent collections',
          impact: 'LOW'
        }
      ],
      recommendedAction: {
        id: 'ASSIGN_COLLECTION_STAFF',
        description: 'Assign available collection staff to the pending collection queue.',
        reason: 'Directly resolves queue congestion by matching available staff capacity to high collection demand without altering clinical orders.'
      },
      confidence: 'HIGH',
      requiresHumanApproval: true
    };
  }

  if (stage === 'Lab Processing') {
    return {
      bottleneckId: context.bottleneckId,
      patientId: context.patientId,
      workflowType: context.workflowType,
      department: context.department,
      stage: context.currentStage,
      expectedNextEvent: context.expectedNextEvent,
      timestamp: context.timestamp || 'just now',
      likelyCause: 'Analyzer batch processing saturation',
      evidence: [
        `Primary diagnostic analyzer queue exceeded optimal batch capacity`,
        `Operating at 94% utilization with ${context.pendingWorkCount} queued specimens`,
        `Secondary testing station has available processing throughput`
      ],
      possibleActions: [
        {
          id: 'REROUTE_SECONDARY_BAY',
          description: 'Reroute urgent specimen batch to Secondary Analyzer Bay B',
          impact: 'HIGH'
        },
        {
          id: 'PRIORITIZE_SPECIMEN_RUN',
          description: 'Elevate specimen to priority queue slot in current batch',
          impact: 'MEDIUM'
        }
      ],
      recommendedAction: {
        id: 'REROUTE_SECONDARY_BAY',
        description: 'Reroute urgent specimen batch to Secondary Analyzer Bay B.',
        reason: 'Balances diagnostic equipment workload by utilizing available secondary analyzer capacity.'
      },
      confidence: 'HIGH',
      requiresHumanApproval: true
    };
  }

  if (stage === 'Sample Transport') {
    return {
      bottleneckId: context.bottleneckId,
      patientId: context.patientId,
      workflowType: context.workflowType,
      department: context.department,
      stage: context.currentStage,
      expectedNextEvent: context.expectedNextEvent,
      timestamp: context.timestamp || 'just now',
      likelyCause: 'Internal logistics transit delay',
      evidence: [
        `Courier transit node batch delayed in cross-ward transit cycle`,
        `Specimen awaiting physical barcode check-in at Central Receiving`,
        `${context.pendingWorkCount} transit batches queued across transit stream`
      ],
      possibleActions: [
        {
          id: 'DISPATCH_RUNNER',
          description: 'Dispatch dedicated priority runner for immediate specimen transit',
          impact: 'HIGH'
        },
        {
          id: 'REROUTE_LOGISTICS_PATH',
          description: 'Route via secondary logistics delivery cart',
          impact: 'MEDIUM'
        }
      ],
      recommendedAction: {
        id: 'DISPATCH_RUNNER',
        description: 'Dispatch dedicated priority runner for immediate specimen transit.',
        reason: 'Bypasses standard multi-stop courier route to deliver stat specimen directly to receiving bench.'
      },
      confidence: 'HIGH',
      requiresHumanApproval: true
    };
  }

  // Doctor Review / Result Ready Default
  return {
    bottleneckId: context.bottleneckId,
    patientId: context.patientId,
    workflowType: context.workflowType,
    department: context.department,
    stage: context.currentStage,
    expectedNextEvent: context.expectedNextEvent,
    timestamp: context.timestamp || 'just now',
    likelyCause: 'Operational sign-off queue backlog',
    evidence: [
      `Review queue depth (${context.pendingWorkCount} items) exceeds configured departmental target`,
      `Workflow elapsed ${context.elapsedMinutes}m (Target: ${context.configuredTargetMinutes}m)`,
      `${context.availableOperationalResources} operational reviewer(s) available in department pool`
    ],
    possibleActions: [
      {
        id: 'PRIORITIZE_REVIEW',
        description: 'Prioritize the pending review packet for attending physician',
        impact: 'LOW'
      },
      {
        id: 'ESCALATE_COORDINATOR',
        description: 'Alert the department coordinator of pending diagnostic report',
        impact: 'LOW'
      }
    ],
    recommendedAction: {
      id: 'PRIORITIZE_REVIEW',
      description: 'Prioritize the pending review packet for attending physician.',
      reason: 'Addresses the immediate queue delay without changing clinical review requirements.'
    },
    confidence: 'HIGH',
    requiresHumanApproval: true
  };
}

/**
 * Orchestrates the full Agentic Investigation
 * Builds structured context and queries the AI Agent Service (with fallback)
 */
export async function runAgentInvestigation(workflow, timestamp = 'just now') {
  const context = buildBottleneckContext(workflow, timestamp);
  return await queryAIAgent(context);
}
