import { create } from 'zustand';
import { Task } from '../types/task';
import * as taskService from '../services/taskService';

interface TaskState {
  tasks: Task[];
  rangeStart: string | null;
  rangeEnd: string | null;
  loading: boolean;
  error: string | null;
  fetchTasksInRange: (start: string, end: string) => Promise<void>;
  createTask: (data: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, data: Partial<Task> & { updateScope?: string }) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  addTask: (task: Task) => void;
  removeTask: (id: string) => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  rangeStart: null,
  rangeEnd: null,
  loading: false,
  error: null,

  fetchTasksInRange: async (start, end) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.getTasksInRange(start, end);
      set({ tasks, rangeStart: start, rangeEnd: end, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  createTask: async (data) => {
    const task = await taskService.createTask(data);
    set((s) => ({ tasks: [...s.tasks, task] }));
    return task;
  },

  updateTask: async (id, data) => {
    const updated = await taskService.updateTask(id, data);
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === id ? updated : t)),
    }));
  },

  toggleComplete: async (id) => {
    const virtual = get().tasks.find((t) => t._id === id && t._virtual);
    if (virtual) {
      const materialized = await taskService.updateTask(virtual.recurringTemplateId as string, {
        updateScope: 'this',
        startTime: virtual.startTime,
        endTime: virtual.endTime,
      });
      const completed = await taskService.toggleTask(materialized._id);
      set((s) => ({
        tasks: s.tasks.map((t) => (t._id === id ? { ...completed, _virtual: false } : t)),
      }));
      return;
    }
    const updated = await taskService.toggleTask(id);
    set((s) => ({
      tasks: s.tasks.map((t) => (t._id === id ? updated : t)),
    }));
  },

  deleteTask: async (id) => {
    await taskService.deleteTask(id);
    set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) }));
  },

  addTask: (task) => set((s) => ({ tasks: [...s.tasks, task] })),
  removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t._id !== id) })),
}));
