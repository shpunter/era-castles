import css from "./add.module.css";
import { useCastlesStore } from "#/features/CastleBoard/useCastles.store";
import type { Faction } from "#/shared/castlesBus";
import Popover from "#/components/popover/Popover";
import Button from "#/components/tabs/button/Button";
import { asset } from "#/shared/asset";
import { getCastleConfig } from "../useFetchCastle";

const castleIDs = [
  "hive",
  "dungeon",
  "grove",
  "necropolis",
  "schism",
  "temple",
] as Faction[];

const Add = () => {
  const addCastle = useCastlesStore((state) => state.addCastle);

  const onAdd = (faction: Faction) => {
    const { castle, secondaryPreBuilds } = getCastleConfig(faction);

    addCastle(crypto.randomUUID(), faction, castle, secondaryPreBuilds);
  };

  return (
    <Popover>
      <Popover.Trigger>
        <Button>+</Button>
      </Popover.Trigger>

      <Popover.Content>
        {({ close }) => (
          <div className={css.options}>
            {castleIDs.map((faction) => {
              const onClick = () => {
                close();
                onAdd(faction);
              };

              return (
                <button
                  key={faction}
                  type="button"
                  className={css.option}
                  data-testid={`add-${faction}`}
                  onClick={onClick}
                >
                  <img
                    src={asset(`img/factions/logo/${faction}.webp`)}
                    alt={faction}
                    className={css.icon}
                  />
                </button>
              );
            })}
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
};

export default Add;
