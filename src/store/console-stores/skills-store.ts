import { create } from "zustand";
import type { SkillInfo } from "@/gateway/adapter-types";
import { getAdapter } from "@/gateway/adapter-provider";

interface SkillsStoreState {
  skills: SkillInfo[];
  isLoading: boolean;
  error: string | null;

  fetchSkills: () => Promise<void>;
}

export const useSkillsStore = create<SkillsStoreState>((set) => ({
  skills: [],
  isLoading: false,
  error: null,

  fetchSkills: async () => {
    set({ isLoading: true, error: null });
    try {
      const skills = await getAdapter().skillsStatus();
      set({ skills, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },
}));
