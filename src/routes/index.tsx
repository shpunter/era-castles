import { createFileRoute } from "@tanstack/react-router";
import CastleBoard from "@/features/CastleBaord/CastleBoard";

export const Route = createFileRoute("/")({
  component: () => (
    <>
      <div className="p-8 text-2xl font-bold">Castles</div>
      <CastleBoard />
    </>
  ),
});
