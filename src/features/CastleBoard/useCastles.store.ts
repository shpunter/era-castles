import { create } from "zustand";
import type { Castle, CastleBuilding, PreBuilds } from "./useFetchCastle";
import type { Faction } from "#/shared/castlesBus";

// Stable key for the primary castle pushed down from the host. Seeding always
// targets this UUID so it never clobbers a secondary castle added via the "+".
export const PRIMARY_UUID = "init-uuid";

export const useCastlesStore = create<Store & Action>((set) => {
  return {
    castles: {} as Store["castles"],
    currCastleUUID: PRIMARY_UUID,
    faction: "hive",
    history: {} as Store["history"],
    day: 0,
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
        // Idempotent registration. The castles tab remounts CastleGrid on every
        // visit (it re-runs this with the route loader's stable castleUUID), so
        // re-initializing here would wipe the built history. Only set up a UUID
        // the first time it's seen; afterwards just re-activate it. New castles
        // from the "+" button always carry a fresh UUID, so they still init.
        if (state.castles[castleUUID]) {
          return { ...state, currCastleUUID: castleUUID };
        }

        const historyDisabled = Array.from<boolean>({
          length: state.day,
        }).fill(true);

        return {
          ...state,
          currCastleUUID: castleUUID,
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

    setInit: (faction, castle, preBuilds) => {
      set((state) => {
        return {
          faction,
          // Merge — keep any secondary castles added via the "+". Only the
          // primary slot is (re)seeded from the host's faction.
          castles: {
            ...state.castles,
            [PRIMARY_UUID]: {
              castle,
              preBuilds,
              faction,
              foundDay: 0,
            },
          },
        };
      });
    },

    setDay: (day) => {
      set({ day });
    },

    setActiveTab: (castleUUID) => {
      set((state) => {
        return {
          ...state,
          currCastleUUID: castleUUID,
        };
      });
    },
  };
});

type Store = {
  day: number;
  faction: Faction;
  castles: {
    [uuid: string]:
      | {
          castle: Castle;
          preBuilds: readonly BuildingID[];
          faction: Faction;
          /** day the castle was added (first castle = 0) */
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
  setActiveTab: (castleUUID: string) => void;

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
