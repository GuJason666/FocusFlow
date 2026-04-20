import { create } from 'zustand';
import { CoachStudent } from '../types/coachStudent';
import * as coachStudentService from '../services/coachStudentService';

interface CoachStudentState {
  students: CoachStudent[];
  loading: boolean;
  error: string | null;
  fetchStudents: () => Promise<void>;
  addStudent: (email: string) => Promise<CoachStudent>;
  removeStudent: (studentId: string) => Promise<void>;
}

export const useCoachStudentStore = create<CoachStudentState>((set) => ({
  students: [],
  loading: false,
  error: null,

  fetchStudents: async () => {
    set({ loading: true, error: null });
    try {
      const students = await coachStudentService.getStudents();
      set({ students, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  addStudent: async (email) => {
    const relation = await coachStudentService.addStudent(email);
    set((s) => ({ students: [...s.students, relation] }));
    return relation;
  },

  removeStudent: async (studentId) => {
    await coachStudentService.removeStudent(studentId);
    set((s) => ({
      students: s.students.filter((r) => r.student._id !== studentId),
    }));
  },
}));
