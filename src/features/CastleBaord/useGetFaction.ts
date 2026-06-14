import { useSyncExternalStore } from "react";
import { state$ } from "@/shared/castlesBus";
import type { Faction } from "@/shared/castlesBus";

export const useFaction = (): Faction => {
  return useSyncExternalStore(
    (cb) => {
      const sub = state$.subscribe(cb);
      return () => sub.unsubscribe();
    },
    () => state$.getValue().down.faction,
    () => state$.getValue().down.faction,
  );
};
