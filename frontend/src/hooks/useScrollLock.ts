import { useEffect } from "react";

export function setDocumentScrollLocked(locked: boolean): void {
  const root = document.documentElement;
  if (locked) {
    root.setAttribute("data-scroll-locked", "");
  } else {
    root.removeAttribute("data-scroll-locked");
  }
}

export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    setDocumentScrollLocked(locked);
    return () => setDocumentScrollLocked(false);
  }, [locked]);
}
