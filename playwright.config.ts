import { defineConfig } from "@playwright/test"

export default defineConfig({
  testDir: "./tests/e2e",
  // Each viewport test runs 16 full axe scans and 16 full-page screenshots, and
  // three of them run in parallel. That does not fit Playwright's 30s default on
  // an ordinary workstation - measured at ~3 minutes for one viewport, alone.
  // This raises the clock only; no assertion is relaxed.
  timeout: 300_000,
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    browserName: "chromium",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev:test",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
