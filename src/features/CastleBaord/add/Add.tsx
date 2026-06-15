
import css from "./add.module.css";
import { useCastlesStore } from "../castleGrid/useCastles.store";
import type { Faction } from "#/shared/castlesBus";
import Popover from "#/features/components/popover/Popover";
import Button from "#/features/components/tabs/button/Button";
import { useQueryClient } from "@tanstack/react-query";
import { castleQueryOptions } from "../useFetchCastle";

const castleIDs = ["hive", "dungeon", "grove", "necropolis", "schism", "temple"] as Faction[];

const Add = () => {
  const addCastle = useCastlesStore((state) => state.addCastle);
  const queryClient = useQueryClient();

  const onAdd = async (faction: Faction) => {
    const { castle, secondaryPreBuilds } = await queryClient.fetchQuery(
      castleQueryOptions(faction),
    );

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
                    src={`/img/factions/logo/${faction}.webp`}
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
