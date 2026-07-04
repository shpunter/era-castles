import { expect, test } from "@playwright/test";
import { getPersistedPrebuilds, getUp, goToDay, waitForApp } from "./helpers";

// The Apiary's Heart dwelling line on the hive castle:
//   id01 (pre-build)  produces { gold: 500, law: 500, astrology: 500 }
//   id11  prev [id01] produces { gold: 250, law: 250, astrology: 250 }, mine 500
//   id21  prev [id11] produces { gold: 250, law: 250, astrology: 250 }, mine 1000
//   id22  prev [id11] (Bank) — a second child of id11, used for trace removal
//
// id01 is a pre-build, so id11 is buildable straight away; id21/id22 need id11.
// The castle mine on id11/id21 can be poured into gold, law or astrology.
const RES = ["gold", "law", "astrology"] as const;

type Page = import("@playwright/test").Page;

async function enableDay0(page: Page) {
  const toggle = page.getByTestId("day0-toggle");
  await expect(toggle).toBeVisible();
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "true");
}

async function disableDay0(page: Page) {
  const toggle = page.getByTestId("day0-toggle");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-pressed", "false");
}

// Add a new castle of the given faction via the "+" popover. The new castle
// becomes the active tab.
async function addCastle(page: Page, faction: string) {
  await page.getByRole("button", { name: "+" }).click();
  await page.getByTestId(`add-${faction}`).click();
}

test.describe("regular mode", () => {
  test("id11 + id21 build → per-day income (produces + mines) on the bus", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForApp(page);

    // Day 1: build id11, pour its mine (500) into gold.
    await goToDay(page, 1);
    await page.getByTestId("building-id11").click();
    await page.getByTestId("mine-id11-gold").click();

    // Day 2: build id21, pour its mine (1000) into astrology.
    await goToDay(page, 2);
    await page.getByTestId("building-id21").click();
    await page.getByTestId("mine-id21-astrology").click();

    // mine[0] = id01 pre-build produces (accrues from foundDay 0).
    await expect
      .poll(async () => (await getUp(page)).mine[0] ?? [])
      .toEqual(
        expect.arrayContaining([
          { resID: "gold", amount: 500 },
          { resID: "law", amount: 500 },
          { resID: "astrology", amount: 500 },
        ]),
      );

    // mine[1] = id11 built day 1: produces 250 each, + gold mine 500 → gold 750.
    await expect
      .poll(async () => (await getUp(page)).mine[1] ?? [])
      .toEqual(
        expect.arrayContaining([
          { resID: "gold", amount: 750 },
          { resID: "law", amount: 250 },
          { resID: "astrology", amount: 250 },
        ]),
      );

    // mine[2] = id21 built day 2: produces 250 each, + astrology mine 1000.
    await expect
      .poll(async () => (await getUp(page)).mine[2] ?? [])
      .toEqual(
        expect.arrayContaining([
          { resID: "gold", amount: 250 },
          { resID: "law", amount: 250 },
          { resID: "astrology", amount: 1250 },
        ]),
      );
  });

  test("id11 + id21 build → remove the leaf id21 leaves id11 intact", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForApp(page);

    await goToDay(page, 1);
    await page.getByTestId("building-id11").click();
    await goToDay(page, 2);
    await page.getByTestId("building-id21").click();

    // Remove id21 (no children → trace is just itself).
    await page.getByTestId("remove-id21").click();

    // id21 gone, id11 preserved. up.history keeps id11 on day 1 only.
    await expect(page.getByTestId("building-id21")).not.toHaveAttribute(
      "data-built-today",
      "true",
    );
    await expect.poll(async () => (await getUp(page)).history[1] ?? []).toEqual([
      "id11",
    ]);
    await expect
      .poll(async () => (await getUp(page)).history[2] ?? [])
      .toEqual([]);
  });

  test("id11 + children build → removing id11 traces out the whole subtree", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForApp(page);

    // Build id11 and both its children across successive days.
    await goToDay(page, 1);
    await page.getByTestId("building-id11").click();
    await goToDay(page, 2);
    await page.getByTestId("building-id21").click();
    await goToDay(page, 3);
    await page.getByTestId("building-id22").click();

    // Sanity: all three are in the published history.
    await expect.poll(async () => (await getUp(page)).history[1] ?? []).toEqual([
      "id11",
    ]);
    await expect.poll(async () => (await getUp(page)).history[3] ?? []).toEqual([
      "id22",
    ]);

    // Remove id11 → trace "next" wipes id11, id21 and id22.
    await goToDay(page, 1);
    await page.getByTestId("remove-id11").click();

    await expect.poll(async () => (await getUp(page)).history).toEqual([]);
    for (const id of ["id11", "id21", "id22"]) {
      await expect(page.getByTestId(`building-${id}`)).not.toHaveAttribute(
        "data-built",
        "true",
      );
    }
  });
});

