import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { Causality, CausalityToken } from "../types";

export const resetCausality = (c: Causality) => {
  const tokensToResetCausalityOn: string[] = [];
  if (c.effects && c.effects.length > 0) {
    c.effects.forEach((effect) => {
      tokensToResetCausalityOn.push(effect.tokenId);
    });
  }
  if (c.causes && c.causes.length > 0) {
    c.causes.forEach((cause) => {
      tokensToResetCausalityOn.push(cause.tokenId);
    });
  }

  OBR.scene.items.updateItems(
    (item) => {
      return tokensToResetCausalityOn.includes(item.id);
    },
    (items) => {
      for (const item of items) {
        const itemToUpdate = item as CausalityToken;
        const causalityMetaData = itemToUpdate.metadata[ID];
        const causalities = causalityMetaData.causalities;
        if (causalities && causalities.length > 0) {
          causalities.forEach((causality) => {
            if (causality.id === c.id) {
              const causes = causality.causes;
              if (causes && causes.length > 0) {
                for (const cause of causes) {
                  cause.status = "Pending";
                  if (cause.isCollided) {
                    cause.isCollided = false;
                  }
                }
              }
            }
          });
        }
      }
    },
  );
};
