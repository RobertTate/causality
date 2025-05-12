import OBR, { isImage, type Item, type InteractionManager, type ToolMode } from "@owlbear-rodeo/sdk";
import { useEffect } from "react";
import { ID } from "../../constants";

export const useCausalityPointer = () => {
  useEffect(() => {
    OBR.onReady(() => {
      let interaction: InteractionManager<Item> | string = "";
      let isUsingOnToolDragMove = false;

      const causalTrackingMode: ToolMode = {
        id: `${ID}/tracking-mode`,
        icons: [
          {
            icon: "/loader.svg",
            label: "Checking For Effects...",
            filter: {
              activeTools: ["rodeo.owlbear.tool/move"],
            },
          },
        ],
        cursors: [
          {
            cursor: "grabbing",
            filter: {
              target: [
                { key: "locked", value: true, operator: "!=" },
                { key: "image", value: undefined, operator: "!=" },
              ],
            },
          },
        ],
        async onToolDragMove(_, ev) {
          isUsingOnToolDragMove = true;
          if (interaction) {
            if (typeof interaction !== "string") {
              const [update] = interaction;
              update((item) => {
                item.position = ev.pointerPosition;
              });
            }
          }
        },
        async onToolMove(_, ev) {
          if (interaction && !isUsingOnToolDragMove) {
            if (typeof interaction !== "string") {
              const [update] = interaction;
              update((item) => {
                item.position = ev.pointerPosition;
              });
            }
          }
        },
        async onToolDragCancel() {
          if (interaction && typeof interaction !== "string") {
            const [_, stop] = interaction;
            stop();
          }
          interaction = "";
          await OBR.tool.activateMode("rodeo.owlbear.tool/move", `${ID}/pointer-mode`);
          isUsingOnToolDragMove = false;
        },
        async onToolUp(_, ev) {
          if (interaction && typeof interaction !== "string") {
            const [update, stop] = interaction;
            const itemToUpdate = update((item) => {
              item.position = ev.pointerPosition;
            });

            await OBR.scene.items.updateItems(isImage, (items) => {
              for (let item of items) {
                if (item.id === itemToUpdate.id) {
                  item.position = itemToUpdate.position;
                }
              }
            })

            stop();
          }

          interaction = "";
          isUsingOnToolDragMove = false;

          await OBR.tool.activateMode("rodeo.owlbear.tool/move", `${ID}/pointer-mode`);
        },
        async onDeactivate() {
          await OBR.tool.removeMode(`${ID}/tracking-mode`);
        }
      }

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
        preventDrag: {
          dragging: true,
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
        async onToolDown(_, ev) {
          const item = ev.target
          if (item && isImage(item) && item.locked === false) {
            console.log(item);
            interaction = "starting";
            interaction = await OBR.interaction.startItemInteraction(item);
            await OBR.tool.createMode(causalTrackingMode);
            await OBR.tool.activateMode("rodeo.owlbear.tool/move", `${ID}/tracking-mode`);
          }
        },
      });
    });
  }, [])
}
