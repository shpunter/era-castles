import type { CSSProperties, HTMLAttributes, ReactNode } from "react";
import { useTooltipContext } from "../hook";
import styles from "./tooltipTrigger.module.css";

const TooltipTrigger = ({
  children,
  className,
  style,
  ...props
}: TriggerProps) => {
  const { onMouseEnter, onMouseLeave, anchorName } = useTooltipContext();

  return (
    <div
      className={`${styles.trigger} ${className ?? ""}`.trim()}
      // anchorName last so it can't be overridden by the caller's style
      style={{ ...style, anchorName } as AnchorStyle}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

export default TooltipTrigger;

export interface TriggerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

// `anchor-name` isn't in csstype yet; widen locally.
type AnchorStyle = CSSProperties & { anchorName?: string };
