import React from 'react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const defaultDailySpend = [
  { day: 'Mon', spend: 8200 },
  { day: 'Tue', spend: 7400 },
  { day: 'Wed', spend: 11200 },
  { day: 'Thu', spend: 12800 },
  { day: 'Fri', spend: 14900 },
  { day: 'Sat', spend: 12100 },
  { day: 'Sun', spend: 19800 },
];

function CustomGradientBarShape(props: any) {
  const { x, y, width, height, index } = props;
  const gradientId = `spend-bar-gradient-${index}`;
  
  if (width == null || height == null || width <= 0 || height <= 0) {
    return null;
  }

  return (
    <g>
      <rect 
        x={x} 
        y={y} 
        width={width} 
        height={2.5} 
        fill="#000000" 
        stroke="none" 
      />
      <rect 
        x={x} 
        y={y + 2.5} 
        width={width} 
        height={height - 2.5} 
        fill={`url(#${gradientId})`} 
        stroke="none" 
      />
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#000000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.02" />
        </linearGradient>
      </defs>
    </g>
  );
}

export default function ProcurementSpendChart() {
  const activeData = defaultDailySpend.map(d => ({ name: d.day, val: d.spend }));

  return (
    <div 
      id="procurement-spend-chart-card"
      className="flex flex-col bg-white p-6 border-l border-r border-b border-[#dedede] rounded-none shadow-xs"
    >
      <div className="flex items-start justify-between gap-4 mb-6 select-none">
        <div>
          <h3 className="font-sans font-bold text-lg text-black tracking-tight">
            Procurement Spend Trend
          </h3>
          <p className="text-xs text-neutral-500 font-mono mt-0.5">
            Daily procurement spend, last 7 days.
          </p>
        </div>

        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 mt-1">
          <span>▲</span>
          <span>16.4%</span>
        </div>
      </div>

      <div id="spend-chart-viewport" className="h-64 w-full md:h-80 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={activeData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              className="text-xs font-bold font-sans text-neutral-400 fill-neutral-400"
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded border border-[#dedede] bg-white p-3 shadow-sm">
                      <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider mb-0.5">
                        {payload[0].payload.name}
                      </p>
                      <p className="font-sans font-bold text-sm text-black">
                        ${payload[0].value?.toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="val" 
              fill="#000000" 
              shape={<CustomGradientBarShape />} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
