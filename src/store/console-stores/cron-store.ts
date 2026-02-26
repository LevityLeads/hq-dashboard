import { create } from "zustand";
import type { CronTask, CronTaskInput } from "@/gateway/adapter-types";
import { getAdapter } from "@/gateway/adapter-provider";

interface CronStoreState {
  tasks: CronTask[];
  isLoading: boolean;
  error: string | null;

  fetchTasks: () => Promise<void>;
  addTask: (input: CronTaskInput) => Promise<void>;
  updateTask: (id: string, patch: Partial<CronTaskInput>) => Promise<void>;
  removeTask: (id: string) => Promise<void>;
  runTask: (id: string) => Promise<void>;
}

export const useCronStore = create<CronStoreState>((set) => ({
  tasks: [],
  isLoading: false,
  error: null,

  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await getAdapter().cronList();
      set({ tasks, isLoading: false });
    } catch (err) {
      set({ error: String(err), isLoading: false });
    }
  },

  addTask: async (input) => {
    try {
      const task = await getAdapter().cronAdd(input);
      set((s) => ({ tasks: [...s.tasks, task] }));
    } catch (err) {
      set({ error: String(err) });
    }
  },

  updateTask: async (id, patch) => {
    try {
      const updated = await getAdapter().cronUpdate(id, patch);
      set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? updated : t)) }));
    } catch (err) {
      set({ error: String(err) });
    }
  },

  removeTask: async (id) => {
    try {
      await getAdapter().cronRemove(id);
      set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
    } catch (err) {
      set({ error: String(err) });
    }
  },

  runTask: async (id) => {
    try {
      await getAdapter().cronRun(id);
    } catch (err) {
      set({ error: String(err) });
    }
  },
}));
