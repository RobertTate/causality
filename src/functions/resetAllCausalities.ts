import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { CausalityToken } from "../types";

export const resetAllCausalities = () => {
  OBR.scene.items.updateItems(
    (item) => {
      const potenialCausalityToken = item as CausalityToken;
      if (potenialCausalityToken?.metadata?.[ID]?.isCausalityToken) {
        return true;
      }
      return false;
    },
    (items) => {
      const causalityTokens = items as CausalityToken[];
      for (const token of causalityTokens) {
        const causalityMetaData = token.metadata[ID];
        const causalities = causalityMetaData.causalities;
        if (causalities && causalities.length > 0) {
          for (const causality of causalities) {
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
        }
      }
    },
  );
};
