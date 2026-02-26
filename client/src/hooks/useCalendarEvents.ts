import { useMemo } from 'react';
import { useTaskStore } from '../store/useTaskStore';
import { useTodoStore } from '../store/useTodoStore';
import { Task } from '../types/task';
import { Todo } from '../types/todo';
import { startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

export type CalendarEventType = 'task' | 'todo';

export interface CalendarEvent {
  id: string;
  type: CalendarEventType;
  title: string;
  start: Date;
  end: Date;
  completed: boolean;
  color: string;
  original: Task | Todo;
}

export function useCalendarEvents(viewStart: Date, viewEnd: Date): CalendarEvent[] {
  const tasks = useTaskStore((s) => s.tasks);
  const todos = useTodoStore((s) => s.todos);

  return useMemo(() => {
    const events: CalendarEvent[] = [];

    for (const task of tasks) {
      const start = new Date(task.startTime);
      const end = new Date(task.endTime);
      if (start <= viewEnd && end >= viewStart) {
        events.push({
          id: task._id,
          type: 'task',
          title: task.title,
          start,
          end,
          completed: task.completed,
          color: task.completed ? '#9CA3AF' : '#2563EB',
          original: task,
        });
      }
    }

    for (const todo of todos) {
      if (todo.deadline && !todo.convertedToTaskId) {
        const deadlineDate = new Date(todo.deadline);
        if (deadlineDate >= viewStart && deadlineDate <= viewEnd) {
          events.push({
            id: `todo_${todo._id}`,
            type: 'todo',
            title: todo.title,
            start: startOfDay(deadlineDate),
            end: endOfDay(deadlineDate),
            completed: todo.completed,
            color: todo.completed ? '#9CA3AF' : '#F59E0B',
            original: todo,
          });
        }
      }
    }

    return events;
  }, [tasks, todos, viewStart, viewEnd]);
}
