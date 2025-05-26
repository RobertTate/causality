import OBR from "@owlbear-rodeo/sdk";
import { useCallback, useEffect, useRef, useState } from "react";

import { AppContext } from "./AppContext";
import { ID } from "./constants";
import { triggerEffectTokens, hasCollisionOccured } from "./functions";
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
    const onItemsChange = async () => {
      OBR.scene.items.onChange(async (items) => {
        const activeToolMode = await OBR.tool.getActiveToolMode();

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
                          () => {
                            return triggerEffectTokens(causality.id)
                          },
                          Number(cause.delay),
                        );
                      }
                      break;
                    }
                    case "disappears": {
                      if (cToken.visible === false) {
                        setTimeout(
                          () => {
                            return triggerEffectTokens(causality.id)
                          },
                          Number(cause.delay),
                        );
                      }
                      break;
                    }
                    case "collision": {
                      if (cause.isCollided) {
                        setTimeout(
                          () => {
                            return triggerEffectTokens(causality.id, cause.instigatorEffects)
                          },
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

          // Logic for checking collisions if using the default move tool
          if (activeToolMode === "rodeo.owlbear.tool-mode/move") {
            const tokensToCheck = collisionTokensRef.current;
            for (const tokenToCheck of tokensToCheck) {
              if (cToken.id !== tokenToCheck.id && hasCollisionOccured(cToken, tokenToCheck)) {
                await OBR.scene.items.updateItems(
                  (item) => {
                    return [tokenToCheck.id].includes(item.id);
                  },
                  (items) => {
                    const itemToUpdate = items.find((item) => item.id === tokenToCheck.id) as CausalityToken;
                    const itemMetaData = itemToUpdate.metadata[ID];
                    const causalities = itemMetaData.causalities;
                    if (causalities && causalities.length > 0) {
                      for (let causality of causalities) {
                        const cause = causality.cause;
                        if (cause) {
                          if (cause.isCollided === false) {
                            cause.isCollided = true;
                            const instigatorEffects = cause.instigatorEffects;
                            if (instigatorEffects && instigatorEffects.length > 0) {
                              for (const ie of instigatorEffects) {
                                const oldTokenID = ie.tokenId;
                                ie.originalCauseTokenId = oldTokenID;
                                ie.tokenId = cToken.id;
                              }
                            }
                          }
                        }
                      }
                    }
                  },
                );
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
