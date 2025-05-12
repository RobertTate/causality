import { useEffect } from "react";
import OBR, { isImage } from "@owlbear-rodeo/sdk";
import type { CausalityToken } from "../../types";
import { ID } from "../../constants";

export const useCausalityTokenSetterMenuContext = () => {
  useEffect(() => {
    const setupContextMenu = () => {
      OBR.contextMenu.create({
        id: `${ID}/causality-menu`,
        icons: [
          {
            icon: "/icon.svg",
            label: "Remove From Causality",
            filter: {
              every: [
                { key: "type", value: "IMAGE" },
                { key: ["metadata", "com.roberttate.causality", "isCausalityToken"], value: true}
              ],
            },
          },
          {
            icon: "/icon.svg",
            label: "Add To Causality",
            filter: {
              every: [
                { key: "type", value: "IMAGE" },
              ],
            },
          }
        ],
        onClick: async (context) => {
          if (isImage(context?.items?.[0])) {
            await OBR.scene.items.updateItems(context?.items, (images) => {
              for (let image of images) {
                const selectedItem = image as CausalityToken;
                if (selectedItem?.metadata?.[ID]?.["isCausalityToken"] === true) {
                  selectedItem.metadata[ID]["isCausalityToken"] = false;
                } else {
                  selectedItem.metadata[ID] = {
                    isCausalityToken: true
                  }
                }
              }
            })
            await OBR.player.deselect();
            await OBR.action.open();
          }
        },
      });
    }

    OBR.onReady(() => {
      setupContextMenu();
    });
  }, [])
}
