import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type TopBarActions = {
  activeCategory?: string;
  onCategorySelect?: (category: string) => void;
  onInventoryClick?: () => void;
};

function actionsEqual(a: TopBarActions, b: TopBarActions): boolean {
  return (
    a.activeCategory === b.activeCategory &&
    a.onCategorySelect === b.onCategorySelect &&
    a.onInventoryClick === b.onInventoryClick
  );
}

const TopBarActionsContext = createContext<{
  actions: TopBarActions;
  setActions: Dispatch<SetStateAction<TopBarActions>>;
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
  const setActions = useContext(TopBarActionsContext)?.setActions;
  useEffect(() => {
    if (!setActions) return;
    setActions((previous) => (actionsEqual(previous, actions) ? previous : actions));
    return () => setActions((previous) => (actionsEqual(previous, {}) ? previous : {}));
  }, [
    setActions,
    actions.activeCategory,
    actions.onCategorySelect,
    actions.onInventoryClick,
  ]);
}

export function useTopBarActions(): TopBarActions {
  return useContext(TopBarActionsContext)?.actions ?? {};
}
