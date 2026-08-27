export const WORKFLOW_STAGES = [
  'Test Ordered',
  'Sample Collection',
  'Sample Transport',
  'Lab Processing',
  'Result Ready',
  'Doctor Review'
];

export const STAGE_SLA_MINUTES = {
  'Test Ordered': 5,
  'Sample Collection': 10,
  'Sample Transport': 15,
  'Lab Processing': 30,
  'Result Ready': 10,
  'Doctor Review': 20
};

export const WORKFLOW_TYPES = {
  CBC: { name: 'CBC (Complete Blood Count)', dept: 'Hematology Lab' },
  BMP: { name: 'Basic Metabolic Panel', dept: 'Biochemistry Lab' },
  MRI: { name: 'MRI Brain w/o Contrast', dept: 'Diagnostic Radiology' },
  CT_CHEST: { name: 'CT Scan Chest', dept: 'Emergency Imaging' },
  ECHO: { name: 'Echocardiogram', dept: 'Cardiology Diagnostics' },
  BIOPSY: { name: 'Biopsy Histology', dept: 'Surgical Pathology' },
};
