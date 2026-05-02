import { create } from "zustand";

type ToastState = {
  open: boolean;
  message: string;
  show: (message: string) => void;
  hide: () => void;
};

export const useToastStore = create<ToastState>((set) => ({
  open: false,
  message: "",
  show: (message) => set({ open: true, message }),
  hide: () => set({ open: false }),
}));
