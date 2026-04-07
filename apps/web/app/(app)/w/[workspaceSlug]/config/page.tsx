import { redirect } from "next/navigation";

import { createTranslator } from "@meet4coffee/i18n";

import { PageShell } from "@/components/page-shell";
import { StatusPill } from "@/components/status-pill";
import { TocaModal } from "@/components/toca-modal";
import { getWorkspaceContext } from "@/lib/auth";
import { getWorkspaceConfigData } from "@/lib/data";
import {
  createClubAction,
  createGroupAction,
  deleteClubAction,
  toggleClubReadyAction,
  updateClubAction,
} from "@/lib/actions/clubs";
import {
  createInviteAction,
  revokeInviteAction,
} from "@/lib/actions/workspace";
import {
  connectGoogleIntegrationAction,
  connectSlackIntegrationAction,
  disconnectIntegrationAction,
  saveSlackChannelAction,
  sendGoogleCalendarTestAction,
  sendSlackTestNotificationAction,
  testAllIntegrationsAction,
} from "@/lib/actions/integrations";
import { getAppUrl } from "@/lib/env";
import { transferOwnershipAction } from "@/lib/actions/roles";
import { localizePath } from "@/lib/locale";
import { DangerZoneForm } from "./danger-zone-form";

function readSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function integrationMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {} as Record<string, unknown>;
  }
  return value as Record<string, unknown>;
}

function integrationFeedbackMessage(
  integration: string | null,
  status: string | null,
  slackTest: string | null,
  googleTest: string | null,
) {
  if (!integration || !status) {
    return null;
  }

  if (integration === "all" && status === "done") {
    return `Combined test finished. Slack: ${slackTest ?? "unknown"} · Google Calendar: ${googleTest ?? "unknown"}.`;
  }

  const prefix =
    integration === "google_calendar"
      ? "Google Calendar"
      : integration === "slack"
        ? "Slack"
        : "Integration";

  const messageByStatus: Record<string, string> = {
    connected: `${prefix} connected successfully.`,
    disconnected: `${prefix} disconnected.`,
    saved: "Slack channel saved.",
    tested: `${prefix} test succeeded.`,
    missing_channel:
      "Save a Slack channel first (channel ID like C0123456789).",
    not_connected: `${prefix} is not connected yet.`,
    oauth_not_configured: `${prefix} OAuth client credentials are missing in server env.`,
    token_exchange_failed: `${prefix} OAuth callback failed during token exchange.`,
    token_error: `${prefix} OAuth callback returned an error from provider.`,
    unauthorized_state: `${prefix} OAuth callback was rejected for this workspace owner.`,
    test_failed: `${prefix} test failed. Check token/scopes and provider app setup.`,
    invalid_provider: "Invalid integration provider.",
  };

  return messageByStatus[status] ?? `${prefix}: ${status}`;
}

function clubsFeedbackMessage(status: string | null) {
  if (!status) {
    return null;
  }

  const messageByStatus: Record<string, string> = {
    created: "Club created.",
    updated: "Club updated.",
    deleted: "Club deleted.",
    create_invalid:
      "Club data is invalid. Check required fields and weekday values.",
    update_invalid: "Club update is invalid.",
    delete_invalid: "Club ID is missing.",
    create_error: "Could not create club due to a server/database error.",
    update_error: "Could not update club due to a server/database error.",
    delete_error: "Could not delete club due to a server/database error.",
    toggle_invalid: "Club ID is missing.",
    toggle_error: "Could not update club ready state.",
  };

  return messageByStatus[status] ?? `Clubs: ${status}`;
}

