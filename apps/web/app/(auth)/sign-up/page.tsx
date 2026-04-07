import Link from "next/link";

import { createTranslator } from "@meet4coffee/i18n";

import { AuthCard } from "@/components/auth-card";
import { getPreferredLocale } from "@/lib/auth";
import { googleAuthAction, signUpAction } from "@/lib/actions/auth";
import { localizePath } from "@/lib/locale";

export default async function SignUpPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string; next?: string }>;
}) {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const params = searchParams ? await searchParams : undefined;
  const error = typeof params?.error === "string" ? params.error : null;
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
      <form action={signUpAction} className="space-y-4">
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
        <label className="block space-y-2">
          <span className="text-sm font-black uppercase tracking-[0.12em] text-mocha-earth">
            {t("auth.confirmPassword")}
          </span>
          <input
            name="confirm_password"
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
          {t("auth.signUp")}
        </button>
        <button
          formAction={googleAuthAction}
          className="w-full rounded-full border-4 border-mocha-earth bg-strawberry-milk px-5 py-3 text-sm font-black whitespace-nowrap text-mocha-earth transition-all hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-none"
          style={{ boxShadow: "4px 4px 0px var(--mocha-earth)" }}
        >
          {t("auth.google")}
        </button>
      </form>
      <p className="mt-4 text-sm font-bold text-mocha-earth/70">
        {t("auth.haveAccount")}{" "}
        <Link
          href={`${localizePath("/sign-in", locale)}?next=${encodeURIComponent(next)}`}
          className="font-black text-mocha-earth underline decoration-2 underline-offset-2"
        >
          {t("auth.signIn")}
        </Link>
      </p>
    </AuthCard>
  );
}
