import React from 'react';

/**
 * Clean SVG Line & Area Trend Visualizer for Time-Series Analytics
 */
export const TrendLineVisualizer = ({
  data = [], // [{ label: 'Sep 1', value: 14 }]
  height = 180,
  title = '',
  lineColor = '#2563eb', // brand-blue
  areaColor = 'rgba(37, 99, 235, 0.12)',
  emptyText = 'No trend data available for this range',
  className = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center h-44 bg-slate-50/50 rounded-2xl border border-dashed border-border text-xs text-brand-slate ${className}`}>
        {emptyText}
      </div>
    );
  }

  const values = data.map((d) => Number(d.value) || 0);
  const maxVal = Math.max(...values, 1);
  const minVal = Math.min(...values, 0);
  const range = maxVal - minVal || 1;

  // Viewport dimensions
  const svgWidth = 600;
  const svgHeight = height;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 30;

  const innerWidth = svgWidth - paddingX * 2;
  const innerHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = data.map((item, idx) => {
    const x = paddingX + (idx / Math.max(data.length - 1, 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((Number(item.value) - minVal) / range) * innerHeight;
    return { x, y, label: item.label, value: item.value };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    return `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`;
  }, '');

  // Closed area polygon
  const areaD = points.length > 0 
    ? `${pathD} L ${points[points.length - 1].x} ${paddingTop + innerHeight} L ${points[0].x} ${paddingTop + innerHeight} Z`
    : '';

  return (
    <div className={`space-y-2 ${className}`}>
      {title && <h4 className="text-xs font-bold text-brand-navy mb-2">{title}</h4>}
      <div className="p-3 bg-slate-50/70 rounded-2xl border border-border overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label={title || 'Trend Line Visualization'}
        >
          {/* Subtle Gridlines */}
          <line
            x1={paddingX}
            y1={paddingTop}
            x2={svgWidth - paddingX}
            y2={paddingTop}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop + innerHeight / 2}
            x2={svgWidth - paddingX}
            y2={paddingTop + innerHeight / 2}
            stroke="#e2e8f0"
            strokeDasharray="4 4"
          />
          <line
            x1={paddingX}
            y1={paddingTop + innerHeight}
            x2={svgWidth - paddingX}
            y2={paddingTop + innerHeight}
            stroke="#cbd5e1"
          />

          {/* Shaded Area */}
          {areaD && <path d={areaD} fill={areaColor} />}

          {/* Trend Polyline */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke={lineColor}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Dots & Labels */}
          {points.map((pt, idx) => (
            <g key={idx} className="group cursor-pointer">
              <circle
                cx={pt.x}
                cy={pt.y}
                r="4"
                fill="#ffffff"
                stroke={lineColor}
                strokeWidth="2.5"
                className="transition-all group-hover:r-6"
              />
              {/* Date Ticks */}
              {(idx === 0 || idx === points.length - 1 || idx % Math.ceil(points.length / 5) === 0) && (
                <text
                  x={pt.x}
                  y={svgHeight - 8}
                  fontSize="9"
                  fill="#64748b"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {pt.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};

export default TrendLineVisualizer;
