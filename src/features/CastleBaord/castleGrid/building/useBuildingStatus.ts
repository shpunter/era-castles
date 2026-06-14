import { useShallow } from "zustand/react/shallow";
import type { BuildingID } from "#/routes/faction/$id";
import { useHistoryStore } from "#/features/history/history.store";

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

// Derives every build-state flag for a single building from one store
// subscription, so the slice of "what's been built so far" is computed once.
export const useBuildingStatus = (buildingID: BuildingID): BuildingStatus => {
  return useHistoryStore(
    useShallow((state) => {
      const { history, currCastleUUID, castles, historyIDX } = state;
      const built = history?.[currCastleUUID]?.built ?? [];
      const preBuilds = castles?.[currCastleUUID]?.preBuilds ?? [];
      const builtUpToToday = [...preBuilds, ...built.slice(0, historyIDX + 1)];

      const isBuiltByCurDay = builtUpToToday.includes(buildingID);
      const isBuiltThisDay = built[historyIDX] === buildingID;
      const isInTheHistory = built.slice(historyIDX).includes(buildingID);

      const prev = castles[currCastleUUID]?.buildings?.[buildingID]?.prev ?? [];
      const isAvailable =
        !history?.[currCastleUUID]?.disabled?.[historyIDX] &&
        !built[historyIDX] &&
        prev.every((prevBuildingID) => builtUpToToday.includes(prevBuildingID));

      return { isBuiltByCurDay, isBuiltThisDay, isInTheHistory, isAvailable };
    }),
  );
};
