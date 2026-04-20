import { create } from 'zustand';
import { Course } from '../types/course';
import * as courseService from '../services/courseService';
import { CreateCourseResult } from '../services/courseService';

interface CourseState {
  courses: Course[];
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  createCourse: (data: Partial<Course>) => Promise<CreateCourseResult>;
  deleteCourse: (id: string) => Promise<void>;
}

export const useCourseStore = create<CourseState>((set) => ({
  courses: [],
  loading: false,
  error: null,

  fetchCourses: async () => {
    set({ loading: true, error: null });
    try {
      const courses = await courseService.getCourses();
      set({ courses, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  createCourse: async (data) => {
    // Do NOT catch here — let 409 errors propagate to the component
    const result = await courseService.createCourse(data);
    set((s) => ({ courses: [...s.courses, result.course] }));
    return result;
  },

  deleteCourse: async (id) => {
    await courseService.deleteCourse(id);
    set((s) => ({ courses: s.courses.filter((c) => c._id !== id) }));
  },
}));
