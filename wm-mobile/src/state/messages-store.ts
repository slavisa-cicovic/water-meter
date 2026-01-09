import { create } from "zustand";
import { MobileService } from "@src/services/mobile.service";

type MessagesState = {
  unreadCount: number;
  loading: boolean;
  refreshMessages: () => Promise<void>;
  setUnreadCount: (value: number) => void;
};

export const useMessagesStore = create<MessagesState>((set) => ({
  unreadCount: 0,
  loading: false,
  refreshMessages: async () => {
    set({ loading: true });
    const result = await MobileService.getMessages();
    if (result.success) {
      set({ unreadCount: result.data.unreadCount ?? 0, loading: false });
      return;
    }
    set({ loading: false });
  },
  setUnreadCount: (value) => set({ unreadCount: value }),
}));
