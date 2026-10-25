import { Link } from "react-router-dom";

export function SiteFooter() {
  return (
    <footer className="shell border-t border-line/40 py-8 pb-[calc(6.5rem+env(safe-area-inset-bottom))] text-center">
      <Link className="link text-sm" to="/credits">Photo credits</Link>
    </footer>
  );
}
