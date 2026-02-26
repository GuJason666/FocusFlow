import api from './api';
import { Todo } from '../types/todo';
import { Task } from '../types/task';

export const getTodos = (projectId?: string) => {
  const url = projectId ? `/todos?projectId=${projectId}` : '/todos';
  return api.get<Todo[]>(url).then((r) => r.data);
};

export const createTodo = (data: Partial<Todo>) =>
  api.post<Todo>('/todos', data).then((r) => r.data);

export const updateTodo = (id: string, data: Partial<Todo>) =>
  api.put<Todo>(`/todos/${id}`, data).then((r) => r.data);

export const toggleTodo = (id: string) =>
  api.patch<Todo>(`/todos/${id}/complete`).then((r) => r.data);

export const deleteTodo = (id: string) =>
  api.delete(`/todos/${id}`).then((r) => r.data);

export const convertTodo = (id: string, startTime: string, endTime: string) =>
  api
    .post<{ task: Task; todo: Todo }>(`/todos/${id}/convert`, { startTime, endTime })
    .then((r) => r.data);
