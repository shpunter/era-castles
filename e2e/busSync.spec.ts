import { test, expect } from "@playwright/test";
import { getUp, goToDay, waitForApp } from "./helpers";

// id11 (Apiary's Heart II) carries a castle mine (value 500); prereq id01 is a
// pre-build, so it's buildable on day 1.
const MINE_BUILDING = "id11";
// id20 (Marketplace) costs { gold: 500, wood: 5 }; prereq id10 is a pre-build.
const COST_BUILDING = "id20";

test("castle mine can be selected only after its building is built", async ({
  page,
}) => {
  await page.goto("/");
  await waitForApp(page);
  await goToDay(page, 1);

  // Before building it, the mine selector doesn't exist.
  await expect(page.getByTestId(`mine-${MINE_BUILDING}-gold`)).toHaveCount(0);

  // Build it → the mine selector appears and a resource can be selected.
  await page.getByTestId(`building-${MINE_BUILDING}`).click();
  const goldMine = page.getByTestId(`mine-${MINE_BUILDING}-gold`);
  await expect(goldMine).toBeVisible();

  await goldMine.click();
  await expect(goldMine).toHaveAttribute("aria-pressed", "true");
});

test("daily income (castle mine) is published to the rxjs bus", async ({
  page,
}) => {
  await page.goto("/");
  await waitForApp(page);
  await goToDay(page, 1);

  await page.getByTestId(`building-${MINE_BUILDING}`).click();
  await page.getByTestId(`mine-${MINE_BUILDING}-law`).click();

  // sendBack mirrors mine income to bus.up.mine (summed by resource, bucketed
  // at index 0) — positive, since it's income.
  await expect
    .poll(async () => (await getUp(page)).mine[0] ?? [])
    .toContainEqual({ resID: "law", amount: 500 });
});

test("building cost is published to the rxjs bus as negative resources", async ({
  page,
}) => {
  await page.goto("/");
  await waitForApp(page);
  await goToDay(page, 1);

  await page.getByTestId(`building-${COST_BUILDING}`).click();

  // sendBack mirrors per-day spend to bus.up.resource[day], with each cost
  // negated (it's a spend). id20 costs { gold: 500, wood: 5 }.
  await expect
    .poll(async () => (await getUp(page)).resource[1] ?? [])
    .toEqual(
      expect.arrayContaining([
        { resID: "gold", amount: -500 },
        { resID: "wood", amount: -5 },
      ]),
    );
});
