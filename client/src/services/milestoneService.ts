import api from './api';
import { Milestone } from '../types/milestone';

export const getMilestones = (projectId: string) =>
  api.get<Milestone[]>(`/milestones?projectId=${projectId}`).then((r) => r.data);

export const createMilestone = (data: Partial<Milestone> & { projectId: string }) =>
  api.post<Milestone>('/milestones', data).then((r) => r.data);

export const updateMilestone = (id: string, data: Partial<Milestone>) =>
  api.put<Milestone>(`/milestones/${id}`, data).then((r) => r.data);

export const toggleMilestone = (id: string) =>
  api.patch<Milestone>(`/milestones/${id}/complete`).then((r) => r.data);

export const deleteMilestone = (id: string) =>
  api.delete(`/milestones/${id}`).then((r) => r.data);
