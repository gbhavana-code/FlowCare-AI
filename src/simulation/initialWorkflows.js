/**
 * FlowCare AI — Initial Synthetic Workflows & Baseline Seed Events
 * 
 * Sets up synthetic workflows across hospital diagnostic departments.
 * Note: P-1042 represents an intentional synthetic stalled workflow where 
 * SAMPLE_COLLECTION_STARTED occurred at 10:07, and SAMPLE_COLLECTED has NOT arrived.
 */

import { createWorkflowState } from './workflowEngine';

export const getInitialWorkflows = () => [
  // P-1042: Stalled CBC Workflow (Target: 12m, Warning: 18m)
  createWorkflowState({
    patientId: 'P-1042',
    workflowType: 'CBC',
    workflowTitle: 'CBC Diagnostic Workflow',
    department: 'Hematology Lab',
    initialStage: 'Sample Collection',
    initialElapsedMinutes: 8,
    stageStartedTimestamp: '10:07',
    priority: 'Urgent',
    isBlocked: true,
    eventHistory: [
      {
        eventId: 'EVT-1042-2',
        eventType: 'SAMPLE_COLLECTION_STARTED',
        stage: 'Sample Collection',
        timestamp: '10:07',
        message: 'Sample collection started in Ward 3'
      },
      {
        eventId: 'EVT-1042-1',
        eventType: 'TEST_ORDERED',
        stage: 'Test Ordered',
        timestamp: '10:02',
        message: 'Urgent CBC Panel ordered via HIS'
      }
    ]
  }),

  // P-1091: MRI Brain
  createWorkflowState({
    patientId: 'P-1091',
    workflowType: 'MRI',
    workflowTitle: 'Brain MRI Diagnostic',
    department: 'Diagnostic Radiology',
    initialStage: 'Test Ordered',
    initialElapsedMinutes: 2,
    stageStartedTimestamp: '10:13',
    priority: 'Standard',
    isBlocked: false,
    eventHistory: [
      {
        eventId: 'EVT-1091-1',
        eventType: 'TEST_ORDERED',
        stage: 'Test Ordered',
        timestamp: '10:13',
        message: 'Brain MRI ordered via RIS'
      }
    ]
  }),

  // P-1028: BMP Blood Test
  createWorkflowState({
    patientId: 'P-1028',
    workflowType: 'BMP',
    workflowTitle: 'Basic Metabolic Panel (BMP)',
    department: 'Biochemistry Lab',
    initialStage: 'Sample Transport',
    initialElapsedMinutes: 11,
    stageStartedTimestamp: '10:04',
    priority: 'High',
    isBlocked: false,
    eventHistory: [
      {
        eventId: 'EVT-1028-2',
        eventType: 'SAMPLE_COLLECTED',
        stage: 'Sample Transport',
        timestamp: '10:04',
        message: 'Sample collected from Bed 4; transport dispatched'
      },
      {
        eventId: 'EVT-1028-1',
        eventType: 'TEST_ORDERED',
        stage: 'Test Ordered',
        timestamp: '09:57',
        message: 'Stat BMP test ordered'
      }
    ]
  }),

  // P-1035: Trauma CT Scan Chest
  createWorkflowState({
    patientId: 'P-1035',
    workflowType: 'CT_CHEST',
    workflowTitle: 'CT Chest Diagnostic',
    department: 'Emergency Imaging',
    initialStage: 'Lab Processing',
    initialElapsedMinutes: 14,
    stageStartedTimestamp: '10:01',
    priority: 'Urgent',
    isBlocked: false,
    eventHistory: [
      {
        eventId: 'EVT-1035-2',
        eventType: 'SAMPLE_RECEIVED',
        stage: 'Lab Processing',
        timestamp: '10:01',
        message: 'Patient positioned in CT gantry; helical scan active'
      },
      {
        eventId: 'EVT-1035-1',
        eventType: 'TEST_ORDERED',
        stage: 'Test Ordered',
        timestamp: '09:50',
        message: 'Trauma CT Chest ordered'
      }
    ]
  }),

  // P-1067: Outpatient CBC
  createWorkflowState({
    patientId: 'P-1067',
    workflowType: 'CBC',
    workflowTitle: 'CBC Diagnostic Workflow',
    department: 'Hematology Lab',
    initialStage: 'Result Ready',
    initialElapsedMinutes: 4,
    stageStartedTimestamp: '10:11',
    priority: 'Standard',
    isBlocked: false,
    eventHistory: [
      {
        eventId: 'EVT-1067-1',
        eventType: 'RESULT_READY',
        stage: 'Result Ready',
        timestamp: '10:11',
        message: 'Automated analyzer posted CBC results to LIS'
      }
    ]
  }),

  // P-1077: Pathology Biopsy Specimen
  createWorkflowState({
    patientId: 'P-1077',
    workflowType: 'BIOPSY',
    workflowTitle: 'Biopsy Histology Specimen',
    department: 'Surgical Pathology',
    initialStage: 'Lab Processing',
    initialElapsedMinutes: 22,
    stageStartedTimestamp: '09:53',
    priority: 'High',
    isBlocked: false,
    eventHistory: [
      {
        eventId: 'EVT-1077-1',
        eventType: 'SAMPLE_RECEIVED',
        stage: 'Lab Processing',
        timestamp: '09:53',
        message: 'Biopsy specimen logged into Pathology LIS'
      }
    ]
  }),

  // P-1084: Cardiology Echocardiogram
  createWorkflowState({
    patientId: 'P-1084',
    workflowType: 'ECHO',
    workflowTitle: 'Echocardiogram Diagnostic',
    department: 'Cardiology Diagnostics',
    initialStage: 'Doctor Review',
    initialElapsedMinutes: 9,
    stageStartedTimestamp: '10:06',
    priority: 'Standard',
    isBlocked: false,
    eventHistory: [
      {
        eventId: 'EVT-1084-1',
        eventType: 'DOCTOR_REVIEW_STARTED',
        stage: 'Doctor Review',
        timestamp: '10:06',
        message: 'Echo loop packet queued for cardiologist review'
      }
    ]
  }),

  // P-1099: Inpatient BMP
  createWorkflowState({
    patientId: 'P-1099',
    workflowType: 'BMP',
    workflowTitle: 'Basic Metabolic Panel (BMP)',
    department: 'Biochemistry Lab',
    initialStage: 'Sample Collection',
    initialElapsedMinutes: 3,
    stageStartedTimestamp: '10:12',
    priority: 'Normal',
    isBlocked: false,
    eventHistory: [
      {
        eventId: 'EVT-1099-1',
        eventType: 'TEST_ORDERED',
        stage: 'Sample Collection',
        timestamp: '10:12',
        message: 'Electrolyte panel requisition queued'
      }
    ]
  })
];

export const getInitialAgentEvents = () => [
  {
    id: 'seed-evt-1',
    type: 'received',
    title: 'Event received: Test ordered for P-1091',
    description: 'Ingested Diagnostic Radiology scheduling request from simulated HIS stream.',
    patientId: 'P-1091',
    stage: 'Test Ordered',
    timestamp: '10:13',
    agent: 'HIS Event Listener',
    severity: 'neutral'
  },
  {
    id: 'seed-evt-2',
    type: 'received',
    title: 'Event received: Result ready for P-1067',
    description: 'Automated analyzer telemetry verified complete CBC run in simulated LIS.',
    patientId: 'P-1067',
    stage: 'Result Ready',
    timestamp: '10:11',
    agent: 'LIS Event Ingestion',
    severity: 'neutral'
  },
  {
    id: 'seed-evt-3',
    type: 'received',
    title: 'Event received: Sample collection started for P-1042',
    description: 'Phlebotomy collection initiated in Ward 3; expecting Sample Collected event.',
    patientId: 'P-1042',
    stage: 'Sample Collection',
    timestamp: '10:07',
    agent: 'LIS Event Listener',
    severity: 'neutral'
  }
];
