import { createTranslator } from "@meet4coffee/i18n";

import { MOCK_PAST_MEETINGS, MOCK_UPCOMING_MEETINGS } from "@/lib/mock-data";
import { PageShell } from "@/components/page-shell";
import { getWorkspaceContext } from "@/lib/auth";
import { getWorkspaceMeetings } from "@/lib/data";
import {
  cancelMeetingAction,
  confirmMeetingAction,
  proposeRescheduleAction,
  rateMeetingAction,
} from "@/lib/actions/meetings";
import { appButtonClassName } from "@/components/ui/app-button";
import { SurfaceCard } from "@/components/ui/surface-card";
import { localizePath, toIntlLocale } from "@/lib/locale";
import { formatDateTime } from "@/lib/utils";
import { createServerSupabaseClient } from "@meet4coffee/supabase";

async function getMeetingSharedInterests(
  workspaceId: string,
  meetingId: string,
  currentMemberId: string,
  currentUserId: string,
): Promise<string[]> {
  const supabase = await createServerSupabaseClient();

  const { data: participants } = await supabase
    .from("meeting_participants")
    .select("member_id")
    .eq("workspace_id", workspaceId)
    .eq("meeting_id", meetingId);

  const otherMemberIds = (participants ?? [])
    .map((p: { member_id: string }) => p.member_id)
    .filter((id: string) => id !== currentMemberId);

  if (otherMemberIds.length === 0) return [];

  // Resolve other member IDs → user IDs
  const { data: otherMembers } = await supabase
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .in("id", otherMemberIds);

  const otherUserIds = (otherMembers ?? []).map(
    (m: { user_id: string }) => m.user_id,
  );
  if (otherUserIds.length === 0) return [];

  const { data: myInterests } = await supabase
    .from("member_interests")
    .select("interest_id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", currentUserId);

  const { data: otherInterests } = await supabase
    .from("member_interests")
    .select("interest_id")
    .eq("workspace_id", workspaceId)
    .in("user_id", otherUserIds);

  const mySet = new Set(
    (myInterests ?? []).map((i: { interest_id: string }) => i.interest_id),
  );
  const sharedIds = [
    ...new Set(
      (otherInterests ?? [])
        .map((i: { interest_id: string }) => i.interest_id)
        .filter((id: string) => mySet.has(id)),
    ),
  ];

  if (sharedIds.length === 0) return [];

  const { data: interests } = await supabase
    .from("interests")
    .select("name")
    .in("id", sharedIds);

  return (interests ?? []).map((i: { name: string }) => i.name);
}

