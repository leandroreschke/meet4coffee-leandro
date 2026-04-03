import Link from "next/link";

import { createTranslator } from "@meet4coffee/i18n";

import { AuthCard } from "@/components/auth-card";
import { getPreferredLocale } from "@/lib/auth";
import { googleAuthAction, magicLinkAction, signInAction } from "@/lib/actions/auth";
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
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      {magicSent ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {t("auth.magicLinkSent")}
        </p>
      ) : null}
      <form action={signInAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">{t("auth.email")}</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 outline-none ring-0"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">{t("auth.password")}</span>
          <input
            name="password"
            type="password"
            required
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 outline-none ring-0"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-stone-900 px-5 py-3 font-medium text-stone-50"
        >
          {t("auth.signIn")}
        </button>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            formAction={magicLinkAction}
            className="rounded-full border border-stone-900/10 bg-white px-5 py-3 font-medium text-stone-700"
          >
            {t("auth.magicLink")}
          </button>
          <button
            formAction={googleAuthAction}
            className="rounded-full border border-stone-900/10 bg-amber-100 px-5 py-3 font-medium text-stone-800"
          >
            {t("auth.google")}
          </button>
        </div>
      </form>
      <p className="text-sm text-stone-600">
        {t("auth.noAccount")}{" "}
        <Link
          href={`${localizePath("/sign-up", locale)}?next=${encodeURIComponent(next)}`}
          className="font-medium text-stone-900 underline"
        >
          {t("auth.signUp")}
        </Link>
      </p>
    </AuthCard>
  );
}
