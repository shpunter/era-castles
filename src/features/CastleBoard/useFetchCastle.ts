import type { Faction } from "#/shared/castlesBus";
import {
  castles,
  initCastlePreBuilds,
  secondaryCastlePreBuilds,
} from "#/shared/castles";

type RawCastle = (typeof castles)[Faction];
export type CastleBuilding = RawCastle extends Record<string, infer V>
  ? V
  : never;
export type Castle = Record<string, CastleBuilding>;
export type PreBuilds = (typeof initCastlePreBuilds)[Faction];
export type SecondaryPreBuilds = (typeof secondaryCastlePreBuilds)[Faction];

export type CastleConfig = {
  castle: Castle;
  preBuilds: PreBuilds;
  secondaryPreBuilds: SecondaryPreBuilds;
};

// Castle data is static config bundled with the app — no server, no fetching.
// Returns the castle layout plus its initial/secondary pre-builds for a faction.
export const getCastleConfig = (faction: Faction): CastleConfig => ({
  castle: castles[faction],
  preBuilds: initCastlePreBuilds[faction],
  secondaryPreBuilds: secondaryCastlePreBuilds[faction],
});
