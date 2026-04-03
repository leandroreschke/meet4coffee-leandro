import { createTranslator } from "@meet4coffee/i18n";

import { PageShell } from "@/components/page-shell";
import { getWorkspaceContext } from "@/lib/auth";
import { getWorkspaceMembers } from "@/lib/data";
import { toggleOptOutAction } from "@/lib/actions/profile";
import { MemberCard } from "@/components/member-card";
import { appButtonClassName } from "@/components/ui/app-button";
import { localizePath } from "@/lib/locale";

export default async function MembersPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const context = await getWorkspaceContext(workspaceSlug);
  const t = createTranslator(context.locale);
  const members = await getWorkspaceMembers(context.workspace.id);

  return (
    <PageShell
      homeHref={localizePath(`/w/${workspaceSlug}`, context.locale)}
      title={t("members.title")}
      description={t("members.description")}
      locale={context.locale}
    >
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map((member) => (
          <MemberCard
            key={member.id}
            member={member}
            labels={{
              anonymous: t("members.card.anonymous"),
              close: t("members.card.close"),
              roleLocation: t("members.card.roleLocation"),
              noRole: t("members.card.noRole"),
              noLocation: t("members.card.noLocation"),
              about: t("members.card.about"),
              noBio: t("members.card.noBio"),
            }}
          >
            {member.user_id !== context.user.id && (
              <form action={toggleOptOutAction} className="mt-2 w-full">
                <input type="hidden" name="workspace_slug" value={workspaceSlug} />
                <input type="hidden" name="target_member_id" value={member.id} />
                <input type="hidden" name="enabled" value="true" />
                <button
                  type="submit"
                  className={appButtonClassName({ variant: "secondary", size: "sm", fullWidth: true })}
                >
                  {t("members.optOut")}
                </button>
              </form>
            )}
          </MemberCard>
        ))}
      </section>
    </PageShell>
  );
}
