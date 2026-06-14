import { useHistoryStore } from "#/features/history/history.store";
import type { BuildingID, CastleID } from "#/routes/faction/$id";
import { trace } from "../utils";
import css from "./buildingActions.module.css";
import CastleMine from "./castleMine/CastleMine";

const BuildingActions = ({
  castleID,
  buildingID,
  isAvailable,
}: BuildingActionsProps) => {
  const removeBuildings = useHistoryStore((state) => state.removeBuildings);

  const canBeRemoved = useHistoryStore((state) => {
    const currBuiltHistory = state.history?.[state.currCastleUUID]?.built ?? [];

    return currBuiltHistory.includes(buildingID);
  });

  const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    removeBuildings(trace(castleID, buildingID, "next"));
  };

  return (
    <>
      {canBeRemoved && (
        <button type="button" className={css.remove} onClick={onRemove}>
          X
        </button>
      )}
      {isAvailable && (
        <div className={css.icon}>
          <img className={css.hammer} src="/svg/hammer.svg" alt="built" />
        </div>
      )}

      {buildingID === "id11" && (
        <CastleMine value={500} buildingID={buildingID} />
      )}
      {buildingID === "id21" && (
        <CastleMine value={1000} buildingID={buildingID} />
      )}
    </>
  );
};

export default BuildingActions;

type BuildingActionsProps = {
  castleID: CastleID;
  buildingID: BuildingID;
  isAvailable: boolean;
};
