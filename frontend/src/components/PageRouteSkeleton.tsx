export function PageRouteSkeleton() {
  return (
    <main className="shell py-8">
      <div className="h-8 w-48 skeleton rounded-btn" />
      <div className="mt-6 aspect-[16/9] skeleton rounded-card" />
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-32 skeleton rounded-card" />
        ))}
      </div>
    </main>
  );
}
