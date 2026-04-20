export interface CourseScheduleSlot {
  dayOfWeek: number;
  period: string;
}

export interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  termStart: string;
  termEnd: string;
  owner: string;
  schedule: CourseScheduleSlot[];
  reminderHours?: number | null;
  createdAt?: string;
  updatedAt?: string;
}
