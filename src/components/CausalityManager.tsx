import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
} from "@dnd-kit/core";
import OBR from "@owlbear-rodeo/sdk";
import { useState } from "react";
import ShortUniqueId from "short-unique-id";

import reset from "../assets/reset.svg";
import { DROP_ZONE_ID, ID } from "../constants";
import { resetAllCausalities } from "../functions";
import { useAppStore } from "../functions/hooks";
import type { CausalityToken } from "../types";
import { Causalities } from "./Causalities";
import styles from "./CausalityManager.module.css";
import { Token } from "./Token";
import { TokenPool } from "./TokenPool";

const { randomUUID } = new ShortUniqueId({ length: 8 });

const MIN_PANE = 0;

export const CausalityManager = () => {
  const { causalities } = useAppStore();
  const [topH, setTopH] = useState(150);
  const [bottomH, setBotH] = useState(280);

  const startResize = (e: React.PointerEvent<HTMLDivElement>) => {
    // capture starting geometry
    const startY = e.clientY;
    const startTop = topH;
    const startBot = bottomH;

    const onMove = (ev: PointerEvent) => {
      const delta = ev.clientY - startY;
      let newTop = startTop + delta;
      let newBot = startBot - delta;

      // clamp so neither pane disappears
      if (newTop < MIN_PANE) {
        newTop = MIN_PANE;
        newBot = startTop + startBot - newTop;
      }
      if (newBot < MIN_PANE) {
        newBot = MIN_PANE;
        newTop = startTop + startBot - newBot;
      }

      setTopH(newTop);
      setBotH(newBot);
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

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
          const uniqueCausalityId = randomUUID();
          const uniqueCauseId = randomUUID();

          if (!itemToUpdate.metadata[ID].causalities) {
            itemToUpdate.metadata[ID].causalities = [];
          }

          const timestamp = new Date().toISOString();

          itemToUpdate.metadata[ID].causalities.unshift({
            id: uniqueCausalityId,
            name: uniqueCausalityId,
            causalityIdsToReset: [],
            tokenId: itemToUpdate.id,
            delay: "0",
            timestamp,
            causes: [
              {
                status: "Pending",
                isCollided: false,
                tokenId: itemToUpdate.id,
                causalityId: uniqueCausalityId,
                name: itemToUpdate.name,
                label: itemToUpdate.text?.plainText,
                imageUrl: itemToUpdate.image.url,
                trigger: "",
                causeId: uniqueCauseId,
                timestamp,
              },
            ],
          });
        },
      );
    } else if (((event.over?.id as string) || "").includes("effects")) {
      // Token was dragged into an effect token area
      const [causalityId, causalityName, delay] = (
        event.over?.id as string
      ).split("-");
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
              name: causalityName,
              delay: delay,
              tokenId: itemToUpdate.id,
              causalityIdsToReset: [],
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
    } else if (((event.over?.id as string) || "").includes("causes")) {
      const [causalityId, causalityName, delay] = (
        event.over?.id as string
      ).split("-");
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

          const timestamp = new Date().toISOString();
          const uniqueCauseId = randomUUID();

          if (alreadyPresentCausality) {
            if (!alreadyPresentCausality.causes) {
              alreadyPresentCausality.causes = [];
            }
            alreadyPresentCausality.causes.push({
              status: "Pending",
              isCollided: false,
              tokenId: itemToUpdate.id,
              causalityId: alreadyPresentCausality.id,
              name: itemToUpdate.name,
              label: itemToUpdate.text?.plainText,
              imageUrl: itemToUpdate.image.url,
              trigger: "",
              causeId: uniqueCauseId,
              timestamp,
              operator: "AND",
            });
          } else {
            itemToUpdate.metadata[ID].causalities.push({
              id: causalityId,
              name: causalityName,
              tokenId: itemToUpdate.id,
              delay: delay,
              causalityIdsToReset: [],
              timestamp,
              causes: [
                {
                  status: "Pending",
                  isCollided: false,
                  tokenId: itemToUpdate.id,
                  causalityId: causalityId,
                  name: itemToUpdate.name,
                  label: itemToUpdate.text?.plainText,
                  imageUrl: itemToUpdate.image.url,
                  trigger: "",
                  causeId: uniqueCauseId,
                  timestamp,
                  operator: "AND",
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
      <TokenPool height={topH} />
      <div
        className={styles["causality-manager-resize"]}
        onPointerDown={startResize}
        style={{
          height: "8px",
          borderRadius: "9999px",
          width: "60px",
          margin: "auto",
          cursor: "row-resize",
          background: "white",
          transform: "translateY(-15px)",
        }}
      />
      <p className={styles["causality-manager-causalities-title"]}>
        Causalities
      </p>
      {causalities.length > 0 && (
        <img
          title="Reset All Causalities"
          onClick={resetAllCausalities}
          className={styles["causality-manager-reset-all"]}
          src={reset}
          alt="Reset All Causalities"
        />
      )}
      <Causalities causalities={causalities} height={bottomH} />
      <DragOverlay>
        {activeToken && <Token isOverlay={true} token={activeToken} />}
      </DragOverlay>
    </DndContext>
  );
};
