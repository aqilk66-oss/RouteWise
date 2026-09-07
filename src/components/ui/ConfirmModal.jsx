import React from 'react';
import { AlertTriangle, Trash2, Archive } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * Confirmation dialog for destructive/archival operations
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed with this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'warning' | 'primary'
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${
          variant === 'danger' ? 'bg-status-danger-bg text-status-danger' :
          variant === 'warning' ? 'bg-status-warning-bg text-status-warning' :
          'bg-brand-blue/10 text-brand-blue'
        }`}>
          {variant === 'danger' ? (
            <Trash2 className="w-6 h-6" />
          ) : variant === 'warning' ? (
            <Archive className="w-6 h-6" />
          ) : (
            <AlertTriangle className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="text-base font-bold text-brand-navy mb-1">{title}</h4>
          <p className="text-xs text-brand-slate leading-relaxed">{message}</p>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-border">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onClose} 
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
