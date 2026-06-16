import { type ReactNode, useCallback, useId, useRef } from "react";
import { PopoverContext } from "./hook";
import PopoverTrigger from "./trigger/PopoverTrigger";
import PopoverContent from "./content/PopoverContent";

// Click-triggered popover built on the native Popover API (top layer), anchored
// to its trigger via CSS anchor positioning — same platform primitives as the
// Tooltip, but opened on click instead of hover.
//
// Why `manual` + our own dismissal (in PopoverContent) rather than an `auto` +
// `popovertarget` invoker, which would give Escape / outside-click for free:
// with a `popovertarget` button the open/close coordination intermittently
// fires the invoked content's click twice (verified 4/4 in e2e), and an `auto`
// popover toggled from JS light-dismisses on the same pointerdown that reopens
// it. Driving it manually keeps a single, predictable open/close.

const Popover = ({ children }: PopoverProps) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  // unique per instance so multiple popovers don't share an anchor name
  const anchorName = `--pop-${useId().replace(/[^a-z0-9]/gi, "")}`;

  const close = useCallback(() => {
    const el = popoverRef.current;
    if (el?.matches(":popover-open")) el.hidePopover();
  }, []);

  const toggle = useCallback(() => {
    const el = popoverRef.current;
    if (!el) return;
    if (el.matches(":popover-open")) el.hidePopover();
    else el.showPopover();
  }, []);

  return (
    <PopoverContext.Provider
      value={{ popoverRef, triggerRef, anchorName, toggle, close }}
    >
      {children}
    </PopoverContext.Provider>
  );
};

Popover.Trigger = PopoverTrigger;
Popover.Content = PopoverContent;

export default Popover;

interface PopoverProps {
  children: ReactNode;
}
