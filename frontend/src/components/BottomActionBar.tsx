import type { RefObject } from "react";

export function BottomActionBar({
  searchInputRef,
  onBrowseInventory,
  onQuickSearch,
}: {
  searchInputRef: RefObject<HTMLInputElement | null>;
  onBrowseInventory: () => void;
  onQuickSearch: (value: string) => void;
}) {
  return (
    <div
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="Quick actions"
    >
      <div className="flex w-full max-w-2xl items-center gap-2 rounded-full border border-line/80 bg-surface/95 px-4 py-2.5 shadow-float backdrop-blur-md">
        <input
          type="search"
          aria-label="Quick search inventory"
          placeholder="Quick search make or model"
          className="input min-h-10 flex-1 border-0 bg-transparent py-2 shadow-none"
          onChange={(event) => onQuickSearch(event.target.value)}
        />
        <button
          type="button"
          className="btn-primary shrink-0 px-4"
          onClick={() => {
            onBrowseInventory();
            searchInputRef.current?.focus();
          }}
        >
          Browse inventory
        </button>
      </div>
    </div>
  );
}
