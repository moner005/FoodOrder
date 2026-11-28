import { test as base, expect, type Page } from "@playwright/test";

export const qa = {
  password: process.env.SWIFTBITE_QA_PASSWORD ?? "",
  customerEmail: process.env.SWIFTBITE_QA_CUSTOMER_EMAIL ?? "customer@example.test",
  ownerEmail: process.env.SWIFTBITE_QA_OWNER_EMAIL ?? "owner@example.test",
  adminEmail: process.env.SWIFTBITE_QA_ADMIN_EMAIL ?? "admin@example.test",
};

type Fixtures = { apiOriginGuard: void };

export const test = base.extend<Fixtures>({
  apiOriginGuard: [async ({ page }, use) => {
    const expected = new URL(process.env.SWIFTBITE_E2E_API_URL!).origin;
    const unexpected: string[] = [];
    await page.route("**/api/**", async (route) => {
      const url = route.request().url();
      if (new URL(url).origin !== expected) {
        unexpected.push(url);
        await route.abort();
        return;
      }
      await route.continue();
    });
    await use();
    expect(unexpected, "API requests must stay on the isolated QA service").toEqual([]);
  }, { auto: true }],
});

export async function signIn(page: Page, email: string) {
  await page.goto("/login");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill(qa.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).not.toHaveURL(/\/login$/);
}

export async function signOut(page: Page) {
  await page.getByRole("button", { name: "Logout" }).click();
  await expect(page.getByRole("link", { name: "Login" })).toBeVisible();
}

export { expect };
