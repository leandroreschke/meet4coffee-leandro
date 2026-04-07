export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceSlug: string }>;
}) {
  return <div className="flex min-h-screen flex-col bg-cream">{children}</div>;
}
