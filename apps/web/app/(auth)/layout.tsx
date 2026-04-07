import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white px-6 py-16">
      <div className="absolute left-6 top-6 z-20">
        <Link
          href="/"
          transitionTypes={["nav-back"]}
          className="rounded-full border-4 border-mocha-earth bg-white px-4 py-2 text-sm font-black uppercase tracking-[0.14em] text-mocha-earth shadow-[3px_3px_0px_var(--mocha-earth)] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none"
        >
          Home
        </Link>
      </div>
      <div className="relative z-10 w-full">{children}</div>
    </main>
  );
}
