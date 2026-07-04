import { expect, type Page } from "@playwright/test";

export type Up = {
  resource: { resID: string; amount: number }[][];
  mine: { resID: string; amount: number }[][];
  history: string[][];
};

// Wait for the board to mount and the globalThis-pinned bus to exist.
export async function waitForApp(page: Page) {
  await page.getByTestId("castle-grid").waitFor();
  await page.waitForFunction(() => "__castlesState$" in window);
}

// The standalone remote has no host to push the timeline day, so drive the
// shared bus directly: set `down.historyIDX` on the BehaviorSubject (same shape
// patchDown produces). CastleBoard reads it → setDay. We then wait for the grid
// to reflect the new day so clicks register on the intended day.
export async function goToDay(page: Page, day: number) {
  await page.evaluate((d) => {
    const bus = (
      window as unknown as {
        __castlesState$: {
          getValue: () => { down: Record<string, unknown> };
          next: (v: unknown) => void;
        };
      }
    ).__castlesState$;
    const prev = bus.getValue();
    bus.next({ ...prev, down: { ...prev.down, historyIDX: d } });
  }, day);

  await expect(page.getByTestId("castle-grid")).toHaveAttribute(
    "data-day",
    String(day),
  );
}

// Read the primary castle's persisted pre-builds straight from IndexedDB (where
// createIdbStore writes under the "eraplanner" DB → "state" store → "castles"
// key). Lets a test wait for the async persist write to actually commit before
// reloading, instead of racing it.
export async function getPersistedPrebuilds(page: Page): Promise<string[]> {
  return page.evaluate(async () => {
    const db: IDBDatabase = await new Promise((resolve, reject) => {
      const req = indexedDB.open("eraplanner", 1);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
    const value = await new Promise<{
      state?: {
        castles?: Record<string, { preBuilds?: string[] } | undefined>;
      };
    } | null>((resolve, reject) => {
      const req = db
        .transaction("state", "readonly")
        .objectStore("state")
        .get("castles");
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
    // "init-uuid" is the store's PRIMARY_UUID (the host-seeded primary castle).
    return value?.state?.castles?.["init-uuid"]?.preBuilds ?? [];
  });
}

// Read the `up` slice the remote publishes back to the host over the bus.
export async function getUp(page: Page): Promise<Up> {
  return page.evaluate(() => {
    const bus = (
      window as unknown as {
        __castlesState$: { getValue: () => { up: unknown } };
      }
    ).__castlesState$;
    return bus.getValue().up as Up;
  });
}
