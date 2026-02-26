import { User } from './user';

export interface Recurring {
  frequency: 'daily' | 'weekly' | 'monthly';
  endDate?: string;
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  owner: User | string;
  assignedTo?: User | string;
  project?: string;
  completed: boolean;
  completedAt?: string;
  recurring?: Recurring;
  isRecurringTemplate: boolean;
  recurringTemplateId?: string;
  occurrenceDate?: string;
  convertedFromTodo?: string;
  _virtual?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
