import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type TopBarActions = {
  activeCategory?: string;
  onCategorySelect?: (category: string) => void;
  onInventoryClick?: () => void;
};

const TopBarActionsContext = createContext<{
  actions: TopBarActions;
  setActions: (actions: TopBarActions) => void;
} | null>(null);

export function TopBarActionsProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<TopBarActions>({});
  const value = useMemo(() => ({ actions, setActions }), [actions]);
  return (
    <TopBarActionsContext.Provider value={value}>
      {children}
    </TopBarActionsContext.Provider>
  );
}

export function useRegisterTopBarActions(actions: TopBarActions): void {
  const ctx = useContext(TopBarActionsContext);
  useEffect(() => {
    if (!ctx) return;
    ctx.setActions(actions);
    return () => ctx.setActions({});
  }, [
    ctx,
    actions.activeCategory,
    actions.onCategorySelect,
    actions.onInventoryClick,
  ]);
}

export function useTopBarActions(): TopBarActions {
  return useContext(TopBarActionsContext)?.actions ?? {};
}
