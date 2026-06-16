import { test, expect } from "@playwright/test";
import { goToDay, waitForApp } from "./helpers";

// Two buildings that are NOT pre-builds but whose single prerequisite IS a
// pre-build (initCastlePreBuilds.hive = id10, id01, id05, id06). So both are
// "available" (buildable) on any free day, and independent of each other.
const A = "id20"; // Marketplace — prereq id10 (pre-built)
const B = "id11"; // Apiary's Heart II — prereq id01 (pre-built)

test("built history persists across day navigation (nothing removed)", async ({
  page,
}) => {
  await page.goto("/");
  await waitForApp(page);

  // Day 1: build A.
  await goToDay(page, 1);
  const a = page.getByTestId(`building-${A}`);
  await expect(a).toHaveAttribute("data-available", "true");
  await a.click();
  await expect(a).toHaveAttribute("data-built-today", "true");

  // Day 2: build B.
  await goToDay(page, 2);
  const b = page.getByTestId(`building-${B}`);
  await expect(b).toHaveAttribute("data-available", "true");
  await b.click();
  await expect(b).toHaveAttribute("data-built-today", "true");

  // Back to day 1: A is still built (today's slot), and B — built on a later day
  // — is preserved as a future build rather than removed.
  await goToDay(page, 1);
  await expect(page.getByTestId(`building-${A}`)).toHaveAttribute(
    "data-built-today",
    "true",
  );
  await expect(page.getByTestId(`building-${B}`)).toHaveAttribute(
    "data-future",
    "true",
  );
});
