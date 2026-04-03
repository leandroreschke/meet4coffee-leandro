import { createTranslator } from "@meet4coffee/i18n";

import { AuthCard } from "@/components/auth-card";
import { getPreferredLocale } from "@/lib/auth";
import { magicLinkAction } from "@/lib/actions/auth";
import { localizePath } from "@/lib/locale";

export default async function MagicLinkPage({
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
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}
      <form action={magicLinkAction} className="space-y-4">
        <input type="hidden" name="next" value={next} />
        <label className="block space-y-2">
          <span className="text-sm font-medium text-stone-700">{t("auth.email")}</span>
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 outline-none"
          />
        </label>
        <button
          type="submit"
          className="w-full rounded-full bg-stone-900 px-5 py-3 font-medium text-stone-50"
        >
          {t("auth.magicLink")}
        </button>
      </form>
    </AuthCard>
  );
}
