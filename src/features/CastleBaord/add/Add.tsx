
import css from "./add.module.css";
import { useCastlesStore } from "../castleGrid/useCastles.store";
import type { Faction } from "#/shared/castlesBus";
import Popover from "#/features/components/popover/Popover";
import Button from "#/features/components/tabs/button/Button";

const castleIDs = ["hive", "dungeon", "grove", "necropolis", "schism", "temple"] as Faction[];

const Add = () => {
  const addCastle = useCastlesStore((state) => state.addCastle);

  const onAdd = (castleID: Faction) =>
    addCastle(
      crypto.randomUUID(),
      castleID,
      castles[castleID],
      secondaryCastlePreBuilds[castleID],
    );

  return (
    <Popover>
      <Popover.Trigger>
        <Button>+</Button>
      </Popover.Trigger>

      <Popover.Content>
        {({ close }) => (
          <div className={css.options}>
            {castleIDs.map((castleID) => {
              const onClick = () => {
                close();
                onAdd(castleID);
              };

              return (
                <button
                  key={castleID}
                  type="button"
                  className={css.option}
                  data-testid={`add-${castleID}`}
                  onClick={onClick}
                >
                  <img
                    src={`/img/factions/logo/${castleID}.webp`}
                    alt={castleID}
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
