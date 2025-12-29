import { create } from "zustand";
import { MobileService } from "@src/services/mobile.service";

type NotificationsState = {
  hasIssuedInvoice: boolean;
  loading: boolean;
  refreshNotifications: () => Promise<void>;
  setHasIssuedInvoice: (value: boolean) => void;
};

export const useNotificationsStore = create<NotificationsState>((set) => ({
  hasIssuedInvoice: false,
  loading: false,
  refreshNotifications: async () => {
    set({ loading: true });
    const result = await MobileService.getNotifications();
    if (result.success) {
      set({ hasIssuedInvoice: result.data.hasIssuedInvoice, loading: false });
      return;
    }
    set({ hasIssuedInvoice: false, loading: false });
  },
  setHasIssuedInvoice: (value) => set({ hasIssuedInvoice: value }),
}));
