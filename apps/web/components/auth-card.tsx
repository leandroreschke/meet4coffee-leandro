export function AuthCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="surface-card mx-auto flex w-full max-w-md flex-col gap-6 rounded-[2rem] p-8">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-mocha-earth/70">{title}</p>
        <p className="text-sm leading-6 text-stone-600">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}
