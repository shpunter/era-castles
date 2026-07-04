import { createIdbStore } from "#/shared/createIdbStore";
import { patchUp } from "#/shared/castlesBus";
import type { Castle, CastleBuilding, PreBuilds } from "./useFetchCastle";
import type { Faction } from "#/shared/castlesBus";

// Stable key for the primary castle pushed down from the host. Seeding always
// targets this UUID so it never clobbers a secondary castle added via the "+".
export const PRIMARY_UUID = "init-uuid";

export const useCastlesStore = createIdbStore<Store & Action>(
  "castles",
  (set) => ({
    castles: {} as Store["castles"],
    currCastleUUID: PRIMARY_UUID,
    faction: "hive",
    history: {} as Store["history"],
    day: 0,
    isDay0: false,
    castleMines: {},

    addBuilding: (buildingID) => {
      set((state) => {
        const { day, currCastleUUID } = state;

        const newHistoryBuilt = structuredClone(
          state.history?.[currCastleUUID]?.built ?? [],
        );

        newHistoryBuilt[day] = buildingID;

        return {
          ...state,
          history: {
            ...state.history,
            [currCastleUUID]: {
              built: newHistoryBuilt,
              disabled: state.history[currCastleUUID]?.disabled ?? [],
            },
          },
        };
      });
    },

    addCastleMines: (buildingID, resource, amount) => {
      set((state) => {
        return {
          ...state,
          castleMines: {
            ...state.castleMines,
            [state.currCastleUUID]: {
              ...state.castleMines[state.currCastleUUID],
              [buildingID]: { resource, amount },
            },
          },
        };
      });
    },

    removeBuildings: (buildingIDs) => {
      set((state) => {
        const { currCastleUUID } = state;

        const buildings = structuredClone(
          state.history?.[currCastleUUID]?.built ?? [],
        );

        buildings.forEach((id, idx) => {
          if (id && buildingIDs.includes(id)) {
            buildings[idx] = undefined;
          }
        });

        return {
          ...state,
          history: {
            ...state.history,
            [currCastleUUID]: {
              built: buildings,
              disabled: state.history[currCastleUUID]?.disabled ?? [],
            },
          },
        };
      });
    },

    addCastle: (castleUUID, faction, castle, preBuilds) => {
      set((state) => {
        if (state.castles[castleUUID]) {
          return { ...state, currCastleUUID: castleUUID };
        }

        const historyDisabled = Array.from<boolean>({
          length: state.day,
        }).fill(true);

        return {
          ...state,
          currCastleUUID: castleUUID,
          isDay0: false,
          castles: {
            ...state.castles,
            [castleUUID]: {
              castle,
              preBuilds,
              faction,
              foundDay: state.day,
            },
          },
          history: {
            ...state.history,
            [castleUUID]: {
              built: [],
              disabled: historyDisabled,
            },
          },
        };
      });
    },

    addPreBuilds: (buildingID) => {
      set((state) => {
        const { currCastleUUID } = state;
        const castle = state.castles[currCastleUUID];
        if (!castle || castle.preBuilds.includes(buildingID)) return state;

        return {
          ...state,
          castles: {
            ...state.castles,
            [currCastleUUID]: {
              ...castle,
              preBuilds: [...castle.preBuilds, buildingID],
            },
          },
        };
      });
    },

    removePreBuilds: (buildingIDs) => {
      set((state) => {
        const { currCastleUUID } = state;
        const castle = state.castles[currCastleUUID];
        if (!castle) return state;

        const remove = new Set(buildingIDs);
        return {
          ...state,
          castles: {
            ...state.castles,
            [currCastleUUID]: {
              ...castle,
              preBuilds: castle.preBuilds.filter((id) => !remove.has(id)),
            },
          },
        };
      });
    },

    setIsDay0: (isDay0) => {
      set({ isDay0 });
    },

    setInit: (faction, castle, preBuilds) => {
      set((state) => {
        // Preserve the player's prebuilds across reload/remount: only seed the
        // config defaults when the primary castle is new or the faction actually
        // changed. Otherwise `setInit` (which runs on every mount) would clobber
        // rehydrated user prebuilds with the static config list.
        const existing = state.castles[PRIMARY_UUID];
        const keep = existing?.faction === faction;

        return {
          faction,
          castles: {
            ...state.castles,
            [PRIMARY_UUID]: {
              castle,
              preBuilds: keep ? existing.preBuilds : preBuilds,
              faction,
              foundDay: keep ? existing.foundDay : 0,
            },
          },
        };
      });
    },

    setDay: (day) => {
      set({ day, isDay0: false });
    },

    setActiveTab: (castleUUID) => {
      set((state) => {
        return {
          ...state,
          currCastleUUID: castleUUID,
          isDay0: false,
        };
      });
    },

    reset: () => {
      set({
        castles: {},
        history: {},
        castleMines: {},
        currCastleUUID: PRIMARY_UUID,
        isDay0: false,
      });
    },
  }),
  {
    // Persist only user-authored data. `faction` and `day` are re-seeded from
    // the host on every mount (initSendBack / CastleBoard), so — like law's
    // lower/higher — they're intentionally left out to avoid restoring stale
    // host state. Castle configs hold no functions, so they clone into IDB fine.
    partialize: (state) => ({
      castles: state.castles,
      history: state.history,
      castleMines: state.castleMines,
      currCastleUUID: state.currCastleUUID,
    }),
  },
);

useCastlesStore.persist.onFinishHydration(() => {
  // Signal the host that persisted state has loaded. The sendBack subscription
  // republishes the actual castle/history/mine data on the same hydration.
  patchUp({ hydrated: true });
});

type Store = {
  day: number;
  isDay0: boolean;
  faction: Faction;
  castles: {
    [uuid: string]:
      | {
          castle: Castle;
          preBuilds: readonly BuildingID[];
          faction: Faction;
          foundDay: number;
        }
      | undefined;
  };
  currCastleUUID: string;
  history: {
    [castleUUID: string]:
      | { built: (BuildingID | undefined)[]; disabled: boolean[] }
      | undefined;
  };
  castleMines: {
    [castleUUID: string]: {
      [buildingID in "id11" | "id21"]?: {
        resource: "gold" | "law" | "astrology";
        amount: number;
      };
    };
  };
};

type Action = {
  removeBuildings: (buildingIDs: BuildingID[]) => void;
  setInit: (faction: Faction, castle: Castle, preBuilds: PreBuilds) => void;
  setDay: (day: number) => void;
  setIsDay0: (isDay0: boolean) => void;
  setActiveTab: (castleUUID: string) => void;
  reset: () => void;
  addPreBuilds: (buildingID: BuildingID) => void;
  removePreBuilds: (buildingIDs: BuildingID[]) => void;

  addBuilding: (buildingID: BuildingID) => void;
  addCastle: (
    castleUUID: string,
    faction: Faction,
    castle: Castle,
    preBuilds: readonly BuildingID[],
  ) => void;
  addCastleMines: (
    buildingID: BuildingID,
    resource: "gold" | "law" | "astrology",
    amount: number,
  ) => void;
};

export type BuildingID = CastleBuilding["id"];
