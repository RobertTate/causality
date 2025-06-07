import OBR, { type Image } from "@owlbear-rodeo/sdk";

import { ID, underway } from "../constants";
import { CausalityToken } from "../types";
import { getImageBoundingBox, intersect } from "./boundingBox";

export const hasCollisionOccured = (a: CausalityToken, b: CausalityToken) => {
  const aBoundingBox = getImageBoundingBox(a);
  const bBoundingBox = getImageBoundingBox(b);
  if (aBoundingBox && bBoundingBox) {
    return intersect(aBoundingBox, bBoundingBox);
  }
  return false;
};

export const checkForCollisions = async (
  item: Image,
  collisionTokensRef: React.RefObject<CausalityToken[]>,
) => {
  const currentTarget = item as CausalityToken;
  const currentTargetID = item.id;
  const tokensToCheck = collisionTokensRef.current;
  if (currentTarget) {
    for (const cToken of tokensToCheck) {
      if (currentTarget.id !== cToken.id) {
        const tokenBeingDraggedBB = getImageBoundingBox(currentTarget);
        const tokenWithCollisionDetection = getImageBoundingBox(cToken);
        if (tokenBeingDraggedBB && tokenWithCollisionDetection) {
          const collisionHasOccured = intersect(
            tokenBeingDraggedBB,
            tokenWithCollisionDetection,
          );
          if (collisionHasOccured && !underway.collisions[cToken.id]) {
            underway.collisions[cToken.id] = true;
            await OBR.scene.items.updateItems(
              (item) => {
                return [cToken.id].includes(item.id);
              },
              (items) => {
                const itemToUpdate = items.find(
                  (item) => item.id === cToken.id,
                ) as CausalityToken;
                const itemMetaData = itemToUpdate.metadata[ID];
                const causalities = itemMetaData.causalities;
                if (causalities && causalities.length > 0) {
                  for (let causality of causalities) {
                    const cause = causality.cause;
                    if (cause) {
                      if (cause.isCollided === false) {
                        // Check if there's a scope of only 1 specific token that should be triggering the collision.
                        if (
                          cause.tokenToTriggerCollision?.id &&
                          cause.tokenToTriggerCollision.id !== currentTargetID
                        ) {
                          return;
                        }
                        // Successful Collision!
                        cause.isCollided = true;
                        const instigatorEffects = cause.instigatorEffects;
                        if (instigatorEffects && instigatorEffects.length > 0) {
                          for (const ie of instigatorEffects) {
                            const oldTokenID = ie.tokenId;
                            ie.originalCauseTokenId = oldTokenID;
                            ie.tokenId = currentTargetID;
                          }
                        }
                      }
                    }
                  }
                }
              },
            );
          }
        }
      }
    }
  }
};
