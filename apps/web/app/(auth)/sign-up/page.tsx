import Link from "next/link";

import { createTranslator } from "@meet4coffee/i18n";

import { AuthCard } from "@/components/auth-card";
import { SignUpForm } from "@/components/sign-up-form";
import { getPreferredLocale } from "@/lib/auth";
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
      <SignUpForm
        next={next}
        labels={{
          email: t("auth.email"),
          password: t("auth.password"),
          confirmPassword: t("auth.confirmPassword"),
          signUp: t("auth.signUp"),
          google: t("auth.google"),
        }}
      />
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
