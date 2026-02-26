import { create } from 'zustand';
import { Project } from '../types/project';
import * as projectService from '../services/projectService';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  createProject: (data: Partial<Project>) => Promise<Project>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  addMember: (id: string, email: string) => Promise<void>;
  removeMember: (id: string, userId: string) => Promise<void>;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectService.getProjects();
      set({ projects, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  createProject: async (data) => {
    const project = await projectService.createProject(data);
    set((s) => ({ projects: [...s.projects, project] }));
    return project;
  },

  updateProject: async (id, data) => {
    const updated = await projectService.updateProject(id, data);
    set((s) => ({
      projects: s.projects.map((p) => (p._id === id ? updated : p)),
    }));
  },

  deleteProject: async (id) => {
    await projectService.deleteProject(id);
    set((s) => ({ projects: s.projects.filter((p) => p._id !== id) }));
  },

  addMember: async (id, email) => {
    const updated = await projectService.addMember(id, email);
    set((s) => ({
      projects: s.projects.map((p) => (p._id === id ? updated : p)),
    }));
  },

  removeMember: async (id, userId) => {
    const updated = await projectService.removeMember(id, userId);
    set((s) => ({
      projects: s.projects.map((p) => (p._id === id ? updated : p)),
    }));
  },
}));