export default async function BreaksPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const context = await getWorkspaceContext(workspaceSlug);
  const t = createTranslator(context.locale);
  const intlLocale = toIntlLocale(context.locale);
  const meetings = await getWorkspaceMeetings(
    context.workspace.id,
    context.membership.id,
  );

  const upcoming = meetings.filter(
    (entry) =>
      entry.meetings?.start_at &&
      new Date(entry.meetings.start_at) >= new Date(),
  );
  const past = meetings.filter(
    (entry) =>
      entry.meetings?.start_at &&
      new Date(entry.meetings.start_at) < new Date(),
  );

  const upcomingWithInterests = [
    ...MOCK_UPCOMING_MEETINGS,
    ...(await Promise.all(
      upcoming.map(async (entry) => {
        const sharedInterests = entry.meetings?.id
          ? await getMeetingSharedInterests(
              context.workspace.id,
              entry.meetings.id,
              context.membership.id,
              context.user.id,
            )
          : [];
        return { ...entry, sharedInterests };
      }),
    )),
  ];
  const allPast = [...MOCK_PAST_MEETINGS, ...past];

  return (
    <PageShell
      homeHref={localizePath(`/w/${workspaceSlug}`, context.locale)}
      title={t("breaks.title")}
      description={t("breaks.description")}
      locale={context.locale}
    >
      <section className="flex flex-col gap-12 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          <h2 className="font-display text-3xl text-stone-900">
            {t("meetings.upcoming")}
          </h2>
          {upcomingWithInterests.length === 0 && (
            <p className="text-sm font-semibold text-mocha-earth/60">
              No upcoming meetings yet. Your matches will appear here when the
              next round is generated.
            </p>
          )}
          {upcomingWithInterests.map((entry) => (
            <SurfaceCard key={entry.id} className="bg-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-mocha-earth/50 mb-1">
                Upcoming roulette
              </p>
              <p className="font-semibold text-mocha-earth/80 text-sm">
                {formatDateTime(
                  entry.meetings?.start_at,
                  intlLocale,
                  context.workspace.timezone,
                )}
              </p>
              {entry.sharedInterests.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs font-bold text-mocha-earth/60 mr-1">
                    Shared interests:
                  </span>
                  {entry.sharedInterests.map((interest) => (
                    <span
                      key={interest}
                      className="rounded-full border border-mocha-earth/20 bg-vanilla-cream px-3 py-1 text-xs font-bold text-mocha-earth"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-5 flex flex-wrap gap-3">
                <form action={confirmMeetingAction}>
                  <input
                    type="hidden"
                    name="workspace_slug"
                    value={workspaceSlug}
                  />
                  <input type="hidden" name="participant_id" value={entry.id} />
                  <button
                    type="submit"
                    className={appButtonClassName({
                      variant: "primary",
                      size: "sm",
                    })}
                  >
                    {t("meetings.confirm")}
                  </button>
                </form>
                <form action={cancelMeetingAction}>
                  <input
                    type="hidden"
                    name="workspace_slug"
                    value={workspaceSlug}
                  />
                  <input type="hidden" name="participant_id" value={entry.id} />
                  <button
                    type="submit"
                    className={appButtonClassName({
                      variant: "secondary",
                      size: "sm",
                    })}
                  >
                    {t("meetings.cancel")}
                  </button>
                </form>
                <form
                  action={proposeRescheduleAction}
                  className="flex flex-wrap gap-2"
                >
                  <input
                    type="hidden"
                    name="workspace_slug"
                    value={workspaceSlug}
                  />
                  <input
                    type="hidden"
                    name="meeting_id"
                    value={entry.meetings?.id ?? ""}
                  />
                  <label className="block">
                    <span className="sr-only">
                      {t("meetings.proposedStart")}
                    </span>
                    <input
                      name="proposed_start_at"
                      type="datetime-local"
                      className="rounded-full border border-stone-900/10 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <label className="block">
                    <span className="sr-only">{t("meetings.proposedEnd")}</span>
                    <input
                      name="proposed_end_at"
                      type="datetime-local"
                      className="rounded-full border border-stone-900/10 bg-white px-3 py-2 text-sm"
                    />
                  </label>
                  <button
                    type="submit"
                    className={appButtonClassName({
                      variant: "neutral",
                      size: "sm",
                    })}
                  >
                    {t("meetings.reschedule")}
                  </button>
                </form>
              </div>
            </SurfaceCard>
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-3xl text-stone-900">History</h2>
          {allPast.map((entry) => (
            <SurfaceCard key={entry.id} className="bg-white">
              <h3 className="font-display text-2xl font-black text-mocha-earth">
                {entry.meetings?.title}
              </h3>
              <p className="mt-2 text-sm font-semibold text-mocha-earth/75">
                {formatDateTime(
                  entry.meetings?.start_at,
                  intlLocale,
                  context.workspace.timezone,
                )}
              </p>
              <form
                action={rateMeetingAction}
                className="mt-4 flex items-center gap-3"
              >
                <input
                  type="hidden"
                  name="workspace_slug"
                  value={workspaceSlug}
                />
                <input type="hidden" name="participant_id" value={entry.id} />
                <label className="block">
                  <span className="sr-only">{t("meetings.rate")}</span>
                  <select
                    name="rating"
                    defaultValue={String(entry.rating ?? 5)}
                    className="rounded-full border border-stone-900/10 bg-white px-4 py-2 text-sm"
                  >
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <option key={rating} value={rating}>
                        {rating}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className={appButtonClassName({
                    variant: "primary",
                    size: "sm",
                  })}
                >
                  {t("meetings.rate")}
                </button>
              </form>
            </SurfaceCard>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
