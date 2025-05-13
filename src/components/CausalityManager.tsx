import { useState } from 'react';
import OBR from '@owlbear-rodeo/sdk';
import { DndContext, DragOverlay, type DragStartEvent, type DragEndEvent } from '@dnd-kit/core';
import type { CausalityToken } from "../types";
import { TokenPool } from "./TokenPool";
import { Token } from './Token';
import { Causalities } from './Causalities';
import { ID, DROP_ZONE_ID } from '../constants';
import ShortUniqueId from "short-unique-id";

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
      OBR.scene.items.updateItems(((item) => {
        return item.id === currentToken.id;
      }), (items) => {
        const itemToUpdate = items[0] as CausalityToken;
        const uniqueKey = randomUUID();

        if (!itemToUpdate.metadata[ID].causalities) {
          itemToUpdate.metadata[ID].causalities = [];
        };

        itemToUpdate.metadata[ID].causalities.push({
          id: uniqueKey,
          cause: {
            status: "Pending",
            tokenId: itemToUpdate.id,
            causalityId: uniqueKey,
            name: itemToUpdate.name,
            label: itemToUpdate.text?.plainText,
            imageUrl: itemToUpdate.image.url,
            trigger: "",
          }
        })
      });
    } else if (event.over?.id) {
      // Token was dragged into an effect token area
      const causalityId = event.over.id as string;
      OBR.scene.items.updateItems(((item) => {
        return item.id === currentToken.id;
      }), (items) => {
        const itemToUpdate = items[0] as CausalityToken;
        if (!itemToUpdate.metadata[ID].causalities) {
          itemToUpdate.metadata[ID].causalities = [];
        };

        const alreadyPresentCausality = itemToUpdate.metadata[ID].causalities.find((cData) => {
          return cData.id === causalityId;
        })

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
          })
        } else {
          itemToUpdate.metadata[ID].causalities.push({
            id: causalityId,
            effects: [{
              tokenId: itemToUpdate.id,
              causalityId: causalityId,
              name: itemToUpdate.name,
              label: itemToUpdate.text?.plainText,
              imageUrl: itemToUpdate.image.url,
              effectId: uniqueKey,
              action: "",
            }]
          })
        }
      })
    }
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <TokenPool />
      <Causalities />
      <DragOverlay>
        {activeToken && (
          <Token isOverlay={true} token={activeToken} />
        )}
      </DragOverlay>
    </DndContext>
  )
}
