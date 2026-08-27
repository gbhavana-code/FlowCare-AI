import React, { useState } from 'react';
import { useSimulation } from '../context/SimulationContext';
import { 
  Layers, 
  Clock, 
  ChevronRight, 
  Search, 
  Info,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  Lightbulb,
  ShieldAlert,
  BrainCircuit,
  X
} from 'lucide-react';

export default function PatientTable() {
  const { workflows, kpis, approveAndExecuteAction } = useSimulation();
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  const filteredPatients = workflows.filter((patient) => {
    const matchesFilter = selectedFilter === 'ALL' || patient.status.toUpperCase() === selectedFilter;
    const matchesSearch = 
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.workflowTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.currentStage.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRowClick = (patient) => {
    setSelectedPatientId(patient.patientId === selectedPatientId ? null : patient.patientId);
  };

  const getStatusBadge = (status, isResolved) => {
    if (isResolved) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          Completed
        </span>
      );
    }

    switch (status) {
      case 'Bottleneck':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
            Bottleneck
          </span>
        );
      case 'At Risk':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
            At Risk
          </span>
        );
      case 'On Track':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            On Track
          </span>
        );
    }
  };

  const getStageBadge = (stage) => {
    const stageColors = {
      'Test Ordered': 'bg-slate-100 text-slate-700 border-slate-200',
      'Sample Collection': 'bg-blue-50 text-blue-700 border-blue-200',
      'Sample Transport': 'bg-purple-50 text-purple-700 border-purple-200',
      'Lab Processing': 'bg-amber-50 text-amber-700 border-amber-200',
      'Result Ready': 'bg-indigo-50 text-indigo-700 border-indigo-200',
      'Doctor Review': 'bg-teal-50 text-teal-700 border-teal-200',
    };
    const style = stageColors[stage] || 'bg-slate-100 text-slate-700 border-slate-200';

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${style}`}>
        {stage}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
      {/* Table Header / Action Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-slate-600" />
            <h2 className="text-base font-bold text-slate-900">Flagged Workflow Queue</h2>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-300">
              Synthetic Patient Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Coordinator triage queue • Displaying live simulated cases from {kpis.networkWorkflows.value} network workflows
          </p>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search synthetic ID, test, stage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-md border border-slate-300 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-teal-600 focus:bg-white w-48 sm:w-56"
            />
          </div>

          {/* Quick Status Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
            {['ALL', 'BOTTLENECK', 'AT RISK', 'ON TRACK'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  selectedFilter === filter
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'ALL' ? 'All' : filter === 'BOTTLENECK' ? 'Bottlenecks' : filter === 'AT RISK' ? 'At Risk' : 'On Track'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Patient ID (Synthetic)</th>
              <th className="py-3 px-4">Workflow</th>
              <th className="py-3 px-4">Current Stage</th>
              <th className="py-3 px-4">Waiting Time</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-slate-400 text-xs">
                  No matching simulated workflow events found for the active filter.
                </td>
              </tr>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = selectedPatientId === patient.patientId;
                const investigation = patient.activeInvestigation;

                return (
                  <React.Fragment key={patient.patientId}>
                    <tr
                      onClick={() => handleRowClick(patient)}
                      className={`cursor-pointer transition-colors group ${
                        isSelected 
                          ? 'bg-teal-50/70 hover:bg-teal-50' 
                          : 'hover:bg-slate-50/90'
                      }`}
                      title="Click row to inspect simulated workflow trace"
                    >
                      {/* Patient ID (Synthetic) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 group-hover:text-teal-700 bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">
                            {patient.patientId}
                          </span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            [DEMO-RECORD]
                          </span>
                        </div>
                      </td>

                      {/* Workflow */}
                      <td className="py-3.5 px-4 font-medium text-slate-800">
                        <div className="flex flex-col">
                          <span>{patient.workflowTitle}</span>
                          <span className="text-xs text-slate-400 font-normal">{patient.department}</span>
                        </div>
                      </td>

                      {/* Current Stage */}
                      <td className="py-3.5 px-4">
                        {getStageBadge(patient.currentStage)}
                      </td>

                      {/* Waiting Time (Live Simulated Minutes) */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <Clock className={`w-3.5 h-3.5 ${
                            patient.status === 'Bottleneck' 
                              ? 'text-rose-500 animate-pulse' 
                              : patient.status === 'At Risk' 
                              ? 'text-amber-500' 
                              : 'text-slate-400'
                          }`} />
                          <span className={`font-semibold ${
                            patient.status === 'Bottleneck' 
                              ? 'text-rose-700' 
                              : patient.status === 'At Risk' 
                              ? 'text-amber-700' 
                              : 'text-slate-700'
                          }`}>
                            {patient.elapsedMinutes}m
                          </span>
                          <span className="text-xs text-slate-400">/ Target: {patient.targetMinutes || patient.expectedDurationMinutes}m</span>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4">
                        {getStatusBadge(patient.status, patient.isResolved)}
                      </td>

                      {/* Action Affordance */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRowClick(patient);
                          }}
                          className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded transition-colors ${
                            isSelected 
                              ? 'bg-teal-700 text-white' 
                              : 'text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200'
                          }`}
                        >
                          <span>{isSelected ? 'Close' : 'Inspect'}</span>
                          <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                        </button>
                      </td>
                    </tr>

                    {/* Inline Workflow State Inspection Panel */}
                    {isSelected && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={6} className="p-4 border-b border-teal-100">
                          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-xs space-y-3.5">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-xs">
                                  {patient.patientId} State Machine Trace
                                </span>
                                <span className="text-xs text-slate-500">• {patient.workflowTitle} ({patient.department})</span>
                              </div>
                              <button 
                                onClick={() => setSelectedPatientId(null)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Key Stage Metrics */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                              {/* Current Stage Card */}
                              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                <span className="text-[11px] font-semibold uppercase text-slate-500 block">Current Stage</span>
                                <span className="text-sm font-bold text-slate-900 mt-1 block">{patient.currentStage}</span>
                                <span className="text-slate-500 text-[11px] mt-0.5 block">Started at: {patient.stageStartedTimestamp} ({patient.elapsedMinutes}m elapsed)</span>
                              </div>

                              {/* Expected Next Event Card */}
                              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                <span className="text-[11px] font-semibold uppercase text-slate-500 block">Expected Next Event</span>
                                <span className="text-xs font-mono font-bold text-teal-800 mt-1 block">{patient.expectedNextEvent || 'NONE'}</span>
                                <span className="text-slate-500 text-[11px] mt-0.5 block">
                                  {patient.isResolved ? 'All diagnostic events received' : 'Awaiting event emission from simulated telemetry'}
                                </span>
                              </div>

                              {/* Operational Rule Config */}
                              <div className="p-3 bg-slate-50 rounded border border-slate-200">
                                <span className="text-[11px] font-semibold uppercase text-slate-500 block">Demo Operational SLA</span>
                                <div className="mt-1 flex items-center gap-2">
                                  <span className="font-semibold text-slate-700">Target: {patient.targetMinutes}m</span>
                                  <span className="text-slate-300">|</span>
                                  <span className="font-semibold text-rose-700">Warning: {patient.warningThresholdMinutes}m</span>
                                </div>
                                <span className="text-[10px] text-slate-400 italic block mt-0.5">Demo configuration — not medical standards</span>
                              </div>
                            </div>

                            {/* Active Agent Investigation & Recommendation Card (If Stalled) */}
                            {investigation && (
                              <div className="p-3.5 bg-teal-50/60 border border-teal-300 rounded-lg space-y-2.5">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-1.5">
                                    <BrainCircuit className="w-4 h-4 text-teal-700" />
                                    <span className="font-bold text-teal-950 text-xs uppercase tracking-wide">
                                      AI Agent Investigation Result
                                    </span>
                                  </div>
                                  <span className="text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3 text-amber-700" />
                                    Human approval required
                                  </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1 text-xs">
                                  {/* Likely Cause & Evidence */}
                                  <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1.5">
                                    <div>
                                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Likely Operational Cause</span>
                                      <p className="font-semibold text-slate-900 mt-0.5">{investigation.likelyCause}</p>
                                    </div>
                                    <div className="pt-1 border-t border-slate-100">
                                      <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Supporting Evidence</span>
                                      <ul className="space-y-0.5 text-slate-600 text-[11px]">
                                        {investigation.evidence.map((ev, i) => (
                                          <li key={i} className="flex items-start gap-1">
                                            <span className="text-teal-600 font-bold">•</span>
                                            <span>{ev}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>

                                  {/* Recommended Action & Possible Options */}
                                  <div className="space-y-2">
                                    <div className="bg-teal-900 text-white p-2.5 rounded shadow-2xs space-y-1">
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold uppercase text-teal-300 flex items-center gap-1">
                                          <Lightbulb className="w-3 h-3 text-amber-300" />
                                          Recommended Action
                                        </span>
                                        <span className="text-[10px] font-semibold bg-teal-800 text-teal-200 px-1.5 py-0.2 rounded border border-teal-700">
                                          Confidence: {investigation.confidence}
                                        </span>
                                      </div>
                                      <p className="text-xs font-semibold text-teal-50">
                                        {investigation.recommendedAction?.description || investigation.recommendedAction}
                                      </p>
                                      {investigation.recommendedAction?.reason && (
                                        <p className="text-[10px] text-teal-200 pt-0.5">
                                          <span className="font-semibold text-teal-100">Rationale:</span> {investigation.recommendedAction.reason}
                                        </p>
                                      )}
                                      <div className="pt-1.5 flex justify-end">
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            approveAndExecuteAction(patient.patientId, investigation.recommendedAction);
                                          }}
                                          className="px-3 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1"
                                        >
                                          <span>Approve & Execute Action</span>
                                        </button>
                                      </div>
                                    </div>

                                    {investigation.possibleActions && investigation.possibleActions.length > 0 && (
                                      <div className="bg-white p-2 rounded border border-slate-200 text-[11px]">
                                        <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">Possible Action Alternatives</span>
                                        <div className="space-y-1">
                                          {investigation.possibleActions.map((act) => (
                                            <div key={act.id} className="flex items-center justify-between bg-slate-50 p-1 rounded border border-slate-100 text-[10px]">
                                              <span className="text-slate-700">{act.description}</span>
                                              <span className="text-[9px] font-bold uppercase px-1 py-0.2 rounded bg-slate-200 text-slate-700">{act.impact} Impact</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Recent Synthetic Event Trace History */}
                            {patient.eventHistory && patient.eventHistory.length > 0 && (
                              <div className="pt-1">
                                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1.5">
                                  Synthetic Telemetry Ingestion History
                                </span>
                                <div className="space-y-1.5 max-h-32 overflow-y-auto">
                                  {patient.eventHistory.map((h, idx) => (
                                    <div key={idx} className="flex items-center justify-between text-[11px] py-1 px-2.5 bg-slate-50 rounded border border-slate-100">
                                      <div className="flex items-center gap-2">
                                        <ArrowRight className="w-3 h-3 text-slate-400" />
                                        <span className="font-semibold text-slate-800">{h.stage || h.eventType}</span>
                                        <span className="text-slate-500">{h.message}</span>
                                      </div>
                                      <span className="text-slate-400 font-mono">{h.timestamp}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Showing <strong>{filteredPatients.length}</strong> prioritized demo records of <strong>{kpis.networkWorkflows.value}</strong> simulated network workflows</span>
        </div>
        <span className="text-slate-400 italic">Coordinator action logs and resolution details ready in next step</span>
      </div>
    </div>
  );
}
