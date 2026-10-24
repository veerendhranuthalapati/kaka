import { useEffect, useRef } from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-flex items-center justify-center ${className}`}
    >
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none"
      />
      <span className="sr-only">Loading</span>
    </span>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="surface flex flex-col items-center gap-2 px-6 py-12 text-center">
      <p className="font-display text-section-title text-ink">{title}</p>
      <p className="max-w-md font-sans text-body text-muted">{description}</p>
    </div>
  );
}

export function Toast({
  message,
  tone = "info",
}: {
  message: string;
  tone?: "info" | "danger";
}) {
  return (
    <div
      role="status"
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={`rounded-card border px-4 py-3 font-sans text-body shadow-resting ${
        tone === "danger"
          ? "border-danger/30 bg-danger-soft text-danger"
          : "border-line bg-surface text-ink"
      }`}
    >
      {message}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
        return;
      }

      if (event.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div ref={dialogRef} className="surface relative z-10 w-full max-w-md p-6">
        <h2 className="font-display text-card-title text-ink">{title}</h2>
        <p className="mt-2 font-sans text-body text-muted">{description}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={onCancel}
            autoFocus
          >
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export function FieldError({
  message,
  testId,
}: {
  message?: string | null;
  testId?: string;
}) {
  if (!message) return null;
  return (
    <p className="field-error" role="alert" data-testid={testId}>
      <span aria-hidden="true" className="mt-0.5 shrink-0 text-danger">
        ⚠
      </span>
      <span>{message}</span>
    </p>
  );
}
