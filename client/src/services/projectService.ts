import api from './api';
import { Project } from '../types/project';

export const getProjects = () => api.get<Project[]>('/projects').then((r) => r.data);

export const getProject = (id: string) =>
  api.get<Project & { milestones: any[] }>(`/projects/${id}`).then((r) => r.data);

export const createProject = (data: Partial<Project>) =>
  api.post<Project>('/projects', data).then((r) => r.data);

export const updateProject = (id: string, data: Partial<Project>) =>
  api.put<Project>(`/projects/${id}`, data).then((r) => r.data);

export const deleteProject = (id: string) =>
  api.delete(`/projects/${id}`).then((r) => r.data);

export const addMember = (id: string, email: string) =>
  api.post<Project>(`/projects/${id}/members`, { email }).then((r) => r.data);

export const removeMember = (id: string, userId: string) =>
  api.delete<Project>(`/projects/${id}/members/${userId}`).then((r) => r.data);

export interface TaskTemplate {
  title: string;
  description?: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  rangeStart: string;
  rangeEnd: string;
}

export interface GenerateTasksResult {
  tasks: any[];
  conflicts: any[];
  conflictCount: number;
}

export const generateTasks = (id: string, templates: TaskTemplate[]) =>
  api.post<GenerateTasksResult>(`/projects/${id}/generate-tasks`, { templates }).then((r) => r.data);
