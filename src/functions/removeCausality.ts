import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { Causality, CausalityToken } from "../types";

export const removeCausality = (c: Causality) => {
  const tokensToRemoveCausalityFrom: string[] = [];
  if (c.effects && c.effects.length > 0) {
    c.effects.forEach((effect) => {
      tokensToRemoveCausalityFrom.push(effect.tokenId);
    });
  }
  if (c.causes && c.causes.length > 0) {
    c.causes.forEach((cause) => {
      tokensToRemoveCausalityFrom.push(cause.tokenId);
    });
  }

  // Code to handle the migration of cause to causes. Can rip out after a few weeks/months probably.
  // @ts-ignore:
  if (c.cause && c.cause.tokenId) {
    // @ts-ignore:
    tokensToRemoveCausalityFrom.push(c.cause.tokenId);
  }

  if (c.tokenId) {
    tokensToRemoveCausalityFrom.push(c.tokenId);
  }

  OBR.scene.items.updateItems(
    (item) => {
      return tokensToRemoveCausalityFrom.includes(item.id);
    },
    (items) => {
      for (const item of items) {
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
