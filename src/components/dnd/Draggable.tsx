import { useDraggable } from "@dnd-kit/core";
import React from "react";

import type { DraggableProps } from "../../types";

export const Draggable = ({ children, id, token }: DraggableProps) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { token },
  });

  const style: React.CSSProperties = {
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      {children}
    </div>
  );
};
