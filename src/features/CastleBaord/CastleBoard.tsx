import { useEffect, useMemo } from "react";
import css from "./castleBoard.module.css";
import { useGetDown } from "./useGetDown";
import CastleGrid from "./castleGrid/CastleGrid";
import { getCastleConfig } from "./useFetchCastle";
import { useCastlesStore } from "./castleGrid/useCastles.store";
import { initSendBack } from "#/shared/sendBack";
import CastleTabs from "./tabs/Tabs";
import Add from "./add/Add";

const CastleBoard = () => {
  const { faction, historyIDX: day } = useGetDown();
  const config = useMemo(() => getCastleConfig(faction), [faction]);

  const setInit = useCastlesStore((state) => state.setInit);
  const active = useCastlesStore((state) => state.castles[state.currCastleUUID]);

  useEffect(() => {
    setInit(faction, day, config.castle, config.preBuilds);
  }, [setInit, day, faction, config]);

  useEffect(() => initSendBack(), []);

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
