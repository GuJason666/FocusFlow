import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useDroppable } from '@dnd-kit/core';
import { format, addMinutes, startOfDay, differenceInMinutes } from 'date-fns';
import { CalendarEvent } from '../../hooks/useCalendarEvents';
import EventBlock from './EventBlock';

const HOUR_HEIGHT = 60; // px per hour
const SLOT_HEIGHT = HOUR_HEIGHT / 2; // 30-min slots

interface TimeSlotProps {
  date: Date;
  slotIndex: number;
}

function TimeSlot({ date, slotIndex }: TimeSlotProps) {
  const slotTime = addMinutes(startOfDay(date), slotIndex * 30);
  const id = format(slotTime, "yyyy-MM-dd HH:mm");
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        height: SLOT_HEIGHT,
        borderBottom: '1px solid',
        borderColor: isOver ? 'primary.main' : 'divider',
        bgcolor: isOver ? 'primary.50' : 'transparent',
        transition: 'background-color 0.15s',
      }}
    />
  );
}

interface Props {
  date: Date;
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

export default function DayView({ date, events, onEventClick }: Props) {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const dayStart = startOfDay(date);

  const dayEvents = events.filter(
    (e) => format(e.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
  );

  function getEventStyle(event: CalendarEvent): React.CSSProperties {
    const startMin = differenceInMinutes(event.start, dayStart);
    const durationMin = differenceInMinutes(event.end, event.start);
    const top = (startMin / 60) * HOUR_HEIGHT;
    const height = Math.max((durationMin / 60) * HOUR_HEIGHT, 20);
    return {
      position: 'absolute',
      top,
      left: '60px',
      right: '4px',
      height,
      zIndex: 1,
    };
  }

  return (
    <Box sx={{ position: 'relative', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)' }}>
      {hours.map((hour) => (
        <Box key={hour} sx={{ display: 'flex' }}>
          <Box
            sx={{
              width: 56,
              flexShrink: 0,
              textAlign: 'right',
              pr: 1,
              pt: 0.5,
              color: 'text.disabled',
            }}
          >
            <Typography variant="caption">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <TimeSlot date={date} slotIndex={hour * 2} />
            <TimeSlot date={date} slotIndex={hour * 2 + 1} />
          </Box>
        </Box>
      ))}

      {/* Overlay events */}
      {dayEvents.map((event) => (
        <EventBlock
          key={event.id}
          event={event}
          onClick={onEventClick}
          style={getEventStyle(event)}
        />
      ))}
    </Box>
  );
}
