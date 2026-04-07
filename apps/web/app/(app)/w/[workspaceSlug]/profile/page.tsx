import { createTranslator } from "@meet4coffee/i18n";

import { PageShell } from "@/components/page-shell";
import { getCurrentMemberships, getWorkspaceContext } from "@/lib/auth";
import {
  getOptOuts,
  getProfileData,
  getWorkspaceMembersSearchable,
} from "@/lib/data";
import {
  importProfileAction,
  saveAvailabilityAction,
  saveProfileAction,
} from "@/lib/actions/profile";
import { addOptOutAction, removeOptOutAction } from "@/lib/actions/opt-outs";
import { localizePath } from "@/lib/locale";
import { LanguageSwitcher } from "@/components/language-switcher";
import { appButtonClassName } from "@/components/ui/app-button";
import { CenterToast } from "@/components/center-toast";
import { InterestsPicker } from "./interests-picker";

function readSearchParam(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

function profileFeedback(status: string | null, code: string | null) {
  if (!status) {
    return null;
  }

  const map: Record<string, { variant: "success" | "error"; message: string }> =
    {
      saved: { variant: "success", message: "Profile saved." },
      error_profile: {
        variant: "error",
        message: "Could not save profile details.",
      },
      error_interests: {
        variant: "error",
        message: "Could not save profile interests.",
      },
      error_membership: {
        variant: "error",
        message: "Could not activate your membership status.",
      },
    };

  const base = map[status] ?? {
    variant: "error",
    message: "Profile save failed.",
  };
  if (!code) {
    return base;
  }
  return {
    ...base,
    message: `${base.message} (${code})`,
  };
}

export default async function ProfilePage({
  params,
  searchParams,
}: {
  params: Promise<{ workspaceSlug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { workspaceSlug } = await params;
  const query = searchParams ? await searchParams : undefined;
  const context = await getWorkspaceContext(workspaceSlug);
  const t = createTranslator(context.locale);
  const data = await getProfileData(context.workspace.id, context.user.id);
  const memberships = await getCurrentMemberships();
  const [optOuts, allMembers] = await Promise.all([
    getOptOuts(context.workspace.id, context.membership.id),
    getWorkspaceMembersSearchable(context.workspace.id, context.membership.id),
  ]);
  const optOutMemberIds = new Set(optOuts.map((o) => o.memberId));
  const availableToOptOut = allMembers.filter(
    (m) => !optOutMemberIds.has(m.memberId),
  );
  const toast = profileFeedback(
    readSearchParam(query?.profile_status),
    readSearchParam(query?.profile_code),
  );
  const importSources = memberships.filter(
    (membership) => membership.workspace_id !== context.workspace.id,
  );

  return (
    <PageShell
      homeHref={localizePath(`/w/${workspaceSlug}`, context.locale)}
      title={t("profile.title")}
      description={t("profile.description")}
      locale={context.locale}
    >
      {toast ? (
        <CenterToast variant={toast.variant} message={toast.message} />
      ) : null}
      <section className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
        <details
          open
          className="group rounded-[2rem] bg-white/85 p-6 shadow-[0_20px_50px_rgba(84,54,35,0.08)] transition-all"
        >
          <summary className="list-none cursor-pointer flex items-center justify-between font-display text-3xl text-stone-900 outline-none select-none">
            {t("profile.orgProfile")}
            <svg
              className="w-6 h-6 text-stone-900 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </summary>
          <form action={saveProfileAction} className="mt-6 grid gap-3">
            <input type="hidden" name="workspace_slug" value={workspaceSlug} />
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-stone-800">
                {t("profile.name")}
              </span>
              <input
                name="name"
                defaultValue={data.profile?.name ?? ""}
                placeholder={t("profile.name")}
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-stone-800">
                {t("profile.location")}
              </span>
              <input
                name="location"
                defaultValue={data.profile?.location ?? ""}
                placeholder={t("profile.location")}
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-stone-800">
                {t("profile.jobTitle")}
              </span>
              <input
                name="job_title"
                defaultValue={data.profile?.job_title ?? ""}
                placeholder={t("profile.jobTitle")}
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-stone-800">
                Slack user ID
              </span>
              <input
                name="slack_user_id"
                defaultValue={data.profile?.slack_user_id ?? ""}
                placeholder="U0123456789"
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-stone-800">
                {t("profile.languageLabel")}
              </span>
              <LanguageSwitcher
                name="language"
                currentLocale={data.profile?.language ?? "en"}
                className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3 appearance-none font-bold outline-none cursor-pointer focus:ring-2 focus:ring-stone-900"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold text-stone-800">
                {t("profile.bioLabel")}
              </span>
              <textarea
                name="bio"
                defaultValue={data.profile?.bio ?? ""}
                placeholder="A bit about me"
                className="w-full min-h-28 rounded-[1.5rem] border border-stone-900/10 bg-stone-50 px-4 py-3"
              />
            </label>
            <InterestsPicker
              interests={data.interests.map((interest) => ({
                id: interest.id,
                name: interest.name,
              }))}
              selectedInterestIds={data.selectedInterestIds}
            />
            <button
              type="submit"
              className={appButtonClassName({ variant: "primary", size: "md" })}
            >
              {t("common.save")}
            </button>
          </form>
        </details>

        <details className="group rounded-[2rem] bg-white/85 p-6 shadow-[0_20px_50px_rgba(84,54,35,0.08)] transition-all">
          <summary className="list-none cursor-pointer flex items-center justify-between font-display text-3xl text-stone-900 outline-none select-none">
            {t("profile.availability")}
            <svg
              className="w-6 h-6 text-stone-900 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </summary>
          <div className="mt-6">
            <form action={saveAvailabilityAction} className="grid gap-3">
              <input
                type="hidden"
                name="workspace_slug"
                value={workspaceSlug}
              />
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-stone-800">
                  {t("profile.weekday")}
                </span>
                <select
                  name="weekday"
                  className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
                >
                  <option value="monday">{t("weekday.monday")}</option>
                  <option value="tuesday">{t("weekday.tuesday")}</option>
                  <option value="wednesday">{t("weekday.wednesday")}</option>
                  <option value="thursday">{t("weekday.thursday")}</option>
                  <option value="friday">{t("weekday.friday")}</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-stone-800">
                  {t("profile.startTime")}
                </span>
                <input
                  name="start_time"
                  type="time"
                  className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-sm font-semibold text-stone-800">
                  {t("profile.endTime")}
                </span>
                <input
                  name="end_time"
                  type="time"
                  className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
                />
              </label>
              <button
                type="submit"
                className={appButtonClassName({
                  variant: "secondary",
                  size: "md",
                })}
              >
                {t("profile.addWindow")}
              </button>
            </form>
            <ul className="mt-4 space-y-2 text-sm text-stone-600">
              {data.availability.map((window) => (
                <li key={window.id}>
                  {window.weekday}: {window.start_time} - {window.end_time}
                </li>
              ))}
            </ul>
          </div>
        </details>

        {importSources.length > 0 && (
          <details className="group rounded-[2rem] bg-white/85 p-6 shadow-[0_20px_50px_rgba(84,54,35,0.08)] transition-all">
            <summary className="list-none cursor-pointer flex items-center justify-between font-display text-3xl text-stone-900 outline-none select-none">
              {t("profile.importTitle")}
              <svg
                className="w-6 h-6 text-stone-900 transition-transform group-open:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                ></path>
              </svg>
            </summary>
            <div className="mt-6">
              <form
                action={importProfileAction}
                className="flex flex-wrap gap-3"
              >
                <input
                  type="hidden"
                  name="workspace_slug"
                  value={workspaceSlug}
                />
                <label className="w-full block space-y-1">
                  <span className="text-sm font-semibold text-stone-800 sr-only">
                    {t("profile.sourceWorkspace")}
                  </span>
                  <select
                    name="source_workspace_id"
                    className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
                  >
                    {importSources.map((membership) => (
                      <option
                        key={membership.id}
                        value={membership.workspace_id}
                      >
                        {membership.workspaces?.name}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className={appButtonClassName({
                    variant: "secondary",
                    size: "md",
                  })}
                >
                  {t("profile.importButton")}
                </button>
              </form>
            </div>
          </details>
        )}
        <details className="group rounded-[2rem] bg-white/85 p-6 shadow-[0_20px_50px_rgba(84,54,35,0.08)] transition-all">
          <summary className="list-none cursor-pointer flex items-center justify-between font-display text-3xl text-stone-900 outline-none select-none">
            Do Not Match Me With
            <svg
              className="w-6 h-6 text-stone-900 transition-transform group-open:rotate-180"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </summary>
          <div className="mt-6 space-y-4">
            <p className="text-sm font-semibold text-stone-600">
              People on this list will never be matched with you in roulette
              meetings.
            </p>

            {optOuts.length > 0 && (
              <ul className="space-y-2">
                {optOuts.map((target) => (
                  <li
                    key={target.memberId}
                    className="flex items-center justify-between rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
                  >
                    <span className="text-sm font-bold text-stone-800">
                      {target.name ?? target.email ?? "Unknown member"}
                      {target.email && target.name ? (
                        <span className="ml-2 font-normal text-stone-500">
                          {target.email}
                        </span>
                      ) : null}
                    </span>
                    <form action={removeOptOutAction}>
                      <input
                        type="hidden"
                        name="workspace_slug"
                        value={workspaceSlug}
                      />
                      <input
                        type="hidden"
                        name="target_member_id"
                        value={target.memberId}
                      />
                      <button
                        type="submit"
                        className="rounded-xl border-2 border-stone-900/20 bg-white px-3 py-1 text-xs font-black text-stone-700 hover:bg-rose-50"
                      >
                        Remove
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            )}

            {availableToOptOut.length > 0 && (
              <form
                action={addOptOutAction}
                className="flex flex-wrap gap-3 items-end"
              >
                <input
                  type="hidden"
                  name="workspace_slug"
                  value={workspaceSlug}
                />
                <label className="flex-1 min-w-[200px] space-y-1">
                  <span className="text-sm font-semibold text-stone-800">
                    Add person
                  </span>
                  <select
                    name="target_member_id"
                    className="w-full rounded-2xl border border-stone-900/10 bg-stone-50 px-4 py-3"
                  >
                    {availableToOptOut.map((member) => (
                      <option key={member.memberId} value={member.memberId}>
                        {member.name ?? member.email ?? member.memberId}
                        {member.email && member.name
                          ? ` (${member.email})`
                          : ""}
                      </option>
                    ))}
                  </select>
                </label>
                <button
                  type="submit"
                  className={appButtonClassName({
                    variant: "secondary",
                    size: "md",
                  })}
                >
                  Add to list
                </button>
              </form>
            )}

            {availableToOptOut.length === 0 && optOuts.length === 0 && (
              <p className="text-sm text-stone-500">
                No other members in this workspace.
              </p>
            )}
          </div>
        </details>
      </section>
    </PageShell>
  );
}
