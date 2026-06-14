import type { BuildingID, CastleID } from "#/routes/faction/$id";
import { castles } from "#/routes/faction/castles.config";

type Direction = "prev" | "next";

type BuildingNode = {
  readonly prev: readonly BuildingID[] | null;
  readonly next: readonly BuildingID[] | null;
};

const fn = (
  castle: Partial<Record<BuildingID, BuildingNode>>,
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
  castleID: CastleID,
  buildingID: BuildingID,
  direction: Direction,
) => {
  const IDs = new Set<BuildingID>();

  fn(castles[castleID], buildingID, IDs, direction);

  return Array.from(IDs);
};
