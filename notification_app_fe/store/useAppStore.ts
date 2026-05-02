import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type ReadMap = Record<string, boolean>;

type AppState = {
  token: string;
  readIds: ReadMap;
  setToken: (token: string) => void;
  markRead: (id: string) => void;
  markUnread: (id: string) => void;
  isRead: (id: string) => boolean;
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: "",
      readIds: {},
      setToken: (token) => set({ token: token.trim() }),
      markRead: (id) =>
        set((s) => ({
          readIds: { ...s.readIds, [id]: true },
        })),
      markUnread: (id) =>
        set((s) => {
          const next = { ...s.readIds };
          delete next[id];
          return { readIds: next };
        }),
      isRead: (id) => !!get().readIds[id],
    }),
    {
      name: "campus-notifications-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ token: s.token, readIds: s.readIds }),
    },
  ),
);
