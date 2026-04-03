import Link from "next/link";
import { createTranslator } from "@meet4coffee/i18n";

import { LanguageSwitcher } from "@/components/language-switcher";
import { getPreferredLocale } from "@/lib/auth";
import { localizePath } from "@/lib/locale";

export default async function MarketingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);

  return (
    <div className="min-h-screen bg-white">
      <header
        className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-6 py-6"
        style={{ viewTransitionName: "persistent-nav" }}
      >
        <Link
          href={localizePath("/", locale)}
          transitionTypes={["nav-back"]}
          className="flex items-center gap-2 font-display text-2xl font-black tracking-tighter text-mocha-earth"
        >
          <svg
            className="h-8 w-8 text-banana-split"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="3"
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          m4c.
        </Link>
        <div className="flex items-center gap-4">
          <LanguageSwitcher currentLocale={locale} shortOptions />
          <Link
            href={`${localizePath("/sign-in", locale)}?next=${encodeURIComponent(localizePath("/app", locale))}`}
            transitionTypes={["nav-forward"]}
            className="font-bold text-mocha-earth transition-colors hover:text-mocha-earth"
          >
            {t("landing.footer.signIn")}
          </Link>
          <Link
            href={`${localizePath("/sign-up", locale)}?next=${encodeURIComponent(localizePath("/app", locale))}`}
            transitionTypes={["nav-forward"]}
            className="rounded-full border-4 border-mocha-earth bg-mocha-earth px-5 py-2.5 font-bold text-vanilla-cream! shadow-[4px_4px_0px_var(--mocha-earth)] transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-banana-split hover:text-mocha-earth! hover:shadow-none"
          >
            {t("landing.getStarted")}
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
