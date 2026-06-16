import { useCastlesStore } from "#/features/CastleBoard/useCastles.store";
import { patchUp } from "#/shared/castlesBus";

// Call once at app startup. Returns the unsubscribe handle (unused for the app
// lifetime, but handy for tests/HMR).
export const initSendBack = () => {
  const publish = (state = useCastlesStore.getState()) => {
    // Sum every mine across all castles by resource, then bucket the result at
    // index 0 to match the bus `mine` type ({ resID; amount }[][]).
    const totals = new Map<string, number>();

    for (const castleMines of Object.values(state.castleMines)) {
      for (const entry of Object.values(castleMines)) {
        if (!entry) continue;
        totals.set(
          entry.resource,
          (totals.get(entry.resource) ?? 0) + entry.amount,
        );
      }
    }

    const mine = [Array.from(totals, ([resID, amount]) => ({ resID, amount }))];

    // Spent resources per timeline day: for each castle, the cost of whatever
    // building was built on each day, summed across castles by resource.
    const spentByDay: Map<string, number>[] = [];
    for (const [uuid, castle] of Object.entries(state.castles)) {
      if (!castle) continue;

      const built = state.history[uuid]?.built ?? [];

      built.forEach((buildingID, day) => {
        if (!buildingID) return;

        const cost = castle.castle[buildingID]?.cost ?? {};
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

    const resource = Array.from({ length: spentByDay.length }, (_, day) => {
      const dayTotals = spentByDay[day];

      return dayTotals
        ? Array.from(dayTotals, ([resID, amount]) => ({ resID, amount }))
        : [];
    });

    return patchUp({ mine, resource });
  };

  // Seed the bus with the current snapshot so a late-mounting host gets it.
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
