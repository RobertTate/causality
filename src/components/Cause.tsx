import { motion } from "motion/react";

import fire from "../assets/fire.svg";
import { handleRemoveCause, updateCauseTokenData } from "../functions";
import { useAppStore } from "../functions/hooks";
import type { CauseProps, CauseTrigger, Cause as CauseType } from "../types";
import styles from "./Cause.module.css";
import { OperatorSwitch } from "./OperatorSwitch";

export const Cause = ({ cause, causality, index }: CauseProps) => {
  const { updateCollisionOptionsDialog } = useAppStore();

  const handleShowCollisionOptionsDialog = (cause: CauseType) => {
    updateCollisionOptionsDialog({
      open: true,
      cause,
    });
  };

  return (
    <>
      <motion.div
        key={cause.causeId}
        className={styles["cause"]}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25 }}
        layout
      >
        {index !== 0 && (
          <>
            <img
              onClick={() => {
                handleRemoveCause(causality.id, cause.tokenId, cause.causeId);
              }}
              className={styles["cause-delete"]}
              src={fire}
              alt="Delete Cause"
            />
            <OperatorSwitch cause={cause} />
          </>
        )}
        <motion.p layout className={styles["cause-when"]}>
          When:
        </motion.p>
        <motion.div layout className={styles["cause-info"]}>
          <motion.img
            layout
            className={styles["cause-image"]}
            src={cause?.imageUrl}
            alt={cause?.name}
          />
          <motion.p layout className={styles["cause-name"]}>
            {cause.name}
          </motion.p>
        </motion.div>
        <motion.div layout className={styles["cause-trigger-settings"]}>
          <motion.select
            layout
            onChange={(event) => {
              return updateCauseTokenData(
                causality.id,
                cause.tokenId,
                "trigger",
                event.target.value as CauseTrigger,
              );
            }}
            name="cause-triggers"
            value={cause.trigger || ""}
            disabled={cause?.status === "Complete" ? true : false}
          >
            <option value="">-- Please choose an option --</option>
            <option value="collision">Is Collided Into</option>
            <option value="covers">Is Covered</option>
            <option value="appears">Appears</option>
            <option value="disappears">Disappears</option>
          </motion.select>
          {["collision", "covers"].includes(cause.trigger) && (
            <div className={styles["collision-edit-area"]}>
              <button
                className={styles["collision-edit-buttton"]}
                onClick={() => handleShowCollisionOptionsDialog(cause)}
                title={
                  "Click here to assign a specific token to trigger the collision"
                }
                disabled={cause.status === "Complete" ? true : false}
              >
                By...
              </button>

              {cause.tokenToTriggerCollision?.name &&
              cause.tokenToTriggerCollision?.imageUrl ? (
                <p className={styles["collision-edit-area-token-text"]}>
                  <img
                    src={cause.tokenToTriggerCollision.imageUrl}
                    alt={cause.tokenToTriggerCollision.name}
                  />
                  {cause.tokenToTriggerCollision.name}
                  {cause.tokenToTriggerCollision.label
                    ? ` / ${cause.tokenToTriggerCollision.label}`
                    : ""}
                </p>
              ) : (
                <p>...any token</p>
              )}
            </div>
          )}
        </motion.div>
      </motion.div>
    </>
  );
};
