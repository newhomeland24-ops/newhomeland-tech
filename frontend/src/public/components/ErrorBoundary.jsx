import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            {this.state.error && (
              <pre className="text-xs text-red-600 bg-red-50 p-3 rounded-lg mb-4 text-left overflow-x-auto whitespace-pre-wrap font-mono">
                {this.state.error.message || String(this.state.error)}
              </pre>
            )}
            <p className="text-gray-600 mb-6 text-sm">We apologize for the inconvenience. Please try refreshing the page or come back later.</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors w-full"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
