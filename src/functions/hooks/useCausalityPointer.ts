import OBR, {
  type Image,
  type InteractionManager,
  type Item,
  isImage,
} from "@owlbear-rodeo/sdk";
import { useEffect } from "react";

import { ID, underway } from "../../constants";
import { checkForCollisions } from "../checkForCollisions";
import { useAppStore } from "./useAppStore";

export const useCausalityPointer = () => {
  const { collisionTokensRef } = useAppStore();

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
                  checkForCollisions(item as Image, collisionTokensRef);
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
                underway.collisions = {};
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
                underway.collisions = {};
              } catch (e) {
                stop();
                interaction = "";
                underway.collisions = {};
              }
            }
          }
        },
      });
    });
  }, []);
};
