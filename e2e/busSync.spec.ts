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

test("daily income is published to the rxjs bus (produces + castle mine)", async ({
  page,
}) => {
  await page.goto("/");
  await waitForApp(page);
  await goToDay(page, 1);

  // id11 produces { gold: 250, law: 250, astrology: 250 } and carries a
  // selectable mine worth 500.
  await page.getByTestId(`building-${MINE_BUILDING}`).click();
  await page.getByTestId(`mine-${MINE_BUILDING}-law`).click();

  // bus.up.mine is per-day: income lands on the day each source starts accruing.
  // mine[0] = the primary hive castle's pre-builds (accrue from foundDay 0);
  // id01 produces 500 of each.
  await expect
    .poll(async () => (await getUp(page)).mine[0] ?? [])
    .toEqual(
      expect.arrayContaining([
        { resID: "gold", amount: 500 },
        { resID: "law", amount: 500 },
        { resID: "astrology", amount: 500 },
      ]),
    );

  // mine[1] = id11, built on day 1: produces 250 of each, plus the law mine
  // (500) stacked on top → law = 750.
  await expect
    .poll(async () => (await getUp(page)).mine[1] ?? [])
    .toEqual(
      expect.arrayContaining([
        { resID: "gold", amount: 250 },
        { resID: "law", amount: 750 },
      ]),
    );
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

test("build history is published to the rxjs bus per day", async ({ page }) => {
  await page.goto("/");
  await waitForApp(page);

  // Build different buildings on two days.
  await goToDay(page, 1);
  await page.getByTestId(`building-${COST_BUILDING}`).click(); // id20
  await goToDay(page, 2);
  await page.getByTestId(`building-${MINE_BUILDING}`).click(); // id11

  // sendBack mirrors built building IDs to bus.up.history, indexed by day.
  await expect.poll(async () => (await getUp(page)).history[1] ?? []).toEqual([
    COST_BUILDING,
  ]);
  await expect.poll(async () => (await getUp(page)).history[2] ?? []).toEqual([
    MINE_BUILDING,
  ]);
});
