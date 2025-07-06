import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { CausalityToken } from "../types";

export const removeCause = (
  causalityID: string,
  tokenID: string,
  causeID: string,
) => {
  OBR.scene.items.updateItems(
    (item) => {
      return item.id === tokenID;
    },
    (items) => {
      const itemToUpdate = items[0] as CausalityToken;
      const causalities = itemToUpdate.metadata?.[ID]?.causalities;
      if (causalities) {
        const matchingCausalityIdx = causalities.findIndex((causality) => {
          return causality.id === causalityID;
        });
        if (matchingCausalityIdx !== -1) {
          const matchingCausality = causalities[matchingCausalityIdx];
          const causes = matchingCausality.causes;
          if (causes && causes.length > 0) {
            const matchingCauseIndex = causes?.findIndex((cause) => {
              return cause.causeId === causeID;
            });
            if (matchingCauseIndex !== -1) {
              causes.splice(matchingCauseIndex, 1);
            }

            // Cleanup to remove the causality on that token if it's empty.
            if (
              matchingCausality.effects?.length === 0 &&
              (!matchingCausality.causes ||
                (matchingCausality.causes &&
                  matchingCausality.causes.length === 0))
            ) {
              causalities.splice(matchingCausalityIdx, 1);
            }
          }
        }
      }
    },
  );
};
