import Link from "next/link";
import { type Locale } from "@meet4coffee/i18n";
import { getShadowColor } from "@/lib/utils";
import { RouteTransition } from "@/components/route-transition";

export function PageShell({
  homeHref,
  title,
  description,
  locale,
  children,
}: {
  homeHref: string;
  title: string;
  description?: string;
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <RouteTransition>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
        <header className="flex w-full items-center justify-between">
          <Link
            href={homeHref}
            transitionTypes={["nav-back"]}
            className="toca-shadow flex items-center justify-center rounded-full border-4 border-mocha-earth bg-white px-6 py-2 font-black tracking-widest text-mocha-earth transition-transform hover:scale-105 active:scale-95"
            style={{ "--shadow-color": getShadowColor("home") } as any}
          >
            &lt;- HOME
          </Link>
          <h1 className="font-display text-3xl font-black uppercase tracking-tight text-mocha-earth md:text-5xl">
            {title}
          </h1>
        </header>
        {children}
      </main>
    </RouteTransition>
  );
}
