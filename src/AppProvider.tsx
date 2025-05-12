import { useEffect, useState } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { AppContext } from "./AppContext";
import type { AppContextProps, AppProviderProps, CausalityToken, CausalityTokenMetaData } from "./types";
import { ID } from "./constants";

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [tokens, setTokens] = useState<CausalityToken[]>([]);

  useEffect(() => {
    const onItemsChange = () => {
      OBR.scene.items.onChange((items) => {
        const causalityTokens = items.filter((item) => {
          const itemMetadata = item.metadata as CausalityTokenMetaData;
          const causalityMetaData = itemMetadata[ID];
          if (causalityMetaData && "isCausalityToken" in causalityMetaData && causalityMetaData.isCausalityToken === true) {
            return true;
          }
        }) as CausalityToken[];
        setTokens(causalityTokens);
      });
    }

    OBR.onReady(() => {
      onItemsChange();
    });
  }, []);

  const store: AppContextProps = {
    tokens
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};
