import type { Page } from "@playwright/test";

export const LOCALES = ["en", "es", "br"] as const;
export type Locale = (typeof LOCALES)[number];

export function path(locale: Locale, route: string) {
  return `/${locale}${route === "/" ? "" : route}`;
}

export async function waitForHydration(page: Page) {
  await page.waitForLoadState("networkidle");
}
