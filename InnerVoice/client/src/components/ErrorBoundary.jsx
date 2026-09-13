import React from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0c0e12] text-[#f5f2eb] flex items-center justify-center p-6 text-center relative overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          <div
            className="p-8 sm:p-10 rounded-3xl max-w-md w-full border border-white/[0.12] shadow-2xl relative z-10 animate-scale-up"
            style={{
              background: "linear-gradient(180deg, rgba(22, 25, 31, 0.96) 0%, rgba(14, 16, 20, 0.98) 100%)",
              boxShadow: "0 25px 60px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            }}
          >
            <div className="w-16 h-16 bg-rose-500/15 text-rose-400 rounded-full flex items-center justify-center mx-auto mb-5 border border-rose-500/30">
              <AlertTriangle size={30} />
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-[#f5f2eb] mb-2 font-normal">
              Pause in the Melody
            </h1>

            <p className="text-xs sm:text-sm text-[#9e9990] font-sans mb-6 leading-relaxed">
              An unexpected disturbance paused this page. Your journal entries and memories are safe.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 text-[#121418] font-sans font-medium text-xs sm:text-sm py-3.5 rounded-xl shadow-lg hover:brightness-105 active:scale-[0.99] transition-all"
              style={{
                background: "linear-gradient(180deg, #dfbc86 0%, #c89e62 100%)",
              }}
            >
              <RefreshCcw size={16} />
              <span>Restore Page</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
