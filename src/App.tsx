import CastleBoard from "@/features/CastleBaord/CastleBoard";
import "./styles.css";

// Module Federation entry point. The host (eraplanner.com) imports `./App` and
// mounts it directly, so this component is self-contained. Castle data is static
// (imported from #/shared/castles), so there's no provider/data-fetching to set up.
export default function App() {
  return <CastleBoard />;
}
