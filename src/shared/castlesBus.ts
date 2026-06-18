import { BehaviorSubject, Subject } from "rxjs";

// Shared communication bus between the host app and the federated `castles`
// remote. Host and remote each bundle their own copy of this module, so the
// Subjects are pinned on `globalThis` (both run in the same window) to guarantee
// a single shared instance — there is only ever one bus. `rxjs` is also shared
// as a singleton in vite.config.ts so operators work across the boundary.
//
// To use it from the remote: copy this file into the remote and import from it.
// Keep this module framework-agnostic (no React/DOM imports) so any remote,
// regardless of framework, can import and use it.

const initialState: CastlesState = {
  down: { faction: "hive", historyIDX: 0 },
  up: { history: [], resource: [], mine: [] },
};

// Pin the streams on globalThis so host and remote share one instance even
// though each bundles its own copy of this module.
type BusGlobal = typeof globalThis & {
  __castlesEvents$?: Subject<CastlesEvent>;
  __castlesState$?: BehaviorSubject<CastlesState>;
};
const g = globalThis as BusGlobal;

if (!g.__castlesEvents$) g.__castlesEvents$ = new Subject<CastlesEvent>();
if (!g.__castlesState$) {
  g.__castlesState$ = new BehaviorSubject<CastlesState>(initialState);
}

export const events$: Subject<CastlesEvent> = g.__castlesEvents$;

export const state$: BehaviorSubject<CastlesState> = g.__castlesState$;

export const emit = (event: CastlesEvent): void => events$.next(event);

export const patchDown = (patch: Partial<CastlesState["down"]>): void => {
  const prev = state$.getValue();
  state$.next({ ...prev, down: { ...prev.down, ...patch } });
};

export const patchUp = (patch: Partial<CastlesState["up"]>): void => {
  const prev = state$.getValue();
  state$.next({ ...prev, up: { ...prev.up, ...patch } });
};

export type Faction =
  | "hive"
  | "schism"
  | "temple"
  | "dungeon"
  | "grove"
  | "necropolis";

export type CastlesEvent =
  | { type: "castles:reset-all" }
  | { type: "castles:ready" };

export type CastlesState = {
  down: {
    faction: Faction;
    historyIDX: number;
  };
  up: {
    history: string[][];
    resource: { resID: string; amount: number }[][];
    mine: { resID: string; amount: number }[][];
  };
};
