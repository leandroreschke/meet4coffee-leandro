import Link from "next/link";
import { createTranslator } from "@meet4coffee/i18n";

import { getPreferredLocale } from "@/lib/auth";
import { localizePath } from "@/lib/locale";
import { SplashScreen } from "@/components/splash-screen";
import { LandingHero } from "@/components/landing-hero";

export default async function LandingPage() {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const featureItems = [
    {
      title: t("landing.highlights.safePlace.title"),
      description: t("landing.highlights.safePlace.description"),
      color: "bg-strawberry-milk",
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2.5"
            d="M12 3l7 3v5c0 5.2-3.2 8.3-7 10-3.8-1.7-7-4.8-7-10V6l7-3z"
          />
        </svg>
      ),
    },
    {
      title: t("landing.highlights.randomDrama.title"),
      description: t("landing.highlights.randomDrama.description"),
      color: "bg-banana-split",
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 7h12m0 0-3-3m3 3-3 3" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M20 17H8m0 0 3 3m-3-3 3-3" />
        </svg>
      ),
    },
    {
      title: t("landing.highlights.bossButton.title"),
      description: t("landing.highlights.bossButton.description"),
      color: "bg-matcha-latte",
      icon: (
        <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M7 7h10v10H7z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 10v4m0 0 2-2m-2 2-2-2" />
        </svg>
      ),
    },
  ];
  const pricingItems = [
    {
      tier: t("landing.pricing.free"),
      amount: "$0",
      detail: t("landing.pricing.freeDetail"),
      color: "bg-lavender-haze",
      features: ["1 Workspace", "Standard Breaks", "Opt-out Lists"],
    },
    {
      tier: t("landing.pricing.premium"),
      amount: "$29",
      detail: t("landing.pricing.premiumDetail"),
      color: "bg-cotton-candy",
      features: ["Unlimited Workspaces", "Advanced Analytics", "Slack Integration"],
    },
    {
      tier: t("landing.pricing.ultimate"),
      amount: "$99",
      detail: t("landing.pricing.ultimateDetail"),
      color: "bg-strawberry-milk",
      features: ["Everything in Premium", "Priority Support", "The Boss Button"],
    },
  ];

  return (
    <>
      <SplashScreen />
      <main className="bg-white px-6 pb-20 pt-2 md:px-10">
        <div className="mx-auto max-w-6xl space-y-16">
          <LandingHero />

          <section className="flex flex-col justify-center py-24 md:py-32">
            <h2 className="mb-20 text-center font-display text-5xl font-black text-mocha-earth md:text-7xl">
              {t("landing.highlights.title")}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {featureItems.map((feature) => (
                <article key={feature.title} className={`surface-card rounded-4xl p-8 ${feature.color}`}>
                  <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-mocha-earth bg-white text-mocha-earth shadow-[4px_4px_0px_var(--mocha-earth)]">
                    {feature.icon}
                  </div>
                  <h2 className="font-display text-3xl font-black tracking-tight text-mocha-earth xl:text-4xl">
                    {feature.title}
                  </h2>
                  <p className="mt-4 text-lg font-bold leading-7 text-mocha-earth/80">
                    {feature.description}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section className="flex flex-col justify-center py-24 md:py-32">
            <h2 className="mb-20 text-center font-display text-5xl font-black text-mocha-earth md:text-7xl">
              {t("landing.pricing.title")}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {pricingItems.map((item) => (
                <article
                  key={item.tier}
                  className="flex flex-col rounded-4xl border-4 border-mocha-earth bg-white p-8 shadow-[6px_6px_0px_var(--mocha-earth)] transition-transform hover:-translate-y-2"
                >
                  <p className="text-sm font-black uppercase tracking-[0.22em] text-mocha-earth/70">
                    {item.tier}
                  </p>
                  <p className="mt-4 font-display text-7xl font-black text-mocha-earth">
                    {item.amount}
                  </p>
                  <p className="mt-3 text-lg font-bold text-mocha-earth/80">
                    {item.detail}
                  </p>

                  <ul className="mb-8 mt-8 grow space-y-4">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-lg font-bold leading-snug text-mocha-earth">
                        <svg
                          className="mt-0.5 h-6 w-6 shrink-0 text-mocha-earth"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={`mt-auto h-6 w-full rounded-full border-2 border-mocha-earth ${item.color}`} />
                </article>
              ))}
            </div>
          </section>

          <section className="flex flex-col justify-center py-24 md:py-32">
            <div className="surface-card w-full rounded-[3rem] bg-matcha-latte p-10 text-center md:p-16">
              <h2 className="mb-8 font-display text-5xl font-black text-mocha-earth md:text-7xl">
                {t("landing.getStarted.title")}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-xl font-bold leading-8 text-mocha-earth/80">
                {t("landing.getStarted.description")}
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href={`${localizePath("/sign-up", locale)}?next=${encodeURIComponent(localizePath("/app", locale))}`}
                  transitionTypes={["nav-forward"]}
                  className="rounded-full border-4 border-mocha-earth bg-mocha-earth px-8 py-4 text-lg font-black uppercase tracking-[0.16em] text-vanilla-cream! shadow-[6px_6px_0px_var(--banana-split)] transition-all hover:translate-x-[6px] hover:translate-y-[6px] hover:bg-banana-split hover:text-mocha-earth! hover:shadow-none"
                >
                  {t("landing.createAccount")}
                </Link>
                <Link
                  href={localizePath("/help", locale)}
                  transitionTypes={["nav-forward"]}
                  className="rounded-full border-4 border-mocha-earth bg-white px-8 py-4 text-lg font-black uppercase tracking-[0.16em] text-mocha-earth shadow-[6px_6px_0px_var(--cotton-candy)] transition-all hover:translate-x-[6px] hover:translate-y-[6px] hover:bg-cotton-candy hover:shadow-none"
                >
                  {t("landing.helpCenter")}
                </Link>
              </div>
            </div>
          </section>

          <footer className="rounded-[2.5rem] border-4 border-mocha-earth bg-white px-8 py-10 shadow-[6px_6px_0px_var(--mocha-earth)]">
            <div className="flex flex-wrap items-center justify-between gap-6 text-lg font-bold text-mocha-earth">
              <p>© {new Date().getFullYear()} m4c.</p>
              <div className="flex items-center gap-6">
                <Link href={localizePath("/blog", locale)} transitionTypes={["nav-forward"]} className="transition-colors hover:text-strawberry-milk">
                  {t("landing.footer.blog")}
                </Link>
                <Link href={localizePath("/help", locale)} transitionTypes={["nav-forward"]} className="transition-colors hover:text-banana-split">
                  {t("landing.footer.help")}
                </Link>
                <Link
                  href={`${localizePath("/sign-in", locale)}?next=${encodeURIComponent(localizePath("/app", locale))}`}
                  transitionTypes={["nav-forward"]}
                  className="transition-colors hover:text-matcha-latte"
                >
                  {t("landing.footer.signIn")}
                </Link>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </>
  );
}
