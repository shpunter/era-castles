import { useCastlesStore } from "#/features/CastleBoard/useCastles.store";
import { patchUp } from "#/shared/castlesBus";

// Call once at app startup. Returns the unsubscribe handle (unused for the app
// lifetime, but handy for tests/HMR).
export const initSendBack = () => {
  const publish = (state = useCastlesStore.getState()) => {
    // Daily income, summed across all castles by resource and bucketed at index
    // 0 to match the bus `mine` type ({ resID; amount }[][]). Income is each
    // built building's `produces` (summed as-is) plus the player's selected
    // castle mines on top.
    const income = new Map<string, number>();

    // Per timeline day, across all castles: the cost of whatever was built
    // (negated — it's a spend) and the building IDs built that day.
    const spentByDay: Map<string, number>[] = [];
    const builtByDay: string[][] = [];
    for (const [uuid, castle] of Object.entries(state.castles)) {
      if (!castle) continue;

      // Pre-builds are already built on the castle's found day and produce
      // income too — they live in `preBuilds`, not in the day-by-day `built`
      // history, so count their production here.
      for (const buildingID of castle.preBuilds) {
        for (const [resID, amount] of Object.entries(
          castle.castle[buildingID]?.produces ?? {},
        )) {
          income.set(resID, (income.get(resID) ?? 0) + amount);
        }
      }

      const built = state.history[uuid]?.built ?? [];

      built.forEach((buildingID, day) => {
        if (!buildingID) return;

        const building = castle.castle[buildingID];

        let dayBuilt = builtByDay[day];

        if (!dayBuilt) {
          dayBuilt = [];
          builtByDay[day] = dayBuilt;
        }

        dayBuilt.push(buildingID);

        // Base daily income from the building's production.
        for (const [resID, amount] of Object.entries(
          building?.produces ?? {},
        )) {
          income.set(resID, (income.get(resID) ?? 0) + amount);
        }

        const cost = building?.cost ?? {};
        let dayTotals = spentByDay[day];

        if (!dayTotals) {
          dayTotals = new Map<string, number>();
          spentByDay[day] = dayTotals;
        }

        for (const [resID, amount] of Object.entries(cost)) {
          dayTotals.set(resID, (dayTotals.get(resID) ?? 0) - amount);
        }
      });
    }

    // Castle mines (player-selected) stack on top of the base produces income.
    for (const castleMines of Object.values(state.castleMines)) {
      for (const entry of Object.values(castleMines)) {
        if (!entry) continue;
        income.set(
          entry.resource,
          (income.get(entry.resource) ?? 0) + entry.amount,
        );
      }
    }

    const mine = [Array.from(income, ([resID, amount]) => ({ resID, amount }))];

    const resource = Array.from({ length: spentByDay.length }, (_, day) => {
      const dayTotals = spentByDay[day];

      return dayTotals
        ? Array.from(dayTotals, ([resID, amount]) => ({ resID, amount }))
        : [];
    });

    const history = Array.from(
      { length: builtByDay.length },
      (_, day) => builtByDay[day] ?? [],
    );
    console.log(mine, resource);
    return patchUp({ mine, resource, history });
  };

  publish();

  return useCastlesStore.subscribe((state, prev) => {
    if (
      state.castleMines !== prev.castleMines ||
      state.history !== prev.history
    ) {
      publish(state);
    }
  });
};
