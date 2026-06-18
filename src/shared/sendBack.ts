import { useCastlesStore } from "#/features/CastleBoard/useCastles.store";
import { getCastleConfig } from "#/features/CastleBoard/useFetchCastle";
import { patchUp, state$ } from "#/shared/castlesBus";
import type { Faction } from "#/shared/castlesBus";

// Call once at app startup. Returns a cleanup handle (unused for the app
// lifetime, but handy for tests/HMR).
export const initSendBack = () => {
  // Seed the primary castle from the bus's current faction immediately. Without
  // this, CastleBoard.setInit (which normally does the seeding) never runs on
  // non-castles pages, so initSendBack would publish empty castles state.
  const seedFromFaction = (faction: Faction) => {
    const config = getCastleConfig(faction);
    useCastlesStore
      .getState()
      .setInit(faction, config.castle, config.preBuilds);
  };

  seedFromFaction(state$.getValue().down.faction);

  const publish = (state = useCastlesStore.getState()) => {
    // Per timeline day: building costs (negated) and income by the day each
    // source *starts* accruing. Pre-build income starts from foundDay; a built
    // building's produces and castle-mine output start from the day it was
    // built. buildTimeline adds mine[day] to incomePerDay on that day → pays
    // out from the NEXT day, matching the original per-building timing.
    const spentByDay: Map<string, number>[] = [];
    const builtByDay: string[][] = [];
    const mineByDay: Map<string, number>[] = [];

    const addToMine = (day: number, resID: string, amount: number) => {
      if (!mineByDay[day]) mineByDay[day] = new Map();
      mineByDay[day].set(resID, (mineByDay[day].get(resID) ?? 0) + amount);
    };

    for (const [uuid, castle] of Object.entries(state.castles)) {
      if (!castle) continue;

      // Pre-builds are free and already live on the castle's found day.
      for (const buildingID of castle.preBuilds) {
        for (const [resID, amount] of Object.entries(
          castle.castle[buildingID]?.produces ?? {},
        )) {
          addToMine(castle.foundDay, resID, amount);
        }
      }

      const built = state.history[uuid]?.built ?? [];

      built.forEach((buildingID, day) => {
        if (!buildingID) return;

        const building = castle.castle[buildingID];

        if (!builtByDay[day]) builtByDay[day] = [];
        builtByDay[day].push(buildingID);

        // Building produces: income starts from the day it was built.
        for (const [resID, amount] of Object.entries(
          building?.produces ?? {},
        )) {
          addToMine(day, resID, amount);
        }

        // Castle mine (player-chosen output of a dwelling): same timing.
        const castleMine =
          state.castleMines?.[uuid]?.[buildingID as "id11" | "id21"];
        if (castleMine) {
          addToMine(day, castleMine.resource, castleMine.amount);
        }

        // Building cost is paid on the day it's built (negated).
        const cost = building?.cost ?? {};
        if (!spentByDay[day]) spentByDay[day] = new Map();
        for (const [resID, amount] of Object.entries(cost)) {
          spentByDay[day].set(
            resID,
            (spentByDay[day].get(resID) ?? 0) - amount,
          );
        }
      });
    }

    const mine = Array.from({ length: mineByDay.length }, (_, day) => {
      const dayMap = mineByDay[day];
      return dayMap
        ? Array.from(dayMap, ([resID, amount]) => ({ resID, amount }))
        : [];
    });

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

    return patchUp({ mine, resource, history });
  };

  publish();

  const storeUnsub = useCastlesStore.subscribe((state, prev) => {
    if (
      state.castles !== prev.castles ||
      state.castleMines !== prev.castleMines ||
      state.history !== prev.history
    ) {
      publish(state);
    }
  });

  // Re-seed whenever the host switches faction (client-side nav while on a
  // non-castles tab). Comparing by value avoids re-seeding on `up` updates.
  let trackedFaction = state$.getValue().down.faction;
  const busUnsub = state$.subscribe((busState) => {
    const newFaction = busState.down.faction;
    if (newFaction !== trackedFaction) {
      trackedFaction = newFaction;
      seedFromFaction(newFaction);
    }
  });

  return () => {
    storeUnsub();
    busUnsub.unsubscribe();
  };
};
