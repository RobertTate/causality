import OBR from "@owlbear-rodeo/sdk";
import { isArray, mergeWith } from "lodash";
import { useEffect } from "react";

import { ID } from "../../constants";
import {
  Causality,
  CausalityToken,
  CausalityTokenMetaData,
  CauseOperator,
} from "../../types";
import { hasCollisionOccured, triggerCausality } from "../index";
import { useAppStore } from "./useAppStore";

export const useCausalityUpdates = () => {
  const { updateCausalities, updateTokens, collisionTokensRef } = useAppStore();

  useEffect(() => {
    const onItemsChange = async () => {
      OBR.scene.items.onChange(async (items) => {
        const collisionTokens: CausalityToken[] = [];
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

        const causalitiesDeduper: { [id: string]: Causality } = {};
        const clonedCausalityTokens = structuredClone(causalityTokens);

        for (const token of clonedCausalityTokens) {
          const tokenCausalities = token.metadata[ID].causalities;
          if (tokenCausalities && tokenCausalities.length > 0) {
            tokenCausalities.forEach((tokenCausality) => {
              if (causalitiesDeduper[tokenCausality.id]) {
                causalitiesDeduper[tokenCausality.id] = mergeWith(
                  causalitiesDeduper[tokenCausality.id],
                  tokenCausality,
                  (objValue, srcValue) => {
                    if (isArray(objValue)) {
                      return objValue.concat(srcValue);
                    }
                  },
                );
              } else {
                causalitiesDeduper[tokenCausality.id] = tokenCausality;
              }
            });
          }
        }

        const causalities = Object.values(causalitiesDeduper);
        updateCausalities(causalities);

        for (const causality of causalities) {
          const causes = (causality.causes || []).sort((a, b) =>
            new Date(a.timestamp) < new Date(b.timestamp) ? -1 : 1,
          );

          const causeConditionArray: [boolean, CauseOperator | undefined][] =
            causes.map((cause) => {
              const tokenTiedToCause = causalityTokens.find(
                (token) => token.id === cause.tokenId,
              );
              if (
                tokenTiedToCause &&
                cause.trigger &&
                cause.status === "Pending"
              ) {
                switch (cause.trigger) {
                  case "appears": {
                    if (tokenTiedToCause.visible === true) {
                      return [true, cause.operator];
                    }
                    break;
                  }
                  case "disappears": {
                    if (tokenTiedToCause.visible === false) {
                      return [true, cause.operator];
                    }
                    break;
                  }
                  case "covers": {
                    collisionTokens.push(tokenTiedToCause);
                    if (!cause.isCollided) {
                      return [false, cause.operator];
                    } else if (cause.isCollided) {
                      return [true, cause.operator];
                    }
                    break;
                  }
                  case "collision": {
                    if (!cause.isCollided) {
                      collisionTokens.push(tokenTiedToCause);
                      return [false, cause.operator];
                    } else if (cause.isCollided) {
                      return [true, cause.operator];
                    }
                    break;
                  }
                  default: {
                    return [false, cause.operator];
                  }
                }
              }
              return [false, cause.operator];
            });

          const areCauseConditionsMet = (
            causeConditionArray: [boolean, CauseOperator | undefined][],
          ) => {
            let areConditionsMet = causeConditionArray?.[0]?.[0];

            for (let i = 1; i < causeConditionArray.length; i++) {
              const [isConditionMet, operator] = causeConditionArray[i];
              if (operator === "AND") {
                areConditionsMet = areConditionsMet && isConditionMet;
              } else if (operator === "OR") {
                areConditionsMet = areConditionsMet || isConditionMet;
              }
            }

            return areConditionsMet;
          };

          if (areCauseConditionsMet(causeConditionArray)) {
            const delay = causality.delay || causality?.causes?.[0]?.delay;

            if (
              causes[0].instigatorEffects &&
              causes[0].instigatorEffects.length > 0
            ) {
              setTimeout(() => {
                return triggerCausality(
                  causality.id,
                  causes[0].instigatorEffects,
                );
              }, Number(delay));
            } else {
              setTimeout(() => {
                return triggerCausality(causality.id);
              }, Number(delay));
            }
          }
        }

        for (const token of causalityTokens) {
          // Logic for checking collisions if using the default move tool
          if (activeToolMode === "rodeo.owlbear.tool-mode/move") {
            const tokensToCheck = collisionTokensRef.current;
            for (const tokenToCheck of tokensToCheck) {
              if (
                token.id !== tokenToCheck.id &&
                hasCollisionOccured(token, tokenToCheck)
              ) {
                await OBR.scene.items.updateItems(
                  (item) => {
                    return [tokenToCheck.id].includes(item.id);
                  },
                  (items) => {
                    const itemToUpdate = items.find(
                      (item) => item.id === tokenToCheck.id,
                    ) as CausalityToken;
                    const itemMetaData = itemToUpdate.metadata[ID];
                    const causalities = itemMetaData.causalities;
                    if (causalities && causalities.length > 0) {
                      for (const causality of causalities) {
                        const causes = causality.causes || [];
                        for (const cause of causes) {
                          if (cause) {
                            if (cause.isCollided === false) {
                              // Check if there's a scope of only 1 specific token that should be triggering the collision.
                              if (
                                cause.tokenToTriggerCollision?.id &&
                                cause.tokenToTriggerCollision.id !== token.id
                              ) {
                                return;
                              }
                              // Successful Collision!
                              cause.isCollided = true;
                              const instigatorEffects = cause.instigatorEffects;
                              if (
                                instigatorEffects &&
                                instigatorEffects.length > 0
                              ) {
                                for (const ie of instigatorEffects) {
                                  const oldTokenID = ie.tokenId;
                                  ie.originalCauseTokenId = oldTokenID;
                                  ie.tokenId = token.id;
                                }
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
        updateTokens(causalityTokens);
      });
    };

    OBR.onReady(() => {
      onItemsChange();
    });
  }, []);
};
