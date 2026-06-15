import type { Castle } from "../useFetchCastle";
import type { BuildingID } from "./useCastles.store";

type Direction = "prev" | "next";

type BuildingNode = {
  readonly prev: readonly BuildingID[] | null;
  readonly next: readonly BuildingID[] | null;
};

const fn = (
  castle: Record<string, BuildingNode>,
  buildingID: BuildingID,
  IDs: Set<BuildingID>,
  direction: Direction,
) => {
  if (!buildingID || IDs.has(buildingID)) return;

  const collectedIDs = castle[buildingID]?.[direction] ?? [];

  IDs.add(buildingID);

  collectedIDs.forEach((collectedID) => {
    fn(castle, collectedID, IDs, direction);
  });
};

export const trace = (
  castle: Castle,
  buildingID: BuildingID,
  direction: Direction,
) => {
  const IDs = new Set<BuildingID>();

  fn(castle, buildingID, IDs, direction);

  return Array.from(IDs);
};