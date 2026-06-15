import { useMemo } from "react";
import Building from "./building/Building";
import css from "./castleGrid.module.css";
import type { Castle, CastleBuilding } from "../useFetchCastle";

const CastleGrid = ({ castle }: CastleGridProps) => {
  const grid = useMemo(() => {
    const array = Array.from({ length: 9 * 5 }, () => ({
      uuid: crypto.randomUUID(),
    })) as Array<{ uuid: string } | ({ uuid: string } & CastleBuilding)>;

    (Object.values(castle ?? {}) as CastleBuilding[]).forEach((building) => {
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
            castle={castle}
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
  castle: Castle;
};
