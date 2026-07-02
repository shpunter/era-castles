import { type ReactNode, useId, useRef } from "react";
import { TooltipContext } from "./hook";
import TooltipContent, { type ContentProps } from "./content/TooltipContent";
import TooltipTrigger, { type TriggerProps } from "./trigger/TooltipTrigger";

const Tooltip = ({ children }: TooltipProps) => {
  const ref = useRef<HTMLDivElement>(null);
  // unique per instance so multiple tooltips don't share one anchor name
  const anchorName = `--tt-${useId().replace(/[^a-z0-9]/gi, "")}`;

  // showPopover/hidePopover throw if already in that state, so guard on
  // :popover-open
  const onMouseEnter = () => {
    const el = ref.current;
    if (el && !el.matches(":popover-open")) el.showPopover();
  };
  const onMouseLeave = () => {
    const el = ref.current;
    if (el?.matches(":popover-open")) el.hidePopover();
  };

  return (
    <TooltipContext.Provider
      value={{ popoverRef: ref, anchorName, onMouseEnter, onMouseLeave }}
    >
      {children}
    </TooltipContext.Provider>
  );
};

Tooltip.Trigger = TooltipTrigger;
Tooltip.Content = TooltipContent;

export default Tooltip;

interface TooltipProps {
  children: ReactNode;
}

export type { TriggerProps, ContentProps };
