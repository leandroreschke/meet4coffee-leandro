import Link from "next/link";
import { type Locale } from "@meet4coffee/i18n";
import { appButtonClassName } from "@/components/ui/app-button";
import { signOutAction } from "@/lib/actions/auth";
import { localizePath } from "@/lib/locale";

type Props = {
  workspaceSlug: string;
  workspaceName: string;
  locale: Locale;
  membershipRoleLabel: string;
  signOutLabel: string;
  switchWorkspaceLabel: string;
  configTitleLabel: string;
  otherMemberships: Array<{
    id: string;
    workspaces?: { slug: string; name: string } | null;
  }>;
};

export function WorkspaceHeader({
  workspaceSlug,
  workspaceName,
  locale,
  membershipRoleLabel,
  signOutLabel,
  switchWorkspaceLabel,
  configTitleLabel,
  otherMemberships,
}: Props) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-5">
      <div className="surface-card rounded-[2.5rem] bg-cotton-candy p-5 md:p-6" style={{ '--shadow-color': 'var(--strawberry-milk)' } as any}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div>
              <Link
                href={localizePath(`/w/${workspaceSlug}`, locale)}
                transitionTypes={["nav-back"]}
                className="font-display text-3xl font-black tracking-tight text-mocha-earth"
              >
                {workspaceName}
              </Link>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <form action={signOutAction}>
              <button type="submit" className={appButtonClassName({ variant: "secondary", size: "sm" })}>
                {signOutLabel}
              </button>
            </form>
          </div>
        </div>
      </div>
      {otherMemberships.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-black uppercase tracking-[0.16em] text-mocha-earth/70">
            {switchWorkspaceLabel}
          </span>
          {otherMemberships.map((membership) => (
            <Link
              key={membership.id}
              href={localizePath(`/w/${membership.workspaces?.slug ?? ""}`, locale)}
              transitionTypes={["nav-forward"]}
              className={appButtonClassName({ variant: "neutral", size: "sm" })}
            >
              {membership.workspaces?.name ?? configTitleLabel}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
