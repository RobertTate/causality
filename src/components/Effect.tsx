import { motion } from "motion/react";
import { useEffect } from "react";

import fire from "../assets/fire.svg";
import { handleRemoveEffect, updateCauseTokenData } from "../functions";
import { useAppStore } from "../functions/hooks";
import type { EffectProps } from "../types";
import styles from "./Effect.module.css";

export const Effect = ({ causality, effect, instigatorEffects }: EffectProps) => {
  const { effectDialog, updateEffectDialog } = useAppStore();
  const { activeEffectId, open } = effectDialog;
  const cause = causality.cause;
  const isEditAllowed = causality.cause?.status === "Complete" ? false : true;

  useEffect(() => {
    if (activeEffectId === effect.effectId && open) {
      updateEffectDialog({
        open: true,
        causality,
        effect,
      });
    }
  }, [causality, activeEffectId]);

  const handleShowEffectDialog = () => {
    updateEffectDialog({
      open: true,
      causality,
      effect,
      activeEffectId: effect.effectId,
    });
  };

  return (
    <motion.div
      key={effect.effectId}
      className={styles["effect"]}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      layout="preserve-aspect"
    >
      <img
        onClick={() => {
          if ("isInstigator" in effect && effect.isInstigator && cause) {
            const newInstigatorEffects = instigatorEffects.filter((ie) => {
              return ie.effectId !== effect.effectId;
            });
            updateCauseTokenData(
              causality.id,
              cause.tokenId,
              "instigatorEffects",
              newInstigatorEffects
            );
          } else {
            handleRemoveEffect(causality.id, effect.tokenId, effect.effectId)
          }
        }}
        className={styles["effect-delete"]}
        src={fire}
        alt="Delete Causality"
      />

      <div className={styles["effect-info"]}>
        <img
          className={styles["effect-image"]}
          src={effect?.imageUrl}
          alt={effect?.name}
        />
        <div className={styles["effect-token-text-area"]}>
          <p className={styles["effect-name"]}>{effect?.name}</p>
          <p>{effect?.label}</p>
        </div>
      </div>

      <p className={styles["effect-action-choice"]}>
        ...will {effect.action || "_______"}
      </p>

      <button
        className={styles["effect-edit"]}
        onClick={handleShowEffectDialog}
        disabled={isEditAllowed ? false : true}
        title={"Click here to edit how this token reacts"}
      >
        Edit
      </button>
    </motion.div>
  );
};
