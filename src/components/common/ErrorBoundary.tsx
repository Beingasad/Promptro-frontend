import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8f7fc] dark:bg-[#0d0b14] p-6">
          <div className="max-w-md w-full rounded-[2.5rem] p-10 text-center pill-glass">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8">
              <AlertCircle className="w-10 h-10" />
            </div>
            
            <h1 className="text-2xl font-bold text-[#171421] dark:text-white mb-3">Something went wrong</h1>
            <p className="text-[#756d8d] dark:text-[#afa6c8] mb-8 font-medium">
              We encountered an unexpected error. This usually happens due to a missing component or a temporary glitch.
            </p>

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleReset}
                className="w-full py-4 rounded-2xl bg-primary text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Page
              </button>
              <a
                href="/"
                className="w-full py-4 rounded-2xl border border-[#e9e2f3] dark:border-white/10 text-[#756d8d] dark:text-[#afa6c8] font-bold flex items-center justify-center gap-2 hover:bg-[#f8f7fc] dark:hover:bg-white/5 transition-all"
              >
                <Home className="w-5 h-5" />
                Go to Homepage
              </a>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-8 p-4 bg-red-50 dark:bg-red-500/5 rounded-xl border border-red-100 dark:border-red-500/10 text-left overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-red-600 dark:text-red-400">
                  {this.state.error.toString()}
                </p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
