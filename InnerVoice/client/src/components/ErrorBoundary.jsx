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
        <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-6 text-center">
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl max-w-md w-full border border-red-100 dark:border-red-900/30">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertTriangle className="text-red-500" size={32} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Something went wrong
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              An unexpected error occurred in the application. We've logged the issue.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white py-3 rounded-xl font-semibold transition"
            >
              <RefreshCcw size={18} />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
