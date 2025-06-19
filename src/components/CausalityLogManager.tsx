import OBR from "@owlbear-rodeo/sdk";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { ID } from "../constants";
import { CausalityLog } from "../types";
import styles from "./CausalityLogManager.module.css";

export const CausalityLogManager = () => {
  const [logs, setLogs] = useState<CausalityLog[]>([]);

  useEffect(() => {
    const handleLogBroadcast = () => {
      OBR.broadcast.onMessage(`${ID}/log`, (data) => {
        const newLogs = Object.values(data.data || []) as CausalityLog[];
        for (const log of newLogs) {
          const { effects } = log;
          if (effects && effects.length > 0) {
            setLogs((prev) => {
              return [log, ...prev];
            });
          }
        }
      });
    };

    OBR.onReady(() => {
      handleLogBroadcast();
    });
  }, []);

  const actionMap = {
    lock: "locked",
    unlock: "unlocked",
    appear: "appeared",
    disappear: "disappeared",
    broadcast: "broadcasted",
    default: "triggerred",
  };

  return (
    <section className={styles["log-section"]}>
      <div className={styles["log-scroll-area"]}>
        <h2 className={styles["log-title"]}>Log</h2>
        <div className={styles["log-area"]}>
          <AnimatePresence>
            {logs && logs.length > 0 ? (
              <>
                {logs.map((log) => {
                  const { effects, logID } = log;
                  return effects.map((effect) => (
                    <motion.p
                      layout="position"
                      className={styles["log-content"]}
                      key={`${logID}-${effect.effectId}`}
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      exit={{ y: 10 }}
                      transition={{ duration: 0.25 }}
                    >
                      <img
                        className={styles["log-content-effect-img"]}
                        src={effect.imageUrl}
                        alt={effect.name}
                      />{" "}
                      <strong>{effect.name}</strong>&nbsp;
                      <em>{actionMap[effect.action || "default"]}</em>.&nbsp;
                    </motion.p>
                  ));
                })}
              </>
            ) : (
              <p>uhh.....something will show up here eventually."</p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
