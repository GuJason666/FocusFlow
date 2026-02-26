import { create } from 'zustand';
import { Todo } from '../types/todo';
import * as todoService from '../services/todoService';
import { useTaskStore } from './useTaskStore';

interface TodoState {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  fetchTodos: (projectId?: string) => Promise<void>;
  createTodo: (data: Partial<Todo>) => Promise<Todo>;
  updateTodo: (id: string, data: Partial<Todo>) => Promise<void>;
  toggleComplete: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  convertToTask: (id: string, startTime: string, endTime: string) => Promise<void>;
}

export const useTodoStore = create<TodoState>((set) => ({
  todos: [],
  loading: false,
  error: null,

  fetchTodos: async (projectId) => {
    set({ loading: true, error: null });
    try {
      const todos = await todoService.getTodos(projectId);
      set({ todos, loading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || err.message, loading: false });
    }
  },

  createTodo: async (data) => {
    const todo = await todoService.createTodo(data);
    set((s) => ({ todos: [...s.todos, todo] }));
    return todo;
  },

  updateTodo: async (id, data) => {
    const updated = await todoService.updateTodo(id, data);
    set((s) => ({
      todos: s.todos.map((t) => (t._id === id ? updated : t)),
    }));
  },

  toggleComplete: async (id) => {
    const updated = await todoService.toggleTodo(id);
    set((s) => ({
      todos: s.todos.map((t) => (t._id === id ? updated : t)),
    }));
  },

  deleteTodo: async (id) => {
    await todoService.deleteTodo(id);
    set((s) => ({ todos: s.todos.filter((t) => t._id !== id) }));
  },

  convertToTask: async (id, startTime, endTime) => {
    const { task, todo } = await todoService.convertTodo(id, startTime, endTime);
    // Remove from todos list
    set((s) => ({ todos: s.todos.filter((t) => t._id !== id) }));
    // Add to task store
    useTaskStore.getState().addTask(task);
  },
}));
