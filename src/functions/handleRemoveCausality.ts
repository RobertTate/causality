import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { Causality, CausalityToken } from "../types";

export const handleRemoveCausality = (c: Causality) => {
  const tokensToRemoveCausalityFrom: string[] = [];
  if (c.effects && c.effects.length > 0) {
    c.effects.forEach((effect) => {
      tokensToRemoveCausalityFrom.push(effect.tokenId);
    });
  }
  if (c.cause) {
    tokensToRemoveCausalityFrom.push(c.cause.tokenId);
  }

  OBR.scene.items.updateItems(
    (item) => {
      return tokensToRemoveCausalityFrom.includes(item.id);
    },
    (items) => {
      for (let item of items) {
        const itemToUpdate = item as CausalityToken;
        itemToUpdate.metadata[ID].causalities = itemToUpdate.metadata[
          ID
        ].causalities?.filter((causality) => {
          return causality.id !== c.id;
        });
      }
    },
  );
};
