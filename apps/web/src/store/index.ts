import { create } from 'zustand';

interface GlobalState {
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
}

export const useStore = create<GlobalState>((set) => ({
  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
}));