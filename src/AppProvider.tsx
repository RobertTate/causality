import OBR from "@owlbear-rodeo/sdk";
import { useCallback, useEffect, useRef, useState } from "react";

import { AppContext } from "./AppContext";
import { ID } from "./constants";
import { triggerEffectTokens } from "./functions";
import type {
  AppContextProps,
  AppProviderProps,
  CausalityToken,
  CausalityTokenMetaData,
  EffectDialogConfig,
} from "./types";

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [tokens, setTokens] = useState<CausalityToken[]>([]);
  const collisionTokensRef = useRef<CausalityToken[]>([]);
  const [effectDialog, setEffectDialog] = useState<EffectDialogConfig>({
    open: false,
  });

  const updateEffectDialog = useCallback((effectDialog: EffectDialogConfig) => {
    setEffectDialog((prev) => {
      return {
        ...prev,
        ...effectDialog,
      };
    });
  }, []);

  useEffect(() => {
    const onItemsChange = () => {
      OBR.scene.items.onChange(async (items) => {
        const causalityTokens = items.filter((item) => {
          const itemMetadata = item.metadata as CausalityTokenMetaData;
          const causalityMetaData = itemMetadata[ID];
          if (
            causalityMetaData &&
            "isCausalityToken" in causalityMetaData &&
            causalityMetaData.isCausalityToken === true
          ) {
            return true;
          }
        }) as CausalityToken[];
        let collisionTokens: CausalityToken[] = [];
        for (let i = 0; i < causalityTokens.length; i++) {
          const cToken = causalityTokens[i];
          const itemMetadata = cToken.metadata as CausalityTokenMetaData;
          const causalityMetaData = itemMetadata[ID];
          const causalities = causalityMetaData.causalities;
          if (causalities && causalities.length > 0) {
            for (let k = 0; k < causalities.length; k++) {
              const causality = causalities[k];
              const cause = causality.cause;
              if (cause) {
                if (cause.trigger && cause.status === "Pending") {
                  switch (cause.trigger) {
                    case "appears": {
                      if (cToken.visible === true) {
                        setTimeout(
                          () => triggerEffectTokens(causality.id),
                          Number(cause.delay),
                        );
                      }
                      break;
                    }
                    case "disappears": {
                      if (cToken.visible === false) {
                        setTimeout(
                          () => triggerEffectTokens(causality.id),
                          Number(cause.delay),
                        );
                      }
                      break;
                    }
                    case "collision": {
                      if (cause.isCollided) {
                        setTimeout(
                          () => triggerEffectTokens(causality.id, cause.instigatorEffects),
                          Number(cause.delay),
                        );
                      }
                      collisionTokens.push(cToken);
                      break;
                    }
                  }
                }
              }
            }
          }
        }
        collisionTokensRef.current = collisionTokens;
        setTokens(causalityTokens);
      });
    };

    OBR.onReady(() => {
      onItemsChange();
    });
  }, []);

  const store: AppContextProps = {
    tokens,
    collisionTokensRef,
    effectDialog,
    updateEffectDialog,
  };

  return <AppContext.Provider value={store}>{children}</AppContext.Provider>;
};
