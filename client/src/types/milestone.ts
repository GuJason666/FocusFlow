export interface Milestone {
  _id: string;
  project: string;
  title: string;
  description: string;
  deadline?: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}
