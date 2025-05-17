import { motion } from "motion/react"
import type { EffectProps } from "../types";
import {
  handleRemoveEffect,
} from "../functions";
import styles from "./Effect.module.css";
import fire from "../assets/fire.svg";
import { useAppStore } from "../functions/hooks";
import { useEffect } from "react";

export const Effect = ({ cData, effect }: EffectProps) => {
  const { effectDialog, updateEffectDialog } = useAppStore();
  const { activeEffectId, open } = effectDialog;

  const isEditAllowed = cData.cause?.status === "Complete" ? false : true;

  useEffect(() => {
    if (activeEffectId === effect.effectId && open) {
      updateEffectDialog({
        open: true,
        cData,
        effect
      })
    }
  }, [cData, activeEffectId]);

  const handleShowEffectDialog = () => {
    updateEffectDialog({
      open: true,
      cData,
      effect,
      activeEffectId: effect.effectId
    })
  }

  return (
    <motion.div
      key={effect.effectId}
      className={styles["effect"]}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      layout="position"
    >
      <img onClick={() => handleRemoveEffect(cData.id, effect.tokenId, effect.effectId)} className={styles["effect-delete"]} src={fire} alt="Delete Causality" />

      <div className={styles["effect-info"]}>
        <img className={styles["effect-image"]} src={effect?.imageUrl} alt={effect?.name} />
        <div className={styles["effect-token-text-area"]}>
          <p className={styles["effect-name"]}>{effect?.name}</p>
          <p>{effect?.label}</p>
        </div>
      </div>

      {effect.action && (
        <p className={styles["effect-action-choice"]}>...will {effect.action}</p>
      )}

      <button
        className={styles["effect-edit"]}
        onClick={handleShowEffectDialog}
        disabled={isEditAllowed ? false : true}
        title={"Click here to edit how this token reacts"}
      >
        Edit
      </button>
    </motion.div>
  )
}
