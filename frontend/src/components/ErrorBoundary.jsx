import React from "react";
import "./ErrorBoundary.css";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary__content">
            <h1>Oops! Something went wrong</h1>
            <p>We encountered an error loading this page. Please try refreshing.</p>
            <button 
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="error-boundary__button"
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
