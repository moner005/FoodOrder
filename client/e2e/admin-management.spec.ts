import { test, expect, signIn, qa } from "./fixtures";

test("administrator creates, renames, suspends and reactivates a customer account", async ({ page }) => {
  await signIn(page, qa.adminEmail);
  await page.goto("/admin");
  await page.getByRole("tab", { name: "Accounts" }).click();
  const id = crypto.randomUUID().replaceAll("-", "").slice(0, 10);
  const email = `e2e-${id}@example.test`;
  const initialName = `E2E Customer ${id}`;
  await page.getByRole("textbox", { name: "Name", exact: true }).fill(initialName);
  await page.getByRole("textbox", { name: "Email", exact: true }).fill(email);
  await page.getByLabel("Account role").selectOption("CUSTOMER");
  await page.getByLabel("Initial password").fill(`Local-${id}-Qa!`);
  await page.getByRole("button", { name: "Create account" }).click();
  const account = page.locator(".admin-account-row").filter({ hasText: email });
  await expect(account).toBeVisible();
  await account.getByLabel("Display name").fill(`${initialName} Renamed`);
  await account.getByLabel("Suspend this account").check();
  await account.getByRole("button", { name: "Save account" }).click();
  await expect(account.getByText("Suspended")).toBeVisible();
  await account.getByLabel("Suspend this account").uncheck();
  await account.getByRole("button", { name: "Save account" }).click();
  await expect(account.getByText("Active")).toBeVisible();
});

test("administrator can review venue controls and pending approval without changing fixture state", async ({ page }) => {
  await signIn(page, qa.adminEmail);
  await page.goto("/admin");
  await page.getByRole("tab", { name: "Restaurants" }).click();
  const salford = page.locator(".admin-venue-row").filter({ hasText: "Salford & Co" });
  await expect(salford.getByLabel("Delivery fee ($)")).toHaveValue("2.5");
  await expect(salford.getByLabel("Food minimum ($)")).toHaveValue("12");
  await expect(salford.getByLabel("Served areas")).toHaveValue("Willow Quarter");
  const pending = page.locator(".admin-venue-row").filter({ hasText: "Cedar Kitchen" });
  await expect(pending.getByRole("button", { name: "Approve restaurant" })).toBeVisible();
});
