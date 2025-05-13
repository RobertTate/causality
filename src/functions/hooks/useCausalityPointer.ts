import OBR, { isImage, type Item, type InteractionManager } from "@owlbear-rodeo/sdk";
import { useEffect } from "react";
import { ID } from "../../constants";
import { CausalityToken } from "../../types";
import { useAppStore } from "./useAppStore";
import { getImageBoundingBox, intersect } from "../boundingBox";

export const useCausalityPointer = () => {
  const { collisionTokensRef } = useAppStore()

  const checkForCollisions = (item: Item) => {
    const currentTarget = item as CausalityToken;
    if (currentTarget) {
      const tokensToCheck = collisionTokensRef.current;
      tokensToCheck.forEach((cToken) => {
        if (currentTarget.id !== cToken.id) {
          const tokenBeingDraggedBB = getImageBoundingBox(currentTarget);
          const tokenWithCollisionDetection = getImageBoundingBox(cToken);
          if (tokenBeingDraggedBB && tokenWithCollisionDetection) {
            const collisionHasOccured = intersect(tokenBeingDraggedBB, tokenWithCollisionDetection);
            if (collisionHasOccured && cToken.isCollisionUpdateUnderway !== true) {
              cToken.isCollisionUpdateUnderway = true;
              OBR.scene.items.updateItems(((item) => {
                return item.id === cToken.id;
              }), (items) => {
                const itemToUpdate = items[0] as CausalityToken;
                const itemMetaData = itemToUpdate.metadata[ID];
                if (itemMetaData.isCollided === false) {
                  itemMetaData.isCollided = true;
                }
              })
            }
          }
        }
      })
    }
  }

  useEffect(() => {
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
            { key: ["metadata", "com.roberttate.causality", "isCausalityToken"], value: false, coordinator: "||" },
            { key: ["metadata", "com.roberttate.causality", "isCausalityToken"], value: undefined },
          ]
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
          const item = ev.target
          if (item && isImage(item) && item.locked === false) {
            interaction = "starting";
            interaction = await OBR.interaction.startItemInteraction(item);
          }
        },
        async onToolDragMove(_, ev) {
          if (interaction) {
            if (typeof interaction !== "string") {
              const [update] = interaction;
              update((item) => {
                item.position = ev.pointerPosition;
                checkForCollisions(item);
              });
            }
          }
        },
        async onToolDragEnd(_, ev) {
          if (interaction) {
            if (typeof interaction !== "string") {
              const [update, stop] = interaction;
              const itemToUpdate = update((item) => {
                item.position = ev.pointerPosition;
              });
              await OBR.scene.local.updateItems((item) => {
                return item.type === "LIGHT"
              }, (items) => {
                for (let item of items) {
                  item.visible = false;
                }
              });
              await OBR.scene.items.updateItems((item) => {
                return item.id === itemToUpdate.id;
              }, (items) => {
                for (let item of items) {
                  if (item.id === itemToUpdate.id) {
                    item.position = itemToUpdate.position;
                  }
                }
              });
              await OBR.scene.local.updateItems((item) => {
                return item.type === "LIGHT"
              }, (items) => {
                for (let item of items) {
                  item.visible = true;
                }
              });
              stop();
              interaction = "";
            }
          }
        },
      });
    });
  }, [])
}
