import React, { useState } from 'react';
import { 
  Bot, 
  AlertOctagon, 
  BrainCircuit, 
  Lightbulb, 
  PlayCircle, 
  Clock, 
  Sparkles, 
  Inbox, 
  UserCheck, 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  ShieldAlert, 
  ListChecks, 
  X,
  Cpu
} from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function AgentActivityPanel() {
  const { events, isRunning, approveAndExecuteAction } = useSimulation();
  const [selectedInvestigation, setSelectedInvestigation] = useState(null);
  const [expandedCards, setExpandedCards] = useState({});

  const toggleExpand = (id) => {
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getImpactBadge = (impact) => {
    switch (impact) {
      case 'HIGH':
        return <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">High Impact</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">Medium Impact</span>;
      case 'LOW':
      default:
        return <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-300">Low Risk/Impact</span>;
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'received':
        return <Inbox className="w-4 h-4 text-sky-600" />;
      case 'bottleneck':
        return <AlertOctagon className="w-4 h-4 text-rose-600" />;
      case 'analysis':
        return <BrainCircuit className="w-4 h-4 text-amber-600" />;
      case 'recommendation':
        return <Sparkles className="w-4 h-4 text-teal-700" />;
      case 'approval':
        return <UserCheck className="w-4 h-4 text-purple-600" />;
      case 'resumed':
        return <PlayCircle className="w-4 h-4 text-emerald-600" />;
      default:
        return <Bot className="w-4 h-4 text-slate-600" />;
    }
  };

  const getEventBorder = (type) => {
    switch (type) {
      case 'received':
        return 'border-sky-200 bg-sky-50/40';
      case 'bottleneck':
        return 'border-rose-200 bg-rose-50/40 ring-1 ring-rose-300/50';
      case 'analysis':
        return 'border-amber-200 bg-amber-50/40';
      case 'recommendation':
        return 'border-teal-400/80 bg-teal-50/50 ring-1 ring-teal-500/30 shadow-xs';
      case 'approval':
        return 'border-purple-200 bg-purple-50/40';
      case 'resumed':
        return 'border-emerald-200 bg-emerald-50/40';
      default:
        return 'border-slate-200 bg-slate-50';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm flex flex-col h-full">
      {/* Panel Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-gradient-to-b from-white to-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-teal-100 text-teal-800">
              <Bot className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Agent Activity Stream</h2>
          </div>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border ${
            isRunning 
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}>
            <Radio className={`w-3 h-3 ${isRunning ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
            {isRunning ? 'Live Engine Feed' : 'Feed Paused'}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          Automated bottleneck detection & LLM agentic investigation feed
        </p>
      </div>

      {/* Events Feed */}
      <div className="p-4 space-y-3.5 overflow-y-auto max-h-[calc(100vh-280px)]">
        {events.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            Awaiting incoming simulated events...
          </div>
        ) : (
          events.map((event) => {
            const hasInvestigation = !!event.investigation;
            const isExpanded = expandedCards[event.id] ?? true; // Default open for recommendations

            return (
              <div
                key={event.id}
                className={`p-3.5 rounded-lg border text-xs transition-colors hover:shadow-xs ${getEventBorder(event.type)}`}
              >
                {/* Top Bar: Icon + Event Title + Time */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="p-1 rounded bg-white border border-slate-200 shadow-2xs shrink-0">
                      {getEventIcon(event.type)}
                    </span>
                    <span className="font-semibold text-slate-900 text-xs leading-snug">
                      {event.title}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {event.timestamp}
                  </span>
                </div>

                {/* Standard Event Description if not an investigation */}
                {!hasInvestigation && (
                  <p className="text-slate-600 mt-2 text-xs leading-relaxed">
                    {event.description}
                  </p>
                )}

                {/* Structured LLM Agent Investigation Card */}
                {hasInvestigation && (
                  <div className="mt-2.5 pt-2.5 border-t border-teal-200/80 space-y-2.5">
                    {/* Header Banner & Model / Fallback Indicator */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-teal-800 text-white shadow-2xs">
                        <Sparkles className="w-3 h-3 text-teal-300" />
                        AI Investigation
                      </span>
                      <span className="font-mono text-[11px] font-bold text-slate-700">
                        {event.investigation.patientId} · {event.investigation.stage}
                      </span>
                    </div>

                    {/* Source / Fallback Notice */}
                    {event.investigation.sourceNotice && (
                      <div className={`px-2 py-1 rounded text-[10px] font-medium flex items-center gap-1.5 border ${
                        event.investigation.source === 'AI_AGENT'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        <Cpu className="w-3 h-3 text-slate-500 shrink-0" />
                        <span>{event.investigation.sourceNotice}</span>
                      </div>
                    )}

                    {/* Likely Cause */}
                    <div className="bg-white p-2.5 rounded border border-slate-200">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">Likely Cause</span>
                      <p className="text-xs font-semibold text-slate-900 mt-0.5">
                        {event.investigation.likelyCause}
                      </p>
                    </div>

                    {/* Expandable Evidence & Possible Actions Section */}
                    {isExpanded && (
                      <>
                        {/* Operational Evidence */}
                        <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1">
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">Operational Evidence</span>
                          <ul className="space-y-1 text-slate-600 text-[11px]">
                            {event.investigation.evidence.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-1.5">
                                <span className="text-teal-600 font-bold">•</span>
                                <span>{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Possible Operational Actions */}
                        {event.investigation.possibleActions && event.investigation.possibleActions.length > 0 && (
                          <div className="bg-white p-2.5 rounded border border-slate-200 space-y-1.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1">
                              <ListChecks className="w-3 h-3 text-slate-500" />
                              Possible Operational Actions
                            </span>
                            <div className="space-y-1.5">
                              {event.investigation.possibleActions.map((act) => (
                                <div key={act.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-1.5 rounded border border-slate-100">
                                  <span className="text-slate-800">{act.description}</span>
                                  {getImpactBadge(act.impact)}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommended Action */}
                        <div className="bg-teal-900 text-white p-3 rounded-md shadow-xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase text-teal-300 flex items-center gap-1">
                              <Lightbulb className="w-3 h-3 text-amber-300" />
                              Recommended Action
                            </span>
                            <span className="text-[10px] font-semibold bg-teal-800 text-teal-200 px-1.5 py-0.2 rounded border border-teal-700">
                              Confidence: {event.investigation.confidence}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-teal-50 leading-snug">
                            {event.investigation.recommendedAction?.description || event.investigation.recommendedAction}
                          </p>
                          {event.investigation.recommendedAction?.reason && (
                            <p className="text-[11px] text-teal-200 pt-0.5 border-t border-teal-800/80">
                              <span className="font-semibold text-teal-100">Reason:</span> {event.investigation.recommendedAction.reason}
                            </p>
                          )}
                        </div>
                      </>
                    )}

                    {/* Card Actions & Human Approval Status */}
                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded">
                        <ShieldAlert className="w-3 h-3 text-amber-700" />
                        <span>Human approval required</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => toggleExpand(event.id)}
                          className="text-[11px] text-slate-500 hover:text-slate-800 px-2 py-1 rounded hover:bg-white/60 transition-colors inline-flex items-center gap-0.5"
                        >
                          <span>{isExpanded ? 'Less' : 'Details'}</span>
                          {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedInvestigation(event.investigation)}
                          className="text-[11px] font-semibold text-teal-800 bg-white hover:bg-teal-50 border border-teal-300 hover:border-teal-400 px-2.5 py-1 rounded shadow-2xs transition-colors"
                        >
                          Review Recommendation
                        </button>

                        <button
                          type="button"
                          onClick={() => approveAndExecuteAction(event.investigation.patientId, event.investigation.recommendedAction)}
                          className="text-[11px] font-semibold text-white bg-teal-700 hover:bg-teal-800 px-2.5 py-1 rounded shadow-2xs transition-colors inline-flex items-center gap-1"
                        >
                          <span>Approve Action</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Event Footer: Agent Tag & Patient Tag */}
                <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="font-medium text-slate-500 flex items-center gap-1">
                    <Bot className="w-3 h-3 text-teal-600" />
                    {event.agent}
                  </span>
                  <span className="font-mono font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                    {event.patientId}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Review Recommendation Detail (Human Approval Mandatory) */}
      {selectedInvestigation && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-2xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-teal-600 text-white">
                  <BrainCircuit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">AI Agent Recommendation Review</h3>
                  <p className="text-[11px] text-slate-400">
                    Hospital Operations Coordinator Review • Authorization Required
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvestigation(null)}
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 text-xs text-slate-700 max-h-[70vh] overflow-y-auto">
              {/* Context Summary */}
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Patient Case</span>
                  <p className="font-mono font-bold text-slate-900">{selectedInvestigation.patientId}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400">Workflow & Stage</span>
                  <p className="font-semibold text-slate-900">{selectedInvestigation.workflowType} · {selectedInvestigation.stage}</p>
                </div>
              </div>

              {/* Likely Cause */}
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500">Likely Operational Cause</span>
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-md mt-1 font-semibold text-rose-900">
                  {selectedInvestigation.likelyCause}
                </div>
              </div>

              {/* Evidence */}
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500">Supporting Operational Evidence</span>
                <div className="mt-1 space-y-1.5 p-3 bg-slate-50 rounded-md border border-slate-200">
                  {selectedInvestigation.evidence.map((ev, i) => (
                    <div key={i} className="flex items-start gap-2 text-slate-700">
                      <span className="text-teal-600 font-bold">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Possible Actions */}
              {selectedInvestigation.possibleActions && selectedInvestigation.possibleActions.length > 0 && (
                <div>
                  <span className="text-[11px] font-bold uppercase text-slate-500">Possible Operational Actions</span>
                  <div className="mt-1 space-y-1.5">
                    {selectedInvestigation.possibleActions.map((act) => (
                      <div key={act.id} className="p-2.5 bg-slate-50 rounded-md border border-slate-200 flex items-center justify-between">
                        <span className="text-slate-800 font-medium">{act.description}</span>
                        {getImpactBadge(act.impact)}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              <div>
                <span className="text-[11px] font-bold uppercase text-slate-500">AI Recommended Operational Action</span>
                <div className="p-3.5 bg-teal-50 border border-teal-300 rounded-md mt-1 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-teal-950 text-xs">
                      {selectedInvestigation.recommendedAction?.description || selectedInvestigation.recommendedAction}
                    </p>
                    <span className="text-[10px] font-semibold bg-teal-100 text-teal-800 px-2 py-0.5 rounded border border-teal-200">
                      Confidence: {selectedInvestigation.confidence}
                    </span>
                  </div>
                  {selectedInvestigation.recommendedAction?.reason && (
                    <p className="text-[11px] text-teal-800">
                      <span className="font-semibold">Rationale:</span> {selectedInvestigation.recommendedAction.reason}
                    </p>
                  )}
                </div>
              </div>

              {/* Human Approval Mandatory Notice */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-900 block">Human Approval Required</span>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    FlowCare AI reasons about operational bottlenecks and presents actionable recommendations for coordinator review. Autonomous execution is disabled; human approval will trigger execution in the next stage.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-mono">
                Bottleneck ID: {selectedInvestigation.bottleneckId}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedInvestigation(null)}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-xs font-semibold shadow-xs transition-colors"
                >
                  Close Review
                </button>
                <button
                  type="button"
                  onClick={() => {
                    approveAndExecuteAction(selectedInvestigation.patientId, selectedInvestigation.recommendedAction);
                    setSelectedInvestigation(null);
                  }}
                  className="px-4 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded text-xs font-semibold shadow-xs transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Approve & Execute Action</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="p-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between mt-auto">
        <span className="flex items-center gap-1 text-teal-700 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          LLM Operational Reasoning Layer
        </span>
        <span className="text-[11px] text-slate-400">Human Authorization Stage</span>
      </div>
    </div>
  );
}
