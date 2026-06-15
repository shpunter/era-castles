import {
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
  useEffect,
} from "react";
import { usePopoverContext } from "../hook";
import styles from "./popoverContent.module.css";

const PopoverContent = ({
  children,
  className,
  style,
  ...props
}: ContentProps) => {
  const { popoverRef, triggerRef, anchorName, close } = usePopoverContext();

  // Manual popover: the API does NOT light-dismiss, so close on an outside
  // pointerdown or Escape ourselves. Pointerdowns on the trigger are ignored —
  // its own onClick toggles — so a click there doesn't close-then-reopen.
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      const el = popoverRef.current;
      if (!el?.matches(":popover-open")) return;

      const target = e.target as Node;
      if (el.contains(target) || triggerRef.current?.contains(target)) return;

      close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [close, popoverRef, triggerRef]);

  return (
    <div
      ref={popoverRef}
      popover="manual"
      className={`${styles.content} ${className ?? ""}`.trim()}
      style={{ ...style, positionAnchor: anchorName } as AnchorStyle}
      {...props}
    >
      {typeof children === "function" ? children({ close }) : children}
    </div>
  );
};

export default PopoverContent;

export interface ContentProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  // render-prop form receives `close` so a selection can dismiss the popover
  children: ReactNode | ((api: { close: () => void }) => ReactNode);
}

// `position-anchor` isn't in csstype yet; widen locally.
type AnchorStyle = CSSProperties & { positionAnchor?: string };
