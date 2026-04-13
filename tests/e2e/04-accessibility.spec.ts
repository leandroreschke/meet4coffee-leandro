import { test, expect } from "@playwright/test";
import { path } from "./helpers";

const PUBLIC_PAGES = [
  { name: "Landing", url: path("en", "/") },
  { name: "Sign-in", url: path("en", "/sign-in") },
  { name: "Sign-up", url: path("en", "/sign-up") },
  { name: "Blog", url: path("en", "/blog") },
  { name: "Help", url: path("en", "/help") },
];

for (const { name, url } of PUBLIC_PAGES) {
  test(`${name} page — no browser console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto(url);
    await page.waitForLoadState("networkidle");

    expect(errors, `Console errors on ${name}: ${errors.join(", ")}`).toHaveLength(0);
  });
}

for (const { name, url } of PUBLIC_PAGES) {
  test(`${name} page — page title is set`, async ({ page }) => {
    await page.goto(url);
    const title = await page.title();
    expect(title.length, `${name} page has empty <title>`).toBeGreaterThan(0);
  });
}

for (const { name, url } of PUBLIC_PAGES) {
  test(`${name} page — responds with 200`, async ({ page }) => {
    const response = await page.goto(url);
    expect(
      response?.status(),
      `${name} returned ${response?.status()}`
    ).toBeLessThan(400);
  });
}
