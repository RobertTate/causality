import { Dialog } from "radix-ui";

import close from "../assets/close.svg";
import { updateCauseTokenData } from "../functions";
import { useAppStore } from "../functions/hooks";
import styles from "./GlobalCollisionOptionsDialog.module.css";

export const GlobalCollisionOptionsDialog = () => {
  const { collisionOptionsDialog, updateCollisionOptionsDialog, tokens } =
    useAppStore();
  const { open, cause } = collisionOptionsDialog;

  const handleClose = () => {
    updateCollisionOptionsDialog({
      open: false,
    });
  };

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className={styles["dialog-overlay"]} />
        <Dialog.Content
          aria-describedby={undefined}
          className={styles["dialog-content"]}
        >
          {cause && (
            <p className={styles["dialog-pre"]}>
              When <img src={cause.imageUrl} alt={cause.name} />
              <strong>{cause.name}</strong> is collided into...
            </p>
          )}

          <Dialog.Title className={styles["dialog-title"]}>
            <div className={styles["dialog-info"]}>
              <p className={styles["dialog-name"]}>By...</p>
            </div>
          </Dialog.Title>

          <div className={styles["dialog-effect-action-settings"]}>
            {tokens && (
              <select
                name="dialog-effect-actions"
                onChange={(event) => {
                  if (cause) {
                    updateCauseTokenData(
                      cause.causalityId,
                      cause.tokenId,
                      "tokenToTriggerCollision",
                      {
                        name: event.target.selectedOptions[0].dataset
                          .name as string,
                        label: event.target.selectedOptions[0].dataset
                          .label as string,
                        id: event.target.value,
                        imageUrl: event.target.selectedOptions[0].dataset
                          .img as string,
                      },
                    );
                    updateCollisionOptionsDialog({
                      open: true,
                      cause: {
                        ...cause,
                        tokenToTriggerCollision: {
                          name: event.target.selectedOptions[0].dataset
                            .name as string,
                          label: event.target.selectedOptions[0].dataset
                            .label as string,
                          id: event.target.value,
                          imageUrl: event.target.selectedOptions[0].dataset
                            .img as string,
                        },
                      },
                    });
                  }
                }}
                value={cause?.tokenToTriggerCollision?.id || ""}
              >
                <option value="">...any token</option>
                {tokens.map((token) => {
                  if (token.id !== cause?.tokenId) {
                    return (
                      <option
                        key={token.id}
                        data-name={token.name}
                        data-label={token.text.plainText}
                        data-img={token.image.url}
                        value={token.id}
                      >
                        ...{token.name}
                        {token.text?.plainText
                          ? ` / ${token.text.plainText}`
                          : ""}
                      </option>
                    );
                  }
                })}
              </select>
            )}
          </div>
          <button
            onClick={handleClose}
            className={styles["dialog-effect-confirm-button"]}
          >
            Confirm
          </button>
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
