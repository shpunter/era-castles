import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { classnames } from "#/shared/classnames";
import { useTabsContext } from "../context";
import css from "./tab.module.css";

const Tab = <T extends string>({
  value,
  children,
  className,
  indicator = false,
  ...props
}: TabProps<T>) => {
  const { value: activeValue, onChange, size } = useTabsContext();
  const isActive = value === activeValue;

  const classNames = classnames({
    [css.tab]: true,
    [css[size]]: true,
    [css.active]: isActive,
  });

  const onClick = () => onChange(value);

  return (
    <button
      {...props}
      type="button"
      role="tab"
      aria-selected={isActive}
      className={classNames}
      onClick={onClick}
    >
      <span className={css.label}>{children}</span>
      {indicator && <span className={css.indicator} data-testid="tab-indicator" />}
    </button>
  );
};

export default Tab;

type TabProps<T extends string> = ComponentPropsWithoutRef<"button"> & {
  value: T;
  children: ReactNode;
  /** shows a small yellow dot on the tab, e.g. to flag pending changes */
  indicator?: boolean;
};
