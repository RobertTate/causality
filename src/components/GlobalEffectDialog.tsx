import { Dialog } from "radix-ui";

import close from "../assets/close.svg";
import { updateEffectTokenData } from "../functions";
import { useAppStore } from "../functions/hooks";
import type { EffectAction } from "../types";
import { BroadcastInput } from "./BroadcastInput";
import styles from "./GlobalEffectDialog.module.css";

export const GlobalEffectDialog = () => {
  const { effectDialog, updateEffectDialog } = useAppStore();
  const { open, causality, effect } = effectDialog;

  const handleClose = () => {
    updateEffectDialog({
      open: false,
    });
  };

  const causeTriggerTextMap = {
    collision: "is collided into...",
    appears: "appears...",
    disappears: "disappears...",
    default: "does something...",
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles["dialog-overlay"]} />
        <Dialog.Content aria-describedby={undefined} className={styles["dialog-content"]}>
          {causality && (
            <p className={styles["dialog-pre"]}>
              When <img src={causality.cause?.imageUrl} alt={causality.cause?.name} />
              <strong>{causality.cause?.name}</strong>{" "}
              {causeTriggerTextMap[causality.cause?.trigger || "default"]}
            </p>
          )}

          <Dialog.Title className={styles["dialog-title"]}>
            <div className={styles["dialog-info"]}>
              <img
                className={styles["dialog-image"]}
                src={effect?.imageUrl}
                alt={effect?.name}
              />
              <div className={styles["dialog-token-text-area"]}>
                <p className={styles["dialog-name"]}>{effect?.name}</p>
                <p className={styles["dialog-label"]}>{effect?.label}</p>
              </div>
            </div>
          </Dialog.Title>
          <p className={styles["dialog-post"]}>
            <strong>will...</strong>
          </p>
          <div className={styles["dialog-effect-action-settings"]}>
            {causality && effect && (
              <select
                name="dialog-effect-actions"
                onChange={(event) => {
                  updateEffectTokenData(
                    causality.id,
                    effect.tokenId,
                    effect.effectId,
                    "action",
                    event.target.value as EffectAction,
                  );
                }}
                value={effect.action || ""}
                disabled={causality.cause?.status === "Complete" ? true : false}
              >
                <option value="">-- Please choose an option --</option>
                <option value="lock">Lock</option>
                <option value="unlock">Unlock</option>
                <option value="appear">Appear</option>
                <option value="disappear">Disappear</option>
                <option value="broadcast">Broadcast</option>
              </select>
            )}
          </div>

          {causality && effect?.action === "broadcast" && (
            <BroadcastInput causality={causality} effect={effect} />
          )}

          {effect?.action && (
            <button
              onClick={handleClose}
              className={styles["dialog-effect-confirm-button"]}
            >
              Confirm
            </button>
          )}

          <Dialog.Close asChild>
            <button
              onClick={handleClose}
              className={styles["dialog-close-button"]}
              aria-label="Close"
            >
              <img src={close} alt="Close Icon" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
