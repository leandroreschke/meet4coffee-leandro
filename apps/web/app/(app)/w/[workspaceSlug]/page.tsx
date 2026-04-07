import { createTranslator } from "@meet4coffee/i18n";

import { RouteTransition } from "@/components/route-transition";
import { WorkspaceMenuGrid } from "@/components/workspace-menu-grid";
import { getCurrentMemberships, getWorkspaceContext } from "@/lib/auth";
import { localizePath } from "@/lib/locale";
import { WorkspaceHeader } from "@/components/workspace-header";
import { redirect } from "next/navigation";

export default async function WorkspaceHomePage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const context = await getWorkspaceContext(workspaceSlug);
  const memberships = await getCurrentMemberships();
  const t = createTranslator(context.locale);

  if (!context.workspace) {
    redirect(localizePath("/setup", context.locale));
  }

  const otherMemberships = memberships.filter(
    (membership) =>
      membership.workspaces?.slug &&
      membership.workspaces.slug !== workspaceSlug,
  );
  const cardsLayoutClass =
    context.membership.role === "owner"
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 md:grid-cols-2";
  const menuItems = [
    {
      href: localizePath(`/w/${workspaceSlug}/clubs`, context.locale),
      title: t("nav.clubs"),
    },
    {
      href: localizePath(`/w/${workspaceSlug}/members`, context.locale),
      title: t("nav.members"),
    },
    {
      href: localizePath(`/w/${workspaceSlug}/breaks`, context.locale),
      title: t("nav.breaks"),
    },
    {
      href: localizePath(`/w/${workspaceSlug}/profile`, context.locale),
      title: t("nav.profile"),
    },
    ...(context.membership.role === "owner"
      ? [
          {
            href: localizePath(`/w/${workspaceSlug}/config`, context.locale),
            title: t("nav.config"),
          },
        ]
      : []),
  ];

  return (
    <RouteTransition>
      <WorkspaceHeader
        workspaceSlug={workspaceSlug}
        workspaceName={context.workspace.name}
        locale={context.locale}
        membershipRoleLabel={
          context.membership.role === "owner"
            ? t("common.owner")
            : t("common.member")
        }
        signOutLabel={t("auth.signOut")}
        switchWorkspaceLabel="Switch workspace"
        configTitleLabel={t("config.title")}
        otherMemberships={otherMemberships}
      />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-8">
        <WorkspaceMenuGrid
          items={menuItems}
          cardsLayoutClass={cardsLayoutClass}
        />
      </main>
    </RouteTransition>
  );
}
