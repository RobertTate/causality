import { useAppStore } from "../functions/hooks";
import { Token } from "./Token";
import styles from "./TokenPool.module.css";
import { Draggable } from "./dnd/Draggable";

export const TokenPool = () => {
  const { tokens } = useAppStore();

  const populateTokenPool = () => {
    if (tokens.length === 0) {
      return (
        <p>
          <em>
            Right click a token on the map and select "Add To Causality" to add
            it to your token pool.
          </em>
        </p>
      );
    }

    return tokens.map((token) => (
      <Draggable key={token.id} id={token.id} token={token}>
        <Token token={token} />
      </Draggable>
    ));
  };

  return (
    <section className={styles["tokenpool-section"]}>
      <div className={styles["tokenpool-scroll-area"]}>
        <h2 className={styles["tokenpool-title"]}>Token Pool</h2>
        <div className={styles["tokenpool-token-area"]}>
          {populateTokenPool()}
        </div>
      </div>
    </section>
  );
};
