import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCastlesStore, type BuildingID } from "../useCastles.store";
import type { CastleBuilding } from "../../useFetchCastle";

// Derived read model for the active castle. The store keeps `built` day-indexed
// (built[day] = id), which is right for writes but forces an O(n) scan per read.
// We invert it once into a building-keyed map so every status lookup is O(1).
export type BuildingIndex = {
  /** building id -> day it was built (pre-builds map to -1, "always present") */
  builtDay: Map<BuildingID, number>;
  /** currently selected day */
  day: number;
  /** true if the selected day is free to build on (same for every building) */
  canBuildToday: boolean;
};

// One subscription, one memoized derivation — call once per castle, not per
// building. Selects the raw store slices by reference (stable unless they
// actually change) so the Map is only rebuilt when `built`/`preBuilds` change.
export const useCastleIndex = (): BuildingIndex => {
  const { built, preBuilds, disabled, day } = useCastlesStore(
    useShallow((state) => {
      const uuid = state.currCastleUUID;
      return {
        built: state.history[uuid]?.built,
        preBuilds: state.castles[uuid]?.preBuilds,
        disabled: state.history[uuid]?.disabled,
        day: state.day,
      };
    }),
  );

  return useMemo(() => {
    const builtDay = new Map<BuildingID, number>();
    preBuilds?.forEach((id) => {
      builtDay.set(id, -1);
    });
    built?.forEach((id, d) => {
      if (id) builtDay.set(id, d);
    });

    const canBuildToday = !disabled?.[day] && !built?.[day];

    return { builtDay, day, canBuildToday };
  }, [built, preBuilds, disabled, day]);
};

// Pure O(1) per-building status derived from the shared index. No store
// subscription, no array scans, no allocations.
export const getBuildingStatus = (
  building: CastleBuilding,
  { builtDay, day, canBuildToday }: BuildingIndex,
): BuildingStatus => {
  const d = builtDay.get(building.id);

  const isBuiltByCurDay = d !== undefined && d <= day;
  const isBuiltThisDay = d === day;
  const isInTheHistory = d !== undefined && d >= day;

  const isAvailable =
    canBuildToday &&
    (building.prev ?? []).every((prevID) => {
      const prevDay = builtDay.get(prevID);
      return prevDay !== undefined && prevDay <= day;
    });

  return { isBuiltByCurDay, isBuiltThisDay, isInTheHistory, isAvailable };
};

export type BuildingStatus = {
  /** built on or before the selected day (incl. pre-builds) */
  isBuiltByCurDay: boolean;
  /** built exactly on the selected day */
  isBuiltThisDay: boolean;
  /** built on the selected day or any later day */
  isInTheHistory: boolean;
  /** can be constructed on the selected day */
  isAvailable: boolean;
};
