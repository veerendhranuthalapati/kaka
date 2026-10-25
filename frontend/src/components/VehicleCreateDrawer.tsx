import { useEffect, useId, useRef, useState } from "react";
import { ApiError } from "../api/client";
import type { Vehicle, VehicleInput, VehicleUpdateInput } from "../types";
import type { VehicleFormValues } from "../utils/vehicleFormModel";
import { ConfirmDialog } from "./State";
import { VehicleForm } from "./VehicleForm";

export function VehicleCreateDrawer({
  open,
  title,
  initialValues,
  onClose,
  onCreate,
  onSuccess,
}: {
  open: boolean;
  title: string;
  initialValues: VehicleFormValues;
  onClose: () => void;
  onCreate: (payload: VehicleInput) => Promise<Vehicle>;
  onSuccess: (vehicle: Vehicle) => void;
}) {
  const titleId = useId();
  const panelRef = useRef<HTMLElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Record<string, string>
  >({});
  const [dirty, setDirty] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);

  useEffect(() => {
    if (!open) {
      setServerFieldErrors({});
      setDirty(false);
      setConfirmDiscard(false);
      return;
    }
    const frame = window.requestAnimationFrame(() => {
      panelRef.current?.querySelector<HTMLElement>("input, select, textarea")?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, initialValues]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      event.preventDefault();
      if (dirty) {
        setConfirmDiscard(true);
      } else {
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, dirty, onClose]);

  async function handleSubmit(payload: VehicleInput | VehicleUpdateInput) {
    setSubmitting(true);
    setServerFieldErrors({});
    try {
      const created = await onCreate(payload as VehicleInput);
      onSuccess(created);
      onClose();
    } catch (caught) {
      if (caught instanceof ApiError && caught.fieldErrors) {
        setServerFieldErrors(caught.fieldErrors);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-ink/40"
        aria-hidden="true"
        onClick={() => (dirty ? setConfirmDiscard(true) : onClose())}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="vehicle-create-drawer fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col overflow-x-hidden border-l border-line bg-surface shadow-resting motion-safe:animate-drawer-slide-in motion-reduce:animate-none"
      >
        <header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 id={titleId} className="font-display text-card-title text-ink">
            {title}
          </h2>
          <button
            type="button"
            className="btn-ghost text-label normal-case"
            onClick={() => (dirty ? setConfirmDiscard(true) : onClose())}
          >
            Close
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 py-6">
          <VehicleForm
            mode="create"
            initialValues={initialValues}
            submitting={submitting}
            serverFieldErrors={serverFieldErrors}
            onDirtyChange={setDirty}
            onSubmit={handleSubmit}
          />
        </div>
      </aside>

      <ConfirmDialog
        open={confirmDiscard}
        title="Discard changes?"
        description="You have unsaved vehicle details. Close without saving?"
        confirmLabel="Discard"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => {
          setConfirmDiscard(false);
          onClose();
        }}
      />
    </>
  );
}
