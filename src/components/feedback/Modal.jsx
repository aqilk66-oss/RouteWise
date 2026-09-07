import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';

/**
 * Accessible Modal Component with GSAP backdrop & dialog transition and Escape listener
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let ctx;

      if (!prefersReducedMotion) {
        ctx = gsap.context(() => {
          gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.2, ease: 'power2.out' });
          gsap.fromTo(
            modalRef.current,
            { opacity: 0, scale: 0.95, y: 15 },
            { opacity: 1, scale: 1, y: 0, duration: 0.25, ease: 'back.out(1.4)' }
          );
        });
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        if (ctx) ctx.revert();
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-dark/50 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size] || sizeClasses.md} bg-white rounded-2xl shadow-floating border border-border overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
          <h3 className="text-lg font-bold text-brand-navy">{title}</h3>
          {showClose && (
            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="p-1 rounded-lg text-brand-slate hover:text-brand-navy hover:bg-surface-subtle transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
        <div className="p-6 max-h-[80vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
