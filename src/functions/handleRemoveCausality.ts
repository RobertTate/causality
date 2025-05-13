import OBR from '@owlbear-rodeo/sdk';
import type { CausalityData, CausalityToken } from "../types";
import { ID } from "../constants";

export const handleRemoveCausality = (cData: CausalityData) => {
    const tokensToRemoveCausalityFrom: string[] = [];
    if (cData.effects && cData.effects.length > 0) {
      cData.effects.forEach((effect) => {
        tokensToRemoveCausalityFrom.push(effect.tokenId);
      })
    }
    if (cData.cause) {
      tokensToRemoveCausalityFrom.push(cData.cause.tokenId);
    };

    OBR.scene.items.updateItems(((item) => {
      return tokensToRemoveCausalityFrom.includes(item.id);
    }), (items) => {
      for (let item of items) {
        const itemToUpdate = item as CausalityToken;
        itemToUpdate.metadata[ID].causalities = itemToUpdate.metadata[ID].causalities?.filter((cDataToCheck) => {
          return cDataToCheck.id !== cData.id;
        })
      }
    })
  }
