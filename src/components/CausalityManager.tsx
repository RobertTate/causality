import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import OBR from "@owlbear-rodeo/sdk";
import { useState } from "react";
import ShortUniqueId from "short-unique-id";

import { DROP_ZONE_ID, ID } from "../constants";
import type { CausalityToken } from "../types";
import { Causalities } from "./Causalities";
import { Token } from "./Token";
import { TokenPool } from "./TokenPool";

const { randomUUID } = new ShortUniqueId({ length: 8 });

export const CausalityManager = () => {
  const [activeToken, setActiveToken] = useState<CausalityToken | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    const currentToken = event.active.data.current?.token as CausalityToken;
    setActiveToken(currentToken);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const currentToken = event.active.data.current?.token as CausalityToken;
    if (event.over?.id === DROP_ZONE_ID) {
      // Token was dragged over the general causality area
      OBR.scene.items.updateItems(
        (item) => {
          return item.id === currentToken.id;
        },
        (items) => {
          const itemToUpdate = items[0] as CausalityToken;
          const uniqueKey = randomUUID();

          if (!itemToUpdate.metadata[ID].causalities) {
            itemToUpdate.metadata[ID].causalities = [];
          }

          itemToUpdate.metadata[ID].causalities.unshift({
            id: uniqueKey,
            timestamp: new Date().toISOString(),
            cause: {
              status: "Pending",
              delay: "0",
              isCollided: false,
              tokenId: itemToUpdate.id,
              causalityId: uniqueKey,
              name: itemToUpdate.name,
              label: itemToUpdate.text?.plainText,
              imageUrl: itemToUpdate.image.url,
              trigger: "",
            },
          });
        },
      );
    } else if (event.over?.id) {
      // Token was dragged into an effect token area
      const causalityId = event.over.id as string;
      OBR.scene.items.updateItems(
        (item) => {
          return item.id === currentToken.id;
        },
        (items) => {
          const itemToUpdate = items[0] as CausalityToken;
          if (!itemToUpdate.metadata[ID].causalities) {
            itemToUpdate.metadata[ID].causalities = [];
          }

          const alreadyPresentCausality = itemToUpdate.metadata[
            ID
          ].causalities.find((causality) => {
            return causality.id === causalityId;
          });

          const uniqueKey = randomUUID();

          if (alreadyPresentCausality) {
            if (!alreadyPresentCausality.effects) {
              alreadyPresentCausality.effects = [];
            }
            alreadyPresentCausality.effects.push({
              tokenId: itemToUpdate.id,
              causalityId: alreadyPresentCausality.id,
              name: itemToUpdate.name,
              label: itemToUpdate.text?.plainText,
              imageUrl: itemToUpdate.image.url,
              effectId: uniqueKey,
              action: "",
            });
          } else {
            itemToUpdate.metadata[ID].causalities.push({
              id: causalityId,
              timestamp: new Date().toISOString(),
              effects: [
                {
                  tokenId: itemToUpdate.id,
                  causalityId: causalityId,
                  name: itemToUpdate.name,
                  label: itemToUpdate.text?.plainText,
                  imageUrl: itemToUpdate.image.url,
                  effectId: uniqueKey,
                  action: "",
                },
              ],
            });
          }
        },
      );
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <TokenPool />
      <Causalities />
      <DragOverlay>
        {activeToken && <Token isOverlay={true} token={activeToken} />}
      </DragOverlay>
    </DndContext>
  );
};
