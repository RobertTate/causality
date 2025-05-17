import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { CausalityData, CausalityToken } from "../types";

export const handleResetCausality = (cData: CausalityData) => {
  const tokensToResetCausalityOn: string[] = [];
  if (cData.effects && cData.effects.length > 0) {
    cData.effects.forEach((effect) => {
      tokensToResetCausalityOn.push(effect.tokenId);
    });
  }
  if (cData.cause) {
    tokensToResetCausalityOn.push(cData.cause.tokenId);
  }

  OBR.scene.items.updateItems(
    (item) => {
      return tokensToResetCausalityOn.includes(item.id);
    },
    (items) => {
      for (let item of items) {
        const itemToUpdate = item as CausalityToken;
        const causalityMetaData = itemToUpdate.metadata[ID];
        const causalities = causalityMetaData.causalities;
        if (causalities && causalities.length > 0) {
          causalities.forEach((causality) => {
            if (causality.id === cData.id) {
              const cause = causality.cause;
              if (cause) {
                cause.status = "Pending";

                if (cause.isCollided) {
                  cause.isCollided = false;
                }

                cause.trigger = "";
              }
            }
          });
        }
      }
    },
  );
};
