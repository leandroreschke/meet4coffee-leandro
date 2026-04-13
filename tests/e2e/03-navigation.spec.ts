import { test, expect } from "@playwright/test";
import { path } from "./helpers";

test.describe("Navigation flows", () => {
  test("clicking Sign In from landing goes to sign-in page", async ({
    page,
  }) => {
    await page.goto(path("en", "/"));
    await page.locator("footer").getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/sign-in/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("clicking Create Account from landing goes to sign-up page", async ({
    page,
  }) => {
    await page.goto(path("en", "/"));
    const cta = page.getByRole("link", { name: /create account/i }).first();
    await cta.click();
    await expect(page).toHaveURL(/sign-up/);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test("sign-up page links back to sign-in", async ({ page }) => {
    await page.goto(path("en", "/sign-up"));
    await page.getByRole("link", { name: /sign in/i }).click();
    await expect(page).toHaveURL(/sign-in/);
  });

  test("sign-in page links to sign-up", async ({ page }) => {
    await page.goto(path("en", "/sign-in"));
    await page.getByRole("link", { name: /sign up/i }).click();
    await expect(page).toHaveURL(/sign-up/);
  });

  test("Help Center link from landing navigates correctly", async ({
    page,
  }) => {
    await page.goto(path("en", "/"));
    await page.getByRole("link", { name: /help center/i }).click();
    await expect(page).toHaveURL(/\/help/);
  });

  test("/app redirects unauthenticated users to sign-in", async ({ page }) => {
    await page.goto(path("en", "/app"));
    await expect(page).toHaveURL(/sign-in|\/$/);
  });
});

test.describe("404 handling", () => {
  test("unknown page shows 404 or redirects", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist-xyz");
    expect(response?.status()).not.toBe(500);
  });
});
