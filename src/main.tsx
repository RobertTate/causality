import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { AppProvider } from "./AppProvider.tsx";
import { TriggeringTokenForCollisionDialog } from "./components/TriggeringTokenForCollisionDialog.tsx";
import { EffectDialog } from "./components/EffectDialog.tsx";
import { CausalityOnCompleteDialog } from "./components/CausalityOnCompleteDialog.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
    <EffectDialog />
    <TriggeringTokenForCollisionDialog />
    <CausalityOnCompleteDialog />
  </AppProvider>,
);
