import Button from "#/components/tabs/button/Button";
import { useCastlesStore } from "#/features/CastleBoard/useCastles.store";

const Day0 = () => {
  const isDay0 = useCastlesStore((state) => state.isDay0);
  const setIsDay0 = useCastlesStore((state) => state.setIsDay0);

  const isFoundDay = useCastlesStore(
    (state) => state.day === state.castles[state.currCastleUUID]?.foundDay,
  );

  if (!isFoundDay) return null;

  const onClick = () => setIsDay0(!isDay0);

  return (
    <Button
      variant={isDay0 ? "gold" : "secondary"}
      aria-pressed={isDay0}
      data-testid="day0-toggle"
      onClick={onClick}
    >
      {isDay0 ? "Disable" : "Enable"} Day0
    </Button>
  );
};

export default Day0;