export default async function ConfigPage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workspaceSlug } = await params;
  const query = await searchParams;
  const context = await getWorkspaceContext(workspaceSlug);
  const t = createTranslator(context.locale);
  const appUrl = getAppUrl();

  if (context.membership.role !== "owner") {
    redirect(`/w/${workspaceSlug}`);
  }

  const config = await getWorkspaceConfigData(context.workspace.id);
  const slackIntegration =
    config.integrations.find(
      (integration) => integration.provider === "slack",
    ) ?? null;
  const googleIntegration =
    config.integrations.find(
      (integration) => integration.provider === "google_calendar",
    ) ?? null;
  const slackMetadata = integrationMetadata(slackIntegration?.metadata);
  const savedSlackChannelId =
    typeof slackMetadata.slack_channel_id === "string"
      ? slackMetadata.slack_channel_id
      : "";
  const integrationFeedback = integrationFeedbackMessage(
    readSearchParam(query.integration),
    readSearchParam(query.status),
    readSearchParam(query.slack_test),
    readSearchParam(query.google_test),
  );
  const clubsFeedback = clubsFeedbackMessage(
    readSearchParam(query.clubs_status),
  );

  return (
    <PageShell
      homeHref={localizePath(`/w/${workspaceSlug}`, context.locale)}
      title={t("config.title")}
      locale={context.locale}
    >
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <article
            className="surface-card rounded-[2.5rem] p-6 lg:p-8"
            style={{ "--shadow-color": "var(--strawberry-milk)" } as any}
          >
            <h2 className="font-display text-4xl font-black text-mocha-earth">
              Workspace Actions
            </h2>
            <p className="mt-2 text-mocha-earth/80 font-bold mb-6">
              Open settings models to manage your workspace components.
            </p>

            <div className="flex flex-col gap-4">
              <TocaModal
                id="invites-modal"
                title={t("invites.title")}
                trigger={
                  <button
                    className="toca-shadow flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 border-4 border-mocha-earth text-left font-black tracking-widest uppercase text-mocha-earth transition-transform hover:-translate-y-1"
                    style={{ "--shadow-color": "var(--matcha-latte)" } as any}
                  >
                    <span>Manage Invites</span>
                    <span>&rarr;</span>
                  </button>
                }
              >
                <form action={createInviteAction} className="mt-5 grid gap-3">
                  <input
                    type="hidden"
                    name="workspace_slug"
                    value={workspaceSlug}
                  />
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-stone-800">
                      Email
                    </span>
                    <input
                      name="email"
                      type="email"
                      placeholder="Email (optional, only enforced for single use)"
                      className="w-full"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-stone-800">
                      Usage Limit
                    </span>
                    <select
                      name="usage"
                      defaultValue="single"
                      className="w-full"
                    >
                      <option value="single">Single use</option>
                      <option value="unlimited">Unlimited</option>
                    </select>
                  </label>
                  <button
                    type="submit"
                    className="toca-shadow mt-2 rounded-2xl border-4 border-mocha-earth bg-banana-split px-5 py-3 font-black text-mocha-earth hover:-translate-y-1 transition-transform"
                    style={{ "--shadow-color": "var(--cotton-candy)" } as any}
                  >
                    {t("common.create")}
                  </button>
                </form>
                <div className="mt-5 space-y-3">
                  {config.invites.map((invite) => (
                    <div
                      key={invite.id}
                      className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border-4 border-mocha-earth bg-white px-4 py-3"
                    >
                      <div className="text-sm font-bold text-mocha-earth">
                        <div>
                          {invite.invited_email ?? "Open invite"} · used{" "}
                          {invite.usage_count} times
                        </div>
                        <a
                          href={`${appUrl}/join/${invite.id}`}
                          className="font-bold underline text-blue-600 truncate block max-w-[200px] md:max-w-none"
                        >
                          {`${appUrl}/join/${invite.id}`}
                        </a>
                      </div>
                      <form action={revokeInviteAction}>
                        <input
                          type="hidden"
                          name="workspace_slug"
                          value={workspaceSlug}
                        />
                        <input
                          type="hidden"
                          name="invite_id"
                          value={invite.id}
                        />
                        <button
                          type="submit"
                          className="rounded-xl border-4 border-mocha-earth bg-rose-200 px-4 py-2 text-sm font-black text-mocha-earth"
                        >
                          Revoke
                        </button>
                      </form>
                    </div>
                  ))}
                </div>
              </TocaModal>

              <TocaModal
                id="groups-modal"
                title="Groups"
                trigger={
                  <button
                    className="toca-shadow flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 border-4 border-mocha-earth text-left font-black tracking-widest uppercase text-mocha-earth transition-transform hover:-translate-y-1"
                    style={{ "--shadow-color": "var(--cotton-candy)" } as any}
                  >
                    <span>Manage Groups</span>
                    <span>&rarr;</span>
                  </button>
                }
              >
                <form action={createGroupAction} className="mt-5 grid gap-3">
                  <input
                    type="hidden"
                    name="workspace_slug"
                    value={workspaceSlug}
                  />
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-stone-800">
                      Group Name
                    </span>
                    <input
                      name="name"
                      placeholder="Designers"
                      className="w-full"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-sm font-semibold text-stone-800">
                      Description
                    </span>
                    <input
                      name="description"
                      placeholder="Team or functional group"
                      className="w-full"
                    />
                  </label>
                  <button
                    type="submit"
                    className="toca-shadow mt-2 rounded-2xl border-4 border-mocha-earth bg-banana-split px-5 py-3 font-black text-mocha-earth hover:-translate-y-1 transition-transform"
                    style={
                      { "--shadow-color": "var(--strawberry-milk)" } as any
                    }
                  >
                    {t("common.create")}
                  </button>
                </form>
                <ul className="mt-5 space-y-2 text-sm text-mocha-earth font-bold">
                  {config.groups.map((group) => (
                    <li
                      key={group.id}
                      className="p-3 border-4 border-mocha-earth rounded-xl bg-vanilla-cream"
                    >
                      {group.name}
                    </li>
                  ))}
                </ul>
              </TocaModal>

              <TocaModal
                id="clubs-modal"
                title="Clubs"
                trigger={
                  <button
                    className="toca-shadow flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 border-4 border-mocha-earth text-left font-black tracking-widest uppercase text-mocha-earth transition-transform hover:-translate-y-1"
                    style={{ "--shadow-color": "var(--banana-split)" } as any}
                  >
                    <span>Manage Clubs</span>
                    <span>&rarr;</span>
                  </button>
                }
              >
                {clubsFeedback && (
                  <p className="mt-3 rounded-xl border-4 border-mocha-earth bg-white px-3 py-2 text-sm font-bold text-mocha-earth">
                    {clubsFeedback}
                  </p>
                )}

                <div className="mt-5 space-y-4">
                  {config.clubs.length === 0 ? (
                    <p className="rounded-2xl border-4 border-mocha-earth bg-white px-4 py-3 text-sm font-bold text-mocha-earth/80">
                      No clubs yet. Create your first club below.
                    </p>
                  ) : (
                    config.clubs.map((club) => (
                      <article
                        key={club.id}
                        className="rounded-[1.5rem] border-4 border-mocha-earth bg-white px-4 py-4"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-display text-2xl font-black text-mocha-earth">
                              {club.name}
                            </p>
                            {club.description ? (
                              <p className="mt-1 text-sm font-semibold text-mocha-earth/80">
                                {club.description}
                              </p>
                            ) : null}
                            <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-mocha-earth/70">
                              {club.frequency} · {club.visibility} ·{" "}
                              {club.join_policy}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <form action={toggleClubReadyAction}>
                              <input
                                type="hidden"
                                name="workspace_slug"
                                value={workspaceSlug}
                              />
                              <input
                                type="hidden"
                                name="club_id"
                                value={club.id}
                              />
                              <input
                                type="hidden"
                                name="is_ready"
                                value={club.is_ready ? "false" : "true"}
                              />
                              <button
                                type="submit"
                                className={`rounded-xl border-4 border-mocha-earth px-4 py-2 text-sm font-black ${
                                  club.is_ready
                                    ? "bg-matcha-latte text-mocha-earth"
                                    : "bg-white text-mocha-earth/60"
                                }`}
                              >
                                {club.is_ready ? "⏸ Pause" : "▶ Go Live"}
                              </button>
                            </form>
                            <details>
                              <summary className="list-none cursor-pointer rounded-xl border-4 border-mocha-earth bg-banana-split px-4 py-2 text-sm font-black text-mocha-earth">
                                Edit
                              </summary>
                              <form
                                action={updateClubAction}
                                className="mt-3 grid gap-3"
                              >
                                <input
                                  type="hidden"
                                  name="workspace_slug"
                                  value={workspaceSlug}
                                />
                                <input
                                  type="hidden"
                                  name="club_id"
                                  value={club.id}
                                />
                                <label className="space-y-1">
                                  <span className="text-xs font-semibold text-mocha-earth">
                                    Name
                                  </span>
                                  <input
                                    name="name"
                                    defaultValue={club.name}
                                    required
                                    className="w-full px-3 py-2"
                                  />
                                </label>
                                <label className="space-y-1">
                                  <span className="text-xs font-semibold text-mocha-earth">
                                    Description
                                  </span>
                                  <input
                                    name="description"
                                    defaultValue={club.description ?? ""}
                                    className="w-full px-3 py-2"
                                  />
                                </label>
                                <div className="grid gap-2 sm:grid-cols-2">
                                  <select
                                    name="join_policy"
                                    defaultValue={club.join_policy}
                                    className="w-full px-3 py-2"
                                  >
                                    <option value="free_join">Free join</option>
                                    <option value="approval_required">
                                      Approval required
                                    </option>
                                    <option value="owner_only">
                                      Owner only
                                    </option>
                                  </select>
                                  <select
                                    name="visibility"
                                    defaultValue={club.visibility}
                                    className="w-full px-3 py-2"
                                  >
                                    <option value="public">Public</option>
                                    <option value="hidden">Hidden</option>
                                  </select>
                                  <select
                                    name="frequency"
                                    defaultValue={club.frequency}
                                    className="w-full px-3 py-2"
                                  >
                                    <option value="weekly">Weekly</option>
                                    <option value="biweekly">Biweekly</option>
                                    <option value="monthly">Monthly</option>
                                  </select>
                                  <select
                                    name="anchor_weekday"
                                    defaultValue={club.anchor_weekday ?? ""}
                                    className="w-full px-3 py-2"
                                  >
                                    <option value="">No anchor weekday</option>
                                    <option value="monday">Monday</option>
                                    <option value="tuesday">Tuesday</option>
                                    <option value="wednesday">Wednesday</option>
                                    <option value="thursday">Thursday</option>
                                    <option value="friday">Friday</option>
                                    <option value="saturday">Saturday</option>
                                    <option value="sunday">Sunday</option>
                                  </select>
                                  <input
                                    name="group_size_target"
                                    type="number"
                                    min="2"
                                    defaultValue={club.group_size_target}
                                    className="w-full px-3 py-2"
                                  />
                                  <input
                                    name="duration_minutes"
                                    type="number"
                                    min="1"
                                    defaultValue={club.duration_minutes}
                                    className="w-full px-3 py-2"
                                  />
                                  <input
                                    name="anchor_time"
                                    type="time"
                                    defaultValue={club.anchor_time ?? ""}
                                    className="w-full px-3 py-2"
                                  />
                                  <input
                                    name="reminder_minutes_before"
                                    type="number"
                                    min="0"
                                    defaultValue={club.reminder_minutes_before}
                                    className="w-full px-3 py-2"
                                  />
                                </div>
                                <label className="flex items-center gap-2 rounded-xl border-2 border-mocha-earth bg-vanilla-cream px-3 py-2">
                                  <input
                                    name="calendar_event_enabled"
                                    type="checkbox"
                                    defaultChecked={club.calendar_event_enabled}
                                  />
                                  <span className="text-xs font-bold text-mocha-earth">
                                    Enable calendar events
                                  </span>
                                </label>
                                <button
                                  type="submit"
                                  className="rounded-xl border-4 border-mocha-earth bg-matcha-latte px-4 py-2 text-sm font-black text-mocha-earth"
                                >
                                  Save changes
                                </button>
                              </form>
                            </details>

                            <details>
                              <summary className="list-none cursor-pointer rounded-xl border-4 border-mocha-earth bg-rose-200 px-4 py-2 text-sm font-black text-mocha-earth">
                                Delete
                              </summary>
                              <form
                                action={deleteClubAction}
                                className="mt-3 space-y-2"
                              >
                                <input
                                  type="hidden"
                                  name="workspace_slug"
                                  value={workspaceSlug}
                                />
                                <input
                                  type="hidden"
                                  name="club_id"
                                  value={club.id}
                                />
                                <p className="text-xs font-bold text-mocha-earth/80">
                                  This permanently removes the club and related
                                  memberships/rounds. Continue?
                                </p>
                                <button
                                  type="submit"
                                  className="rounded-xl border-4 border-mocha-earth bg-rose-300 px-4 py-2 text-sm font-black text-mocha-earth"
                                >
                                  Confirm delete
                                </button>
                              </form>
                            </details>
                          </div>
                        </div>
                      </article>
                    ))
                  )}
                </div>

                <details className="mt-6 rounded-[1.5rem] border-4 border-mocha-earth bg-white px-4 py-4">
                  <summary className="list-none cursor-pointer rounded-xl border-4 border-mocha-earth bg-banana-split px-4 py-3 text-center text-sm font-black uppercase tracking-[0.14em] text-mocha-earth">
                    Add New Club
                  </summary>
                  <form action={createClubAction} className="mt-5 grid gap-4">
                    <input
                      type="hidden"
                      name="workspace_slug"
                      value={workspaceSlug}
                    />
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-800">
                          Club name
                        </span>
                        <input
                          name="name"
                          required
                          placeholder="1:1 Roulette"
                          className="w-full px-4 py-3"
                        />
                      </label>
                      <label className="space-y-2">
                        <span className="text-sm font-semibold text-stone-800">
                          Description
                        </span>
                        <input
                          name="description"
                          placeholder="Weekly coffee pairs for everyone"
                          className="w-full px-4 py-3"
                        />
                      </label>
                    </div>

                    <fieldset className="rounded-[1.4rem] border-4 border-mocha-earth bg-white p-4">
                      <legend className="px-2 text-xs font-black uppercase tracking-[0.2em] text-mocha-earth bg-white">
                        Participation
                      </legend>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-stone-800">
                            Join policy
                          </span>
                          <select
                            name="join_policy"
                            defaultValue="free_join"
                            className="w-full px-4 py-3"
                          >
                            <option value="free_join">Free join</option>
                            <option value="approval_required">
                              Approval required
                            </option>
                            <option value="owner_only">Owner only</option>
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-stone-800">
                            Visibility
                          </span>
                          <select
                            name="visibility"
                            defaultValue="public"
                            className="w-full px-4 py-3"
                          >
                            <option value="public">Public</option>
                            <option value="hidden">Hidden</option>
                          </select>
                        </label>
                      </div>
                    </fieldset>

                    <fieldset className="rounded-[1.4rem] border-4 border-mocha-earth bg-white p-4">
                      <legend className="px-2 text-xs font-black uppercase tracking-[0.2em] text-mocha-earth bg-white">
                        Scheduling
                      </legend>
                      <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-stone-800">
                            Group size target
                          </span>
                          <input
                            name="group_size_target"
                            type="number"
                            min="2"
                            defaultValue="2"
                            className="w-full px-4 py-3"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-stone-800">
                            Duration (minutes)
                          </span>
                          <input
                            name="duration_minutes"
                            type="number"
                            min="15"
                            step="15"
                            defaultValue="30"
                            className="w-full px-4 py-3"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-stone-800">
                            Frequency
                          </span>
                          <select
                            name="frequency"
                            defaultValue="weekly"
                            className="w-full px-4 py-3"
                          >
                            <option value="weekly">Weekly</option>
                            <option value="biweekly">Biweekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-stone-800">
                            Anchor weekday
                          </span>
                          <select
                            name="anchor_weekday"
                            defaultValue=""
                            className="w-full px-4 py-3"
                          >
                            <option value="">No anchor weekday</option>
                            <option value="monday">Monday</option>
                            <option value="tuesday">Tuesday</option>
                            <option value="wednesday">Wednesday</option>
                            <option value="thursday">Thursday</option>
                            <option value="friday">Friday</option>
                            <option value="saturday">Saturday</option>
                            <option value="sunday">Sunday</option>
                          </select>
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-stone-800">
                            Anchor time
                          </span>
                          <input
                            name="anchor_time"
                            type="time"
                            className="w-full px-4 py-3"
                          />
                        </label>
                        <label className="space-y-2">
                          <span className="text-sm font-semibold text-stone-800">
                            Reminder (minutes before)
                          </span>
                          <input
                            name="reminder_minutes_before"
                            type="number"
                            min="0"
                            defaultValue="30"
                            className="w-full px-4 py-3"
                          />
                        </label>
                      </div>
                    </fieldset>

                    <label className="flex items-center gap-3 rounded-2xl border-4 border-mocha-earth bg-white px-4 py-3">
                      <input
                        name="calendar_event_enabled"
                        type="checkbox"
                        defaultChecked
                        className="w-6 h-6 border-4 border-mocha-earth"
                      />
                      <span className="text-sm font-bold text-mocha-earth">
                        Enable calendar events
                      </span>
                    </label>
                    <button
                      type="submit"
                      className="toca-shadow mt-2 rounded-2xl border-4 border-mocha-earth bg-banana-split px-5 py-3 font-black text-mocha-earth hover:-translate-y-1 transition-transform"
                      style={
                        { "--shadow-color": "var(--strawberry-milk)" } as any
                      }
                    >
                      {t("common.create")}
                    </button>
                  </form>
                </details>
              </TocaModal>

              <TocaModal
                id="roles-modal"
                title={t("roles.title")}
                trigger={
                  <button
                    className="toca-shadow flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 border-4 border-mocha-earth text-left font-black tracking-widest uppercase text-mocha-earth transition-transform hover:-translate-y-1"
                    style={{ "--shadow-color": "var(--vanilla-cream)" } as any}
                  >
                    <span>Manage Roles</span>
                    <span>&rarr;</span>
                  </button>
                }
              >
                <div className="mt-5 space-y-3">
                  {config.members.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-[1.5rem] border-4 border-mocha-earth bg-white px-4 py-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-mocha-earth text-lg">
                            {member.member_profiles?.name ??
                              "Unfinished profile"}
                          </p>
                          <p className="text-sm font-bold text-mocha-earth/80 uppercase tracking-widest">
                            {member.role}
                          </p>
                        </div>
                        {context.membership.role === "owner" &&
                          member.role !== "owner" && (
                            <div className="flex flex-wrap gap-2">
                              <form action={transferOwnershipAction}>
                                <input
                                  type="hidden"
                                  name="workspace_slug"
                                  value={workspaceSlug}
                                />
                                <input
                                  type="hidden"
                                  name="target_member_id"
                                  value={member.id}
                                />
                                <button
                                  type="submit"
                                  className="rounded-xl border-4 border-mocha-earth bg-banana-split px-4 py-2 text-sm font-black text-mocha-earth"
                                >
                                  {t("roles.transferOwnership")}
                                </button>
                              </form>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </TocaModal>

              <TocaModal
                id="integrations-modal"
                title={t("integrations.title")}
                trigger={
                  <button
                    className="toca-shadow flex w-full items-center justify-between rounded-2xl bg-white px-5 py-4 border-4 border-mocha-earth text-left font-black tracking-widest uppercase text-mocha-earth transition-transform hover:-translate-y-1"
                    style={{ "--shadow-color": "var(--lavender-haze)" } as any}
                  >
                    <span>Manage Integrations</span>
                    <span>&rarr;</span>
                  </button>
                }
              >
                {integrationFeedback && (
                  <p className="mt-3 rounded-xl border-4 border-mocha-earth bg-white px-3 py-2 text-sm font-bold text-mocha-earth">
                    {integrationFeedback}
                  </p>
                )}
                <div className="mt-5 space-y-5">
                  <div className="rounded-[1.5rem] border-4 border-mocha-earth bg-white px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-xl text-mocha-earth">
                          Slack Workspace
                        </p>
                        <p className="text-sm font-bold text-mocha-earth/80 mt-1 max-w-sm">
                          Connect once, choose a channel, and send test
                          notifications.
                        </p>
                      </div>
                      <StatusPill>
                        {slackIntegration?.status ?? "not_connected"}
                      </StatusPill>
                    </div>
                    <form
                      action={connectSlackIntegrationAction}
                      className="mt-4 inline-block"
                    >
                      <input
                        type="hidden"
                        name="workspace_slug"
                        value={workspaceSlug}
                      />
                      <button
                        type="submit"
                        className="toca-shadow rounded-xl border-4 border-mocha-earth bg-banana-split px-4 py-2 text-sm font-black text-mocha-earth"
                        style={
                          { "--shadow-color": "var(--strawberry-milk)" } as any
                        }
                      >
                        {slackIntegration?.status === "connected"
                          ? "Reconnect Slack"
                          : "Connect Slack"}
                      </button>
                    </form>
                    {slackIntegration && (
                      <form
                        action={disconnectIntegrationAction}
                        className="mt-3 inline-block ml-2"
                      >
                        <input
                          type="hidden"
                          name="workspace_slug"
                          value={workspaceSlug}
                        />
                        <input type="hidden" name="provider" value="slack" />
                        <button
                          type="submit"
                          className="rounded-xl border-4 border-mocha-earth bg-white px-4 py-2 text-sm font-black text-mocha-earth"
                        >
                          Disconnect
                        </button>
                      </form>
                    )}
                    <form
                      action={saveSlackChannelAction}
                      className="mt-4 grid gap-2"
                    >
                      <input
                        type="hidden"
                        name="workspace_slug"
                        value={workspaceSlug}
                      />
                      <label className="block space-y-1">
                        <span className="text-sm font-semibold text-stone-800">
                          Slack channel ID
                        </span>
                        <input
                          name="slack_channel_id"
                          defaultValue={savedSlackChannelId}
                          placeholder="C0123456789"
                          className="w-full"
                        />
                      </label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="submit"
                          className="rounded-xl border-4 border-mocha-earth bg-white px-4 py-2 text-sm font-black text-mocha-earth mt-2"
                        >
                          Save channel
                        </button>
                      </div>
                    </form>
                    <form
                      action={sendSlackTestNotificationAction}
                      className="mt-3"
                    >
                      <input
                        type="hidden"
                        name="workspace_slug"
                        value={workspaceSlug}
                      />
                      <button
                        type="submit"
                        className="rounded-xl border-4 border-mocha-earth bg-white px-4 py-2 text-sm font-black text-mocha-earth"
                      >
                        Send Slack test notification
                      </button>
                    </form>
                  </div>
                  <div className="rounded-[1.5rem] border-4 border-mocha-earth bg-white px-4 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-black text-xl text-mocha-earth">
                          Google Calendar
                        </p>
                        <p className="text-sm font-bold text-mocha-earth/80 mt-1 max-w-sm">
                          Connect once and generate a test calendar event in the
                          owner account.
                        </p>
                      </div>
                      <StatusPill>
                        {googleIntegration?.status ?? "not_connected"}
                      </StatusPill>
                    </div>
                    <form
                      action={connectGoogleIntegrationAction}
                      className="mt-4 inline-block"
                    >
                      <input
                        type="hidden"
                        name="workspace_slug"
                        value={workspaceSlug}
                      />
                      <button
                        type="submit"
                        className="toca-shadow rounded-xl border-4 border-mocha-earth bg-banana-split px-4 py-2 text-sm font-black text-mocha-earth"
                        style={
                          { "--shadow-color": "var(--cotton-candy)" } as any
                        }
                      >
                        {googleIntegration?.status === "connected"
                          ? "Reconnect Google Calendar"
                          : "Connect Google Calendar"}
                      </button>
                    </form>
                    {googleIntegration && (
                      <form
                        action={disconnectIntegrationAction}
                        className="mt-3 inline-block ml-2"
                      >
                        <input
                          type="hidden"
                          name="workspace_slug"
                          value={workspaceSlug}
                        />
                        <input
                          type="hidden"
                          name="provider"
                          value="google_calendar"
                        />
                        <button
                          type="submit"
                          className="rounded-xl border-4 border-mocha-earth bg-white px-4 py-2 text-sm font-black text-mocha-earth"
                        >
                          Disconnect
                        </button>
                      </form>
                    )}
                    <form
                      action={sendGoogleCalendarTestAction}
                      className="mt-3"
                    >
                      <input
                        type="hidden"
                        name="workspace_slug"
                        value={workspaceSlug}
                      />
                      <button
                        type="submit"
                        className="rounded-xl border-4 border-mocha-earth bg-white px-4 py-2 text-sm font-black text-mocha-earth"
                      >
                        Create Google Calendar test event
                      </button>
                    </form>
                    <form action={testAllIntegrationsAction} className="mt-3">
                      <input
                        type="hidden"
                        name="workspace_slug"
                        value={workspaceSlug}
                      />
                      <button
                        type="submit"
                        className="rounded-xl border-4 border-mocha-earth bg-white px-4 py-2 text-sm font-black text-mocha-earth"
                      >
                        Run both tests
                      </button>
                    </form>
                  </div>
                </div>
              </TocaModal>
            </div>
          </article>
        </div>

        <div className="space-y-6">
          <article
            className="surface-card rounded-[2.5rem] p-6 lg:p-8"
            style={{ "--shadow-color": "var(--cotton-candy)" } as any}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-4xl font-black text-mocha-earth">
                {t("billing.title")}
              </h2>
              <StatusPill>{config.subscription?.tier ?? "free"}</StatusPill>
            </div>
            <p className="mt-4 text-sm font-bold leading-6 text-mocha-earth/80">
              Stripe Checkout and Customer Portal routes are wired. Once env
              vars are set, upgrades and portal access will work from here.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <form action="/api/stripe/checkout" method="post">
                <input
                  type="hidden"
                  name="workspace_slug"
                  value={workspaceSlug}
                />
                <input type="hidden" name="tier" value="premium" />
                <button
                  type="submit"
                  className="toca-shadow rounded-2xl border-4 border-mocha-earth bg-banana-split px-5 py-4 text-sm font-black tracking-widest uppercase text-mocha-earth hover:-translate-y-1 transition-transform"
                  style={{ "--shadow-color": "var(--lavender-haze)" } as any}
                >
                  Upgrade to Premium
                </button>
              </form>
              <form action="/api/stripe/portal" method="post">
                <input
                  type="hidden"
                  name="workspace_slug"
                  value={workspaceSlug}
                />
                <button
                  type="submit"
                  className="rounded-2xl border-4 border-mocha-earth bg-white px-5 py-4 text-sm font-black tracking-widest uppercase text-mocha-earth"
                >
                  Open Portal
                </button>
              </form>
            </div>
          </article>

          <article
            className="surface-card rounded-[2.5rem] border-4 border-rose-500 bg-rose-50 p-6 lg:p-8"
            style={{ "--shadow-color": "var(--mocha-earth)" } as any}
          >
            <h2 className="font-display text-4xl font-black text-rose-900">
              Danger zone
            </h2>
            <div className="mt-4">
              <DangerZoneForm workspaceSlug={workspaceSlug} />
            </div>
          </article>
        </div>
      </section>
    </PageShell>
  );
}
