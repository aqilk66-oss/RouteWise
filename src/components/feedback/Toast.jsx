import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, message, type = 'info', duration = 4000 }) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-status-success shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-status-warning shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-status-danger shrink-0" />,
    info: <Info className="w-5 h-5 text-status-info shrink-0" />,
  };

  const borderColors = {
    success: 'border-status-success/30',
    warning: 'border-status-warning/30',
    error: 'border-status-danger/30',
    info: 'border-status-info/30',
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-white shadow-floating border ${borderColors[toast.type] || 'border-border'} transition-all duration-300`}
            role="alert"
          >
            {icons[toast.type] || icons.info}
            <div className="flex-1 min-w-0">
              {toast.title && <h4 className="text-xs font-bold text-brand-navy">{toast.title}</h4>}
              {toast.message && <p className="text-xs text-brand-slate mt-0.5">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-brand-slate hover:text-brand-navy p-0.5 rounded transition-colors"
              aria-label="Dismiss toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export default ToastProvider;
