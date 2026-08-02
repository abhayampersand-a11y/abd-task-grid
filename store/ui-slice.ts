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

/** Filters for the dashboard's all-tasks table. Kept separate from the
 *  per-group tab filters so switching screens doesn't clobber either. */
export interface BoardFilterState {
  status: TaskStatus | "ALL";
  priority: TaskPriority | "ALL";
  assigneeId: string | "ALL";
  assignedBy: string | "ALL";
  due: "ALL" | "overdue" | "today" | "week" | "none";
  search: string;
  page: number;
}

interface UiState {
  sidebarOpen: boolean;
  commandOpen: boolean;
  activeTaskTab: TaskTab;
  taskFilters: TaskFilterState;
  boardFilters: BoardFilterState;
}

export const emptyTaskFilters: TaskFilterState = {
  status: "ALL",
  priority: "ALL",
  assignedBy: "ALL",
  search: "",
  sort: "newest",
};

export const emptyBoardFilters: BoardFilterState = {
  status: "ALL",
  priority: "ALL",
  assigneeId: "ALL",
  assignedBy: "ALL",
  due: "ALL",
  search: "",
  page: 1,
};

const initialState: UiState = {
  sidebarOpen: false,
  commandOpen: false,
  activeTaskTab: "assigned-to-me",
  taskFilters: emptyTaskFilters,
  boardFilters: emptyBoardFilters,
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
    setBoardFilter(state, action: PayloadAction<Partial<BoardFilterState>>) {
      // Any filter change invalidates the current page.
      const resetPage = !("page" in action.payload);
      state.boardFilters = {
        ...state.boardFilters,
        ...action.payload,
        ...(resetPage ? { page: 1 } : {}),
      };
    },
    resetBoardFilters(state) {
      state.boardFilters = emptyBoardFilters;
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
  setBoardFilter,
  resetBoardFilters,
} = uiSlice.actions;

export default uiSlice.reducer;
