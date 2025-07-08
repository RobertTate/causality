import { AnimatePresence, motion } from "motion/react";
import { memo } from "react";
import ShortUniqueId from "short-unique-id";

import edit from "../assets/edit.svg";
import fire from "../assets/fire.svg";
import ok from "../assets/ok.svg";
import reset from "../assets/reset.svg";
import target from "../assets/target.svg";
import timer from "../assets/timer.svg";
import play from "../assets/play.svg";
import pause from "../assets/pause.svg";
import up from "../assets/up.svg";
import down from "../assets/down.svg";
import { DROP_ZONE_ID } from "../constants";
import {
  removeCausality,
  resetCausality,
  updateCausalityData,
  updateCauseData,
} from "../functions";
import { useAppStore } from "../functions/hooks";
import type { CausalitiesProps, CausalityStatus } from "../types";
import styles from "./Causalities.module.css";
import { Cause } from "./Cause";
import { Effect } from "./Effect";
import { Droppable } from "./dnd/Droppable";

const { randomUUID } = new ShortUniqueId({ length: 8 });

export const Causalities = memo(({ causalities, height }: CausalitiesProps) => {
  const { updateCausalityOnCompleteDialog } = useAppStore();

  const populateCausalities = () => {
    return causalities.length > 0 ? (
      causalities
        .sort((a, b) => {
          return new Date(a.timestamp) < new Date(b.timestamp) ? 1 : -1;
        })
        .map((causality) => {
          const effectsIDSet = new Set();
          const causes = (causality.causes || []).sort((a, b) =>
            new Date(a.timestamp) < new Date(b.timestamp) ? -1 : 1,
          );
          const instigatorEffects = (causes || []).flatMap(
            (cause) => cause.instigatorEffects || [],
          );
          const effects = causality.effects;
          const allEffects =
            instigatorEffects &&
              instigatorEffects.length > 0 &&
              causes?.some((cause) =>
                ["collision", "covers"].includes(cause.trigger),
              )
              ? [...(effects || []), ...instigatorEffects]
              : effects || [];

          const causalityStatus: CausalityStatus = causality.causes?.every(
            (cause) => cause.status === "Complete",
          )
            ? "Complete"
            : "Pending";

          return (
            <motion.div
              key={causality.id}
              className={styles["causality"]}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              layout
              data-status={causalityStatus}
            >
              <motion.div layout className={styles["causality-title-area"]}>
                <motion.p layout>Causes</motion.p>
                <motion.img
                  layout
                  title="Reset"
                  onClick={() => resetCausality(causality)}
                  className={styles["causality-reset"]}
                  src={reset}
                  alt="Reset Causality"
                />
                <motion.p layout className={styles["causality-status"]}>
                  Status:{" "}
                  <span data-status={causalityStatus}>{causalityStatus}</span>
                </motion.p>
                <motion.img
                  layout
                  title="Delete"
                  onClick={() => removeCausality(causality)}
                  className={styles["causality-delete"]}
                  src={fire}
                  alt="Delete Causality"
                />
                <motion.p layout>Effects</motion.p>
              </motion.div>
              <motion.div className={styles["causality-cause-effect-area"]}>
                {!causality.compact ? (
                  <>
                    {/* CAUSE TOKEN AREA */}
                    <Droppable
                      id={`${causality.id}-${causality.name}-${causality?.delay || causality?.causes?.[0]?.delay || "0"}-causes`}
                    >
                      <>
                        {causes &&
                          causes.length > 0 &&
                          causes.map((cause, index) => (
                            <Cause
                              cause={cause}
                              causality={causality}
                              key={cause.causeId}
                              index={index}
                            />
                          ))}
                      </>
                    </Droppable>
                    {/* EFFECT TOKEN AREA */}
                    <Droppable
                      id={`${causality.id}-${causality.name}-${causality?.delay || causality?.causes?.[0]?.delay || "0"}-effects`}
                    >
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
                        <motion.p
                          key="emptyEffectDisclaimer"
                          layout="position"
                          className={styles["causality-empty-effect-disclaimer"]}
                        >
                          <em>
                            Drag tokens here from your <strong>token pool</strong>{" "}
                            to add them as an "Effect".
                          </em>
                        </motion.p>
                      )}

                      <>
                        {causes?.some((cause) =>
                          ["collision", "covers"].includes(cause.trigger),
                        ) && (
                            <div>
                              <img
                                className={styles["causality-triggering-token-icon"]}
                                src={target}
                                alt="Triggering Token Icon"
                                title="Add an effect on whichever token triggers this collision or covering"
                                onClick={() => {
                                  return updateCauseData(
                                    causality.id,
                                    causes[0].tokenId,
                                    "instigatorEffects",
                                    [
                                      ...(causes[0].instigatorEffects || []),
                                      {
                                        name: "The Triggering Token",
                                        label: "",
                                        effectId: randomUUID(),
                                        imageUrl: target,
                                        action: "",
                                        isInstigator: true,
                                        causalityId: causality.id,
                                        // Set the tokenID to the first cause token, just until the collision occurs.
                                        // It will then be updated to the token id for the token that actually
                                        // instigated a collision.
                                        tokenId: causes[0].tokenId,
                                      },
                                    ],
                                  );
                                }}
                              />
                              <p
                                className={styles["causality-triggering-token-text"]}
                              >
                                <em>&lt;– Add a Triggering Token Effect</em>
                              </p>
                            </div>
                          )}
                      </>
                    </Droppable>
                  </>
                ) : (
                  <hr className={styles["causality-divider"]} />
                )}
              </motion.div>
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
                        if (causes[0]) {
                          return updateCausalityData(
                            causality.id,
                            "delay",
                            event.target.value,
                          );
                        }
                      }}
                      value={causality.delay || causes?.[0]?.delay || "0"}
                      disabled={causalityStatus === "Complete" ? true : false}
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
                <div className={styles["causality-naming-zone"]}>
                  {!causality?.isEditNameModeOn && (
                    <>
                      <img
                        className={styles["causality-edit-name-icon"]}
                        src={edit}
                        alt="edit icon"
                        title="Edit Causality Name"
                        onClick={() => {
                          updateCausalityData(
                            causality.id,
                            "isEditNameModeOn",
                            true,
                          );
                        }}
                      />
                      <p className={styles["causality-naming-zone-text"]}>
                        {causality.name}
                      </p>
                    </>
                  )}
                  {causality?.isEditNameModeOn && (
                    <>
                      <img
                        className={styles["causality-edit-name-icon"]}
                        src={ok}
                        alt="accept icon"
                        title="Accept New Causality Name"
                        onClick={() => {
                          updateCausalityData(
                            causality.id,
                            "isEditNameModeOn",
                            false,
                          );
                        }}
                      />
                      <input
                        type="text"
                        className={styles["causality-naming-zone-input"]}
                        value={causality.name}
                        size={causality?.name?.length || 8}
                        onChange={(e) =>
                          updateCausalityData(
                            causality.id,
                            "name",
                            e.target.value,
                          )
                        }
                      />
                    </>
                  )}
                </div>
                {((causality.delay && causality.delay !== "0") || (causes?.[0]?.delay && causes[0].delay !== "0")) && (
                  <div className={styles["causality-on-complete-zone"]}>
                    <button
                      title="Reset other Causalities when this one completes"
                      className={styles["causality-on-complete-buttton"]}
                      style={{
                        boxShadow: `0px 0px 3px 1px ${causality.loopsArePaused ? '#f46767' : '#ae86ff'}`
                      }}
                      onClick={() => {
                        updateCausalityOnCompleteDialog({
                          open: true,
                          causalityId: causality.id,
                        });
                      }}
                    >
                      Loops
                    </button>
                    {causality.loopsArePaused ? (
                      <img
                        className={styles["causality-on-complete-play-pause"]}
                        src={play} alt="Play / Resume Loops"
                        title="Play / Resume Loops"
                        onClick={() =>
                          updateCausalityData(
                            causality.id,
                            "loopsArePaused",
                            false,
                          )
                        }
                      />
                    ) : (
                      <img
                        className={styles["causality-on-complete-play-pause"]}
                        src={pause}
                        alt="Pause Loops"
                        title="Pause Loops"
                        onClick={() =>
                          updateCausalityData(
                            causality.id,
                            "loopsArePaused",
                            true,
                          )
                        }
                      />
                    )}
                  </div>
                )}
                <img
                  className={styles["causality-compact-icon"]}
                  src={causality.compact ? down : up}
                  alt="accept icon"
                  title="Accept New Causality Name"
                  onClick={() => {
                    updateCausalityData(
                      causality.id,
                      "compact",
                      !causality.compact,
                    );
                  }}
                />
              </div>
            </motion.div>
          );
        })
    ) : (
      <motion.p
        key="emptyDisclaimer"
        layout="position"
        style={{
          maxWidth: "270px",
        }}
      >
        <em>
          Drag tokens here from your <strong>token pool</strong> to create a new
          "Causality", adding them as "Causes". When all "Cause" conditiona are
          met for a "Causalitty", its "Effects" are triggered.
        </em>
      </motion.p>
    );
  };

  return (
    <Droppable id={DROP_ZONE_ID}>
      <section className={styles["causalities-section"]}>
        <div
          style={{ height: height }}
          className={styles["causalities-scroll-area"]}
        >
          <div className={styles["causalities-token-area"]}>
            <AnimatePresence>{populateCausalities()}</AnimatePresence>
          </div>
        </div>
      </section>
    </Droppable>
  );
});
