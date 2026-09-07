import React, { useState } from 'react';
import { Calendar, ChevronDown, Check } from 'lucide-react';

const PERIOD_OPTIONS = [
  { id: 'today', label: 'Today' },
  { id: 'yesterday', label: 'Yesterday' },
  { id: 'last7days', label: 'Last 7 Days' },
  { id: 'last30days', label: 'Last 30 Days' },
  { id: 'thisMonth', label: 'This Month' },
  { id: 'thisYear', label: 'This Year' },
  { id: 'custom', label: 'Custom Range' },
];

export const ReportPeriodSelector = ({
  selectedPeriod = 'last7days',
  onPeriodChange,
  customStart = '',
  customEnd = '',
  onCustomDateChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  const activeOption = PERIOD_OPTIONS.find((opt) => opt.id === selectedPeriod) || PERIOD_OPTIONS[2];

  const handleSelect = (id) => {
    onPeriodChange(id);
    setIsOpen(false);
    setError(null);
  };

  const handleStartChange = (e) => {
    const val = e.target.value;
    if (customEnd && val > customEnd) {
      setError('Start date cannot be after end date.');
    } else {
      setError(null);
    }
    if (onCustomDateChange) onCustomDateChange(val, customEnd);
  };

  const handleEndChange = (e) => {
    const val = e.target.value;
    if (customStart && val < customStart) {
      setError('End date cannot be before start date.');
    } else {
      setError(null);
    }
    if (onCustomDateChange) onCustomDateChange(customStart, val);
  };

  return (
    <div className={`flex flex-wrap items-center gap-2 relative ${className}`}>
      {/* Period Dropdown Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border text-xs font-bold text-brand-navy shadow-soft hover:bg-slate-50 transition-colors"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          <Calendar className="w-3.5 h-3.5 text-brand-blue" />
          <span>{activeOption.label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-brand-slate" />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1.5 w-44 bg-white border border-border rounded-2xl shadow-elevated py-1.5 z-30 animate-fade-in text-xs">
            {PERIOD_OPTIONS.map((opt) => {
              const isSelected = opt.id === selectedPeriod;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2 text-left transition-colors font-medium ${
                    isSelected ? 'bg-blue-50/70 text-brand-blue font-bold' : 'text-brand-navy hover:bg-slate-50'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-blue" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Custom Date Inputs if Custom Range selected */}
      {selectedPeriod === 'custom' && (
        <div className="flex items-center gap-2 text-xs">
          <input
            type="date"
            value={customStart}
            onChange={handleStartChange}
            className="px-2.5 py-1.5 rounded-xl border border-border bg-white text-brand-navy text-xs font-medium outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          <span className="text-brand-slate font-bold">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={handleEndChange}
            className="px-2.5 py-1.5 rounded-xl border border-border bg-white text-brand-navy text-xs font-medium outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          {error && <span className="text-[11px] text-rose-600 font-medium ml-1">{error}</span>}
        </div>
      )}
    </div>
  );
};

export default ReportPeriodSelector;
