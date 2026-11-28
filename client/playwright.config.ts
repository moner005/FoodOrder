import { defineConfig, devices } from "@playwright/test";
import { hostname } from "node:os";

const isolated = process.env.SWIFTBITE_E2E_ISOLATED === "1";
const baseURL = process.env.SWIFTBITE_E2E_BASE_URL;
const apiURL = process.env.SWIFTBITE_E2E_API_URL;

function requireLoopback(value: string | undefined, name: string): string {
  if (!value) throw new Error(`${name} must be explicitly configured for isolated E2E runs.`);
  const parsed = new URL(value);
  const host = parsed.hostname.toLowerCase();
  if (!(["127.0.0.1", "localhost", "::1"].includes(host) || host === hostname().toLowerCase())) {
    throw new Error(`${name} must point to this machine's isolated local QA service.`);
  }
  if (["4191", "3302"].includes(parsed.port)) {
    throw new Error(`${name} points at the regular preview. Use the isolated QA ports.`);
  }
  return parsed.toString().replace(/\/$/, "");
}

if (!isolated) throw new Error("Set SWIFTBITE_E2E_ISOLATED=1 only for the isolated QA stack.");
const appURL = requireLoopback(baseURL, "SWIFTBITE_E2E_BASE_URL");
const backendURL = requireLoopback(apiURL, "SWIFTBITE_E2E_API_URL");
if (!process.env.SWIFTBITE_QA_PASSWORD) throw new Error("SWIFTBITE_QA_PASSWORD must be supplied by the isolated QA runner.");

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 45_000,
  expect: { timeout: 8_000 },
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: appURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "narrow-chromium", testMatch: /storefront\.spec\.ts/, use: { ...devices["Pixel 7"] } },
  ],
});

export const isolatedApiURL = backendURL;
