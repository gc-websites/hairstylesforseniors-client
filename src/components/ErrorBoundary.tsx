import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional custom fallback. When omitted, a friendly content-bearing page is shown. */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches render-time errors so a single bad API record or component bug never
 * unmounts the whole React tree to a blank `<div id="root">`. A blank page is
 * doubly bad here: it looks broken to AdSense reviewers and it shows the ad
 * script on a page with no publisher content. The fallback always renders real,
 * navigable content instead of nothing.
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Keep a console trace for debugging; never surface a blank screen.
    console.error('Render error caught by ErrorBoundary:', error, info);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    if (typeof window !== 'undefined') window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="container section__padding flex flex-col items-center gap-6 text-center">
        <h1 className="section__title text-3xl md:text-4xl">
          Something went wrong on this page
        </h1>
        <p className="section__description max-w-xl">
          Sorry — we hit a temporary problem displaying this page. Your
          connection is fine; please try again, or head back to the homepage to
          keep reading our hair-care articles and tips for adults 50+.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={this.handleReload}
            className="px-6 py-3 bg-main text-white rounded-md hover:bg-main3 transition-colors"
          >
            Try again
          </button>
          <a
            href="/"
            className="px-6 py-3 border border-main text-main rounded-md hover:bg-main hover:text-white transition-colors"
          >
            Go to homepage
          </a>
        </div>
        <nav
          aria-label="Helpful links"
          className="flex flex-wrap gap-4 text-sm"
        >
          <a href="/about" className="text-main underline">
            About
          </a>
          <a href="/forum" className="text-main underline">
            Community Forum
          </a>
          <a href="/contact" className="text-main underline">
            Contact
          </a>
          <a href="/privacy" className="text-main underline">
            Privacy Policy
          </a>
        </nav>
      </div>
    );
  }
}

export default ErrorBoundary;
