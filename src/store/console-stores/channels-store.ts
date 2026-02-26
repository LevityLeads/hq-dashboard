import { create } from "zustand";
import type { ChannelInfo } from "@/gateway/adapter-types";
import { getAdapter } from "@/gateway/adapter-provider";

interface ChannelsStoreState {
  channels: ChannelInfo[];
  isLoading: boolean;
  error: string | null;

  fetchChannels: () => Promise<void>;
}

export const useChannelsStore = create<ChannelsStoreState>((set) => ({
  channels: [],
  isLoading: false,
  error: null,

  fetchChannels: async () => {
    set({ isLoading: true, error: null });
    try {
      const channels = await getAdapter().channelsStatus();
      set({ channels, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },
}));
