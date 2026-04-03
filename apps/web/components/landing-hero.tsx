import Link from "next/link";
import { getPreferredLocale } from "@/lib/auth";
import { createTranslator } from "@meet4coffee/i18n";
import { localizePath } from "@/lib/locale";

export async function LandingHero() {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const lineAnimation =
    "hero-line-in 620ms cubic-bezier(0.22, 1, 0.36, 1) forwards";

  return (
    <section className="relative flex min-h-[calc(100svh-6rem)] w-full flex-col items-center justify-center overflow-hidden px-4 text-center">
      <div className="w-full max-w-6xl">
        <div className="relative inline-block text-center font-display font-black text-[clamp(2.6rem,8.2vw,7rem)] leading-[1.02] tracking-[-0.025em] text-mocha-earth">
          <div
            className="block opacity-0"
            style={{ animation: lineAnimation, animationDelay: "120ms" }}
          >
            {t("landing.hero.line1")}
          </div>

          <div
            className="block relative whitespace-nowrap opacity-0"
            style={{ animation: lineAnimation, animationDelay: "260ms" }}
          >
            <svg
              className="absolute -left-[12%] sm:-left-[8%] top-1/2 w-[12%] sm:w-[8%] h-[80%] -translate-y-1/2"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M40 15 L10 25 M45 30 L20 38"
                stroke="var(--mocha-earth)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
            {t("landing.hero.line2Prefix")}{" "}
            <svg
              className="sticker -rotate-6"
              viewBox="0 0 100 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cute Chat Balloon */}
              <path
                d="M25,20 L75,20 C86,20 95,29 95,40 L95,65 C95,76 86,85 75,85 L50,85 L25,105 L30,85 L25,85 C14,85 5,76 5,65 L5,40 C5,29 14,20 25,20 Z"
                fill="var(--strawberry-milk)"
                stroke="var(--mocha-earth)"
                strokeWidth="8"
                strokeLinejoin="round"
              />
              <circle cx="35" cy="48" r="5" fill="var(--mocha-earth)" />
              <circle cx="65" cy="48" r="5" fill="var(--mocha-earth)" />
              <path
                d="M44 58 Q50 66 56 58"
                stroke="var(--mocha-earth)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>{" "}
            {t("landing.hero.line2Suffix")}
          </div>

          <div
            className="block opacity-0"
            style={{ animation: lineAnimation, animationDelay: "400ms" }}
          >
            {t("landing.hero.line3")}
          </div>

          <div
            className="block opacity-0"
            style={{ animation: lineAnimation, animationDelay: "540ms" }}
          >
            {t("landing.hero.line4")}
          </div>

          <div
            className="block relative whitespace-nowrap opacity-0"
            style={{ animation: lineAnimation, animationDelay: "680ms" }}
          >
            {t("landing.hero.line5Prefix")}
            <svg
              className="sticker rotate-6"
              viewBox="0 0 100 110"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Cute Coffee Cup */}
              <path
                d="M20 20 L80 20 L75 80 C74 90 65 95 50 95 C35 95 26 90 25 80 Z"
                fill="var(--banana-split)"
                stroke="var(--mocha-earth)"
                strokeWidth="8"
                strokeLinejoin="round"
              />
              <path
                d="M80 35 C95 35 95 60 78 60"
                stroke="var(--mocha-earth)"
                strokeWidth="8"
                strokeLinecap="round"
                fill="none"
              />
              <circle cx="40" cy="55" r="5" fill="var(--mocha-earth)" />
              <circle cx="60" cy="55" r="5" fill="var(--mocha-earth)" />
              <path
                d="M45 65 Q50 72 55 65"
                stroke="var(--mocha-earth)"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />
              <path
                d="M40 5 Q45 -5 50 5 M60 10 Q65 0 70 10"
                stroke="var(--mocha-earth)"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            {t("landing.hero.line5Suffix")}

            <svg
              className="absolute -right-[15%] sm:-right-[10%] bottom-0 w-[15%] sm:w-[10%] h-full"
              viewBox="0 0 50 50"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 25 L5 25 M15 35 L5 40 M25 40 L25 48 M35 35 L45 40 M40 25 L48 25 M35 15 L45 10"
                stroke="var(--mocha-earth)"
                strokeWidth="6"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        <div className="mx-auto mt-24 w-full max-w-sm px-4">
          <Link
            href={`${localizePath("/sign-up", locale)}?next=${encodeURIComponent(localizePath("/app", locale))}`}
            transitionTypes={["nav-forward"]}
            className="block w-full bg-mocha-earth text-vanilla-cream! px-8 py-5 rounded-full font-bold text-xl border-4 border-mocha-earth shadow-[6px_6px_0px_var(--strawberry-milk)] hover:bg-strawberry-milk hover:text-mocha-earth! hover:translate-x-[6px] hover:translate-y-[6px] hover:shadow-none transition-all"
          >
            {t("landing.getStarted")}
          </Link>
        </div>
      </div>
    </section>
  );
}
