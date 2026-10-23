export function NotFoundPage() {
  return (
    <main className="shell flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-muted">
        404
      </p>
      <h1 className="text-2xl font-bold tracking-tight text-ink">
        Page not found
      </h1>
      <p className="text-sm text-muted">
        The page you are looking for does not exist.
      </p>
      <a className="link" href="/">
        Back to inventory
      </a>
    </main>
  );
}
