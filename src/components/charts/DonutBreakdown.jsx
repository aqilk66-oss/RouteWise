import React from 'react';

/**
 * Clean SVG Donut Breakdown for Categorical Proportions (e.g., Trip Statuses, Fleet State)
 */
export const DonutBreakdown = ({
  data = [], // [{ label: 'Completed', value: 45, color: '#059669' }]
  size = 180,
  strokeWidth = 24,
  title = '',
  centerLabel = '',
  centerValue = '',
  emptyText = 'No breakdown data available',
  className = '',
}) => {
  const total = data.reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  if (total === 0) {
    return (
      <div className={`flex items-center justify-center h-48 bg-slate-50/50 rounded-2xl border border-dashed border-border text-xs text-brand-slate ${className}`}>
        {emptyText}
      </div>
    );
  }

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  let currentOffset = 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {title && <h4 className="text-xs font-bold text-brand-navy mb-1">{title}</h4>}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 bg-slate-50/70 rounded-2xl border border-border">
        {/* SVG Donut */}
        <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="transform -rotate-90">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke="#e2e8f0"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {/* Segment arcs */}
            {data.map((item, idx) => {
              const val = Number(item.value) || 0;
              if (val === 0) return null;
              const strokeDasharray = `${(val / total) * circumference} ${circumference}`;
              const strokeDashoffset = -currentOffset;
              currentOffset += (val / total) * circumference;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={item.color || '#2563eb'}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  className="transition-all duration-500 hover:opacity-85"
                />
              );
            })}
          </svg>

          {/* Centered label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-black text-brand-navy leading-none">
              {centerValue !== '' ? centerValue : total}
            </span>
            <span className="text-[10px] font-bold text-brand-slate uppercase tracking-wider mt-0.5">
              {centerLabel || 'Total'}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="space-y-2 text-xs min-w-[140px]">
          {data.map((item, idx) => {
            const val = Number(item.value) || 0;
            const pct = total > 0 ? Math.round((val / total) * 100) : 0;

            return (
              <div key={idx} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color || '#2563eb' }}
                  />
                  <span className="text-brand-navy font-semibold">{item.label}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brand-navy">{val}</span>
                  <span className="text-[10px] text-brand-slate ml-1">({pct}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DonutBreakdown;
