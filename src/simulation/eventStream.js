/**
 * FlowCare AI — Local Simulated Event Stream Layer
 * 
 * ARCHITECTURAL CONTEXT:
 * ============================================================================
 * PROTOTYPE ARCHITECTURE:
 * [Simulated Event Stream] (this module)
 *        ↓
 * [Workflow Engine] (workflowEngine.js)
 *        ↓
 * [Bottleneck Detection] (bottleneckDetector.js)
 * 
 * PRODUCTION ARCHITECTURE:
 * [Hospital Information System (HIS)] \
 * [Laboratory Info System (LIS)]       ──► [Integration / Event Bus Layer]
 * [Radiology Info System (RIS)]       /           ↓
 *                                          [FlowCare Workflow Engine]
 *                                                 ↓
 *                                          [Bottleneck Detection]
 *                                                 ↓
 *                                          [Agentic Investigation]
 *                                                 ↓
 *                                          [Human Authorization]
 *                                                 ↓
 *                                          [Action & Verification]
 * ============================================================================
 * 
 * This module generates realistic synthetic hospital workflow events.
 * It is completely modular: swapping this out for a real WebSocket / Kafka / HL7 FHIR
 * listener in production requires ZERO changes to the Workflow Engine or Bottleneck Detector.
 */

let eventSequenceId = 1000;

export function generateEventId() {
  eventSequenceId += 1;
  return `EVT-${eventSequenceId}`;
}

/**
 * Supported Hospital Event Types
 */
export const EVENT_TYPES = {
  TEST_ORDERED: 'TEST_ORDERED',
  SAMPLE_COLLECTION_STARTED: 'SAMPLE_COLLECTION_STARTED',
  SAMPLE_COLLECTED: 'SAMPLE_COLLECTED',
  SAMPLE_TRANSPORT_STARTED: 'SAMPLE_TRANSPORT_STARTED',
  SAMPLE_RECEIVED: 'SAMPLE_RECEIVED',
  LAB_PROCESSING_STARTED: 'LAB_PROCESSING_STARTED',
  RESULT_READY: 'RESULT_READY',
  DOCTOR_REVIEW_STARTED: 'DOCTOR_REVIEW_STARTED',
  DOCTOR_REVIEW_COMPLETED: 'DOCTOR_REVIEW_COMPLETED'
};

/**
 * Formats simulated minute offset into a realistic hospital clock timestamp (HH:MM)
 * Baseline demo clock starts at 10:00 AM
 */
export function formatSimulatedTime(simulatedMinutesFromBase = 0, baseHour = 10, baseMinute = 0) {
  const totalMinutes = (baseHour * 60 + baseMinute + simulatedMinutesFromBase) % (24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Creates a normalized workflow event payload compliant with FlowCare engine schema
 */
export function createWorkflowEvent({
  patientId,
  workflowType,
  eventType,
  timestamp,
  department,
  stage,
  details = ''
}) {
  return {
    eventId: generateEventId(),
    patientId,
    workflowType,
    eventType,
    timestamp,
    department,
    stage,
    details
  };
}

/**
 * Synthetic Demo Timeline Events for Background Workflows
 * 
 * Scheduled events trigger at specific simulation minute ticks.
 * Notice: P-1042 has NO scheduled SAMPLE_COLLECTED event, naturally creating a realistic stalled workflow!
 */
export const SCHEDULED_SIMULATION_EVENTS = [
  // Minute 2: P-1091 (MRI) advances to Sample Collection
  {
    atMinute: 2,
    patientId: 'P-1091',
    workflowType: 'MRI',
    eventType: 'SAMPLE_COLLECTION_STARTED',
    department: 'Diagnostic Radiology',
    stage: 'Sample Collection',
    details: 'Pre-scan screening initiated by radiology tech'
  },
  // Minute 4: P-1028 (BMP) arrives at lab
  {
    atMinute: 4,
    patientId: 'P-1028',
    workflowType: 'BMP',
    eventType: 'SAMPLE_RECEIVED',
    department: 'Biochemistry Lab',
    stage: 'Lab Processing',
    details: 'Specimen barcoded and checked in at Biochemistry analyzer'
  },
  // Minute 6: P-1067 (CBC) enters Doctor Review
  {
    atMinute: 6,
    patientId: 'P-1067',
    workflowType: 'CBC',
    eventType: 'DOCTOR_REVIEW_STARTED',
    department: 'Hematology Lab',
    stage: 'Doctor Review',
    details: 'Attending physician opened CBC report for clinical review'
  },
  // Minute 8: P-1035 (CT Chest) result becomes ready
  {
    atMinute: 8,
    patientId: 'P-1035',
    workflowType: 'CT_CHEST',
    eventType: 'RESULT_READY',
    department: 'Emergency Imaging',
    stage: 'Result Ready',
    details: '3D axial slices rendered and published to PACS'
  },
  // Minute 10: P-1084 (ECHO) completes doctor review
  {
    atMinute: 10,
    patientId: 'P-1084',
    workflowType: 'ECHO',
    eventType: 'DOCTOR_REVIEW_COMPLETED',
    department: 'Cardiology Diagnostics',
    stage: 'Completed',
    details: 'Cardiologist completed and electronically signed echo report'
  },
  // Minute 14: P-1028 (BMP) completes lab processing
  {
    atMinute: 14,
    patientId: 'P-1028',
    workflowType: 'BMP',
    eventType: 'RESULT_READY',
    department: 'Biochemistry Lab',
    stage: 'Result Ready',
    details: 'Automated electrolyte analyzer completed assay'
  },
  // Minute 16: P-1091 (MRI) patient transferred to scanner
  {
    atMinute: 16,
    patientId: 'P-1091',
    workflowType: 'MRI',
    eventType: 'SAMPLE_RECEIVED',
    department: 'Diagnostic Radiology',
    stage: 'Lab Processing',
    details: 'Patient positioned in 3T MRI suite; sequence started'
  },
  // Minute 20: P-1067 (CBC) review finalized
  {
    atMinute: 20,
    patientId: 'P-1067',
    workflowType: 'CBC',
    eventType: 'DOCTOR_REVIEW_COMPLETED',
    department: 'Hematology Lab',
    stage: 'Completed',
    details: 'Physician sign-off complete; results dispatched to EHR'
  }
];

/**
 * Pulls any events scheduled to arrive at the current simulated minute
 */
export function pollScheduledEvents(currentSimulatedMinute) {
  const matching = SCHEDULED_SIMULATION_EVENTS.filter(
    (item) => item.atMinute === currentSimulatedMinute
  );

  return matching.map((item) =>
    createWorkflowEvent({
      patientId: item.patientId,
      workflowType: item.workflowType,
      eventType: item.eventType,
      timestamp: formatSimulatedTime(currentSimulatedMinute),
      department: item.department,
      stage: item.stage,
      details: item.details
    })
  );
}
