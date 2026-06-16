import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { usePopoverContext } from "../hook";
import styles from "./popoverTrigger.module.css";

const PopoverTrigger = ({
  children,
  className,
  style,
  ...props
}: TriggerProps) => {
  const { toggle, anchorName, triggerRef } = usePopoverContext();

  return (
    <div
      ref={triggerRef}
      className={`${styles.trigger} ${className ?? ""}`.trim()}
      // anchorName last so it can't be overridden by the caller's style
      style={{ ...style, anchorName } as AnchorStyle}
      onClick={toggle}
      {...props}
    >
      {children}
    </div>
  );
};

export default PopoverTrigger;

export interface TriggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// `anchor-name` isn't in csstype yet; widen locally.
type AnchorStyle = CSSProperties & { anchorName?: string };
