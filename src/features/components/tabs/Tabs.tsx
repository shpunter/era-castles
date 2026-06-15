import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { classnames } from "#/shared/classnames";
import { TabsContext, type TabsSize } from "./context";
import Tab from "./tab/Tab";
import css from "./tabs.module.css";

const Tabs = <T extends string>({
  value,
  onChange,
  size = "md",
  className,
  children,
  ...props
}: TabsProps<T>) => {
  const classNames = classnames({ [css.tabs]: true });

  return (
    <TabsContext.Provider
      value={{ value, onChange: onChange as (value: string) => void, size }}
    >
      <div className={classNames} role="tablist" {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
};

Tabs.Tab = Tab;

export default Tabs;
export { Tab };

type TabsProps<T extends string> = Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> & {
  value: T;
  onChange: (value: T) => void;
  size?: TabsSize;
  children: ReactNode;
};
