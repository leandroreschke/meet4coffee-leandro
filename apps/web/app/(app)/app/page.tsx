import { redirect } from "next/navigation";

import { getCurrentMemberships, getCurrentUser, getPreferredLocale } from "@/lib/auth";
import { localizePath } from "@/lib/locale";

export default async function AppEntryPage() {
  const locale = await getPreferredLocale();
  const user = await getCurrentUser();

  if (!user) {
    redirect(`${localizePath("/sign-in", locale)}?next=${encodeURIComponent(localizePath("/app", locale))}`);
  }

  const memberships = await getCurrentMemberships();
  const firstWorkspace = memberships.find((membership) => membership.workspaces?.slug);

  if (firstWorkspace?.workspaces?.slug) {
    redirect(localizePath(`/w/${firstWorkspace.workspaces.slug}`, locale));
  }

  redirect(localizePath("/welcome", locale));
}
