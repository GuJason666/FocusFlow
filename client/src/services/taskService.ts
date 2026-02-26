import api from './api';
import { Task } from '../types/task';

export const getTasksInRange = (start: string, end: string) =>
  api.get<Task[]>(`/tasks?start=${start}&end=${end}`).then((r) => r.data);

export const getProjectTasks = (projectId: string) =>
  api.get<Task[]>(`/tasks/project/${projectId}`).then((r) => r.data);

export const getTask = (id: string) =>
  api.get<Task>(`/tasks/${id}`).then((r) => r.data);

export const createTask = (data: Partial<Task>) =>
  api.post<Task>('/tasks', data).then((r) => r.data);

export const updateTask = (id: string, data: Partial<Task> & { updateScope?: string }) =>
  api.put<Task>(`/tasks/${id}`, data).then((r) => r.data);

export const toggleTask = (id: string) =>
  api.patch<Task>(`/tasks/${id}/complete`).then((r) => r.data);

export const deleteTask = (id: string) =>
  api.delete(`/tasks/${id}`).then((r) => r.data);
