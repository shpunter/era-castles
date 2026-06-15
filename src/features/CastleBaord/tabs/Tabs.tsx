import Tabs from "#/features/components/tabs/Tabs";
import { useCastlesStore } from "../castleGrid/useCastles.store";
import css from "./tabs.module.css";

const CastleTabs = () => {
  const castles = useCastlesStore((state) => state.castles);
  const history = useCastlesStore((state) => state.history);
  const historyIDX = useCastlesStore((state) => state.day);
  const currCastleUUID = useCastlesStore((state) => state.currCastleUUID);
  const setActiveTab = useCastlesStore((state) => state.setActiveTab);

  return (
    <Tabs value={currCastleUUID} onChange={setActiveTab}>
      {Object.entries(castles).map(([uuid, castle]) => {
        if (!castle?.castleID) return null;

        const isDisabled = history[uuid]?.disabled[historyIDX] ?? false;
        if (isDisabled) return null;

        const hasChange = !!history[uuid]?.built?.[historyIDX];

        return (
          <Tabs.Tab key={uuid} value={uuid} indicator={hasChange}>
            <div className={css.item}>
              <img
                src={`/img/factions/logo/${castle.castleID}.webp`}
                alt={castle.castleID}
                className={css.logo}
              />
            </div>
          </Tabs.Tab>
        );
      })}
    </Tabs>
  );
};

export default CastleTabs;
