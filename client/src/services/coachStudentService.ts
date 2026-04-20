import api from './api';
import { CoachStudent } from '../types/coachStudent';
import { Todo } from '../types/todo';

export const getStudents = (): Promise<CoachStudent[]> =>
  api.get<CoachStudent[]>('/coach-students').then((r) => r.data);

export const addStudent = (email: string): Promise<CoachStudent> =>
  api.post<CoachStudent>('/coach-students', { email }).then((r) => r.data);

export const removeStudent = (studentId: string): Promise<void> =>
  api.delete(`/coach-students/${studentId}`).then((r) => r.data);

export const getCoachStudentTodos = (
  start: string,
  end: string,
  studentId?: string
): Promise<Todo[]> => {
  const params: Record<string, string> = { start, end };
  if (studentId) params.studentId = studentId;
  return api.get<Todo[]>('/coach/student-todos', { params }).then((r) => r.data);
};
