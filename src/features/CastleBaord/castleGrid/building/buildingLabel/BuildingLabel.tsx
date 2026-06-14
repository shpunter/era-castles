import type { TBuilding } from "#/routes/faction/$id";

import { classnames } from "#/shared/classnames";
import css from "./buildingLabel.module.css";

const BuildingLabel = ({
  name,
  isMarked,
  isBuilt,
  isAvailable,
  isBuiltThisDay,
}: BuildingLabelProps) => {
  const className = classnames({
    [css.label]: true,
    [css.marked]: !isBuilt && isMarked,
    [css.available]: isAvailable && isMarked && !isBuilt,
    [css.builtThisDay]: isBuiltThisDay,
  });

  return <div className={className}>{name}</div>;
};

export default BuildingLabel;

type BuildingLabelProps = {
  name: TBuilding["name"];
  isMarked: boolean;
  isBuilt: boolean;
  isAvailable: boolean;
  isBuiltThisDay: boolean;
};
