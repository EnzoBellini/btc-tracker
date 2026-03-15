/**
 * Global UI state via Zustand.
 * Keeps transient UI state (sidebar collapsed, active filters, etc.)
 * out of React component trees.
 */
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface UIState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Trades page filter state
  tradesFilter: {
    status: string;
    direction: string;
    search: string;
  };
  setTradesFilter: (patch: Partial<UIState["tradesFilter"]>) => void;
  resetTradesFilter: () => void;
}

const defaultTradesFilter = { status: "all", direction: "all", search: "" };

export const useUIStore = create<UIState>()(
  immer((set) => ({
    sidebarCollapsed: false,
    toggleSidebar: () =>
      set((s) => {
        s.sidebarCollapsed = !s.sidebarCollapsed;
      }),

    tradesFilter: defaultTradesFilter,
    setTradesFilter: (patch) =>
      set((s) => {
        Object.assign(s.tradesFilter, patch);
      }),
    resetTradesFilter: () =>
      set((s) => {
        s.tradesFilter = defaultTradesFilter;
      }),
  }))
);
