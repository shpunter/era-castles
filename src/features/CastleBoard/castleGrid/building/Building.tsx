import { classnames } from "#/shared/classnames";
import type { Castle, CastleBuilding } from "../../useFetchCastle";
import type { Faction } from "#/shared/castlesBus";
import { useCastlesStore } from "#/features/CastleBoard/useCastles.store";
import { useMarkedStore } from "../useMarked.store";
import { trace } from "../utils";

import css from "./building.module.css";
import BuildingActions from "./buildingActions/BuildingActions";
import BuildingLabel from "./buildingLabel/BuildingLabel";
import { getBuildingStatus, type BuildingIndex } from "./useBuildingStatus";

const Building = ({ building, castle, faction, index }: BuildingProps) => {
  const setMarked = useMarkedStore((state) => state.setMarked);
  const addBuilding = useCastlesStore((state) => state.addBuilding);
  const removeBuildings = useCastlesStore((state) => state.removeBuildings);

  const { isBuiltByCurDay, isBuiltThisDay, isInTheHistory, isAvailable } =
    getBuildingStatus(building, index);

  const isMarked = useMarkedStore((state) => {
    return state.marked.includes(building.id);
  });

  const isMarkedAny = useMarkedStore((state) => {
    return state.marked.length > 0;
  });

  const onMouseEnter = () => {
    const buildingIDs = trace(castle, building.id, "prev");

    setMarked(buildingIDs);
  };

  const onMouseLeave = () => {
    setMarked([]);
  };

  const onClick = () => {
    if (!isAvailable || isBuiltByCurDay) return;

    if (isInTheHistory) {
      removeBuildings(trace(castle, building.id, "next"));
    }

    addBuilding(building.id);
  };

  const classNames = classnames({
    [css.builtInTheFuture]:
      !isBuiltThisDay && !isBuiltByCurDay && isInTheHistory,
    [css.unavailable]: !isAvailable,
    [css.built]: isBuiltByCurDay,
    [css.marked]: isMarked,
    [css.available]: isAvailable,
    [css.builtThisDay]: isBuiltThisDay,
    [css.item]: true,
    [css.notMarked]: isMarkedAny && !isMarked,
    [css.disabled]:
      !isAvailable && !isMarked && !isBuiltThisDay && !isBuiltByCurDay,
  });

  return (
    <div
      className={classNames}
      id={building.id}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <img
        key={building.id}
        src={`/img/factions/buildings/${faction}/${building.id}.webp`}
        alt={building.name}
        className={css.image}
      />
      <BuildingActions
        buildingID={building.id}
        isAvailable={isAvailable && !isBuiltThisDay && !isBuiltByCurDay}
      />
      <BuildingLabel
        name={building.name}
        isMarked={isMarked}
        isBuilt={isBuiltByCurDay || isBuiltThisDay}
        isAvailable={isAvailable}
        isBuiltThisDay={isBuiltThisDay}
      />
    </div>
  );
};

export default Building;

type BuildingProps = {
  building: { uuid: string } & CastleBuilding;
  castle: Castle;
  faction: Faction;
  index: BuildingIndex;
};
