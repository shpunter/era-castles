import { hive } from "./hive";
import { necropolis } from "./necropolis";
import { grove } from "./grove";
import { dungeon } from "./dungeon";
import { temple } from "./temple";
import { schism } from "./schism";

export const castles = {
  hive,
  necropolis,
  grove,
  dungeon,
  temple,
  schism,
} as const;

export const initCastlePreBuilds = {
  hive: ["id10", "id01", "id05", "id06"],
  necropolis: ["id10", "id01", "id05", "id07"],
  grove: ["id10", "id01", "id05"],
  dungeon: ["id10", "id01", "id04", "id06"],
  temple: ["id10", "id01", "id15", "id06"],
  schism: ["id10", "id01", "id04", "id06"],
} as const;

export const secondaryCastlePreBuilds = {
  hive: ["id10", "id01", "id06"],
  necropolis: ["id10", "id01", "id05"],
  grove: ["id10", "id01", "id05"],
  dungeon: ["id10", "id01", "id04"],
  temple: ["id10", "id01", "id15"],
  schism: ["id10", "id01", "id06"],
} as const;
