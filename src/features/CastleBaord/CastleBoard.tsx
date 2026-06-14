import { Suspense } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import css from "./castleBoard.module.css";
import type { Faction } from "@/shared/castlesBus";
import { getCastleData } from "../../server/castleBoard.rpc";
import { useFaction } from "./useGetFaction";
import CastleGrid from "./castleGrid/CastleGrid";

const CastleBoardInner = ({ faction }: { faction: Faction }) => {
  const { data: castle } = useSuspenseQuery({
    queryKey: ["castleData", faction],
    queryFn: () => getCastleData({ data: faction }),
  });
  return <CastleGrid castle={castle} castleID="hive" castleUUID="uuid" />;
};

const CastleBoard = () => {
  const faction = useFaction();

  return (
    <section className={css.main}>
      <Suspense
        fallback={<div className={css.loader}>Loading Castle Data...</div>}
      >
        <CastleBoardInner faction={faction} />
      </Suspense>
    </section>
  );
};

export default CastleBoard;
