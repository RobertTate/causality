import OBR, {
  type InteractionManager,
  type Item,
  type Image,
  isImage,
} from "@owlbear-rodeo/sdk";
import { useEffect } from "react";

import { ID } from "../../constants";
import { CausalityToken } from "../../types";
import { getImageBoundingBox, intersect } from "../boundingBox";
import { useAppStore } from "./useAppStore";

export const useCausalityPointer = () => {
  const { collisionTokensRef } = useAppStore();

  let underwayCollisions: { [key: string]: boolean } = {};

  const checkForCollisions = (item: Image) => {
    const currentTarget = item as CausalityToken;
    const currentTargetID = item.id;
    if (currentTarget) {
      const tokensToCheck = collisionTokensRef.current;
      tokensToCheck.forEach((cToken) => {
        if (currentTarget.id !== cToken.id) {
          const tokenBeingDraggedBB = getImageBoundingBox(currentTarget);
          const tokenWithCollisionDetection = getImageBoundingBox(cToken);
          if (tokenBeingDraggedBB && tokenWithCollisionDetection) {
            const collisionHasOccured = intersect(
              tokenBeingDraggedBB,
              tokenWithCollisionDetection,
            );
            if (collisionHasOccured && !underwayCollisions[cToken.id]) {
              underwayCollisions[cToken.id] = true;
              OBR.scene.items.updateItems(
                (item) => {
                  return [cToken.id, currentTargetID].includes(item.id);
                },
                (items) => {
                  const itemToUpdate = items.find((item) => item.id === cToken.id) as CausalityToken;
                  const itemMetaData = itemToUpdate.metadata[ID];
                  const causalities = itemMetaData.causalities;
                  if (causalities && causalities.length > 0) {
                    for (let causality of causalities) {
                      const cause = causality.cause;
                      if (cause) {
                        if (cause.isCollided === false) {
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
      });
    }
  };

  useEffect(() => {
    let dragCount = 0;

    OBR.onReady(() => {
      let interaction: InteractionManager<Item> | string = "";
      OBR.tool.createMode({
        id: `${ID}/pointer-mode`,
        icons: [
          {
            icon: "/icon.svg",
            label: "Causality Move",
            filter: {
              activeTools: ["rodeo.owlbear.tool/move"],
            },
          },
        ],
        shortcut: "C",
        preventDrag: {
          dragging: true,
          target: [
            { key: ["locked"], value: true, coordinator: "||" },
            {
              key: ["metadata", "com.roberttate.causality", "isCausalityToken"],
              value: false,
              coordinator: "||",
            },
            {
              key: ["metadata", "com.roberttate.causality", "isCausalityToken"],
              value: undefined,
            },
          ],
        },
        cursors: [
          {
            cursor: "pointer",
            filter: {
              target: [
                { key: "locked", value: true, operator: "!=" },
                { key: "image", value: undefined, operator: "!=" },
              ],
            },
          },
          { cursor: "all-scroll" },
        ],
        async onToolDragStart(_, ev) {
          const item = ev.target;
          if (item && isImage(item) && item.locked === false) {
            interaction = "starting";
            interaction = await OBR.interaction.startItemInteraction(item);
          }
        },
        async onToolDragMove(_, ev) {
          if (interaction) {
            if (typeof interaction !== "string") {
              const [update, stop] = interaction;
              try {
                const itemToUpdate = update((item) => {
                  item.position = ev.pointerPosition;
                  checkForCollisions(item as Image);
                });
                dragCount++;
                if (dragCount % 20 === 0) {
                  await OBR.scene.items.updateItems(
                    (item) => {
                      return item.id === itemToUpdate.id;
                    },
                    (items) => {
                      for (let item of items) {
                        if (item.id === itemToUpdate.id) {
                          item.position = itemToUpdate.position;
                        }
                      }
                    },
                  );
                }
              } catch (e) {
                console.warn(e);
                stop();
                interaction = "";
                underwayCollisions = {};
              }
            }
          }
        },
        async onToolDragEnd(_, ev) {
          if (interaction) {
            if (typeof interaction !== "string") {
              const [update, stop] = interaction;
              try {
                const itemToUpdate = update((item) => {
                  item.position = ev.pointerPosition;
                });
                await OBR.scene.items.updateItems(
                  (item) => {
                    return item.id === itemToUpdate.id;
                  },
                  (items) => {
                    for (let item of items) {
                      if (item.id === itemToUpdate.id) {
                        item.position = itemToUpdate.position;
                      }
                    }
                  },
                );
                stop();
                interaction = "";
                underwayCollisions = {};
              } catch (e) {
                stop();
                interaction = "";
                underwayCollisions = {}
              }
            }
          }
        },
      });
    });
  }, []);
};
