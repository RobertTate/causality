import OBR, { isImage } from "@owlbear-rodeo/sdk";
import { useEffect } from "react";
import ShortUniqueId from "short-unique-id";

import { ID } from "../../constants";
import type { CausalityToken } from "../../types";

const { randomUUID } = new ShortUniqueId({ length: 8 });

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
                {
                  key: [
                    "metadata",
                    "com.roberttate.causality",
                    "isCausalityToken",
                  ],
                  value: true,
                },
              ],
            },
          },
          {
            icon: "/icon.svg",
            label: "Add To Causality",
            filter: {
              every: [{ key: "type", value: "IMAGE" }],
            },
          },
        ],
        onClick: async (context) => {
          if (isImage(context?.items?.[0])) {
            await OBR.scene.items.updateItems(context?.items, (images) => {
              for (let image of images) {
                const selectedItem = image as CausalityToken;
                if (
                  selectedItem?.metadata?.[ID]?.["isCausalityToken"] === true
                ) {
                  selectedItem.metadata[ID]["isCausalityToken"] = false;
                } else {
                  selectedItem.metadata[ID] = {
                    isCausalityToken: true,
                    causalities: [],
                  };
                }
              }
            });
            await OBR.player.deselect();
            await OBR.action.open();
          }
        },
      });

      OBR.contextMenu.create({
        id: `${ID}/causality-trap-menu`,
        icons: [
          {
            icon: "/icon.svg",
            label: "Add Causality Trap",
            filter: {
              every: [
                { key: "type", value: "IMAGE" },
                {
                  key: [
                    "metadata",
                    "com.roberttate.causality",
                    "isCausalityToken",
                  ],
                  value: false,
                },
              ],
            },
          },
        ],
        onClick: async (context) => {
          if (isImage(context?.items?.[0])) {
            await OBR.scene.items.updateItems(context?.items, (images) => {
              for (let image of images) {
                const selectedItem = image as CausalityToken;
                if (selectedItem.visible === true) {
                  selectedItem.visible = false;
                }
                const uniqueKey = randomUUID();
                selectedItem.metadata[ID] = {
                  isCausalityToken: true,
                  causalities: [
                    {
                      id: uniqueKey,
                      timestamp: new Date().toISOString(),
                      cause: {
                        status: "Pending",
                        delay: "0",
                        isCollided: false,
                        tokenId: selectedItem.id,
                        causalityId: uniqueKey,
                        name: selectedItem.name,
                        label: selectedItem.text?.plainText,
                        imageUrl: selectedItem.image.url,
                        trigger: "collision",
                      },
                      effects: [
                        {
                          tokenId: selectedItem.id,
                          causalityId: uniqueKey,
                          name: selectedItem.name,
                          label: selectedItem.text?.plainText,
                          imageUrl: selectedItem.image.url,
                          effectId: randomUUID(),
                          action: "appear",
                        },
                      ],
                    },
                  ],
                };
              }
            });
            await OBR.player.deselect();
            await OBR.action.open();
          }
        },
      });
    };

    OBR.onReady(() => {
      setupContextMenu();
    });
  }, []);
};
