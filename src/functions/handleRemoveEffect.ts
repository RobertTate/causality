import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { CausalityToken } from "../types";

export const handleRemoveEffect = (
  causalityID: string,
  tokenID: string,
  effectID: string,
) => {
  OBR.scene.items.updateItems(
    (item) => {
      return item.id === tokenID;
    },
    (items) => {
      const itemToUpdate = items[0] as CausalityToken;
      const causalities = itemToUpdate.metadata?.[ID]?.causalities;
      if (causalities) {
        const matchingCausalityIdx = causalities.findIndex((cData) => {
          return cData.id === causalityID;
        });
        if (matchingCausalityIdx !== -1) {
          const matchingCausality = causalities[matchingCausalityIdx];
          const effects = matchingCausality.effects;
          if (effects && effects.length > 0) {
            const matchingEffectIndex = effects?.findIndex((effect) => {
              return effect.effectId === effectID;
            });
            if (matchingEffectIndex !== -1) {
              effects.splice(matchingEffectIndex, 1);
            }

            // CLEANUP
            if (
              matchingCausality.effects?.length === 0 &&
              !matchingCausality.cause
            ) {
              causalities.splice(matchingCausalityIdx, 1);
            }
          }
        }
      }
    },
  );
};
