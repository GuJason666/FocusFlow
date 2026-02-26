import { User } from './user';

export interface Project {
  _id: string;
  title: string;
  description: string;
  goal: string;
  deadline?: string;
  coach: User;
  members: User[];
  createdAt: string;
  updatedAt: string;
}
