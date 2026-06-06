import React from 'react';
import { KPIMetric } from '../types';

interface KPIGridProps {
  metrics: KPIMetric[];
}

export default function KPIGrid({ metrics }: KPIGridProps) {
  return (
    <div 
      id="kpi-cards-grid" 
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 bg-white border border-[#dedede] rounded-t-md divide-y lg:divide-y-0 lg:divide-x divide-[#dedede] shadow-xs"
    >
      {metrics.map((metric) => {
        const isPositive = metric.delta >= 0;
        
        return (
          <div 
            key={metric.title} 
            id={`kpi-card-${metric.title.toLowerCase().replace(/\s+/g, '-')}`}
            className="flex flex-col bg-white p-8 transition-colors hover:bg-neutral-50/50"
          >
            <div className="mb-4">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest font-sans">
                {metric.title}
              </span>
            </div>

            <div className="mb-5">
              <p className="font-sans font-bold text-4xl text-black tracking-tight">
                {metric.value}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] font-sans">
              <span 
                className={`font-bold flex items-center gap-0.5 ${
                  isPositive ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {isPositive ? '▲' : '▼'} {Math.abs(metric.delta)}%
              </span>
              <span className="text-neutral-400 font-medium font-sans">
                {metric.subtitle}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export const defaultMetrics: KPIMetric[] = [
  {
    title: 'Active RFQ',
    value: '24',
    delta: 3.1,
    subtitle: 'vs last week'
  },
  {
    title: 'Quotations',
    value: '78',
    delta: 12.4,
    subtitle: 'vs last week'
  },
  {
    title: 'Approvals',
    value: '5',
    delta: -0.4,
    subtitle: 'vs last week'
  },
  {
    title: 'Invoices',
    value: '31',
    delta: 8.7,
    subtitle: 'vs last week'
  }
];
