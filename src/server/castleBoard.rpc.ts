import {
  castles,
  initCastlePreBuilds,
  secondaryCastlePreBuilds,
} from "#/server/castles";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const factionSchema = z.enum([
  "hive",
  "schism",
  "temple",
  "dungeon",
  "grove",
  "necropolis",
]);

export const getCastleData = createServerFn({ method: "GET" })
  .validator(factionSchema)
  .handler(({ data: faction }) => ({
    castle: castles[faction],
    preBuilds: initCastlePreBuilds[faction],
    secondaryPreBuilds: secondaryCastlePreBuilds[faction],
  }));
