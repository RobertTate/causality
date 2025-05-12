import { CSSProperties } from "react";
import type { TokenProps } from "../types";
import styles from "./Token.module.css";

export const Token = ({ token, isOverlay=false }: TokenProps) => {

  const additionalStyles: CSSProperties = isOverlay ? {
    opacity: 0.5,
  } : {}

  return (
    <div style={additionalStyles} className={styles["token"]}>
      <img className={styles["token-image"]} src={token.image.url} alt={token.name} />
      <div className={styles["token-textarea"]}>
        <p className={styles["token-name"]}>{token?.name}</p>
        {token?.text?.plainText && (
          <p>{token?.text?.plainText}</p>
        )}
      </div>
    </div>
  )
}