test.describe("day-0 mode", () => {
  test("id11 + id21 pre-built → income accrues from foundDay across all res", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForApp(page);
    await enableDay0(page);

    // Add id11 and id21 as pre-builds and pick their mines.
    await page.getByTestId("building-id11").click();
    await page.getByTestId("mine-id11-gold").click();
    await page.getByTestId("building-id21").click();
    await page.getByTestId("mine-id21-astrology").click();

    // Everything is a pre-build now → all income lands on day 0 (foundDay):
    //   id01     gold 500  law 500  astrology 500
    //   id11     gold 250  law 250  astrology 250  + gold mine 500
    //   id21     gold 250  law 250  astrology 250  + astrology mine 1000
    //   totals   gold 1500 law 1000 astrology 2000
    await expect
      .poll(async () => (await getUp(page)).mine[0] ?? [])
      .toEqual(
        expect.arrayContaining([
          { resID: "gold", amount: 1500 },
          { resID: "law", amount: 1000 },
          { resID: "astrology", amount: 2000 },
        ]),
      );

    // Pre-builds don't feed the day-indexed build history.
    await expect(page.getByTestId("building-id11")).toHaveAttribute(
      "data-built",
      "true",
    );
  });

  test("id11 + id21 pre-built → remove the leaf id21 leaves id11 intact", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForApp(page);
    await enableDay0(page);

    await page.getByTestId("building-id11").click();
    await page.getByTestId("building-id21").click();

    // Remove id21 (leaf). Its X is only offered while day-0 mode is on.
    await page.getByTestId("remove-id21").click();

    await expect(page.getByTestId("building-id21")).not.toHaveAttribute(
      "data-built",
      "true",
    );
    await expect(page.getByTestId("building-id11")).toHaveAttribute(
      "data-built",
      "true",
    );

    // id11 pre-build income (produces only) survives across all three res.
    await expect
      .poll(async () => (await getUp(page)).mine[0] ?? [])
      .toEqual(
        expect.arrayContaining([
          { resID: "gold", amount: 750 },
          { resID: "law", amount: 750 },
          { resID: "astrology", amount: 750 },
        ]),
      );
  });

  test("id11 + children pre-built → removing id11 traces out the whole subtree", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForApp(page);
    await enableDay0(page);

    // id11 and both children as pre-builds (order-independent on day 0).
    await page.getByTestId("building-id11").click();
    await page.getByTestId("building-id21").click();
    await page.getByTestId("building-id22").click();

    for (const id of ["id11", "id21", "id22"]) {
      await expect(page.getByTestId(`building-${id}`)).toHaveAttribute(
        "data-built",
        "true",
      );
    }

    // Remove id11 → trace "next" removes id11, id21 and id22 pre-builds.
    await page.getByTestId("remove-id11").click();

    for (const id of ["id11", "id21", "id22"]) {
      await expect(page.getByTestId(`building-${id}`)).not.toHaveAttribute(
        "data-built",
        "true",
      );
    }

    // Only the id01 pre-build income remains — one value per checked resource.
    const mine0 = () =>
      getUp(page).then((up) => up.mine[0] ?? []);
    await expect
      .poll(mine0)
      .toEqual(
        expect.arrayContaining(
          RES.map((resID) => ({ resID, amount: 500 })),
        ),
      );
  });

  test("user-added pre-builds survive a page reload (not overwritten by config)", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForApp(page);
    await enableDay0(page);

    // id11 is NOT a config default pre-build (hive defaults: id10/id01/id05/id06),
    // so adding it here is purely user state that must persist via IndexedDB.
    const id11 = page.getByTestId("building-id11");
    await id11.click();
    await expect(id11).toHaveAttribute("data-built", "true");

    // Wait for the async IndexedDB persist write to actually commit before
    // reloading (the DOM attribute above only reflects in-memory state).
    await expect
      .poll(async () => await getPersistedPrebuilds(page))
      .toContain("id11");

    // Reload: the store rehydrates from IndexedDB, then setInit re-seeds on
    // mount. The fix keeps the user's pre-builds instead of clobbering them with
    // the config list.
    await page.reload();
    await waitForApp(page);

    // The user-added pre-build is still there…
    await expect(page.getByTestId("building-id11")).toHaveAttribute(
      "data-built",
      "true",
    );
    // …and its pre-build income is still published on foundDay (id11 produces
    // 250 of each, on top of the id01 default pre-build's 500 of each).
    await expect
      .poll(async () => (await getUp(page)).mine[0] ?? [])
      .toEqual(
        expect.arrayContaining([
          { resID: "gold", amount: 750 },
          { resID: "law", amount: 750 },
          { resID: "astrology", amount: 750 },
        ]),
      );
  });

  test("pre-builds across multiple castles & factions survive a reload", async ({
    page,
  }) => {
    await page.goto("/");
    await waitForApp(page);

    // Add id11 + id21 as pre-builds to whichever castle is currently active.
    const prebuildActiveCastle = async () => {
      await enableDay0(page);
      await page.getByTestId("building-id11").click();
      await page.getByTestId("building-id21").click();
      await expect(page.getByTestId("building-id21")).toHaveAttribute(
        "data-built",
        "true",
      );
      await disableDay0(page);
    };

    // 1) primary castle (hive, seeded by the host)
    await prebuildActiveCastle();

    // 2) a second castle of the SAME faction (hive) — becomes active on add
    await addCastle(page, "hive");
    await prebuildActiveCastle();

    // 3) a third castle of a DIFFERENT faction (dungeon)
    await addCastle(page, "dungeon");
    await prebuildActiveCastle();

    await expect(page.getByRole("tab")).toHaveCount(3);

    // Snapshot what the remote publishes UP to the host (aggregated across all
    // castles): mine = income, resource = spend, history = day-indexed builds.
    // Pre-builds are free, so `resource`/`history` are empty by design and the
    // patched-up value lives in `mine` — but we assert the whole slice so any
    // spend/history would be covered too.
    const pick = (up: Awaited<ReturnType<typeof getUp>>) => ({
      mine: up.mine,
      resource: up.resource,
      history: up.history,
    });
    const before = pick(await getUp(page));
    // sanity: we're actually verifying real published income, not empty == empty
    expect(before.mine[0]?.length ?? 0).toBeGreaterThan(0);

    await page.reload();
    await waitForApp(page);

    // All three castles kept their pre-builds (id11 + id21 built on each tab).
    await expect(page.getByRole("tab")).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await page.getByRole("tab").nth(i).click();
      for (const id of ["id11", "id21"]) {
        await expect(page.getByTestId(`building-${id}`)).toHaveAttribute(
          "data-built",
          "true",
        );
      }
    }

    // The published up-state is re-patched identically after the reload.
    await expect.poll(async () => pick(await getUp(page))).toEqual(before);
  });
});
