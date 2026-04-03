export function StatusPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex rounded-full bg-stone-900/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700">
      {children}
    </span>
  );
}
