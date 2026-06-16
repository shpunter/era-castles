import { classnames } from "#/shared/classnames";
import { asset } from "#/shared/asset";
import { useCastlesStore } from "#/features/CastleBoard/useCastles.store";
import css from "./castleMine.module.css";

const RESOURCES = [
  { res: "gold", icon: asset("img/resource/gold.webp") },
  { res: "law", icon: asset("img/resource/law.png") },
  { res: "astrology", icon: asset("img/resource/astrology.png") },
] as const;

const CastleMine = ({ value, buildingID }: CastleMineProps) => {
  const addCastleMines = useCastlesStore((state) => state.addCastleMines);

  const activeRes = useCastlesStore(
    (state) => state.castleMines[state.currCastleUUID]?.[buildingID]?.resource,
  );

  const onClick =
    (res: "gold" | "law" | "astrology") =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
      addCastleMines(buildingID, res, value);
      e.stopPropagation();
    };

  return (
    <div className={css.resources}>
      {RESOURCES.map(({ res, icon }) => {
        const isActive = activeRes === res;

        const className = classnames({
          [css.option]: true,
          [css.active]: isActive,
          [css.inactive]: !isActive,
        });

        return (
          <button
            key={res}
            type="button"
            className={className}
            onClick={onClick(res)}
            title={res}
            data-testid={`mine-${buildingID}-${res}`}
            aria-pressed={isActive}
          >
            <img className={css.icon} src={icon} alt={res} />
          </button>
        );
      })}
    </div>
  );
};

export default CastleMine;

type CastleMineProps = {
  value: number;
  buildingID: "id11" | "id21";
};
