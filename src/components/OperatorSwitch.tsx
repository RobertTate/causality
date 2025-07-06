import { Switch } from "radix-ui";

import { updateCauseData } from "../functions";
import type { CauseOperator, OperatorSwitchProps } from "../types";
import styles from "./OperatorSwitch.module.css";

export const OperatorSwitch = ({ cause }: OperatorSwitchProps) => {
  const { operator } = cause;

  const handleOnSwitchChange = (checked: boolean) => {
    const newOperator: CauseOperator = checked ? "OR" : "AND";
    updateCauseData(cause.causalityId, cause.tokenId, "operator", newOperator);
  };

  return (
    <form>
      <div
        className={styles.OperatorSwitch}
        style={{ display: "flex", alignItems: "center" }}
      >
        <label
          className={styles.Label}
          htmlFor="and-operator"
          style={{
            paddingRight: 5,
            color: operator === "AND" ? "#3bf05c" : "white",
          }}
        >
          AND
        </label>
        <Switch.Root
          onCheckedChange={handleOnSwitchChange}
          checked={operator === "AND" ? false : true}
          className={styles.Root}
        >
          <Switch.Thumb className={styles.Thumb} />
        </Switch.Root>
        <label
          className={styles.Label}
          htmlFor="or-operator"
          style={{
            paddingLeft: 5,
            color: operator === "OR" ? "#3bf05c" : "white",
          }}
        >
          OR
        </label>
      </div>
    </form>
  );
};
