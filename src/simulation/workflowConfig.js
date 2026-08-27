/**
 * FlowCare AI — Demo Hospital Workflow Configuration
 * 
 * IMPORTANT DISCLAIMER:
 * "Demo operational configuration — not medical standards."
 * 
 * In a real-world hospital deployment, these thresholds are configured according to:
 * - Hospital operational service level agreements (SLAs)
 * - Departmental turnaround time policies
 * - Historical workflow velocity data
 * - Department-specific staffing and capacity models
 * 
 * FlowCare is an operational orchestration layer, not a clinical decision tool.
 */

export const DEMO_HOSPITAL_WORKFLOW_CONFIG = {
  // Complete Blood Count (Hematology Lab)
  CBC: {
    name: 'CBC (Complete Blood Count)',
    department: 'Hematology Lab',
    stages: {
      'Test Ordered': {
        targetMinutes: 5,
        warningThresholdMinutes: 10,
        expectedNextEvent: 'SAMPLE_COLLECTION_STARTED'
      },
      'Sample Collection': {
        targetMinutes: 12,
        warningThresholdMinutes: 18,
        expectedNextEvent: 'SAMPLE_COLLECTED'
      },
      'Sample Transport': {
        targetMinutes: 15,
        warningThresholdMinutes: 25,
        expectedNextEvent: 'SAMPLE_RECEIVED'
      },
      'Lab Processing': {
        targetMinutes: 30,
        warningThresholdMinutes: 45,
        expectedNextEvent: 'RESULT_READY'
      },
      'Result Ready': {
        targetMinutes: 10,
        warningThresholdMinutes: 20,
        expectedNextEvent: 'DOCTOR_REVIEW_STARTED'
      },
      'Doctor Review': {
        targetMinutes: 20,
        warningThresholdMinutes: 35,
        expectedNextEvent: 'DOCTOR_REVIEW_COMPLETED'
      }
    }
  },

  // Basic Metabolic Panel (Biochemistry Lab)
  BMP: {
    name: 'Basic Metabolic Panel',
    department: 'Biochemistry Lab',
    stages: {
      'Test Ordered': {
        targetMinutes: 5,
        warningThresholdMinutes: 10,
        expectedNextEvent: 'SAMPLE_COLLECTION_STARTED'
      },
      'Sample Collection': {
        targetMinutes: 10,
        warningThresholdMinutes: 16,
        expectedNextEvent: 'SAMPLE_COLLECTED'
      },
      'Sample Transport': {
        targetMinutes: 15,
        warningThresholdMinutes: 22,
        expectedNextEvent: 'SAMPLE_RECEIVED'
      },
      'Lab Processing': {
        targetMinutes: 25,
        warningThresholdMinutes: 40,
        expectedNextEvent: 'RESULT_READY'
      },
      'Result Ready': {
        targetMinutes: 10,
        warningThresholdMinutes: 18,
        expectedNextEvent: 'DOCTOR_REVIEW_STARTED'
      },
      'Doctor Review': {
        targetMinutes: 20,
        warningThresholdMinutes: 30,
        expectedNextEvent: 'DOCTOR_REVIEW_COMPLETED'
      }
    }
  },

  // Magnetic Resonance Imaging (Diagnostic Radiology)
  MRI: {
    name: 'MRI Brain w/o Contrast',
    department: 'Diagnostic Radiology',
    stages: {
      'Test Ordered': {
        targetMinutes: 8,
        warningThresholdMinutes: 15,
        expectedNextEvent: 'SAMPLE_COLLECTION_STARTED'
      },
      'Sample Collection': {
        targetMinutes: 15,
        warningThresholdMinutes: 25,
        expectedNextEvent: 'SAMPLE_COLLECTED'
      },
      'Sample Transport': {
        targetMinutes: 10,
        warningThresholdMinutes: 20,
        expectedNextEvent: 'SAMPLE_RECEIVED'
      },
      'Lab Processing': {
        targetMinutes: 45,
        warningThresholdMinutes: 60,
        expectedNextEvent: 'RESULT_READY'
      },
      'Result Ready': {
        targetMinutes: 15,
        warningThresholdMinutes: 25,
        expectedNextEvent: 'DOCTOR_REVIEW_STARTED'
      },
      'Doctor Review': {
        targetMinutes: 30,
        warningThresholdMinutes: 50,
        expectedNextEvent: 'DOCTOR_REVIEW_COMPLETED'
      }
    }
  },

  // CT Scan Chest (Emergency Imaging)
  CT_CHEST: {
    name: 'CT Scan Chest',
    department: 'Emergency Imaging',
    stages: {
      'Test Ordered': {
        targetMinutes: 5,
        warningThresholdMinutes: 10,
        expectedNextEvent: 'SAMPLE_COLLECTION_STARTED'
      },
      'Sample Collection': {
        targetMinutes: 10,
        warningThresholdMinutes: 15,
        expectedNextEvent: 'SAMPLE_COLLECTED'
      },
      'Sample Transport': {
        targetMinutes: 8,
        warningThresholdMinutes: 15,
        expectedNextEvent: 'SAMPLE_RECEIVED'
      },
      'Lab Processing': {
        targetMinutes: 20,
        warningThresholdMinutes: 35,
        expectedNextEvent: 'RESULT_READY'
      },
      'Result Ready': {
        targetMinutes: 8,
        warningThresholdMinutes: 15,
        expectedNextEvent: 'DOCTOR_REVIEW_STARTED'
      },
      'Doctor Review': {
        targetMinutes: 15,
        warningThresholdMinutes: 25,
        expectedNextEvent: 'DOCTOR_REVIEW_COMPLETED'
      }
    }
  },

  // Echocardiogram (Cardiology Diagnostics)
  ECHO: {
    name: 'Echocardiogram',
    department: 'Cardiology Diagnostics',
    stages: {
      'Test Ordered': {
        targetMinutes: 10,
        warningThresholdMinutes: 20,
        expectedNextEvent: 'SAMPLE_COLLECTION_STARTED'
      },
      'Sample Collection': {
        targetMinutes: 15,
        warningThresholdMinutes: 25,
        expectedNextEvent: 'SAMPLE_COLLECTED'
      },
      'Sample Transport': {
        targetMinutes: 10,
        warningThresholdMinutes: 18,
        expectedNextEvent: 'SAMPLE_RECEIVED'
      },
      'Lab Processing': {
        targetMinutes: 30,
        warningThresholdMinutes: 45,
        expectedNextEvent: 'RESULT_READY'
      },
      'Result Ready': {
        targetMinutes: 10,
        warningThresholdMinutes: 20,
        expectedNextEvent: 'DOCTOR_REVIEW_STARTED'
      },
      'Doctor Review': {
        targetMinutes: 20,
        warningThresholdMinutes: 35,
        expectedNextEvent: 'DOCTOR_REVIEW_COMPLETED'
      }
    }
  },

  // Biopsy Specimen (Surgical Pathology)
  BIOPSY: {
    name: 'Biopsy Histology',
    department: 'Surgical Pathology',
    stages: {
      'Test Ordered': {
        targetMinutes: 15,
        warningThresholdMinutes: 30,
        expectedNextEvent: 'SAMPLE_COLLECTION_STARTED'
      },
      'Sample Collection': {
        targetMinutes: 20,
        warningThresholdMinutes: 35,
        expectedNextEvent: 'SAMPLE_COLLECTED'
      },
      'Sample Transport': {
        targetMinutes: 15,
        warningThresholdMinutes: 25,
        expectedNextEvent: 'SAMPLE_RECEIVED'
      },
      'Lab Processing': {
        targetMinutes: 60,
        warningThresholdMinutes: 90,
        expectedNextEvent: 'RESULT_READY'
      },
      'Result Ready': {
        targetMinutes: 15,
        warningThresholdMinutes: 30,
        expectedNextEvent: 'DOCTOR_REVIEW_STARTED'
      },
      'Doctor Review': {
        targetMinutes: 30,
        warningThresholdMinutes: 50,
        expectedNextEvent: 'DOCTOR_REVIEW_COMPLETED'
      }
    }
  }
};

