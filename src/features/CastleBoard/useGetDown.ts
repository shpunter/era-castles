import { useSyncExternalStore } from "react";
import { state$ } from "@/shared/castlesBus";

export const useGetDown = () => {
  return useSyncExternalStore(
    (cb) => {
      const sub = state$.subscribe(cb);
      return () => sub.unsubscribe();
    },
    () => state$.getValue().down,
    () => state$.getValue().down,
  );
};
