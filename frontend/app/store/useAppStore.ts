import { create } from 'zustand';

export interface SurveyCount {
  total_entries: number;
  complete_entries: number;
  terminate_entries: number;
  quota_full_entries: number;
  security_term_entries: number;
}

export interface Survey {
  _id: string;
  uid: string;
  pid: string;
  status: string;
  ipAddress: string;
  createdAt: string;
}

export type CategoryTab = "All" | "Complete" | "Terminate" | "Quota Full" | "Security Term";

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
  
  // Dashboard Data
  counts: SurveyCount | null;
  setCounts: (counts: SurveyCount | null) => void;
  surveys: Survey[];
  setSurveys: (surveys: Survey[]) => void;
  
  // UI State
  loading: boolean;
  setLoading: (loading: boolean) => void;
  dataLoading: boolean;
  setDataLoading: (loading: boolean) => void;
  
  // Pagination & Filters
  currentTab: CategoryTab;
  setCurrentTab: (tab: CategoryTab) => void;
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (isOpen) => set({ sidebarOpen: isOpen }),
  
  counts: null,
  setCounts: (counts) => set({ counts }),
  surveys: [],
  setSurveys: (surveys) => set({ surveys }),
  
  loading: true,
  setLoading: (loading) => set({ loading }),
  dataLoading: true,
  setDataLoading: (dataLoading) => set({ dataLoading }),
  
  currentTab: "All",
  setCurrentTab: (currentTab) => set({ currentTab }),
  page: 1,
  setPage: (page) => set({ page }),
  limit: 10,
  setLimit: (limit) => set({ limit }),
}));
