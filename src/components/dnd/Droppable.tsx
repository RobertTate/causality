import { useDroppable } from "@dnd-kit/core";
import { motion } from "motion/react";
import type { CSSProperties } from "react";

import { DROP_ZONE_ID } from "../../constants";
import type { DroppableProps } from "../../types";

export const Droppable = ({ children, id }: DroppableProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const causalityZoneStyles: CSSProperties = {
    border: isOver ? "1px solid white" : "1px solid #8447ff",
    borderRadius: "10px",
    transition: "border-color 0.5s ease",
    width: "100%",
    boxShadow: isOver
      ? "0px 0px 5px 0px rgb(255, 255, 255)"
      : "0px 0px 5px 0px rgba(0, 0, 0, 0.2)",
  };

  const causeAndEffectZoneStyles: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: "#7a7a7a",
    flex: 1,
    padding: "0.5rem",
    marginLeft: "0.5rem",
    borderRadius: "10px",
    boxShadow: isOver
      ? "0px 0px 5px 0px rgb(255, 255, 255)"
      : "3px 3px 2px 0px rgba(0, 0, 0, 0.2)",
    border: isOver ? "1px solid white" : "1px solid transparent",

    transition: "box-shadow 0.25s ease",
  };

  const style =
    id === DROP_ZONE_ID ? causalityZoneStyles : causeAndEffectZoneStyles;

  return (
    <motion.div
      style={style}
      ref={setNodeRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0 }}
      layout="position"
    >
      {children}
    </motion.div>
  );
};
