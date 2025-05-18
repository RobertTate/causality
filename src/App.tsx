import OBR from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import styles from "./App.module.css";
import icon from "./assets/icon.svg";
import info from "./assets/info.svg";
import { CausalityManager } from "./components/CausalityManager";
import {
  useCausalityPointer,
  useCausalityTokenSetterMenuContext,
} from "./functions/hooks";
import type { Role } from "./types";

function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [role, setRole] = useState<Role>(undefined);

  useEffect(() => {
    const initApp = async () => {
      const roleValue = await OBR.player.getRole();
      setRole(roleValue);
      setAppIsReady(true);
    };

    OBR.onReady(() => {
      initApp();
    });
  }, []);

  useCausalityPointer();
  useCausalityTokenSetterMenuContext();

  return (
    <main className={styles["app-main"]}>
      <div className={styles["app-header-area"]}>
        <a
          title="Read the docs"
          className={styles["app-info-link"]}
          href="https://github.com/RobertTate/causality"
          target="_blank"
        >
          <img src={info} alt="Link to Docs" />
        </a>
        <h1 className={styles["app-header"]}>
          <img
            className={styles["app-header-icon"]}
            id="headingImage"
            alt="Causality Logo"
            src={icon}
          ></img>
          Causality
        </h1>
        <p>Automate what happens next</p>
      </div>

      {appIsReady && role === "GM" ? (
        <>
          <CausalityManager />
        </>
      ) : (
        <>Not for you! Go away.</>
      )}
    </main>
  );
}

export default App;
