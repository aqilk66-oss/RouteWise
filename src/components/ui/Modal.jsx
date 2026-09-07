import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/**
 * Accessible, responsive Modal dialog for RouteWise dashboard workflows.
 * Features:
 * - Traps scroll by locking body overflow during mount.
 * - Escape key listener to close modal.
 * - WAI-ARIA compliant role="dialog" aria-modal="true" aria-labelledby.
 * - Restores body overflow cleanly upon unmount.
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'max-w-xl',
}) => {
  const modalContentRef = useRef(null);
  const titleId = title ? `modal-title-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` : 'modal-title';

  useEffect(() => {
    if (!isOpen) return;

    // Lock background scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Keyboard Escape listener
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content Container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div 
          ref={modalContentRef}
          className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-elevated transition-all sm:my-8 w-full ${maxWidth} border border-border animate-fade-in`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-border bg-slate-50/50">
            <div>
              {title && (
                <h3 id={titleId} className="text-base font-bold text-brand-navy leading-6">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-brand-slate mt-0.5">{subtitle}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-brand-slate hover:bg-slate-100 hover:text-brand-navy transition-colors focus-visible:ring-2 focus-visible:ring-brand-blue outline-none"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(100vh-200px)] overflow-y-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
