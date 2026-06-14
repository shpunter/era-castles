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
  up: { resource: [], mine: [] },
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

/** Event stream — use for transient signals (clicks, intents, notifications). */
export const events$: Subject<CastlesEvent> = g.__castlesEvents$;

/** State stream — use for current values that new subscribers should replay. */
export const state$: BehaviorSubject<CastlesState> = g.__castlesState$;

/** Publish an event onto the bus. */
export const emit = (event: CastlesEvent): void => events$.next(event);

/**
 * Push state DOWN: host → remote. Merges into the `down` slice, leaving
 * `up` and any untouched `down` fields intact.
 */
export const patchDown = (patch: Partial<CastlesState["down"]>): void => {
  const prev = state$.getValue();
  state$.next({ ...prev, down: { ...prev.down, ...patch } });
};

/**
 * Push state UP: remote → host. Merges into the `up` slice, leaving
 * `down` and any untouched `up` fields intact.
 */
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

/** Fire-and-forget events. Extend this union as the contract grows. */
export type CastlesEvent =
  | { type: "castles:reset-all" }
  | { type: "castles:ready" };

/** Shared, replayable state. Late subscribers immediately get the latest value. */
export type CastlesState = {
  down: {
    faction: Faction;
    /** Current timeline day index sent from host to remote. */
    historyIDX: number;
  };
  up: {
    /** Resources produced by castles per timeline day (index = historyIDX). */
    resource: { resID: string; amount: number }[][];
    /** Mine resources produced by castles per timeline day (index = historyIDX). */
    mine: { resID: string; amount: number }[][];
  };
};
