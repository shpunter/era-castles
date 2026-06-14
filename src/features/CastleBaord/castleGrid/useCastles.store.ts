// import { create } from "zustand";

// export const useCastlesStore = create<Store & Action>((set) => {
//   return {
//     castles: {} as Store["castles"],
//     currCastleUUID: "",

//   };
// });

// type Store = {
//   castles: {
//     [uuid: string]:
//       | {
//           buildings: BuildingsType;
//           preBuilds: readonly BuildingID[];
//           castleID: CastleID;
//           /** day the castle was added (first castle = 0) */
//           foundDay: number;
//         }
//       | undefined;
//   };
//   currCastleUUID: string;
// };
// type Action = {};

// export type CastleID = "hive" | "schism" | "temple" | "dungeon" | "grove" | "necropolis"

