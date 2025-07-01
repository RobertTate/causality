import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { Broadcast, Causality, CausalityToken, Cause, Effect } from "../types";

export const updateCausalityData = <K extends keyof Causality>(
  causalityID: string,
  propName: K,
  propValue: Causality[K],
  operation?: "add" | "remove",
) => {
  OBR.scene.items.updateItems(
    (item) => {
      const causalityToken = item as CausalityToken;
      const causalityTokenMetaData = causalityToken?.metadata?.[ID];
      const matchingCausality = (causalityTokenMetaData?.causalities || []).find((causality) => {
        return causality.id === causalityID;
      });
      if (matchingCausality) {
        return true;
      }
      return false;
    },
    (items) => {
      const itemsToUpdate = items as CausalityToken[];
      for (const causalityToken of itemsToUpdate) {
        const causalities = causalityToken.metadata?.[ID]?.causalities;
        if (causalities) {
          const matchingCausality = causalities.find((causality) => {
            return causality.id === causalityID;
          });
          if (matchingCausality) {
            if (propName === "causalityIdsToReset") {
              if (!matchingCausality["causalityIdsToReset"] === undefined) {
                matchingCausality["causalityIdsToReset"] = [];
              }
              const causalityIdsToReset = matchingCausality[propName] as Causality["causalityIdsToReset"]
              const [idToAdd] = propValue as string[];
              if (operation === "add") {
                matchingCausality["causalityIdsToReset"] = [
                  idToAdd,
                  ...causalityIdsToReset,
                ];
              } else if (operation === "remove") {
                matchingCausality["causalityIdsToReset"] = (matchingCausality["causalityIdsToReset"] || []).filter((id) => {
                  return id !== idToAdd;
                });
              }
            } else {
              matchingCausality[propName] = propValue;
            }
          }
        }
      }
    },
  );
}

export const updateCauseData = <K extends keyof Cause>(
  causalityID: string,
  tokenID: string,
  propName: K,
  propValue: Cause[K],
) => {
  OBR.scene.items.updateItems(
    (item) => {
      return item.id === tokenID;
    },
    (items) => {
      const itemToUpdate = items[0] as CausalityToken;
      const causalities = itemToUpdate.metadata?.[ID]?.causalities;
      if (causalities) {
        const matchingCausality = causalities.find((causality) => {
          return causality.id === causalityID;
        });
        if (matchingCausality) {
          const causes = matchingCausality.causes || [];
          for (const cause of causes) {
            if (cause && cause.tokenId === tokenID) {
              cause[propName] = propValue;
            }
          }
        }
      }
    },
  );
};

export const updateEffectData = <K extends keyof Effect>(
  causalityID: string,
  tokenID: string,
  effectID: string,
  propName: K,
  propValue: Effect[K],
) => {
  OBR.scene.items.updateItems(
    (item) => {
      return item.id === tokenID;
    },
    (items) => {
      const itemToUpdate = items[0] as CausalityToken;
      const causalities = itemToUpdate.metadata?.[ID]?.causalities;
      if (causalities) {
        const matchingCausality = causalities.find((causality) => {
          return causality.id === causalityID;
        });
        if (matchingCausality) {
          const effects = matchingCausality.effects;
          const instigatorEffects = (matchingCausality.causes || []).flatMap(
            (cause) => cause.instigatorEffects || [],
          );
          const allEffects = instigatorEffects
            ? [...(effects || []), ...(instigatorEffects || [])]
            : effects;

          if (allEffects && allEffects.length > 0) {
            const matchingEffect = allEffects.find((effect) => {
              return effect.effectId === effectID;
            });
            if (matchingEffect) {
              if (propName === "broadcast") {
                const broadcastObj = propValue as Broadcast;
                matchingEffect.broadcast = {
                  ...matchingEffect.broadcast,
                  ...broadcastObj,
                };
              } else {
                matchingEffect[propName] = propValue;
              }
            }
          }
        }
      }
    },
  );
};
