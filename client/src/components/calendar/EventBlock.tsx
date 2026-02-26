import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { format } from 'date-fns';
import { CalendarEvent } from '../../hooks/useCalendarEvents';

interface Props {
  event: CalendarEvent;
  onClick?: (event: CalendarEvent) => void;
  style?: React.CSSProperties;
}

export default function EventBlock({ event, onClick, style }: Props) {
  return (
    <Tooltip title={`${event.title} — ${format(event.start, 'h:mm a')} to ${format(event.end, 'h:mm a')}`}>
      <Box
        onClick={() => onClick?.(event)}
        sx={{
          bgcolor: event.color,
          color: '#fff',
          borderRadius: 1,
          px: 0.5,
          py: 0.25,
          overflow: 'hidden',
          cursor: 'pointer',
          opacity: event.completed ? 0.6 : 1,
          '&:hover': { opacity: 0.85 },
          ...style,
        }}
      >
        <Typography variant="caption" fontWeight={600} noWrap display="block">
          {event.title}
        </Typography>
        <Typography variant="caption" noWrap display="block" sx={{ opacity: 0.85 }}>
          {format(event.start, 'h:mm a')}
        </Typography>
      </Box>
    </Tooltip>
  );
}
