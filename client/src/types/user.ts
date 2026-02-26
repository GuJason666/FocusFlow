export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'coach';
  createdAt: string;
  updatedAt: string;
}
