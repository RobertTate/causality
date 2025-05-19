import { isArray, mergeWith } from "lodash";
import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";

import fire from "../assets/fire.svg";
import reset from "../assets/reset.svg";
import timer from "../assets/timer.svg";
import target from "../assets/target.svg";
import { DROP_ZONE_ID, ID } from "../constants";
import {
  handleRemoveCausality,
  handleResetCausality,
  updateCauseTokenData,
} from "../functions";
import { useAppStore } from "../functions/hooks";
import type { Causality, CauseTrigger } from "../types";
import styles from "./Causalities.module.css";
import { Effect } from "./Effect";
import { Droppable } from "./dnd/Droppable";
import ShortUniqueId from "short-unique-id";

const { randomUUID } = new ShortUniqueId({ length: 8 });

export const Causalities = memo(() => {
  const { tokens } = useAppStore();

  const populateCausalities = () => {
    const causalities: { [id: string]: Causality } = {};

    tokens.forEach((token) => {
      const tokenCausalities = token.metadata[ID].causalities;

      if (tokenCausalities && tokenCausalities.length > 0) {
        tokenCausalities.forEach((tokenCausality) => {
          if (causalities[tokenCausality.id]) {
            causalities[tokenCausality.id] = mergeWith(
              causalities[tokenCausality.id],
              tokenCausality,
              (objValue, srcValue) => {
                if (isArray(objValue)) {
                  return objValue.concat(srcValue);
                }
              },
            );
          } else {
            causalities[tokenCausality.id] = tokenCausality;
          }
        });
      }
    });

    const causalityDataArray = Object.values(causalities);
    return causalityDataArray.length > 0 ? (
      causalityDataArray
        .sort((a, b) => {
          return new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1;
        })
        .map((causality) => {
          const effectsIDSet = new Set();
          const cause = causality.cause;
          const instigatorEffects = cause?.instigatorEffects;
          const effects = causality.effects;
          const allEffects = instigatorEffects && instigatorEffects.length > 0 && cause.trigger === "collision" ? [
            ...(effects || []),
            ...instigatorEffects
          ] : effects;

          return (
            <motion.div
              key={causality.id}
              className={styles["causality"]}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              layout="position"
              data-status={causality.cause?.status}
            >
              <div className={styles["causality-title-area"]}>
                <p>Causes</p>
                <img
                  title="Reset"
                  onClick={() => handleResetCausality(causality)}
                  className={styles["causality-reset"]}
                  src={reset}
                  alt="Reset Causality"
                />
                <p className={styles["causality-status"]}>
                  Status:{" "}
                  <span data-status={causality.cause?.status}>
                    {causality.cause?.status}
                  </span>
                </p>
                <img
                  title="Delete"
                  onClick={() => handleRemoveCausality(causality)}
                  className={styles["causality-delete"]}
                  src={fire}
                  alt="Delete Causality"
                />
                <p>Effects</p>
              </div>
              <div className={styles["causality-cause-effect-area"]}>
                {/* CAUSE TOKEN AREA */}
                {cause && (
                  <div className={styles["causality-cause"]}>
                    <p className={styles["causality-cause-when"]}>When:</p>
                    <div className={styles["causality-cause-info"]}>
                      <img
                        className={styles["causality-cause-image"]}
                        src={cause?.imageUrl}
                        alt={cause?.name}
                      />
                      <p className={styles["causality-cause-name"]}>
                        {cause.name}
                      </p>
                    </div>
                    <div className={styles["causality-cause-trigger-settings"]}>
                      <select
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
                        disabled={
                          cause?.status === "Complete" ? true : false
                        }
                      >
                        <option value="">-- Please choose an option --</option>
                        <option value="collision">Is Collided Into</option>
                        <option value="appears">Appears</option>
                        <option value="disappears">Disappears</option>
                      </select>
                    </div>
                  </div>
                )}
                {/* EFFECT TOKEN AREA */}
                <Droppable id={causality.id}>
                  {allEffects && allEffects.length > 0 ? (
                    <>
                      {allEffects.map((effect) => {
                        if (!effectsIDSet.has(effect.effectId)) {
                          effectsIDSet.add(effect.effectId);
                          return (
                            <Effect
                              key={effect.effectId}
                              causality={causality}
                              effect={effect}
                              instigatorEffects={instigatorEffects || []}
                            />
                          );
                        }
                      })}
                    </>
                  ) : (
                    <motion.p key="emptyEffectDisclaimer" layout="position" className={styles["causality-empty-effect-disclaimer"]}>
                      <em>
                        Drag tokens here from your <strong>token pool</strong> to add them as an "Effect".
                      </em>
                    </motion.p>
                  )}

                  <>
                    {cause?.trigger === "collision" && (
                      <div>
                        <img
                          className={styles["causality-triggering-token-icon"]}
                          src={target}
                          alt="Triggering Token Icon"
                          title="Add an effect on whichever token triggers this collision"
                          onClick={() => {
                            return updateCauseTokenData(
                              causality.id,
                              cause.tokenId,
                              "instigatorEffects",
                              [
                                ...(cause.instigatorEffects || []),
                                {
                                  name: "The Triggering Token",
                                  label: "",
                                  effectId: randomUUID(),
                                  imageUrl: target,
                                  action: "",
                                  isInstigator: true,
                                  causalityId: causality.id,
                                  // Set the tokenID to the cause token, just until the collision occurs.
                                  // It will then be updated to the token id for the token that actually
                                  // instigated a collision.
                                  tokenId: cause.tokenId
                                }
                              ]
                            );
                          }}
                        />
                        <p className={styles["causality-triggering-token-text"]} ><em>&lt;– Add a Triggering Token Effect</em></p>
                      </div>
                    )}
                  </>

                </Droppable>
              </div>
              <div className={styles["causality-footer-area"]}>
                <div className={styles["causality-time-delay"]}>
                  <img
                    className={styles["causality-time-delay-icon"]}
                    src={timer}
                    alt="time delay icon"
                  />
                  <label className={styles["causality-time-delay-selection"]}>
                    <select
                      name="time-delay"
                      title="Set a time delay"
                      onChange={(event) => {
                        if (causality.cause) {
                          return updateCauseTokenData(
                            causality.id,
                            causality.cause.tokenId,
                            "delay",
                            event.target.value as CauseTrigger,
                          );
                        }
                      }}
                      value={causality.cause?.delay}
                      disabled={
                        causality.cause?.status === "Complete" ? true : false
                      }
                    >
                      {[
                        ["0", "0s"],
                        ["500", "0.5s"],
                        ["1000", "1s"],
                        ["2000", "2s"],
                        ["3000", "3s"],
                        ["4000", "4s"],
                        ["5000", "5s"],
                      ].map((dItem) => {
                        const [delay, delayDisplay] = dItem;
                        return (
                          <option key={delay} value={delay}>
                            {delayDisplay}
                          </option>
                        );
                      })}
                    </select>
                  </label>
                </div>
              </div>
            </motion.div>
          );
        })
    ) : (
      <motion.p
        key="emptyDisclaimer"
        layout="position"
        style={{
          maxWidth: "355px",
        }}
      >
        <em>
          Drag tokens here from your <strong>token pool</strong> to create a new "Causality", adding them as the "Cause".
          When a "Cause" condition is met, each associated "Effect" is triggered.
        </em>
      </motion.p>
    );
  };

  return (
    <Droppable id={DROP_ZONE_ID}>
      <section className={styles["causalities-section"]}>
        <div className={styles["causalities-scroll-area"]}>
          <h2 className={styles["causalities-title"]}>Causalities</h2>
          <div className={styles["causalities-token-area"]}>
            <AnimatePresence>{populateCausalities()}</AnimatePresence>
          </div>
        </div>
      </section>
    </Droppable>
  );
});
