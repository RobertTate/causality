import { memo } from 'react';
import { Droppable } from "./dnd/Droppable"
import { AnimatePresence, motion } from "motion/react"
import styles from "./Causalities.module.css";
import { DROP_ZONE_ID, ID } from "../constants";
import { useAppStore } from "../functions/hooks";
import {
  handleRemoveCausality,
  handleResetCausality,
  handleRemoveEffect,
  updateCauseTokenData,
  updateEffectTokenData
} from "../functions";
import type { CausalityData, CauseTrigger, EffectAction } from "../types";
import { mergeWith, isArray } from "lodash";
import fire from "../assets/fire.svg";
import reset from "../assets/reset.svg";

export const Causalities = memo(() => {
  const { tokens } = useAppStore();

  const populateCausalities = () => {
    const causalities: { [id: string]: CausalityData } = {};

    tokens.forEach((token) => {
      const tokenCausalities = token.metadata[ID].causalities;

      if (tokenCausalities && tokenCausalities.length > 0) {
        tokenCausalities.forEach((tokenCausality) => {
          if (causalities[tokenCausality.id]) {
            causalities[tokenCausality.id] = mergeWith(causalities[tokenCausality.id], tokenCausality, (objValue, srcValue) => {
              if (isArray(objValue)) {
                return objValue.concat(srcValue);
              }
            });
          } else {
            causalities[tokenCausality.id] = tokenCausality;
          }
        })
      }
    })

    const causalityDataArray = Object.values(causalities);
    return causalityDataArray.length > 0 ? causalityDataArray.map((cData) => {
      const effectsIDSet = new Set();
      return (
        <motion.div
          key={cData.id}
          className={styles["causality"]}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.25 }}
          layout="position"
          data-status={cData.cause?.status}
        >
          <div className={styles["causality-title-area"]}>
            <p>Causes</p>
            <img title="Reset" onClick={() => handleResetCausality(cData)} className={styles["causality-reset"]} src={reset} alt="Reset Causality" />
            <p className={styles["causality-status"]}>Status: <span data-status={cData.cause?.status}>{cData.cause?.status}</span></p>
            <img title="Delete" onClick={() => handleRemoveCausality(cData)} className={styles["causality-delete"]} src={fire} alt="Delete Causality" />
            <p>Effects</p>
          </div>
          <div className={styles["causality-cause-effect-area"]}>
            {/* CAUSE TOKEN AREA */}
            {cData.cause && (
              <div className={styles["causality-cause"]}>
                <p className={styles["causality-cause-when"]}>When:</p>
                <div className={styles["causality-cause-info"]}>
                  <img className={styles["causality-cause-image"]} src={cData.cause?.imageUrl} alt={cData.cause?.name} />
                  <p className={styles["causality-cause-name"]}>{cData.cause.name}</p>
                </div>
                <div className={styles["causality-cause-trigger-settings"]}>
                  <select
                    onChange={(event) => {
                      if (cData.cause) {
                        return updateCauseTokenData(cData.id, cData.cause.tokenId, 'trigger', event.target.value as CauseTrigger)
                      }
                    }}
                    name="cause-triggers"
                    value={cData.cause.trigger || ""}
                    disabled={cData.cause?.status === "Complete" ? true : false}
                  >
                    <option value="">-- Please choose an option --</option>
                    <option value="collision">Is Collided With</option>
                    <option value="appears">Is Made Visible</option>
                    <option value="disappears">Is Made Hidden</option>
                  </select>
                </div>
              </div>
            )}
            {/* EFFECT TOKEN AREA */}
            <Droppable id={cData.id}>
              {cData.effects && cData.effects.length > 0 ? (
                <>
                  {cData.effects.map((effect) => {
                    if (!effectsIDSet.has(effect.effectId)) {
                      effectsIDSet.add(effect.effectId);
                      return (
                        <motion.div
                          key={effect.effectId}
                          className={styles["causality-effect"]}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.25 }}
                          layout="position"
                        >
                          <img onClick={() => handleRemoveEffect(cData.id, effect.tokenId, effect.effectId)} className={styles["causality-effect-delete"]} src={fire} alt="Delete Causality" />
                          <div className={styles["causality-effect-info"]}>
                            <img className={styles["causality-effect-image"]} src={effect?.imageUrl} alt={effect?.name} />
                            <p className={styles["causality-effect-name"]}>{effect?.name} <span>will:</span></p>
                          </div>
                          <div className={styles["causality-effect-action-settings"]}>
                            <select
                              name="effect-actions"
                              onChange={(event) => {
                                updateEffectTokenData(cData.id, effect.tokenId, effect.effectId, "action", event.target.value as EffectAction)
                              }}
                              value={effect.action || ""}
                              disabled={cData.cause?.status === "Complete" ? true : false}
                            >
                              <option value="">-- Please choose an option --</option>
                              <option value="lock">Lock</option>
                              <option value="unlock">Unlock</option>
                              <option value="appear">Appear</option>
                              <option value="disappear">Disappear</option>
                            </select>
                          </div>
                        </motion.div>
                      )
                    }
                  })}
                </>
              ) : (
                <motion.p
                  key="emptyEffectDisclaimer"
                  layout="position"
                >
                  <em>Drag tokens from your token pool here to add them as an "Effect" token.</em>
                </motion.p>
              )}
            </Droppable>
          </div>
        </motion.div>
      )
    })
      : (
        <motion.p
          key="emptyDisclaimer"
          layout="position"
          style={{
            maxWidth: "255px"
          }}
        >
          <em>
            Drag tokens here from your token pool to add them as a "Cause" token. When a "Cause" token meets a condition, "Effect" tokens are then updated.
          </em>
        </motion.p>
      )
  };

  return (
    <Droppable id={DROP_ZONE_ID}>
      <section className={styles["causalities-section"]}>
        <div className={styles["causalities-scroll-area"]}>
          <h2 className={styles["causalities-title"]}>Causalities</h2>
          <div className={styles["causalities-token-area"]}>
            <AnimatePresence>
              {populateCausalities()}
            </AnimatePresence>
          </div>
        </div>
      </section>
    </Droppable>
  )
});
