import type { Metadata } from "next";

import { getPreferredLocale } from "@/lib/auth";

import "./globals.css";

export const metadata: Metadata = {
  title: "Meet 4 Coffee",
  description: "Recurring team coffee chats, clubs, and meetings.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getPreferredLocale();

  return (
    <html lang={locale} className="h-full bg-cream antialiased">
      <body className="min-h-full bg-cream text-stone-900">{children}</body>
    </html>
  );
}
