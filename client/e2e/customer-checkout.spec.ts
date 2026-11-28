import { test, expect, signIn, qa } from "./fixtures";

test("customer places and reloads a two-restaurant checkout, then tracks one order", async ({ page }) => {
  await signIn(page, qa.customerEmail);

  await page.goto("/restaurants");
  await page.locator(".sb-restaurant-card").filter({ hasText: "Salford & Co" }).getByRole("link", { name: "View menu" }).click();
  await page.locator(".sb-meal-card").filter({ hasText: "Margherita Pizza" }).getByRole("button", { name: "Add to cart" }).click();
  await page.goto("/restaurants");
  await page.locator(".sb-restaurant-card").filter({ hasText: "Al Forno" }).getByRole("link", { name: "View menu" }).click();
  await page.locator(".sb-meal-card").filter({ hasText: "Wood-fired Margherita" }).getByRole("button", { name: "Add to cart" }).click();

  await page.goto("/cart");
  await expect(page.getByText("$33.50")).toBeVisible();
  await expect(page.getByText("$5.50")).toBeVisible();
  await page.getByRole("link", { name: /Continue to checkout/i }).click();
  await page.getByLabel("Delivery address").fill("44 Willow Lane, Apartment 2");
  await page.getByLabel("Delivery area").selectOption({ label: "Willow Quarter" });
  await page.getByLabel(/Delivery instructions/).fill("Ring the bell once");
  await expect(page.getByText("$33.50")).toBeVisible();
  await page.getByRole("button", { name: "Place order" }).click();

  await expect(page.getByRole("heading", { name: "Order placed" })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Willow Quarter")).toBeVisible();
  await expect(page.getByText("$33.50")).toBeVisible();
  const receiptGroups = page.locator(".sb-receipt-group");
  await expect(receiptGroups).toHaveCount(2);
  const salfordReceipt = receiptGroups.filter({ hasText: "Salford & Co" });
  const fornoReceipt = receiptGroups.filter({ hasText: "Al Forno" });
  const salfordPath = await salfordReceipt.getByRole("link", { name: "View order status →" }).getAttribute("href");
  const fornoPath = await fornoReceipt.getByRole("link", { name: "View order status →" }).getAttribute("href");
  await page.reload();
  await expect(page.getByRole("heading", { name: "Order placed" })).toBeVisible();
  await expect(page.getByText("$33.50")).toBeVisible();
  await page.goto(salfordPath!);
  await expect(page.getByRole("heading", { name: "Order Details" })).toBeVisible();
  const orderId = new URL(salfordPath!, "http://local").pathname.split("/").pop()!;
  const siblingOrderId = new URL(fornoPath!, "http://local").pathname.split("/").pop()!;

  await page.getByRole("button", { name: "Logout" }).click();
  await signIn(page, qa.adminEmail);
  await page.goto("/admin");
  await page.getByRole("tab", { name: "Orders" }).click();
  const row = page.locator(".admin-order-row").filter({ hasText: orderId });
  await expect(row).toBeVisible();
  await row.getByRole("button", { name: "Advance to CONFIRMED" }).click();
  await expect(row.getByText("CONFIRMED")).toBeVisible();
  await row.getByRole("button", { name: "Advance to PREPARING" }).click();
  await expect(row.getByText("PREPARING")).toBeVisible();
  const siblingRow = page.locator(".admin-order-row").filter({ hasText: siblingOrderId });
  await expect(siblingRow).toContainText("Al Forno");
  await expect(siblingRow.getByText("PENDING", { exact: true }).first()).toBeVisible();
});
