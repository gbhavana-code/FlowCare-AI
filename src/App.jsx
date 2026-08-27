import React from 'react';
import Header from './components/Header';
import KpiCards from './components/KpiCards';
import PatientTable from './components/PatientTable';
import AgentActivityPanel from './components/AgentActivityPanel';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Play, Pause, RotateCcw, Database, ShieldCheck, Activity } from 'lucide-react';

function DashboardContent() {
  const { isRunning, toggleSimulation, resetSimulation, simulatedMinutes } = useSimulation();

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900">
      {/* Top Navigation */}
      <Header />

      {/* Main Command Center Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Page Title & Control Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
                Hospital Flow Command Center
              </h2>
              <span className="bg-teal-100 text-teal-800 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-teal-200">
                Operations Coordinator View
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-1 font-medium">
              Operational command center for detecting and resolving workflow bottlenecks.
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Autonomous orchestration layer sitting on top of HIS, LIS, and RIS event streams to detect stalls and generate actionable coordinator alerts.
            </p>
          </div>

          {/* Demo Controls: Pause/Play & Reset */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {/* Simulation Status & Toggle Button */}
            <button
              type="button"
              onClick={toggleSimulation}
              className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-md border shadow-xs transition-colors ${
                isRunning 
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300' 
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600'
              }`}
              title={isRunning ? 'Pause the live demo clock' : 'Resume the live demo clock'}
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-slate-600" />
                  <span>Pause Simulation</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-white" />
                  <span>Resume Simulation</span>
                </>
              )}
            </button>

            {/* Reset Demo Button */}
            <button
              type="button"
              onClick={resetSimulation}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 shadow-xs transition-colors"
              title="Reset workflows and demo event timeline to initial baseline"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset Demo</span>
            </button>

            {/* Demo Source Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium bg-slate-800 text-white rounded-md shadow-xs">
              <Database className="w-3.5 h-3.5 text-teal-300" />
              <span>Simulated Event Stream</span>
            </div>
          </div>
        </div>

        {/* 4 Dynamic KPI Metric Cards */}
        <KpiCards />

        {/* Operational Grid: Patient Workflow Table + Agent Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Patient Workflow Table (8 of 12 columns on desktop) */}
          <div className="lg:col-span-8">
            <PatientTable />
          </div>

          {/* Agent Activity Panel (4 of 12 columns on desktop) */}
          <div className="lg:col-span-4">
            <AgentActivityPanel />
          </div>

        </div>

      </main>

      {/* Footer with Clear Positioning */}
      <footer className="bg-white border-t border-slate-200 py-3 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>FlowCare AI • Agentic Workflow Orchestration Layer (Demo Environment · Simulated Data)</span>
          <span className="text-slate-400">Step 2: Simulated Event Engine & Bottleneck Detector</span>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <DashboardContent />
    </SimulationProvider>
  );
}
