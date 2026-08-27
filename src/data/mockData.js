export const kpiData = {
  activeWorkflows: {
    title: "Network Workflows",
    value: 142,
    subtext: "Simulated hospital-wide streams",
    change: "142 Active in Stream",
    trend: "neutral",
    description: "Total active workflows monitored across simulated HIS/LIS/RIS event streams"
  },
  atRisk: {
    title: "At Risk",
    value: 18,
    subtext: "Approaching SLA threshold",
    change: "18 Near Threshold",
    trend: "warning",
    description: "Workflows nearing target turnaround time limits in simulated queue"
  },
  bottlenecks: {
    title: "Bottlenecks",
    value: 5,
    subtext: "Exceeded SLA limits",
    change: "5 Stalls Detected",
    trend: "danger",
    description: "Active stalls identified by agentic bottleneck detection rules"
  },
  resolvedToday: {
    title: "Resolved Today",
    value: 34,
    subtext: "Coordinator actions applied",
    change: "34 Actions Executed",
    trend: "positive",
    description: "Bottlenecks cleared following agent recommendations & coordinator action"
  }
};

export const mockPatients = [
  {
    id: "P-1042",
    workflow: "CBC Diagnostic Workflow",
    workflowCategory: "CBC",
    currentStage: "Sample Collection",
    department: "Simulated Hematology Lab",
    waitingTime: "18m",
    targetTime: "12m",
    status: "Bottleneck",
    priority: "Urgent",
    assignedTo: "Collection Queue"
  },
  {
    id: "P-1091",
    workflow: "Brain MRI Diagnostic",
    workflowCategory: "MRI",
    currentStage: "Test Ordered",
    department: "Simulated Diagnostic Imaging",
    waitingTime: "2m",
    targetTime: "8m",
    status: "On Track",
    priority: "Standard",
    assignedTo: "MRI Queue Pool"
  },
  {
    id: "P-1028",
    workflow: "Basic Metabolic Panel (BMP)",
    workflowCategory: "BMP",
    currentStage: "Sample Transport",
    department: "Simulated Internal Logistics",
    waitingTime: "11m",
    targetTime: "15m",
    status: "On Track",
    priority: "High",
    assignedTo: "Transit Courier Node 4"
  },
  {
    id: "P-1035",
    workflow: "CT Chest Diagnostic",
    workflowCategory: "CT_CHEST",
    currentStage: "Lab Processing",
    department: "Simulated Radiology Review",
    waitingTime: "14m",
    targetTime: "20m",
    status: "On Track",
    priority: "Urgent",
    assignedTo: "Radiology Review Queue"
  },
  {
    id: "P-1067",
    workflow: "CBC Diagnostic Workflow",
    workflowCategory: "CBC",
    currentStage: "Result Ready",
    department: "Simulated Hematology Lab",
    waitingTime: "4m",
    targetTime: "10m",
    status: "On Track",
    priority: "Standard",
    assignedTo: "Analyzer Station 1"
  },
  {
    id: "P-1077",
    workflow: "Biopsy Histology Specimen",
    workflowCategory: "BIOPSY",
    currentStage: "Lab Processing",
    department: "Simulated Pathology Lab",
    waitingTime: "22m",
    targetTime: "60m",
    status: "On Track",
    priority: "High",
    assignedTo: "Histology Bay 2"
  },
  {
    id: "P-1084",
    workflow: "Echocardiogram Diagnostic",
    workflowCategory: "ECHO",
    currentStage: "Doctor Review",
    department: "Simulated Cardiology Unit",
    waitingTime: "9m",
    targetTime: "20m",
    status: "On Track",
    priority: "Standard",
    assignedTo: "Cardiology Review Queue"
  },
  {
    id: "P-1099",
    workflow: "Basic Metabolic Panel (BMP)",
    workflowCategory: "BMP",
    currentStage: "Sample Collection",
    department: "Simulated Biochemistry Lab",
    waitingTime: "3m",
    targetTime: "10m",
    status: "On Track",
    priority: "Normal",
    assignedTo: "Transit Queue 2"
  }
];

export const mockAgentEvents = [
  {
    id: "evt-1",
    type: "received",
    title: "Event received: CBC sample collection started",
    description: "Ingested timestamp event from simulated LIS feed for patient record P-1042.",
    patientId: "P-1042",
    stage: "Sample Collection",
    timestamp: "1 min ago",
    agent: "HIS/LIS Event Listener",
    severity: "neutral"
  },
  {
    id: "evt-2",
    type: "bottleneck",
    title: "Bottleneck detected: sample collection exceeded expected SLA",
    description: "Lab Processing wait time exceeded threshold by +60m at Analyzer Station B3.",
    patientId: "P-1042",
    stage: "Lab Processing",
    timestamp: "3 mins ago",
    agent: "Bottleneck Detection Agent",
    severity: "danger"
  },
  {
    id: "evt-3",
    type: "analysis",
    title: "Agent analysis completed",
    description: "Backlog identified: 8 pending CBC specimens queued at primary analyzer.",
    patientId: "P-1042",
    stage: "Diagnostic Reasoning",
    timestamp: "5 mins ago",
    agent: "Delay Analysis Agent",
    severity: "warning"
  },
  {
    id: "evt-4",
    type: "recommendation",
    title: "Recommended action generated",
    description: "Recommend rerouting urgent specimen P-1042 to Rapid Testing Unit (Bay B-04).",
    patientId: "P-1042",
    stage: "Resolution Routing",
    timestamp: "7 mins ago",
    agent: "Resolution Planner Agent",
    severity: "info"
  },
  {
    id: "evt-5",
    type: "approval",
    title: "Awaiting coordinator approval",
    description: "Proposed reroute action staged for Hospital Operations Coordinator review.",
    patientId: "P-1042",
    stage: "Operations Control",
    timestamp: "8 mins ago",
    agent: "Action Dispatcher",
    severity: "warning"
  },
  {
    id: "evt-6",
    type: "resumed",
    title: "Workflow resumed: P-1038 cleared",
    description: "Approved transport reroute executed; simulated LIS confirmed specimen check-in.",
    patientId: "P-1038",
    stage: "Doctor Review",
    timestamp: "16 mins ago",
    agent: "Orchestration Monitor",
    severity: "success"
  }
];