/**
 * Standard ordered workflow stages sequence
 */
export const ORDERED_STAGES = [
  'Test Ordered',
  'Sample Collection',
  'Sample Transport',
  'Lab Processing',
  'Result Ready',
  'Doctor Review'
];

/**
 * Mapping from event types to corresponding workflow stages
 */
export const EVENT_TO_STAGE_MAP = {
  TEST_ORDERED: 'Test Ordered',
  SAMPLE_COLLECTION_STARTED: 'Sample Collection',
  SAMPLE_COLLECTED: 'Sample Transport',
  SAMPLE_TRANSPORT_STARTED: 'Sample Transport',
  SAMPLE_RECEIVED: 'Lab Processing',
  LAB_PROCESSING_STARTED: 'Lab Processing',
  RESULT_READY: 'Result Ready',
  DOCTOR_REVIEW_STARTED: 'Doctor Review',
  DOCTOR_REVIEW_COMPLETED: 'Completed'
};

/**
 * Expected next event for each stage
 */
export const STAGE_NEXT_EVENT_MAP = {
  'Test Ordered': 'SAMPLE_COLLECTION_STARTED',
  'Sample Collection': 'SAMPLE_COLLECTED',
  'Sample Transport': 'SAMPLE_RECEIVED',
  'Lab Processing': 'RESULT_READY',
  'Result Ready': 'DOCTOR_REVIEW_STARTED',
  'Doctor Review': 'DOCTOR_REVIEW_COMPLETED'
};

/**
 * Helper to fetch operational configuration for a given workflow type and stage
 */
export function getStageConfig(workflowType, stageName) {
  const typeConfig = DEMO_HOSPITAL_WORKFLOW_CONFIG[workflowType] || DEMO_HOSPITAL_WORKFLOW_CONFIG.CBC;
  const stageConfig = (typeConfig.stages && typeConfig.stages[stageName]) || {
    targetMinutes: 15,
    warningThresholdMinutes: 25,
    expectedNextEvent: STAGE_NEXT_EVENT_MAP[stageName] || 'NEXT_STAGE_EVENT'
  };

  return {
    workflowName: typeConfig.name,
    department: typeConfig.department,
    targetMinutes: stageConfig.targetMinutes,
    warningThresholdMinutes: stageConfig.warningThresholdMinutes,
    expectedNextEvent: stageConfig.expectedNextEvent || STAGE_NEXT_EVENT_MAP[stageName] || 'NEXT_EVENT'
  };
}
