import { useEffect, useState, useRef } from "react";
import OBR from "@owlbear-rodeo/sdk";
import { AppContext } from "./AppContext";
import type { AppContextProps, AppProviderProps, CollisionToken, CausalityToken, CausalityTokenMetaData } from "./types";
import { ID } from "./constants";
import { triggerEffectTokens } from "./functions";

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [tokens, setTokens] = useState<CausalityToken[]>([]);
  const collisionTokensRef = useRef<CollisionToken[]>([]);

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

        let collisionTokens: CausalityToken[] = [];
        causalityTokens.forEach((cToken) => {
          const itemMetadata = cToken.metadata as CausalityTokenMetaData;
          const causalityMetaData = itemMetadata[ID];
          const causalities = causalityMetaData.causalities;
          if (causalities && causalities.length > 0) {
            causalities.forEach((causality) => {
              const causeToken = causality.cause;
              if (causeToken) {
                if (causeToken.trigger && causeToken.status === "Pending") {
                  switch (causeToken.trigger) {
                    case "appears": {
                      if (cToken.visible === true) {
                        triggerEffectTokens(causality.id);
                      }
                      break;
                    };
                    case "disappears": {
                      if (cToken.visible === false) {
                        triggerEffectTokens(causality.id);
                      }
                      break;
                    };
                    case "collision": {
                      if (causalityMetaData.isCollided) {
                        triggerEffectTokens(causality.id);
                      }
                      collisionTokens.push(cToken);
                      break;
                    };
                  }
                }
              }
            })
          }
        })

        collisionTokensRef.current = collisionTokens;
        setTokens(causalityTokens);
      });
    }

    OBR.onReady(() => {
      onItemsChange();
    });
  }, []);

  const store: AppContextProps = {
    tokens,
    collisionTokensRef,
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};
