import { useMemo } from "react";
import { useShallow } from "zustand/react/shallow";
import type { CastleBuilding } from "#/features/CastleBoard/useFetchCastle";
import {
  useCastlesStore,
  type BuildingID,
} from "#/features/CastleBoard/useCastles.store";

// Derived read model for the active castle. The store keeps `built` day-indexed
// (built[day] = id), which is right for writes but forces an O(n) scan per read.
// We invert it once into a building-keyed map so every status lookup is O(1).
export type BuildingIndex = {
  builtDay: Map<BuildingID, number>;
  day: number;
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
  isBuiltByCurDay: boolean;
  isBuiltThisDay: boolean;
  isInTheHistory: boolean;
  isAvailable: boolean;
};
