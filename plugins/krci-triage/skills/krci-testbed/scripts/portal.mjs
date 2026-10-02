// Playwright helpers for the KRCI Portal.
// Copy next to node_modules/playwright: ESM resolves `playwright` from this file's directory.
import { chromium } from "playwright";

export const PORTAL_URL = process.env.PORTAL_URL ?? "http://localhost:5173";

// `onMount` and `feature` tours of krci-portal `apps/client/src/modules/tours/config.tsx`.
// The portal checks only that a tour id is present; `schemaVersion` must be 1.
const AUTO_TOURS = ["welcome_tour", "pinned_items_intro", "form_guide_intro", "page_guide_intro"];

function completedTours() {
  const record = { completedAt: Date.now(), version: "playwright", completed: true };
  return JSON.stringify({
    schemaVersion: 1,
    firstVisit: new Date().toISOString(),
    tours: Object.fromEntries(AUTO_TOURS.map((id) => [id, record])),
  });
}

/** Launches headless Chromium with the auto tours completed. Accepts the testbed's self-signed TLS. */
export async function launch({ viewport = { width: 1600, height: 1000 } } = {}) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport, ignoreHTTPSErrors: true });
  await context.addInitScript((value) => localStorage.setItem("portal_tours", value), completedTours());
  return { browser, context, page: await context.newPage() };
}

/** Signs in with a ServiceAccount token. Returns the cluster name of the `/c/<cluster>/` routes. */
export async function login(page, token) {
  await page.goto(PORTAL_URL);
  const saButton = page.getByRole("button", { name: "Use Service Account Token" });
  const moreOptions = page.getByRole("button", { name: "More options" });
  // With OIDC enabled the ServiceAccount option sits behind "More options".
  await saButton.or(moreOptions).first().waitFor();
  if (!(await saButton.isVisible())) await moreOptions.click();
  await saButton.click();
  await page.locator("#sa-token").fill(token);
  await page.locator("form").getByRole("button", { name: "Sign In" }).click();
  const clusterLink = page.locator('a[href*="/c/"]').first();
  await clusterLink.waitFor({ timeout: 30_000 });
  return (await clusterLink.getAttribute("href")).match(/\/c\/([^/]+)/)[1];
}
