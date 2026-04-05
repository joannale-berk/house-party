import { useState } from "react";
import LandingPage from "./pages/LandingPage";
import PartyPage from "./pages/PartyPage";

function App() {
  const [started, setStarted] = useState(false);
  return started
    ? <PartyPage onExit={() => setStarted(false)} />
    : <LandingPage onStart={() => setStarted(true)} />;
}

export default App;
