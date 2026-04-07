import Image from "next/image";

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
    <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6">
      <div className="mb-2 flex flex-col items-center gap-3">
        <img src="/images/logo.svg" alt="Meet4Coffee" className="h-auto w-72" />
      </div>
      <div className="surface-card w-full rounded-4xl p-8">
        <div className="mb-6 space-y-1">
          <p className="font-display text-2xl font-black text-mocha-earth">
            {title}
          </p>
          <p className="text-sm font-bold leading-6 text-mocha-earth/60">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
