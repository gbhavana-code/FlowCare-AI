import React from 'react';
import { Activity, Database, Radio, Play, Pause } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function Header() {
  const { isRunning, simulatedMinutes } = useSimulation();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Main Product Tag */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-700 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-600/20 shrink-0">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">FlowCare AI</h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  <Radio className={`w-3 h-3 mr-1 ${isRunning ? 'text-teal-600 animate-pulse' : 'text-slate-400'}`} />
                  Orchestration Layer
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">Diagnostic Operations Center</p>
            </div>
          </div>

          {/* Center / Hospital & Synthetic Environment Badge */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md">
              <div className="flex flex-col text-left">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-800 text-xs">FlowCare Demo Hospital</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">
                    DEMO ENVIRONMENT · SYNTHETIC DATA
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Database className="w-3 h-3 text-slate-400" />
                  Event Source: Simulated HIS / LIS / RIS
                </span>
              </div>
            </div>
          </div>

          {/* Right Status Indicators */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium ${
              isRunning 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span className="font-semibold">
                {isRunning ? 'Simulation: ON' : 'Simulation: PAUSED'}
              </span>
              <span className="text-[10px] opacity-75 font-mono">
                (+{simulatedMinutes}m)
              </span>
            </div>

            <div className="hidden sm:flex flex-col items-end text-[11px] text-slate-500 font-medium">
              <span className="text-slate-700 font-semibold">Ops Coordinator View</span>
              <span className="text-slate-400">Autonomous Monitoring</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
