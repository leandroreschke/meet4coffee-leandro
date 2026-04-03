import { redirect } from "next/navigation";

import { createTranslator } from "@meet4coffee/i18n";

import { getPreferredLocale, getCurrentMemberships } from "@/lib/auth";
import { localizePath } from "@/lib/locale";
import { getSupportedTimezones } from "@/lib/timezones";

import { SetupForm } from "./setup-form";

export default async function SetupPage() {
  const locale = await getPreferredLocale();
  const t = createTranslator(locale);
  const memberships = await getCurrentMemberships();
  const timezones = getSupportedTimezones();

  if (memberships.length > 0) {
    const firstWorkspace = memberships.find((membership) => membership.workspaces?.slug);

    if (firstWorkspace?.workspaces?.slug) {
      redirect(localizePath(`/w/${firstWorkspace.workspaces.slug}`, locale));
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-16">
      <div className="surface-card w-full rounded-[2.5rem] p-8">
        <div className="mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-mocha-earth/70">
            {t("setup.title")}
          </p>
          <h1 className="font-display text-5xl text-stone-900">{t("app.name")}</h1>
        </div>
        <SetupForm
          nameLabel={t("setup.name")}
          slugLabel={t("setup.slug")}
          timezoneLabel={t("setup.timezone")}
          hoursStartLabel={t("setup.hoursStart")}
          hoursEndLabel={t("setup.hoursEnd")}
          submitLabel={t("setup.submit")}
          timezones={timezones}
        />
      </div>
    </main>
  );
}
