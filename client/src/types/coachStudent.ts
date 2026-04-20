import { User } from './user';

export interface CoachStudent {
  _id: string;
  coach: string;
  student: User;
  createdAt: string;
}
