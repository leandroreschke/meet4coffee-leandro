import Link from "next/link";
import { redirect } from "next/navigation";
import { createTranslator } from "@meet4coffee/i18n";

import { getCurrentMemberships, getCurrentUser, getPreferredLocale } from "@/lib/auth";
import { localizePath } from "@/lib/locale";

export default async function WelcomePage() {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const user = await getCurrentUser();

  if (!user) {
    redirect(localizePath("/sign-in", locale));
  }

  const memberships = await getCurrentMemberships();
  const firstWorkspace = memberships.find((membership) => membership.workspaces?.slug);

  if (firstWorkspace?.workspaces?.slug) {
    redirect(localizePath(`/w/${firstWorkspace.workspaces.slug}`, locale));
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <div className="surface-card w-full space-y-6 rounded-[2.5rem] p-8">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-mocha-earth/70">
            {t("welcome.firstStep")}
          </p>
          <h1 className="font-display text-5xl text-stone-900">{t("welcome.title")}</h1>
          <p className="text-sm leading-6 text-stone-600">
            {t("welcome.description")}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            href={localizePath("/setup", locale)}
            className="rounded-[1.8rem] border border-mocha-earth/20 bg-mocha-earth px-6 py-6 text-vanilla-cream"
          >
            <p className="text-lg font-semibold">{t("welcome.createOrganization")}</p>
            <p className="mt-2 text-sm text-vanilla-cream/85">
              {t("welcome.createOrganizationDescription")}
            </p>
          </Link>

          <div className="rounded-[1.8rem] border border-stone-900/10 bg-white px-6 py-6">
            <p className="text-lg font-semibold text-stone-900">{t("welcome.joinWithInvite")}</p>
            <p className="mt-2 text-sm text-stone-600">
              {t("welcome.joinWithInviteDescription")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
