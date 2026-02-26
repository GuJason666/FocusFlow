import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns';
import { CalendarEvent } from '../../hooks/useCalendarEvents';
import TodoMarker from './TodoMarker';
import { Todo } from '../../types/todo';

interface Props {
  month: Date;
  events: CalendarEvent[];
  todos: Todo[];
  onDayClick?: (date: Date) => void;
}

export default function MonthView({ month, events, todos, onDayClick }: Props) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });
  const weeks = [];
  for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Box>
      {/* Day name headers */}
      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" sx={{ borderBottom: '1px solid', borderColor: 'divider', mb: 0 }}>
        {dayNames.map((d) => (
          <Box key={d} sx={{ textAlign: 'center', py: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              {d}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Weeks */}
      {weeks.map((week, wi) => (
        <Box key={wi} display="grid" gridTemplateColumns="repeat(7, 1fr)">
          {week.map((day) => {
            const dayEvents = events.filter((e) => isSameDay(e.start, day));
            const dayTodos = todos.filter(
              (t) => t.deadline && isSameDay(new Date(t.deadline), day) && !t.convertedToTaskId
            );
            const inMonth = isSameMonth(day, month);

            return (
              <Paper
                key={day.toISOString()}
                variant="outlined"
                onClick={() => onDayClick?.(day)}
                sx={{
                  minHeight: 90,
                  p: 0.5,
                  cursor: 'pointer',
                  opacity: inMonth ? 1 : 0.4,
                  bgcolor: isToday(day) ? 'primary.50' : 'background.paper',
                  borderRadius: 0,
                  '&:hover': { bgcolor: 'grey.50' },
                }}
              >
                <Typography
                  variant="caption"
                  fontWeight={isToday(day) ? 700 : 400}
                  color={isToday(day) ? 'primary.main' : 'text.primary'}
                  display="block"
                  mb={0.25}
                >
                  {format(day, 'd')}
                </Typography>
                {dayEvents.slice(0, 2).map((e) => (
                  <Box
                    key={e.id}
                    sx={{
                      bgcolor: e.color,
                      color: 'white',
                      borderRadius: 0.5,
                      px: 0.5,
                      mb: 0.25,
                      overflow: 'hidden',
                    }}
                  >
                    <Typography variant="caption" noWrap display="block">
                      {e.title}
                    </Typography>
                  </Box>
                ))}
                {dayEvents.length > 2 && (
                  <Typography variant="caption" color="text.secondary">
                    +{dayEvents.length - 2} more
                  </Typography>
                )}
                <TodoMarker todos={dayTodos} />
              </Paper>
            );
          })}
        </Box>
      ))}
    </Box>
  );
}
