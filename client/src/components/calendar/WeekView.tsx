import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDroppable } from '@dnd-kit/core';
import {
  format,
  addDays,
  addMinutes,
  startOfDay,
  differenceInMinutes,
  isSameDay,
  isToday,
} from 'date-fns';
import { CalendarEvent } from '../../hooks/useCalendarEvents';
import EventBlock from './EventBlock';

const HOUR_HEIGHT = 56;
const SLOT_HEIGHT = HOUR_HEIGHT / 2;
const TIME_COL_WIDTH = 52;

interface SlotProps {
  date: Date;
  hour: number;
  half: number;
}

function Slot({ date, hour, half }: SlotProps) {
  const slotTime = addMinutes(startOfDay(date), hour * 60 + half * 30);
  const id = format(slotTime, "yyyy-MM-dd HH:mm");
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      data-slot-id={id}
      sx={{
        height: SLOT_HEIGHT,
        borderBottom: '1px solid',
        borderLeft: '1px solid',
        borderColor: isOver ? 'primary.main' : 'divider',
        bgcolor: isOver ? 'primary.50' : 'transparent',
        transition: 'background-color 0.15s',
      }}
    />
  );
}

interface Props {
  weekStart: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export default function WeekView({ weekStart, events, onEventClick }: Props) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 24 }, (_, i) => i);

  function getEventStyle(event: CalendarEvent, dayIndex: number): React.CSSProperties {
    const dayStart = startOfDay(days[dayIndex]);
    const startMin = differenceInMinutes(event.start, dayStart);
    const durationMin = Math.max(differenceInMinutes(event.end, event.start), 30);
    const top = (startMin / 60) * HOUR_HEIGHT;
    const height = (durationMin / 60) * HOUR_HEIGHT;
    return { position: 'absolute', top, left: 2, right: 2, height: Math.max(height, 22), zIndex: 1 };
  }

  return (
    <Box sx={{ overflowX: 'auto' }}>
      {/* Header row */}
      <Box sx={{ display: 'flex', borderBottom: '2px solid', borderColor: 'divider', mb: 0 }}>
        <Box sx={{ width: TIME_COL_WIDTH, flexShrink: 0 }} />
        {days.map((day) => (
          <Box
            key={day.toISOString()}
            sx={{
              flex: 1,
              textAlign: 'center',
              py: 1,
              borderLeft: '1px solid',
              borderColor: 'divider',
              bgcolor: isToday(day) ? 'primary.50' : 'transparent',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {format(day, 'EEE')}
            </Typography>
            <Typography
              variant="body2"
              fontWeight={isToday(day) ? 700 : 400}
              color={isToday(day) ? 'primary.main' : 'text.primary'}
            >
              {format(day, 'd')}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Time grid */}
      <Box sx={{ position: 'relative', overflowY: 'auto', maxHeight: 'calc(100vh - 260px)' }}>
        {hours.map((hour) => (
          <Box key={hour} sx={{ display: 'flex' }}>
            <Box
              sx={{
                width: TIME_COL_WIDTH,
                flexShrink: 0,
                textAlign: 'right',
                pr: 1,
                pt: 0,
                color: 'text.disabled',
                borderRight: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="caption" sx={{ lineHeight: `${SLOT_HEIGHT}px` }}>
                {hour === 0 ? '' : hour < 12 ? `${hour}am` : hour === 12 ? '12pm' : `${hour - 12}pm`}
              </Typography>
            </Box>
            {days.map((day) => (
              <Box key={day.toISOString()} sx={{ flex: 1, position: 'relative' }}>
                <Slot date={day} hour={hour} half={0} />
                <Slot date={day} hour={hour} half={1} />
              </Box>
            ))}
          </Box>
        ))}

        {/* Events overlay */}
        {days.map((day, dayIndex) => {
          const dayEvents = events.filter((e) => isSameDay(e.start, day));
          return (
            <Box
              key={day.toISOString()}
              sx={{
                position: 'absolute',
                top: 0,
                left: `calc(${TIME_COL_WIDTH}px + ${dayIndex} * (100% - ${TIME_COL_WIDTH}px) / 7)`,
                width: `calc((100% - ${TIME_COL_WIDTH}px) / 7)`,
                height: '100%',
                pointerEvents: 'none',
              }}
            >
              {dayEvents.map((event) => (
                <Box key={event.id} sx={{ pointerEvents: 'all' }}>
                  <EventBlock
                    event={event}
                    onClick={onEventClick}
                    style={getEventStyle(event, dayIndex)}
                  />
                </Box>
              ))}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
