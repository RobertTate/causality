import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { Broadcast, CausalityToken, Cause, Effect } from "../types";

export const updateCauseTokenData = <K extends keyof Cause>(
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
          const causeToken = matchingCausality.cause;
          if (causeToken && causeToken.tokenId === tokenID) {
            causeToken[propName] = propValue;
          }
        }
      }
    },
  );
};

export const updateEffectTokenData = <K extends keyof Effect>(
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
          const instigatorEffects = matchingCausality?.cause?.instigatorEffects;

          const allEffects = instigatorEffects ? [
            ...(effects || []),
            ...(instigatorEffects || [])
          ] : effects

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
