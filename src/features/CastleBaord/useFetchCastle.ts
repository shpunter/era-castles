import { getCastleData } from "#/server/castleBoard.rpc";
import type { Faction } from "#/shared/castlesBus";
import { useSuspenseQuery } from "@tanstack/react-query";

export const useFetchCastle = (faction: Faction) => {
  return useSuspenseQuery({
    queryKey: ["castleData", faction],
    queryFn: () => getCastleData({ data: faction }),
  });
};

type RawResponse = Awaited<ReturnType<typeof getCastleData>>;
type RawCastle = RawResponse["castle"];
export type CastleBuilding = RawCastle extends Record<string, infer V> ? V : never;
export type Castle = Record<string, CastleBuilding>;
export type PreBuilds = RawResponse["preBuilds"];
