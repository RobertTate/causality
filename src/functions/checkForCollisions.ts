import OBR, { type Image } from "@owlbear-rodeo/sdk";

import { ID, underway } from "../constants";
import { CausalityToken, BoundingBoxObject } from "../types";
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
  const boundingBoxCurrentTargetObject: BoundingBoxObject = {
    grid: {
      dpi: currentTarget.grid.dpi,
      offset: {
        x: currentTarget.grid.offset.x,
        y: currentTarget.grid.offset.y,
      }
    },
    scale: {
      x: currentTarget.scale.x,
      y: currentTarget.scale.y,
    },
    rotation: currentTarget.rotation,
    image: {
      width: currentTarget.image.width,
      height: currentTarget.image.height,
    },
    position: {
      x: currentTarget.position.x,
      y: currentTarget.position.y,
    },
  }

  if (currentTarget) {
    for (const cToken of tokensToCheck) {
      if (currentTargetID !== cToken.id) {
        const tokenBeingDraggedBB = getImageBoundingBox(boundingBoxCurrentTargetObject);
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
                    const causes = (causality.causes || []).sort((a, b) => new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1);
                    for (const cause of causes) {
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
                          const instigatorEffects = causes[0].instigatorEffects;
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
                }
              },
            );
          }
        }
      }
    }
  }
};
