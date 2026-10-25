import { Component, type ErrorInfo, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { logClientError } from "../observability/clientErrorLog";

type Props = {
  children: ReactNode;
  /** When this changes, the boundary clears and retries rendering children. */
  resetKey: string;
};

type State = { hasError: boolean };

function RouteErrorFallback({
  onReload,
  onSignOut,
}: {
  onReload: () => void;
  onSignOut: () => void;
}) {
  return (
    <main className="shell py-16">
      <section
        className="surface mx-auto max-w-lg p-8 text-center"
        role="alert"
        data-testid="route-error-fallback"
      >
        <h1 className="font-display text-section-title text-ink">
          Something went wrong
        </h1>
        <p className="mt-3 text-body text-muted">
          This page could not be displayed. You can reload, go home, or sign out
          and try again.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" className="btn-primary" onClick={onReload}>
            Reload
          </button>
          <Link className="btn-secondary" to="/">
            Go to home
          </Link>
          <button type="button" className="btn-secondary" onClick={onSignOut}>
            Sign out
          </button>
        </div>
      </section>
    </main>
  );
}

class RouteErrorBoundaryInner extends Component<
  Props & { onSignOut: () => void },
  State
> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    logClientError("route", error);
    if (info.componentStack) {
      logClientError("route-stack", info.componentStack.slice(0, 400));
    }
  }

  componentDidUpdate(prevProps: Props & { onSignOut: () => void }): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <RouteErrorFallback
          onReload={() => window.location.reload()}
          onSignOut={this.props.onSignOut}
        />
      );
    }
    return this.props.children;
  }
}

export function RouteErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const { logout } = useAuth();

  const onSignOut = () => {
    logout();
    window.location.assign("/login");
  };

  return (
    <RouteErrorBoundaryInner resetKey={pathname} onSignOut={onSignOut}>
      {children}
    </RouteErrorBoundaryInner>
  );
}
