import { useEffect, useMemo } from "react";
import css from "./castleBoard.module.css";
import { useGetDown } from "./useGetDown";
import CastleGrid from "./castleGrid/CastleGrid";
import { getCastleConfig } from "./useFetchCastle";
import { useCastlesStore } from "./useCastles.store";
import CastleTabs from "./tabs/Tabs";
import Add from "./add/Add";

const CastleBoard = () => {
  const { faction, historyIDX: day } = useGetDown();
  const config = useMemo(() => getCastleConfig(faction), [faction]);

  const setInit = useCastlesStore((state) => state.setInit);
  const setDay = useCastlesStore((state) => state.setDay);
  const active = useCastlesStore(
    (state) => state.castles[state.currCastleUUID],
  );

  // Seed the primary castle from the host's faction (merges; doesn't reset).
  useEffect(() => {
    setInit(faction, config.castle, config.preBuilds);
  }, [setInit, faction, config]);

  // Sync the timeline day from the host — separate from seeding so a day change
  // never rebuilds the castles registry.
  useEffect(() => {
    setDay(day);
  }, [setDay, day]);

  // Render the active castle from the store (switched by tabs / Add); fall back
  // to the faction's config before the store is seeded.
  return (
    <section className={css.main}>
      <div className={css.tabsWrapper}>
        <CastleTabs />
        <Add />
      </div>
      <CastleGrid
        castle={active?.castle ?? config.castle}
        faction={active?.faction ?? faction}
      />
    </section>
  );
};

export default CastleBoard;
