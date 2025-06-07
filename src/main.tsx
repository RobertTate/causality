import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { AppProvider } from "./AppProvider.tsx";
import { GlobalCollisionOptionsDialog } from "./components/GlobalCollisionOptionsDialog.tsx";
import { GlobalEffectDialog } from "./components/GlobalEffectDialog.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
    <GlobalEffectDialog />
    <GlobalCollisionOptionsDialog />
  </AppProvider>,
);
