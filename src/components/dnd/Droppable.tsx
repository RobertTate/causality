import { useDroppable } from "@dnd-kit/core";
import type { CSSProperties } from "react";
import { motion } from "motion/react";

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
  };

  const effectsZoneStyles: CSSProperties = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#696969",
    flex: 1,
    padding: "0.5rem",
    marginLeft: "0.5rem",
    borderRadius: "10px",
    boxShadow: isOver
      ? "3px 3px 2px 0px rgb(255, 255, 255)"
      : "3px 3px 2px 0px rgba(0, 0, 0, 0.2)",
    transition: "box-shadow 0.5s ease",
  };

  const style = id === DROP_ZONE_ID ? causalityZoneStyles : effectsZoneStyles;

  return (
    <motion.div
      style={style} 
      ref={setNodeRef}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.25 }}
      layout
    >
      {children}
    </motion.div>
  );
};
