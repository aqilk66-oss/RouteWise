import React from 'react';

/**
 * Clean SVG/HTML responsive Bar Chart Visualizer using RouteWise Design System
 * Supports vertical bars with values, labels, and accessible attributes
 */
export const BarChartVisualizer = ({
  data = [], // [{ label: 'Mon', value: 12, color?: 'blue' | 'teal' | 'emerald' | 'amber' | 'rose' | 'navy' }]
  height = 200,
  title = '',
  emptyText = 'No data available for this chart',
  className = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-48 bg-slate-50/50 rounded-2xl border border-dashed border-border text-xs text-brand-slate ${className}`}>
        {emptyText}
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => Number(d.value) || 0), 1);

  const colorMap = {
    blue: 'bg-brand-blue hover:bg-blue-600',
    teal: 'bg-brand-teal hover:bg-teal-600',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    amber: 'bg-amber-500 hover:bg-amber-600',
    rose: 'bg-rose-500 hover:bg-rose-600',
    navy: 'bg-brand-navy hover:bg-slate-800',
    slate: 'bg-slate-400 hover:bg-slate-500',
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {title && <h4 className="text-xs font-bold text-brand-navy mb-2">{title}</h4>}
      <div 
        className="flex items-end justify-between gap-2 sm:gap-4 pt-6 pb-2 px-3 bg-slate-50/70 rounded-2xl border border-border overflow-x-auto custom-scrollbar"
        style={{ height: `${height}px` }}
        role="img"
        aria-label={title || 'Bar chart data visualization'}
      >
        {data.map((item, index) => {
          const heightPct = Math.max(8, Math.round(((Number(item.value) || 0) / maxValue) * 100));
          const colorClass = colorMap[item.color] || colorMap.blue;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center justify-end h-full min-w-[36px] max-w-[64px] group relative"
            >
              {/* Tooltip value */}
              <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none bg-brand-navy text-white text-[10px] font-bold px-2 py-0.5 rounded-lg shadow-soft whitespace-nowrap z-10">
                {item.value}
              </div>

              {/* Value label above bar */}
              <span className="text-[10px] font-bold text-brand-navy mb-1.5 opacity-80 group-hover:opacity-100">
                {item.value}
              </span>

              {/* The bar itself */}
              <div
                className={`w-full rounded-t-xl transition-all duration-500 ${colorClass} shadow-sm`}
                style={{ height: `${heightPct}%` }}
              />

              {/* Category label below bar */}
              <span className="text-[10px] font-semibold text-brand-slate mt-2 truncate w-full text-center group-hover:text-brand-navy">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarChartVisualizer;
