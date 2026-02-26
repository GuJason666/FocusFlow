import { useMemo } from 'react';
import { Task } from '../types/task';
import { addDays, addWeeks, addMonths, isWithinInterval, startOfDay } from 'date-fns';

export function useRecurring(tasks: Task[], viewStart: Date, viewEnd: Date): Task[] {
  return useMemo(() => {
    const expanded: Task[] = [];
    for (const task of tasks) {
      if (!task.isRecurringTemplate || !task.recurring?.frequency) continue;
      const { frequency, endDate } = task.recurring;
      const recurEnd = endDate ? new Date(endDate) : viewEnd;
      let current = new Date(task.startTime);
      const duration = new Date(task.endTime).getTime() - new Date(task.startTime).getTime();

      while (current <= viewEnd && current <= recurEnd) {
        if (current >= viewStart) {
          expanded.push({
            ...task,
            _id: `virtual_${task._id}_${current.getTime()}`,
            _virtual: true,
            startTime: current.toISOString(),
            endTime: new Date(current.getTime() + duration).toISOString(),
            occurrenceDate: current.toISOString(),
          });
        }
        if (frequency === 'daily') current = addDays(current, 1);
        else if (frequency === 'weekly') current = addWeeks(current, 1);
        else if (frequency === 'monthly') current = addMonths(current, 1);
        else break;
      }
    }
    return expanded;
  }, [tasks, viewStart, viewEnd]);
}
