import OBR from "@owlbear-rodeo/sdk";

import { ID } from "../constants";
import type { CausalityToken, Effect, InstigatorEffect } from "../types";

const updateItemByEffect = (effect: Effect | InstigatorEffect, itemToUpdate: CausalityToken) => {
  switch (effect.action) {
    case "appear": {
      itemToUpdate.visible = true;
      break;
    }
    case "disappear": {
      itemToUpdate.visible = false;
      break;
    }
    case "lock": {
      itemToUpdate.locked = true;
      break;
    }
    case "unlock": {
      itemToUpdate.locked = false;
      break;
    }
    case "broadcast": {
      const channel = effect.broadcast?.channel;
      const data = effect.broadcast?.data as string;
      const parsedData = JSON.parse(data);
      const destination =
        effect.broadcast?.destination || "REMOTE";

      if (channel && parsedData && destination) {
        OBR.broadcast.sendMessage(channel, parsedData, {
          destination,
        });
      }

      break;
    }
  }

  if ("isInstigator" in effect && effect.isInstigator) {
    const originalCauseTokenId = effect.originalCauseTokenId;
    if (originalCauseTokenId) {
      effect.tokenId = originalCauseTokenId;
    }
  }
}

export const triggerEffectTokens = (causalityID: string, instigatorEffects: InstigatorEffect[] = []) => {
  OBR.scene.items.updateItems(
    (item) => {
      const itemMetaData = (item as CausalityToken).metadata;
      if (itemMetaData[ID]) {
        const causalities = itemMetaData[ID].causalities;
        if (causalities && causalities.length > 0) {
          const matchingCausality = causalities.find(
            (causality) => causality.id === causalityID,
          );
          if (matchingCausality) {
            return true;
          }
        }
      }

      if (instigatorEffects && instigatorEffects.length > 0) {
        for (const ie of instigatorEffects) {
          if (item.id === ie.tokenId) {
            return true;
          }
        }
      }

      return false;
    },
    (items) => {
      let instigatorEffects: InstigatorEffect[] = [];

      for (let item of items) {
        let itemToUpdate = item as CausalityToken;
        const causalityMetadata = itemToUpdate.metadata[ID];
        const causalities = causalityMetadata.causalities;
        if (causalities && causalities.length > 0) {
          for (const causality of causalities) {
            if (causality.id === causalityID) {
              const cause = causality.cause;
              if (cause) {
                cause.status = "Complete";
                if (cause.instigatorEffects && cause.instigatorEffects.length > 0) {
                  for (const ie of cause.instigatorEffects) {
                    instigatorEffects.push(ie);
                  }
                }
              }
              const effects = causality.effects;
              if (effects && effects.length > 0) {
                for (const effect of effects) {
                  updateItemByEffect(effect, itemToUpdate);
                }
              }
            }
          }
        }
      }

      if (instigatorEffects && instigatorEffects.length > 0) {
        const triggeringItem = items.find((item) => {
          return item.id === instigatorEffects[0].tokenId;
        }) as CausalityToken;
        if (triggeringItem) {
          for (const ie of instigatorEffects) {
            updateItemByEffect(ie, triggeringItem);
          }
        }
      }
    },
  );
};
