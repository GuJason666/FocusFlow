import { User } from './user';

export interface Todo {
  _id: string;
  title: string;
  description: string;
  deadline?: string;
  owner: User | string;
  assignedTo?: User | string;
  project?: string;
  category?: string;
  completed: boolean;
  completedAt?: string;
  convertedToTaskId?: string;
  weekOf?: string;
  assignedBy?: User | string;
  sourceCoachTodoId?: string;
  assignedToStudents?: string[];
  createdAt?: string;
  updatedAt?: string;
}
