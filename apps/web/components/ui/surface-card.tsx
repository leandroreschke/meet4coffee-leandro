export function SurfaceCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <article className={`surface-card rounded-[2rem] p-6 ${className}`}>{children}</article>;
}

