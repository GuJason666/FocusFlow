import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import { DndContext, DragEndEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { parse, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, format } from 'date-fns';
import CalendarToolbar, { CalendarView } from '../../components/calendar/CalendarToolbar';
import DayView from '../../components/calendar/DayView';
import WeekView from '../../components/calendar/WeekView';
import MonthView from '../../components/calendar/MonthView';
import TodoSidebar from '../../components/calendar/TodoSidebar';
import ConvertTodoModal from '../../components/calendar/ConvertTodoModal';
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { useTaskStore } from '../../store/useTaskStore';
import { useTodoStore } from '../../store/useTodoStore';
import { Todo } from '../../types/todo';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';

export default function CalendarPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [view, setView] = useState<CalendarView>(isMobile ? 'day' : 'week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [convertModal, setConvertModal] = useState<{
    open: boolean;
    todo: Todo | null;
    prefillStart: Date | null;
  }>({ open: false, todo: null, prefillStart: null });
  const [activeDragTodo, setActiveDragTodo] = useState<Todo | null>(null);

  const fetchTasksInRange = useTaskStore((s) => s.fetchTasksInRange);
  const fetchTodos = useTodoStore((s) => s.fetchTodos);
  const todos = useTodoStore((s) => s.todos);

  const getViewRange = useCallback((v: CalendarView, d: Date) => {
    if (v === 'day') return { start: d, end: d };
    if (v === 'week') return { start: startOfWeek(d, { weekStartsOn: 0 }), end: endOfWeek(d, { weekStartsOn: 0 }) };
    return { start: startOfMonth(d), end: endOfMonth(d) };
  }, []);

  useEffect(() => {
    const { start, end } = getViewRange(view, currentDate);
    fetchTasksInRange(start.toISOString(), end.toISOString());
    fetchTodos();
  }, [view, currentDate, fetchTasksInRange, fetchTodos, getViewRange]);

  const { start: viewStart, end: viewEnd } = getViewRange(view, currentDate);
  const events = useCalendarEvents(viewStart, viewEnd);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const handleDragStart = (event: any) => {
    const todo = event.active.data.current?.todo as Todo;
    if (todo) setActiveDragTodo(todo);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveDragTodo(null);
    const { active, over } = event;
    if (!over) return;

    const todo = active.data.current?.todo as Todo;
    if (!todo) return;

    // Parse slot id: "YYYY-MM-DD HH:mm"
    const slotId = over.id as string;
    const [datePart, timePart] = slotId.split(' ');
    if (!datePart || !timePart) return;

    const [year, month, day] = datePart.split('-').map(Number);
    const [hour, minute] = timePart.split(':').map(Number);
    const prefillStart = new Date(year, month - 1, day, hour, minute);

    setConvertModal({ open: true, todo, prefillStart });
  };

  const weekStart =
    view === 'week' ? startOfWeek(currentDate, { weekStartsOn: 0 }) : currentDate;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box>
        <CalendarToolbar
          view={isMobile ? 'day' : view}
          currentDate={currentDate}
          onViewChange={setView}
          onDateChange={setCurrentDate}
        />

        <Box display="flex" gap={2}>
          <Box flexGrow={1} sx={{ overflow: 'hidden' }}>
            {view === 'day' || isMobile ? (
              <DayView
                date={currentDate}
                events={events}
              />
            ) : view === 'week' ? (
              <WeekView
                weekStart={weekStart}
                events={events}
              />
            ) : (
              <MonthView
                month={currentDate}
                events={events}
                todos={todos}
                onDayClick={(date) => {
                  setCurrentDate(date);
                  setView('day');
                }}
              />
            )}
          </Box>

          {!isMobile && view !== 'month' && (
            <TodoSidebar todos={todos} />
          )}
        </Box>
      </Box>

      <DragOverlay>
        {activeDragTodo && (
          <Paper elevation={4} sx={{ p: 1, width: 180, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="caption" fontWeight={600}>
              {activeDragTodo.title}
            </Typography>
          </Paper>
        )}
      </DragOverlay>

      <ConvertTodoModal
        open={convertModal.open}
        todo={convertModal.todo}
        prefillStart={convertModal.prefillStart}
        onClose={() => setConvertModal({ open: false, todo: null, prefillStart: null })}
      />
    </DndContext>
  );
}
