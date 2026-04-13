import { test, expect } from "@playwright/test";
import { path } from "./helpers";

test.describe("Sign-in page", () => {
  test("renders email and password fields", async ({ page }) => {
    await page.goto(path("en", "/sign-in"));
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
  });

  test("has a sign-in submit button", async ({ page }) => {
    await page.goto(path("en", "/sign-in"));
    await expect(
      page.getByRole("button", { name: /sign in/i })
    ).toBeVisible();
  });

  test("has a magic link option", async ({ page }) => {
    await page.goto(path("en", "/sign-in"));
    await expect(
      page.getByRole("button", { name: /magic link/i })
    ).toBeVisible();
  });

  test("has a link to sign-up", async ({ page }) => {
    await page.goto(path("en", "/sign-in"));
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("shows error state when ?error is present in the URL", async ({
    page,
  }) => {
    await page.goto(path("en", "/sign-in") + "?error=Invalid+credentials");
    const errorBox = page.locator("p.text-red-700");
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText("Invalid credentials");
  });

  test("shows magic link sent confirmation when ?magic=sent", async ({
    page,
  }) => {
    await page.goto(path("en", "/sign-in") + "?magic=sent");
    await expect(page.locator("p").filter({ hasText: /check your email/i })).toBeVisible();
  });
});

test.describe("Sign-up page", () => {
  test("renders email, password and confirm password fields", async ({
    page,
  }) => {
    await page.goto(path("en", "/sign-up"));
    await expect(page.getByLabel(/email/i)).toBeVisible();
    const passwordFields = page.getByLabel(/password/i);
    await expect(passwordFields.first()).toBeVisible();
  });

  test("has a sign-up submit button", async ({ page }) => {
    await page.goto(path("en", "/sign-up"));
    await expect(
      page.getByRole("button", { name: /sign up/i })
    ).toBeVisible();
  });

  test("has a link to sign-in", async ({ page }) => {
    await page.goto(path("en", "/sign-up"));
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });

  test("shows error when ?error is present", async ({ page }) => {
    await page.goto(path("en", "/sign-up") + "?error=Email+already+in+use");
    const errorBox = page.locator("p.text-red-700");
    await expect(errorBox).toBeVisible();
    await expect(errorBox).toContainText("Email already in use");
  });
});

test.describe("Magic link page", () => {
  test("magic-link page loads", async ({ page }) => {
    await page.goto(path("en", "/magic-link"));
    await expect(page).not.toHaveURL(/\/404/);
    await expect(page.locator("body")).toBeVisible();
  });
});
