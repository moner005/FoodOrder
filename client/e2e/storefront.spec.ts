import { test, expect } from "./fixtures";

test("home and restaurant discovery work, including search recovery", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Good Food/i })).toBeVisible();
  await page.getByRole("link", { name: /Explore Restaurants/i }).click();
  await expect(page.getByRole("heading", { name: "Restaurants", exact: true })).toBeVisible();
  await expect(page.locator(".sb-restaurant-card").filter({ hasText: "Salford & Co" })).toBeVisible();
  const search = page.getByPlaceholder("Name, cuisine or area");
  await search.fill("no-neighborhood-match");
  await expect(page.getByText("No matches found")).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).click();
  await expect(page.locator(".sb-restaurant-card").filter({ hasText: "Salford & Co" })).toBeVisible();
});

test("closed and sold-out catalog items cannot be ordered", async ({ page }) => {
  await page.goto("/restaurants");
  const closedVenue = page.locator(".sb-restaurant-card").filter({ hasText: "Golden Fork" });
  await closedVenue.getByRole("link", { name: "View menu" }).click();
  await expect(page.getByText("This restaurant is closed right now.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Unavailable" }).first()).toBeDisabled();

  await page.goto("/restaurants/al-forno/meals");
  const soldOut = page.locator(".sb-meal-card").filter({ hasText: "Roasted Mushroom Pizza" });
  await expect(soldOut).toBeVisible();
  await expect(soldOut.getByRole("button", { name: "Unavailable" })).toBeDisabled();
  await page.getByPlaceholder("Dish name").fill("no-such-dish");
  await expect(page.getByText("No meals match")).toBeVisible();
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".sb-meal-card").filter({ hasText: "Roasted Mushroom Pizza" })).toBeVisible();
});

test("narrow layout has no horizontal page overflow", async ({ page }) => {
  await page.goto("/restaurants");
  await expect(page.getByRole("heading", { name: "Restaurants", exact: true })).toBeVisible();
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
});
