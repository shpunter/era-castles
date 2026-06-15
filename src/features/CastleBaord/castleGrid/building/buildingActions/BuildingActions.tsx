import { useCastlesStore, type BuildingID } from "../../useCastles.store";
import { trace } from "../../utils";
import css from "./buildingActions.module.css";
import CastleMine from "./castleMine/CastleMine";

const BuildingActions = ({ buildingID, isAvailable }: BuildingActionsProps) => {
  const removeBuildings = useCastlesStore((state) => state.removeBuildings);
  const castle = useCastlesStore(
    (state) => state.castles[state.currCastleUUID]?.castle,
  );

  const canBeRemoved = useCastlesStore((state) => {
    const currBuiltHistory = state.history?.[state.currCastleUUID]?.built ?? [];

    return currBuiltHistory.includes(buildingID);
  });

  const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!castle) return;

    event.stopPropagation();
    removeBuildings(trace(castle, buildingID, "next"));
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

      {buildingID === "id11" && canBeRemoved && (
        <CastleMine value={500} buildingID={buildingID} />
      )}
      {buildingID === "id21" && canBeRemoved &&(
        <CastleMine value={1000} buildingID={buildingID} />
      )}
    </>
  );
};

export default BuildingActions;

type BuildingActionsProps = {
  buildingID: BuildingID;
  isAvailable: boolean;
};
