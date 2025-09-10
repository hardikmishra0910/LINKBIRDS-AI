import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  selectedLead: string | null;
  selectedCampaign: string | null;
  leadSheetOpen: boolean;
  searchQuery: string;
  leadStatusFilter: string;
  campaignStatusFilter: string;
}

interface AppActions {
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedLead: (leadId: string | null) => void;
  setSelectedCampaign: (campaignId: string | null) => void;
  setLeadSheetOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setLeadStatusFilter: (status: string) => void;
  setCampaignStatusFilter: (status: string) => void;
  resetFilters: () => void;
}

export const useAppStore = create<AppState & AppActions>((set) => ({
  // State
  sidebarOpen: true,
  selectedLead: null,
  selectedCampaign: null,
  leadSheetOpen: false,
  searchQuery: '',
  leadStatusFilter: 'all',
  campaignStatusFilter: 'all',

  // Actions
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSelectedLead: (leadId) => set({ selectedLead: leadId }),
  setSelectedCampaign: (campaignId) => set({ selectedCampaign: campaignId }),
  setLeadSheetOpen: (open) => set({ leadSheetOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setLeadStatusFilter: (status) => set({ leadStatusFilter: status }),
  setCampaignStatusFilter: (status) => set({ campaignStatusFilter: status }),
  resetFilters: () => set({ 
    searchQuery: '', 
    leadStatusFilter: 'all', 
    campaignStatusFilter: 'all' 
  }),
}));