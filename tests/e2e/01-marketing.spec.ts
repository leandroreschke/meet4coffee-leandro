import { test, expect } from "@playwright/test";
import { path } from "./helpers";

test.describe("Landing page", () => {
  test("loads and shows hero section", async ({ page }) => {
    await page.goto(path("en", "/"));
    await expect(page).toHaveURL(/\/(en|es|br)(\/)?$/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("shows pricing section with three tiers", async ({ page }) => {
    await page.goto(path("en", "/"));
    const pricingCards = page.locator("article").filter({ hasText: "$" });
    await expect(pricingCards).toHaveCount(3);
  });

  test("Create Account button links to sign-up", async ({ page }) => {
    await page.goto(path("en", "/"));
    const cta = page.getByRole("link", { name: /create account/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", /sign-up/);
  });

  test("footer has Blog, Help, Sign In links", async ({ page }) => {
    await page.goto(path("en", "/"));
    const footer = page.locator("footer");
    await expect(footer.getByRole("link", { name: /blog/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /help/i })).toBeVisible();
    await expect(footer.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("root URL redirects to a locale-prefixed page", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/(en|es|br)(\/)?/);
  });
});

test.describe("Blog", () => {
  test("blog index page loads", async ({ page }) => {
    await page.goto(path("en", "/blog"));
    await expect(page).not.toHaveURL(/\/404/);
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Help center", () => {
  test("help index page loads", async ({ page }) => {
    await page.goto(path("en", "/help"));
    await expect(page).not.toHaveURL(/\/404/);
    await expect(page.locator("body")).toBeVisible();
  });
});
