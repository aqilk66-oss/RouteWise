import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, ShieldAlert } from 'lucide-react';
import Button from '../ui/Button';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Only log non-sensitive diagnostics during development
    if (import.meta.env.DEV) {
      console.warn("RouteWise caught an operational interface exception:", error, errorInfo);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50" role="alert">
          <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-border shadow-floating text-center">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mx-auto flex items-center justify-center mb-5 shadow-soft">
              <ShieldAlert className="w-8 h-8" />
            </div>
            
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 mb-3">
              Telemetry Exception Guard
            </span>

            <h2 className="text-xl font-bold text-brand-navy mb-2">Transport System Interface Error</h2>
            <p className="text-xs text-brand-slate mb-4 leading-relaxed">
              An unexpected render exception occurred in this module. The session state has been protected to ensure data security.
            </p>

            {this.state.error && (
              <div className="mb-6 p-3 bg-slate-100 rounded-xl text-left border border-slate-200 overflow-hidden">
                <p className="text-[11px] font-mono text-rose-700 font-semibold break-words">
                  {this.state.error?.message || String(this.state.error)}
                </p>
                {this.state.error?.stack && (
                  <details className="mt-2 text-[10px] text-slate-500 font-mono">
                    <summary className="cursor-pointer hover:text-slate-800 select-none">Technical Trace</summary>
                    <pre className="mt-1 p-2 bg-slate-900 text-slate-100 rounded-lg overflow-x-auto max-h-36 whitespace-pre-wrap text-[9px]">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Button
                variant="outline"
                size="md"
                icon={Home}
                onClick={this.handleReset}
                className="w-full sm:w-1/2"
              >
                Go to Home
              </Button>
              <Button
                variant="primary"
                size="md"
                icon={RefreshCw}
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full sm:w-1/2"
              >
                Reload
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
