import OBR from '@owlbear-rodeo/sdk';
import type { CauseData, EffectData, CausalityToken, BroadCast } from "../types";
import { ID } from "../constants";

export const updateCauseTokenData = <K extends keyof CauseData>(
  causalityID: string,
  tokenID: string,
  propName: K,
  propValue: CauseData[K],
) => {
  OBR.scene.items.updateItems(((item) => {
    return item.id === tokenID;
  }), (items) => {
    const itemToUpdate = items[0] as CausalityToken;
    const causalities = itemToUpdate.metadata?.[ID]?.causalities;
    if (causalities) {
      const matchingCausality = causalities.find((cData) => {
        return cData.id === causalityID;
      });
      if (matchingCausality) {
        const causeToken = matchingCausality.cause;
        if (causeToken && causeToken.tokenId === tokenID) {
          causeToken[propName] = propValue;
        }
      }
    }
  })
}

export const updateEffectTokenData = <K extends keyof EffectData>(
  causalityID: string,
  tokenID: string,
  effectID: string,
  propName: K,
  propValue: EffectData[K],
) => {
  OBR.scene.items.updateItems(((item) => {
    return item.id === tokenID;
  }), (items) => {
    const itemToUpdate = items[0] as CausalityToken;
    const causalities = itemToUpdate.metadata?.[ID]?.causalities;
    if (causalities) {
      const matchingCausality = causalities.find((cData) => {
        return cData.id === causalityID;
      });
      if (matchingCausality) {
        const effects = matchingCausality.effects;
        if (effects && effects.length > 0) {
          const matchingEffect = effects.find((effect) => {
            return effect.effectId === effectID;
          });
          if (matchingEffect) {
            if (propName === "broadcast") {
              const broadcastObj = propValue as BroadCast;
              matchingEffect.broadcast = {
                ...matchingEffect.broadcast,
                ...broadcastObj
              }
            } else {
              matchingEffect[propName] = propValue;
            }
          }
        }
      }
    }
  })
}
