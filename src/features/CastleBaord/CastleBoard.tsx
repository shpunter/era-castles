import { Suspense, useEffect } from "react";
import css from "./castleBoard.module.css";
import type { Faction } from "@/shared/castlesBus";
import { useGetDown } from "./useGetDown";
import CastleGrid from "./castleGrid/CastleGrid";
import { useFetchCastle } from "./useFetchCastle";
import { useCastlesStore } from "./castleGrid/useCastles.store";
import { initSendBack } from "#/shared/sendBack";
import CastleTabs from "./tabs/Tabs";

const CastleBoardInner = ({ faction, day }: CastleBoardInnerProps) => {
  const {
    data: { castle, preBuilds },
  } = useFetchCastle(faction);
  const setInit = useCastlesStore((state) => state.setInit);

  useEffect(() => {
    setInit(faction, day, castle, preBuilds);
  }, [setInit, day, faction, castle, preBuilds]);

  useEffect(() => initSendBack(), []);

  return <CastleGrid castle={castle} />;
};

const CastleBoard = () => {
  const { faction, historyIDX: day } = useGetDown();

  return (
    <section className={css.main}>
      <div className={css.tabsWrapper}>
        <CastleTabs />
        {/* <Add /> */}
      </div>
      <Suspense
        fallback={<div className={css.loader}>Loading Castle Data...</div>}
      >
        <CastleBoardInner faction={faction} day={day} />
      </Suspense>
    </section>
  );
};

export default CastleBoard;

type CastleBoardInnerProps = {
  faction: Faction;
  day: number;
};
