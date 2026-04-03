import Link from "next/link";
import { redirect } from "next/navigation";

import { createTranslator } from "@meet4coffee/i18n";

import { getCurrentMemberships, getWorkspaceContext } from "@/lib/auth";
import { signOutAction } from "@/lib/actions/auth";
import { localizePath } from "@/lib/locale";
import { appButtonClassName } from "@/components/ui/app-button";

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-cream">
      {children}
    </div>
  );
}
