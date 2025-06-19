import OBR from "@owlbear-rodeo/sdk";
import ShortUniqueId from "short-unique-id";

import { ID } from "../constants";
import type {
  CausalityLog,
  CausalityToken,
  Cause,
  Effect,
  InstigatorEffect,
} from "../types";

const { randomUUID } = new ShortUniqueId({ length: 8 });

const updateItemByEffect = (
  effect: Effect | InstigatorEffect,
  itemToUpdate: CausalityToken,
) => {
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
      const destination = effect.broadcast?.destination || "REMOTE";

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
};

export const triggerEffectTokens = async (
  causalityID: string,
  instigatorEffects: InstigatorEffect[] = [],
) => {
  const logs: {
    [key: string]: CausalityLog;
  } = {};
  await OBR.scene.items.updateItems(
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
      const instigatorArray: [Cause, InstigatorEffect][] = [];
      for (const item of items) {
        const itemToUpdate = item as CausalityToken;
        const causalityMetadata = itemToUpdate.metadata[ID];
        const causalities = causalityMetadata.causalities;
        if (causalities && causalities.length > 0) {
          for (const causality of causalities) {
            if (causality.id === causalityID) {
              if (!logs[causality.id]) {
                logs[causality.id] = {
                  causes: [],
                  effects: [],
                  logID: "",
                };
              }

              const causes = causality.causes;
              if (causes && causes.length > 0) {
                for (const cause of causes) {
                  cause.status = "Complete";
                  if (
                    cause.instigatorEffects &&
                    cause.instigatorEffects.length > 0
                  ) {
                    for (const ie of cause.instigatorEffects) {
                      instigatorArray.push([cause, ie]);
                    }
                  }
                  logs[causality.id].causes.push({
                    name: cause?.name,
                    imageUrl: cause?.imageUrl,
                    trigger: cause?.trigger,
                  });
                }
              }
              const effects = causality.effects;
              if (effects && effects.length > 0) {
                for (const effect of effects) {
                  updateItemByEffect(effect, itemToUpdate);
                  logs[causality.id].effects.push({
                    name: effect?.name,
                    imageUrl: effect?.imageUrl,
                    action: effect.action,
                    effectId: effect.effectId,
                  });
                }
              }
            }
          }
        }
      }

      if (instigatorArray && instigatorArray.length > 0) {
        const triggeringItem = items.find((item) => {
          return item.id === instigatorArray[0][1].tokenId;
        }) as CausalityToken;
        if (triggeringItem) {
          for (const ieArr of instigatorArray) {
            const [cause, ie] = ieArr;
            updateItemByEffect(ie, triggeringItem);
            if (!logs[triggeringItem.id]) {
              logs[triggeringItem.id] = {
                causes: [],
                effects: [],
                logID: "",
              };
            }
            logs[triggeringItem.id].causes.push({
              name: cause?.name,
              imageUrl: cause?.imageUrl,
              trigger: cause?.trigger,
            });
            logs[triggeringItem.id].effects.push({
              name: ie?.name,
              imageUrl: ie?.imageUrl,
              action: ie.action,
              effectId: ie.effectId,
            });
          }
        }
      }
    },
  );

  Object.values(logs).forEach((log) => {
    log.logID = randomUUID();
  });

  OBR.broadcast.sendMessage(`${ID}/log`, logs);
};
