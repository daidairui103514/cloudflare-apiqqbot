import React from "react";

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null; errorInfo: React.ErrorInfo | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-4xl mx-auto mt-10 bg-red-50 border border-red-200 rounded-lg text-red-900">
          <h1 className="text-xl font-bold mb-4">Application Error</h1>
          <p className="mb-4">The application encountered a rendering error. Please check the stack trace below:</p>
          <pre className="text-xs bg-red-100 p-4 rounded overflow-auto mb-4 whitespace-pre-wrap">
            {this.state.error?.toString()}
          </pre>
          <pre className="text-xs bg-red-100 p-4 rounded overflow-auto whitespace-pre-wrap">
            {this.state.errorInfo?.componentStack}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
