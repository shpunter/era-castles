import { create } from "zustand";
import type { BuildingID } from "./useCastles.store";

export const useMarkedStore = create<Store & Action>((set) => {
  return {
    marked: [],

    setMarked: (buildings) => {
      set(() => {
        return {
          marked: buildings,
        };
      });
    },
  };
});

type Store = {
  marked: BuildingID[];
};

type Action = {
  setMarked: (buildings: BuildingID[]) => void;
};
