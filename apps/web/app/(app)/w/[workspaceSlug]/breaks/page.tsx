import { createTranslator } from "@meet4coffee/i18n";

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

export default async function BreaksPage({
  params,
}: {
  params: Promise<{ workspaceSlug: string }>;
}) {
  const { workspaceSlug } = await params;
  const context = await getWorkspaceContext(workspaceSlug);
  const t = createTranslator(context.locale);
  const intlLocale = toIntlLocale(context.locale);
  const meetings = await getWorkspaceMeetings(context.workspace.id, context.membership.id);

  const upcoming = meetings.filter(
    (entry) => entry.meetings?.start_at && new Date(entry.meetings.start_at) >= new Date(),
  );
  const past = meetings.filter(
    (entry) => entry.meetings?.start_at && new Date(entry.meetings.start_at) < new Date(),
  );

  return (
    <PageShell
      homeHref={localizePath(`/w/${workspaceSlug}`, context.locale)}
      title={t("breaks.title")}
      description={t("breaks.description")}
      locale={context.locale}
    >
      <section className="flex flex-col gap-12 max-w-4xl mx-auto w-full">
        <div className="space-y-4">
          <h2 className="font-display text-3xl text-stone-900">{t("meetings.upcoming")}</h2>
          {upcoming.map((entry) => (
            <SurfaceCard key={entry.id} className="bg-white">
              <h3 className="font-display text-2xl font-black text-mocha-earth">{entry.meetings?.title}</h3>
              <p className="mt-2 text-sm font-semibold text-mocha-earth/75">
                {formatDateTime(
                  entry.meetings?.start_at,
                  intlLocale,
                  context.workspace.timezone,
                )}
              </p>
              <p className="mt-2 text-sm font-semibold text-mocha-earth/75">{entry.meetings?.meeting_link_url}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <form action={confirmMeetingAction}>
                  <input type="hidden" name="workspace_slug" value={workspaceSlug} />
                  <input type="hidden" name="participant_id" value={entry.id} />
                  <button type="submit" className={appButtonClassName({ variant: "primary", size: "sm" })}>
                    {t("meetings.confirm")}
                  </button>
                </form>
                <form action={cancelMeetingAction}>
                  <input type="hidden" name="workspace_slug" value={workspaceSlug} />
                  <input type="hidden" name="participant_id" value={entry.id} />
                  <button type="submit" className={appButtonClassName({ variant: "secondary", size: "sm" })}>
                    {t("meetings.cancel")}
                  </button>
                </form>
                <form action={proposeRescheduleAction} className="flex flex-wrap gap-2">
                  <input type="hidden" name="workspace_slug" value={workspaceSlug} />
                  <input type="hidden" name="meeting_id" value={entry.meetings?.id ?? ""} />
                  <label className="block">
                    <span className="sr-only">{t("meetings.proposedStart")}</span>
                    <input name="proposed_start_at" type="datetime-local" className="rounded-full border border-stone-900/10 bg-white px-3 py-2 text-sm" />
                  </label>
                  <label className="block">
                    <span className="sr-only">{t("meetings.proposedEnd")}</span>
                    <input name="proposed_end_at" type="datetime-local" className="rounded-full border border-stone-900/10 bg-white px-3 py-2 text-sm" />
                  </label>
                  <button type="submit" className={appButtonClassName({ variant: "neutral", size: "sm" })}>
                    {t("meetings.reschedule")}
                  </button>
                </form>
              </div>
            </SurfaceCard>
          ))}
        </div>
        <div className="space-y-4">
          <h2 className="font-display text-3xl text-stone-900">History</h2>
          {past.map((entry) => (
            <SurfaceCard key={entry.id} className="bg-white">
              <h3 className="font-display text-2xl font-black text-mocha-earth">{entry.meetings?.title}</h3>
              <p className="mt-2 text-sm font-semibold text-mocha-earth/75">
                {formatDateTime(
                  entry.meetings?.start_at,
                  intlLocale,
                  context.workspace.timezone,
                )}
              </p>
              <form action={rateMeetingAction} className="mt-4 flex items-center gap-3">
                <input type="hidden" name="workspace_slug" value={workspaceSlug} />
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
                <button type="submit" className={appButtonClassName({ variant: "primary", size: "sm" })}>
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
