import { createContext, type RefObject, useContext } from "react";

export interface PopoverContextType {
  popoverRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLDivElement | null>;
  /** unique anchor-positioning name linking this popover's trigger and content */
  anchorName: string;
  toggle: () => void;
  close: () => void;
}

export const PopoverContext = createContext<PopoverContextType | null>(null);

export const usePopoverContext = (): PopoverContextType => {
  const context = useContext(PopoverContext);

  if (!context) {
    throw new Error(
      "Popover compound components must be rendered within the Popover parent component.",
    );
  }

  return context;
};
