import { useEffect, useMemo } from "react";
import Building from "./building/Building";
import css from "./castleGrid.module.css";
// import { type CastleID } from "./useCastles.store";

const CastleGrid = ({ castle, castleID, castleUUID }: CastleGridProps) => {
  const grid = useMemo(() => {
    const array = Array.from({ length: 9 * 5 }, () => ({
      uuid: crypto.randomUUID(),
    })) as { uuid: string }[];
    
    Object.values(castle?.buildings ?? {}).forEach((building) => {
      if (!building) return;

      const [y, x] = building.pos;
      const idx = y * 9 + x;
      array[idx] = { ...array[idx], ...building };
    });

    return array;
  }, [castle]);

  if (!castle) return null;

  return (
    <div className={css.castle}>
      {grid.map((building) =>
        "id" in building ? (
          <Building
            key={building.uuid}
            building={building}
            castleID={castle.castleID}
          />
        ) : (
          <div key={building.uuid} />
        ),
      )}
    </div>
  );
};

export default CastleGrid;

type CastleGridProps = {
  castle: ;
  castleID: "hive";
  castleUUID: string;
};
