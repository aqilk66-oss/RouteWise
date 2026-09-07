import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Reusable ErrorState component for network or fetch errors
 */
export const ErrorState = ({
  title = 'Something went wrong',
  description = 'An error occurred while loading this section. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-status-danger-bg/40 border border-status-danger/20 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-status-danger/10 text-status-danger flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-brand-navy mb-1.5">{title}</h3>
      <p className="text-sm text-brand-slate max-w-sm mb-6">{description}</p>
      {onRetry && (
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
