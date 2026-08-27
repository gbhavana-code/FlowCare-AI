import React from 'react';
import { Layers, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import { useSimulation } from '../context/SimulationContext';

export default function KpiCards() {
  const { kpis } = useSimulation();

  const cards = [
    {
      id: 'active',
      title: kpis.networkWorkflows.title,
      value: kpis.networkWorkflows.value,
      subtext: kpis.networkWorkflows.subtext,
      badgeText: kpis.networkWorkflows.badgeText,
      description: kpis.networkWorkflows.description,
      icon: Layers,
      iconColor: 'text-teal-700',
      iconBg: 'bg-teal-50 border-teal-200',
      borderAccent: 'border-l-4 border-l-teal-600',
      tagColor: 'text-teal-800 bg-teal-50 border-teal-200'
    },
    {
      id: 'atRisk',
      title: kpis.atRisk.title,
      value: kpis.atRisk.value,
      subtext: kpis.atRisk.subtext,
      badgeText: kpis.atRisk.badgeText,
      description: kpis.atRisk.description,
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-50 border-amber-200',
      borderAccent: 'border-l-4 border-l-amber-500',
      tagColor: 'text-amber-800 bg-amber-50 border-amber-200'
    },
    {
      id: 'bottlenecks',
      title: kpis.bottlenecks.title,
      value: kpis.bottlenecks.value,
      subtext: kpis.bottlenecks.subtext,
      badgeText: kpis.bottlenecks.badgeText,
      description: kpis.bottlenecks.description,
      icon: AlertOctagon,
      iconColor: 'text-rose-600',
      iconBg: 'bg-rose-50 border-rose-200',
      borderAccent: 'border-l-4 border-l-rose-500',
      tagColor: 'text-rose-800 bg-rose-50 border-rose-200'
    },
    {
      id: 'resolved',
      title: kpis.resolvedToday.title,
      value: kpis.resolvedToday.value,
      subtext: kpis.resolvedToday.subtext,
      badgeText: kpis.resolvedToday.badgeText,
      description: kpis.resolvedToday.description,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50 border-emerald-200',
      borderAccent: 'border-l-4 border-l-emerald-500',
      tagColor: 'text-emerald-800 bg-emerald-50 border-emerald-200'
    },
  ];

  return (
    <section aria-label="Key Performance Indicators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const IconComponent = card.icon;
        return (
          <div
            key={card.id}
            className={`bg-white rounded-lg border border-slate-200 p-5 shadow-sm hover:shadow transition-shadow ${card.borderAccent}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{card.title}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight transition-all duration-300">
                    {card.value}
                  </span>
                </div>
              </div>
              <div className={`p-2.5 rounded-md border ${card.iconBg}`}>
                <IconComponent className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className={`px-2 py-0.5 rounded font-medium border ${card.tagColor}`}>
                {card.badgeText}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {card.subtext}
              </span>
            </div>
          </div>
        );
      })}
    </section>
  );
}
