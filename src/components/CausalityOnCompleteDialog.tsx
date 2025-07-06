import { Checkbox, Dialog } from "radix-ui";

import check from "../assets/check.svg";
import close from "../assets/close.svg";
import { updateCausalityData } from "../functions";
import { useAppStore } from "../functions/hooks";
import styles from "./CausalityOnCompleteDialog.module.css";

export const CausalityOnCompleteDialog = () => {
  const {
    causalityOnCompleteDialog,
    updateCausalityOnCompleteDialog,
    causalities,
  } = useAppStore();
  const { open, causalityId } = causalityOnCompleteDialog;

  const causalityUnderReview = causalities.find((c) => c.id === causalityId);
  const causalityIdsToReset = causalityUnderReview?.causalityIdsToReset || [];

  const handleClose = () => {
    updateCausalityOnCompleteDialog({
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
          <Dialog.Title className={styles["dialog-title"]}>
            When{" "}
            <span className={styles["dialog-title-causality-name"]}>
              &nbsp;{causalityUnderReview?.name}&nbsp;
            </span>{" "}
            completes,
          </Dialog.Title>
          <p className={styles["dialog-post"]}>
            <strong>The following Causalities will reset:</strong>
          </p>

          <div>
            {causalities.map((c) => {
              return (
                <div className={styles["dialog-checkbox-area"]} key={c.id}>
                  <Checkbox.Root
                    onCheckedChange={(checked) => {
                      if (!causalityUnderReview) return;
                      if (checked && !causalityIdsToReset.includes(c.id)) {
                        causalityId &&
                          updateCausalityData(
                            causalityId,
                            "causalityIdsToReset",
                            [c.id],
                            "add",
                          );
                      } else if (!checked) {
                        causalityId &&
                          updateCausalityData(
                            causalityId,
                            "causalityIdsToReset",
                            [c.id],
                            "remove",
                          );
                      }
                    }}
                    name="causalities to reset"
                    value={c.name}
                    className={styles["dialog-checkbox"]}
                    id={c.name}
                    checked={causalityIdsToReset.includes(c.id)}
                  >
                    <Checkbox.Indicator
                      className={styles["dialog-checkbox-indicator"]}
                    >
                      <img
                        width={25}
                        height={25}
                        src={check}
                        alt="Check Icon"
                      />
                    </Checkbox.Indicator>
                  </Checkbox.Root>
                  <label
                    className={styles["dialog-checkbox-label"]}
                    htmlFor={c.name}
                  >
                    {c.name}{" "}
                    <span style={{ fontSize: "14px" }}>
                      {c.id === causalityId ? "(itself)" : ""}
                    </span>
                  </label>
                </div>
              );
            })}
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
