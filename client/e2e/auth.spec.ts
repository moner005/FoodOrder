import { test, expect, signIn, qa } from "./fixtures";

test("guest checkout guard sends visitor to login", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Log in to SwiftBite" })).toBeVisible();
});

test("customer can sign in but cannot enter platform administration", async ({ page }) => {
  await signIn(page, qa.customerEmail);
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/$/);
});

test("administrator reaches the management sections", async ({ page }) => {
  await signIn(page, qa.adminEmail);
  await page.getByRole("link", { name: "Admin" }).click();
  await expect(page.getByRole("heading", { name: "Administration" })).toBeVisible();
  await expect(page.getByRole("tab", { name: "Accounts" })).toBeVisible();
});
