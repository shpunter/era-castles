import { Suspense } from "react";
import css from "./castleBoard.module.css";
import { Await } from "@tanstack/react-router";

const CastleBoard = () => {
  //   const { castle, castleUUID } = ???;
  //   const { castleID } = ???;

  return (
    <section className={css.main}>
      <div>
        <Suspense
          fallback={<div className={css.loader}>Loading Castle Data...</div>}
        >
          <Await promise={castle}>
            {(resolvedCastle) => <div>{castleID}</div>}
          </Await>
        </Suspense>
      </div>
    </section>
  );
};

export default CastleBoard;
