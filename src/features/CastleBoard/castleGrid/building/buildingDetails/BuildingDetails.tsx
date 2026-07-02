import {
  useCastlesStore,
  type BuildingID,
} from "#/features/CastleBoard/useCastles.store";
import { asset } from "#/shared/asset";
import css from "./buildingDetails.module.css";

// Resource id -> icon file. Keys match the `cost`/`produces` keys in the castle
// config; note `crystals` uses the singular `crystal.webp` asset.
const RESOURCE_ICON: Record<string, string> = {
  gold: "img/resource/gold.webp",
  wood: "img/resource/wood.webp",
  ore: "img/resource/ore.webp",
  crystals: "img/resource/crystal.webp",
  gems: "img/resource/gems.webp",
  mercury: "img/resource/mercury.webp",
  dust: "img/resource/dust.webp",
  law: "img/resource/law.png",
  astrology: "img/resource/astrology.png",
};

const BuildingDetails = ({ buildingID }: BuildingDetailsProps) => {
  const building = useCastlesStore(
    (state) => state.castles[state.currCastleUUID]?.castle[buildingID],
  );

  const entries = Object.entries<number>(building?.cost ?? {}).filter(
    ([, amount]) => amount > 0,
  );

  return (
    <div className={css.panel}>
      {building?.description && (
        <p className={css.description}>{building.description}</p>
      )}
      <div className={css.label}>Construction cost:</div>
      {entries.length === 0 ? (
        <span className={css.free}>Free</span>
      ) : (
        <ul className={css.cost}>
          {entries.map(([resID, amount]) => (
            <li key={resID} className={css.res}>
              <img
                className={css.icon}
                src={asset(RESOURCE_ICON[resID] ?? "")}
                alt={resID}
                title={resID}
              />
              <span className={css.amount}>{amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default BuildingDetails;

type BuildingDetailsProps = {
  buildingID: BuildingID;
};
