import { create } from "zustand";
import type { ChannelInfo, SkillInfo } from "@/gateway/adapter-types";
import { getAdapter } from "@/gateway/adapter-provider";

interface DashboardState {
  channelsSummary: ChannelInfo[];
  skillsSummary: SkillInfo[];
  uptime: number;
  isLoading: boolean;
  error: string | null;

  refresh: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  channelsSummary: [],
  skillsSummary: [],
  uptime: 0,
  isLoading: false,
  error: null,

  refresh: async () => {
    set({ isLoading: true, error: null });
    try {
      const adapter = getAdapter();
      const [channels, skills] = await Promise.all([
        adapter.channelsStatus(),
        adapter.skillsStatus(),
      ]);
      set({ channelsSummary: channels, skillsSummary: skills, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },
}));
