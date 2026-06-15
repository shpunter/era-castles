import { createContext, useContext } from "react";

export type TabsSize = "sm" | "md";

export type TabsContextValue = {
  value: string;
  onChange: (value: string) => void;
  size: TabsSize;
};

export const TabsContext = createContext<TabsContextValue | null>(null);

export const useTabsContext = () => {
  const context = useContext(TabsContext);

  if (!context) {
    throw new Error("<Tab> must be used within <Tabs>");
  }

  return context;
};
