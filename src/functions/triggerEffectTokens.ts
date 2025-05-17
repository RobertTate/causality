import OBR from '@owlbear-rodeo/sdk';
import type { CausalityToken } from "../types";
import { ID } from "../constants";

export const triggerEffectTokens = (causalityID: string) => {
  OBR.scene.items.updateItems(((item) => {
    const itemMetaData = (item as CausalityToken).metadata;
    if (itemMetaData[ID]) {
      const causalities = itemMetaData[ID].causalities;
      if (causalities && causalities.length > 0) {
        const matchingCausality = causalities.find((causality) => causality.id === causalityID);
        if (matchingCausality) {
          return true;
        }
      }
    }
    return false;
  }), (items) => {
    for (let item of items) {
      const itemToUpdate = item as CausalityToken;
      const causalityMetadata = itemToUpdate.metadata[ID]
      const causalities = causalityMetadata.causalities;
      if (causalities && causalities.length > 0) {
        causalities.forEach((causality) => {
          if (causality.id === causalityID) {
            const cause = causality.cause;
            if (cause) {
              cause.status = "Complete"
            };
            const effects = causality.effects;
            if (effects && effects.length > 0) {
              effects.forEach((effect) => {
                switch (effect.action) {
                  case "appear": {
                    itemToUpdate.visible = true;
                    break;
                  };
                  case "disappear": {
                    itemToUpdate.visible = false;
                    break;
                  };
                  case "lock": {
                    itemToUpdate.locked = true;
                    break;
                  };
                  case "unlock": {
                    itemToUpdate.locked = false;
                    break;
                  }
                  case "broadcast": {
                    const channel = effect.broadcast?.channel;
                    const data = effect.broadcast?.data as string;
                    const parsedData = JSON.parse(data);
                    const destination = effect.broadcast?.destination || "REMOTE";

                    if (channel && parsedData && destination) {
                      OBR.broadcast.sendMessage(channel, parsedData, { destination });
                    }

                    break;
                  }
                }
              })
            }
          }
        })
      }
    }
  })
}
