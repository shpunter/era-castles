import { create } from "zustand";
import type { Castle, CastleBuilding, PreBuilds } from "../useFetchCastle";
import type { Faction } from "#/shared/castlesBus";

export const useCastlesStore = create<Store & Action>((set) => {
  return {
    castles: {} as Store["castles"],
    currCastleUUID: "init-uuid",
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

    addCastle: (castleUUID, castleID, castle, preBuilds) => {
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
              castleID,
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

    setInit: (faction, day, castle, preBuilds) => {
      set((state) => {
        return {
          faction,
          day,
          castles: {
            [state.currCastleUUID]: {
              castle,
              preBuilds,
              castleID: faction,
              foundDay: 0,
            },
          },
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
          castleID: CastleID;
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
  addBuilding: (buildingID: BuildingID) => void;
  removeBuildings: (buildingIDs: BuildingID[]) => void;
  setInit: (faction: Faction, day: number, castle: Castle, preBuilds: PreBuilds) => void;
  addCastle: (
    castleUUID: string,
    castleID: CastleID,
    castle: Castle,
    preBuilds: readonly BuildingID[],
  ) => void;
  addCastleMines: (
    buildingID: BuildingID,
    resource: "gold" | "law" | "astrology",
    amount: number,
  ) => void;
};

export type CastleID =
  | "hive"
  | "schism"
  | "temple"
  | "dungeon"
  | "grove"
  | "necropolis";
export type BuildingID = CastleBuilding["id"];
