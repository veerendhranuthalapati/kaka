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
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="max-w-md text-sm text-muted">{description}</p>
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
      aria-live="polite"
      className={`rounded-xl border px-4 py-2.5 text-sm shadow-card ${
        tone === "danger"
          ? "border-danger/40 bg-danger/10 text-danger"
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
      <div className="surface relative z-10 w-full max-w-md p-6">
        <h2 className="text-lg font-semibold text-ink">{title}</h2>
        <p className="mt-2 text-sm text-muted">{description}</p>
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
    <p
      className="mt-1 text-sm font-medium text-danger"
      role="alert"
      data-testid={testId}
    >
      {message}
    </p>
  );
}
