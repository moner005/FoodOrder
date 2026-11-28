import { test, expect, signIn, qa } from "./fixtures";

test("assigned owner can manage its menu and restore availability", async ({ page }) => {
  await signIn(page, qa.ownerEmail);
  await page.goto("/owner");
  await expect(page.getByRole("heading", { name: "Your menu" })).toBeVisible();
  const meal = page.locator(".meal-card").filter({ hasText: "Margherita Pizza" }).first();
  await expect(meal).toBeVisible();
  const toggle = () => meal.getByRole("button", { name: /Mark (sold out|available)/ });
  const initialLabel = (await toggle().innerText()).trim();
  let changed = false;
  try {
    await toggle().click();
    changed = true;
    await expect(toggle()).not.toHaveText(initialLabel);
  } finally {
    if (changed && (await toggle().innerText().catch(() => initialLabel)).trim() !== initialLabel) {
      await toggle().click();
    }
  }
});
