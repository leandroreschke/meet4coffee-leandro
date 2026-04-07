import { createTranslator } from "@meet4coffee/i18n";

import { MOCK_CLUBS } from "@/lib/mock-data";
import { PageShell } from "@/components/page-shell";
import { StatusPill } from "@/components/status-pill";
import { appButtonClassName } from "@/components/ui/app-button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { getWorkspaceContext } from "@/lib/auth";
import { getWorkspaceClubs } from "@/lib/data";
import {
  joinClubAction,
  leaveClubAction,
  requestClubAccessAction,
} from "@/lib/actions/clubs";
import { localizePath } from "@/lib/locale";

export default async function ClubsPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const context = await getWorkspaceContext(workspaceSlug);
  const t = createTranslator(context.locale);
  const clubs = await getWorkspaceClubs(
    context.workspace.id,
    context.membership.id,
  );
  const isOwner = context.membership.role === "owner";
  const allClubs = [...MOCK_CLUBS, ...clubs];
  const visibleClubs = allClubs.filter((club) => {
    if (isOwner) {
      return true;
    }
    return club.visibility === "public" || Boolean(club.currentMembership);
  });

  return (
    <PageShell
      homeHref={localizePath(`/w/${workspaceSlug}`, context.locale)}
      title={t("clubs.title")}
      description={t("clubs.description")}
      locale={context.locale}
    >
      <section className="grid gap-4 lg:grid-cols-2">
        {visibleClubs.map((club) => (
          <SurfaceCard key={club.id} className="bg-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-3xl font-black text-mocha-earth">
                  {club.name}
                </h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-mocha-earth/75">
                  {club.description}
                </p>
              </div>
              {club.is_ready && <StatusPill>Active</StatusPill>}
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase tracking-[0.18em] text-mocha-earth/65">
              <span>{club.frequency}</span>
              <span>{club.group_size_target} people</span>
              <span>{club.visibility}</span>
              <span>{club.join_policy}</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {!club.currentMembership &&
                (club.join_policy === "free_join" || isOwner) && (
                  <form action={joinClubAction}>
                    <input
                      type="hidden"
                      name="workspace_slug"
                      value={workspaceSlug}
                    />
                    <input type="hidden" name="club_id" value={club.id} />
                    <button
                      type="submit"
                      className={appButtonClassName({
                        variant: "primary",
                        size: "sm",
                      })}
                    >
                      {t("clubs.join")}
                    </button>
                  </form>
                )}
              {!club.currentMembership &&
                club.join_policy !== "free_join" &&
                !isOwner && (
                  <form action={requestClubAccessAction}>
                    <input
                      type="hidden"
                      name="workspace_slug"
                      value={workspaceSlug}
                    />
                    <input type="hidden" name="club_id" value={club.id} />
                    <button
                      type="submit"
                      className={appButtonClassName({
                        variant: "secondary",
                        size: "sm",
                      })}
                    >
                      {t("clubs.requestAccess")}
                    </button>
                  </form>
                )}
              {club.currentMembership?.status === "active" && (
                <form action={leaveClubAction}>
                  <input
                    type="hidden"
                    name="workspace_slug"
                    value={workspaceSlug}
                  />
                  <input type="hidden" name="club_id" value={club.id} />
                  <button
                    type="submit"
                    className={appButtonClassName({
                      variant: "secondary",
                      size: "sm",
                    })}
                  >
                    {t("clubs.leave")}
                  </button>
                </form>
              )}
              {club.currentMembership?.status === "pending_approval" && (
                <span className="rounded-full border border-mocha-earth/20 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-mocha-earth/70">
                  Pending approval
                </span>
              )}
            </div>
          </SurfaceCard>
        ))}
        {visibleClubs.length === 0 ? (
          <SurfaceCard className="bg-white lg:col-span-2">
            <p className="text-sm font-semibold text-mocha-earth/75">
              No clubs available to join right now.
            </p>
          </SurfaceCard>
        ) : null}
      </section>
    </PageShell>
  );
}
