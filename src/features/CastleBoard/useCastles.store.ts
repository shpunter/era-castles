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
        return {
          faction,
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
  };
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
