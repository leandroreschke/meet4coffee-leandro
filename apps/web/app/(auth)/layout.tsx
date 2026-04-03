import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,var(--color-banana-split),var(--color-vanilla-cream)_42%,var(--color-vanilla-cream)_100%)] opacity-30" />
      <div className="absolute -left-32 top-10 h-56 w-56 rounded-full bg-strawberry-milk/30 blur-3xl" />
      <div className="absolute -right-24 bottom-10 h-64 w-64 rounded-full bg-banana-split/35 blur-3xl" />
      <div className="absolute left-6 top-6 z-20">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="rounded-full border-4 border-mocha-earth bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-mocha-earth"
        >
          Home
        </Link>
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </main>
  );
}
