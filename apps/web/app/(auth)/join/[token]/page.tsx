import Link from "next/link";

import { createTranslator } from "@meet4coffee/i18n";

import { AuthCard } from "@/components/auth-card";
import { getCurrentUser, getPreferredLocale } from "@/lib/auth";
import { localizePath } from "@/lib/locale";
import { claimWorkspaceInviteOrRedirect } from "@/lib/services/invites";

export default async function JoinWithInvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const user = await getCurrentUser();
  const next = localizePath(`/join/${token}`, locale);

  if (user) {
    await claimWorkspaceInviteOrRedirect({
      token,
      userId: user.id,
      userEmail: user.email ?? null,
    });
  }

  return (
    <AuthCard title={t("invites.title")} subtitle="Join the organization and finish onboarding.">
      {!user ? (
        <div className="space-y-3">
          <p className="text-sm text-stone-600">
            Sign in or create an account to accept this invite.
          </p>
          <Link
            href={`${localizePath("/sign-up", locale)}?next=${encodeURIComponent(next)}`}
            className="block w-full rounded-full bg-stone-900 px-5 py-3 text-center font-medium text-stone-50"
          >
            Create account
          </Link>
          <Link
            href={`${localizePath("/sign-in", locale)}?next=${encodeURIComponent(next)}`}
            className="block w-full rounded-full border border-stone-900/10 bg-white px-5 py-3 text-center font-medium text-stone-700"
          >
            Sign in
          </Link>
        </div>
      ) : null}
    </AuthCard>
  );
}
