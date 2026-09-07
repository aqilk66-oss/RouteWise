import React, { forwardRef } from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';

/**
 * Accessible Select dropdown component
 */
export const Select = forwardRef(({
  label,
  id,
  name,
  options = [],
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  placeholder = 'Select an option',
  className = '',
  ...props
}, ref) => {
  const selectId = id || name || `select-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-brand-navy flex items-center justify-between">
          <span>{label} {required && <span className="text-status-danger">*</span>}</span>
        </label>
      )}

      <div className="relative flex items-center">
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
          className={`w-full rounded-lg text-sm bg-white border transition-all duration-200 py-2.5 pl-3.5 pr-10 appearance-none outline-none cursor-pointer
            ${error 
              ? 'border-status-danger focus:ring-2 focus:ring-status-danger/20' 
              : 'border-border hover:border-brand-slate/40 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'}
            disabled:bg-surface-subtle disabled:cursor-not-allowed text-brand-navy`}
          {...props}
        >
          {placeholder && <option value="" disabled>{placeholder}</option>}
          {options.map((opt, i) => (
            <option key={opt.value || i} value={opt.value}>
              {opt.label || opt.name || opt.value}
            </option>
          ))}
        </select>
        <div className="absolute right-3 text-brand-slate pointer-events-none">
          {error ? <AlertCircle className="w-4 h-4 text-status-danger" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {error && (
        <p id={`${selectId}-error`} className="text-xs text-status-danger font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${selectId}-helper`} className="text-xs text-brand-slate">
          {helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
