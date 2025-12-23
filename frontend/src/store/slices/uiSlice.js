import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  sidebarOpen: false,
  theme: "light",
  loading: {
    global: false,
    page: false,
  },
  modals: {
    login: false,
    register: false,
    apply: false,
    profile: false,
  },
  alerts: [],
  searchHistory: JSON.parse(localStorage.getItem("searchHistory") || "[]"),
  trendingSearches: [
    "Software Development",
    "Data Science",
    "React Developer",
    "Machine Learning",
    "UI/UX Design",
  ],
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
    },
    setGlobalLoading: (state, action) => {
      state.loading.global = action.payload;
    },
    setPageLoading: (state, action) => {
      state.loading.page = action.payload;
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
    closeAllModals: (state) => {
      Object.keys(state.modals).forEach((key) => {
        state.modals[key] = false;
      });
    },
    addAlert: (state, action) => {
      const alert = {
        id: Date.now(),
        type: action.payload.type || "info",
        message: action.payload.message,
        duration: action.payload.duration || 5000,
      };
      state.alerts.push(alert);
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(
        (alert) => alert.id !== action.payload,
      );
    },
    clearAlerts: (state) => {
      state.alerts = [];
    },
    addToSearchHistory: (state, action) => {
      const query = action.payload.trim();
      if (query && !state.searchHistory.includes(query)) {
        state.searchHistory.unshift(query);
        state.searchHistory = state.searchHistory.slice(0, 10); // Keep only last 10 searches
        localStorage.setItem(
          "searchHistory",
          JSON.stringify(state.searchHistory),
        );
      }
    },
    clearSearchHistory: (state) => {
      state.searchHistory = [];
      localStorage.removeItem("searchHistory");
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setGlobalLoading,
  setPageLoading,
  openModal,
  closeModal,
  closeAllModals,
  addAlert,
  removeAlert,
  clearAlerts,
  addToSearchHistory,
  clearSearchHistory,
} = uiSlice.actions;

export default uiSlice.reducer;
