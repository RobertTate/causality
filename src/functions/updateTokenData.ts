import OBR from '@owlbear-rodeo/sdk';
import type { CauseTokenData, EffectTokenData, CausalityToken } from "../types";
import { ID } from "../constants";

export const updateCauseTokenData = <K extends keyof CauseTokenData>(
  causalityID: string,
  tokenID: string,
  propName: K,
  propValue: CauseTokenData[K],
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
        if (causeToken && causeToken.tokenID === tokenID) {
          causeToken[propName] = propValue;
        }
      }
    }
  })
}

export const updateEffectTokenData = <K extends keyof EffectTokenData>(
  causalityID: string,
  tokenID: string,
  propName: K,
  propValue: EffectTokenData[K],
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
            return effect.tokenID === tokenID;
          });
          if (matchingEffect) {
            matchingEffect[propName] = propValue;
          }
        }
      }
    }
  })
}
