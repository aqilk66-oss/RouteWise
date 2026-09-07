import React, { forwardRef } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * Accessible, state-aware Input field
 */
export const Input = forwardRef(({
  label,
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  success,
  helperText,
  disabled = false,
  required = false,
  icon: Icon,
  className = '',
  ...props
}, ref) => {
  const inputId = id || name || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-brand-navy flex items-center justify-between">
          <span>{label} {required && <span className="text-status-danger">*</span>}</span>
        </label>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 pointer-events-none text-brand-slate">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
          className={`w-full rounded-lg text-sm bg-white border transition-all duration-200 py-2.5 px-3.5 outline-none
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${error 
              ? 'pr-10 border-status-danger focus:ring-2 focus:ring-status-danger/20' 
              : success 
              ? 'pr-10 border-status-success focus:ring-2 focus:ring-status-success/20' 
              : 'border-border hover:border-brand-slate/40 focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20'}
            disabled:bg-surface-subtle disabled:cursor-not-allowed text-brand-navy placeholder:text-brand-slate/60`}
          {...props}
        />
        {error && (
          <div className="absolute right-3 text-status-danger pointer-events-none">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        {!error && success && (
          <div className="absolute right-3 text-status-success pointer-events-none">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        )}
      </div>

      {error && (
        <p id={`${inputId}-error`} className="text-xs text-status-danger font-medium">
          {error}
        </p>
      )}
      {!error && helperText && (
        <p id={`${inputId}-helper`} className="text-xs text-brand-slate">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
