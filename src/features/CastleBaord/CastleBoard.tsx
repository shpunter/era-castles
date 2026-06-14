import { useSyncExternalStore } from "react";
import css from "./castleBoard.module.css";
import { state$ } from "@/shared/castlesBus";
import type { Faction } from "@/shared/castlesBus";
import { castles } from "@/shared/castles";

function useFaction(): Faction {
  return useSyncExternalStore(
    (cb) => {
      const sub = state$.subscribe(cb);
      return () => sub.unsubscribe();
    },
    () => state$.getValue().down.faction,
    () => state$.getValue().down.faction,
  );
}

const CastleBoard = () => {
  const faction = useFaction();
  const castleData = castles[faction];

  return (
    <section className={css.main}>
      {Object.entries(castleData).map(([id, building]) => (
        <div key={id}>{building.name}</div>
      ))}
    </section>
  );
};

export default CastleBoard;
