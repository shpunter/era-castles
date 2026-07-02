import { createContext, type RefObject, useContext } from "react";

export interface TooltipContextType {
  popoverRef: RefObject<HTMLDivElement | null>;
  /** unique anchor-positioning name linking this tooltip's trigger and content */
  anchorName: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

export const TooltipContext = createContext<TooltipContextType | null>(null);

export const useTooltipContext = () => {
  const context = useContext(TooltipContext);

  if (!context) {
    throw new Error(
      "Tooltip compound components must be rendered within the Tooltip parent component.",
    );
  }

  return context;
};
