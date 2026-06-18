import CastleBoard from "#/features/CastleBoard/CastleBoard";
import { initSendBack } from "#/shared/sendBack";
import "./styles.css";

// Start publishing store state to the bus as soon as this module is imported —
// including during the host's background prefetch — so the host always has
// up-to-date castle income even when the castles tab is never opened.
initSendBack();

export default function App() {
  return <CastleBoard />;
}
