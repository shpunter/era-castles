import {
  useCastlesStore,
  type BuildingID,
} from "#/features/CastleBoard/useCastles.store";
import { asset } from "#/shared/asset";
import { trace } from "#/features/CastleBoard/castleGrid/utils";
import css from "./buildingActions.module.css";
import CastleMine from "./castleMine/CastleMine";

const BuildingActions = ({ buildingID, isAvailable }: BuildingActionsProps) => {
  const removeBuildings = useCastlesStore((state) => state.removeBuildings);
  const removePreBuilds = useCastlesStore((state) => state.removePreBuilds);
  const isDay0 = useCastlesStore((state) => state.isDay0);
  const castle = useCastlesStore(
    (state) => state.castles[state.currCastleUUID]?.castle,
  );

  const isBuilt = useCastlesStore((state) =>
    (state.history?.[state.currCastleUUID]?.built ?? []).includes(buildingID),
  );

  // Pre-builds are only removable while day-0 mode is active.
  const isPreBuilt = useCastlesStore((state) =>
    (state.castles[state.currCastleUUID]?.preBuilds ?? []).includes(buildingID),
  );

  const canBeRemoved = isBuilt || (isDay0 && isPreBuilt);

  const onRemove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!castle) return;

    event.stopPropagation();

    const ids = trace(castle, buildingID, "next");

    removePreBuilds(ids);
    removeBuildings(ids);
  };

  return (
    <>
      {canBeRemoved && (
        <button
          type="button"
          className={css.remove}
          data-testid={`remove-${buildingID}`}
          onClick={onRemove}
        >
          X
        </button>
      )}
      {isAvailable && (
        <div className={css.icon}>
          <img
            className={css.hammer}
            src={asset("svg/hammer.svg")}
            alt="built"
          />
        </div>
      )}

      {buildingID === "id11" && (isBuilt || isPreBuilt) && (
        <CastleMine value={500} buildingID={buildingID} />
      )}
      {buildingID === "id21" && (isBuilt || isPreBuilt) && (
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
