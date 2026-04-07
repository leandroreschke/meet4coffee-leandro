import Link from "next/link";

import { createTranslator } from "@meet4coffee/i18n";

import { AuthCard } from "@/components/auth-card";
import { getPreferredLocale } from "@/lib/auth";
import {
  googleAuthAction,
  magicLinkAction,
  signInAction,
} from "@/lib/actions/auth";
import { localizePath } from "@/lib/locale";

export default async function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; magic?: string; next?: string }>;
}) {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const params = searchParams ? await searchParams : undefined;
  const error = typeof params?.error === "string" ? params.error : null;
  const magicSent = params?.magic === "sent";
  const next =
    typeof params?.next === "string" && params.next.startsWith("/")
      ? params.next
      : localizePath("/app", locale);

  return (
    <AuthCard title={t("auth.title")} subtitle={t("auth.subtitle")}>
      {error ? (
        <p className="rounded-2xl border-2 border-red-400 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </p>
      ) : null}
      {magicSent ? (
        <p className="rounded-2xl border-2 border-matcha-latte bg-matcha-latte/30 px-4 py-3 text-sm font-bold text-mocha-earth">
          {t("auth.magicLinkSent")}
        </p>
      ) : null}
      <form action={signInAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block space-y-2">
          <span className="text-sm font-black uppercase tracking-[0.12em] text-mocha-earth">
            {t("auth.email")}
          </span>
          <input
            name="email"
            type="email"
            required
            className="w-full px-4 py-3"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-black uppercase tracking-[0.12em] text-mocha-earth">
            {t("auth.password")}
          </span>
          <input
            name="password"
            type="password"
            required
            className="w-full px-4 py-3"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full border-4 border-mocha-earth bg-mocha-earth px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-vanilla-cream whitespace-nowrap transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:bg-banana-split hover:text-mocha-earth hover:shadow-none"
          style={{ boxShadow: "4px 4px 0px var(--banana-split)" }}
        >
          {t("auth.signIn")}
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            formAction={magicLinkAction}
            className="rounded-full border-4 border-mocha-earth bg-lavender-haze px-5 py-3 text-sm font-black whitespace-nowrap text-mocha-earth transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
            style={{ boxShadow: "4px 4px 0px var(--mocha-earth)" }}
          >
            {t("auth.magicLink")}
          </button>
          <button
            formAction={googleAuthAction}
            className="rounded-full border-4 border-mocha-earth bg-strawberry-milk px-5 py-3 text-sm font-black whitespace-nowrap text-mocha-earth transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
            style={{ boxShadow: "4px 4px 0px var(--mocha-earth)" }}
          >
            {t("auth.google")}
          </button>
        </div>
      </form>
      <p className="mt-4 text-sm font-bold text-mocha-earth/70">
        {t("auth.noAccount")}{" "}
        <Link
          href={`${localizePath("/sign-up", locale)}?next=${encodeURIComponent(next)}`}
          className="font-black text-mocha-earth underline decoration-2 underline-offset-2"
        >
          {t("auth.signUp")}
        </Link>
      </p>
    </AuthCard>
  );
}
