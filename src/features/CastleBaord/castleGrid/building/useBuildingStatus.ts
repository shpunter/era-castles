import { useShallow } from "zustand/react/shallow";
import { useCastlesStore, type BuildingID } from "../useCastles.store";

// Derives every build-state flag for a single building from one store
// subscription, so the slice of "what's been built so far" is computed once.
export const useBuildingStatus = (buildingID: BuildingID): BuildingStatus => {
  return useCastlesStore(
    useShallow((state) => {

      console.log(state);
      
      const { history, currCastleUUID, castles, day } = state;
      const built = history?.[currCastleUUID]?.built ?? [];
      const preBuilds = castles?.[currCastleUUID]?.preBuilds ?? [];
      const builtUpToToday = [...preBuilds, ...built.slice(0, day + 1)];

      const isBuiltByCurDay = builtUpToToday.includes(buildingID);
      const isBuiltThisDay = built[day] === buildingID;
      const isInTheHistory = built.slice(day).includes(buildingID);

      const prev = castles[currCastleUUID]?.castle?.[buildingID]?.prev ?? [];
      const isAvailable =
        !history?.[currCastleUUID]?.disabled?.[day] &&
        !built[day] &&
        prev.every((prevBuildingID) => builtUpToToday.includes(prevBuildingID));

      return { isBuiltByCurDay, isBuiltThisDay, isInTheHistory, isAvailable };
    }),
  );
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