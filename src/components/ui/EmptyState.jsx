import React from 'react';
import { Inbox } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Reusable empty state component
 */
export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  description = 'There is currently no data available to display.',
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white border border-border/80 ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-surface-subtle flex items-center justify-center text-brand-slate mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-brand-navy mb-1.5">{title}</h3>
      <p className="text-sm text-brand-slate max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
