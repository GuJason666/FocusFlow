import api from './api';
import { Course } from '../types/course';
import { Task } from '../types/task';

export interface CreateCourseResult {
  course: Course;
  lectureCount: number;
  bumpedCount: number;
}

export const getCourses = (): Promise<Course[]> =>
  api.get<Course[]>('/courses').then((r) => r.data);

export const getCourse = (id: string): Promise<Course> =>
  api.get<Course>(`/courses/${id}`).then((r) => r.data);

export const getUpcomingLectures = (id: string): Promise<Task[]> =>
  api.get<Task[]>(`/courses/${id}/lectures`).then((r) => r.data);

export const createCourse = (data: Partial<Course>): Promise<CreateCourseResult> =>
  api.post<CreateCourseResult>('/courses', data).then((r) => r.data);

export const deleteCourse = (id: string): Promise<void> =>
  api.delete(`/courses/${id}`).then((r) => r.data);
