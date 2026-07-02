import { useEffect, useMemo } from "react";
import css from "./castleBoard.module.css";
import { useGetDown } from "./useGetDown";
import CastleGrid from "./castleGrid/CastleGrid";
import { getCastleConfig } from "./useFetchCastle";
import { useCastlesStore } from "./useCastles.store";
import CastleTabs from "./tabs/Tabs";
import Add from "./add/Add";
import Day0 from "./day0/Day0";

const CastleBoard = () => {
  const { faction, historyIDX: day } = useGetDown();
  const config = useMemo(() => getCastleConfig(faction), [faction]);

  const setInit = useCastlesStore((state) => state.setInit);
  const setDay = useCastlesStore((state) => state.setDay);
  const active = useCastlesStore(
    (state) => state.castles[state.currCastleUUID],
  );

  useEffect(() => {
    setInit(faction, config.castle, config.preBuilds);
  }, [setInit, faction, config]);

  useEffect(() => {
    setDay(day);
  }, [setDay, day]);

  return (
    <section className={css.main}>
      <div className={css.tabsWrapper}>
        <CastleTabs />
        <Add />
        <Day0 />
      </div>
      <CastleGrid
        castle={active?.castle ?? config.castle}
        faction={active?.faction ?? faction}
      />
    </section>
  );
};

export default CastleBoard;
