import { useEffect, useRef, useState, type ReactNode } from "react";

const SLOW_LOAD_MS = 3_000;

type Props = {
  children: ReactNode;
};

export function ContentLoadingGuard({ children }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    setSlow(false);
    const timer = window.setTimeout(() => {
      const host = hostRef.current;
      if (!host) return;
      const hasContent = Boolean(host.textContent?.trim());
      if (!hasContent) {
        setSlow(true);
      }
    }, SLOW_LOAD_MS);
    return () => window.clearTimeout(timer);
  }, [children]);

  return (
    <div ref={hostRef} data-testid="content-loading-host">
      {children}
      {slow && (
        <div
          className="shell py-8"
          role="status"
          data-testid="content-slow-loading"
        >
          <p className="text-center text-body text-muted">
            Loading is taking longer than usual.{" "}
            <button
              type="button"
              className="link font-medium"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
