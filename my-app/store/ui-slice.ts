import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { TaskPriority, TaskStatus } from "@/lib/types";

export type TaskTab = "assigned-to-me" | "assigned-by-me";

export interface TaskFilterState {
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  assignedBy: string | "ALL";
  search: string;
  sort: "newest" | "oldest" | "due-soon" | "priority";
}

interface UiState {
  sidebarOpen: boolean;
  commandOpen: boolean;
  activeTaskTab: TaskTab;
  taskFilters: TaskFilterState;
}

export const emptyTaskFilters: TaskFilterState = {
  status: "ALL",
  priority: "ALL",
  assignedBy: "ALL",
  search: "",
  sort: "newest",
};

const initialState: UiState = {
  sidebarOpen: false,
  commandOpen: false,
  activeTaskTab: "assigned-to-me",
  taskFilters: emptyTaskFilters,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setCommandOpen(state, action: PayloadAction<boolean>) {
      state.commandOpen = action.payload;
    },
    setActiveTaskTab(state, action: PayloadAction<TaskTab>) {
      state.activeTaskTab = action.payload;
      state.taskFilters = emptyTaskFilters;
    },
    setTaskFilter(
      state,
      action: PayloadAction<Partial<TaskFilterState>>,
    ) {
      state.taskFilters = { ...state.taskFilters, ...action.payload };
    },
    resetTaskFilters(state) {
      state.taskFilters = emptyTaskFilters;
    },
  },
});

export const {
  setSidebarOpen,
  toggleSidebar,
  setCommandOpen,
  setActiveTaskTab,
  setTaskFilter,
  resetTaskFilters,
} = uiSlice.actions;

export default uiSlice.reducer;
