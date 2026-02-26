import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TodayIcon from '@mui/icons-material/Today';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';

export type CalendarView = 'day' | 'week' | 'month';

interface Props {
  view: CalendarView;
  currentDate: Date;
  onViewChange: (view: CalendarView) => void;
  onDateChange: (date: Date) => void;
}

function getTitle(view: CalendarView, date: Date): string {
  if (view === 'day') return format(date, 'EEEE, MMMM d, yyyy');
  if (view === 'week') {
    const start = date;
    const end = addDays(date, 6);
    return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`;
  }
  return format(date, 'MMMM yyyy');
}

function navigate(view: CalendarView, date: Date, dir: 1 | -1): Date {
  if (view === 'day') return dir === 1 ? addDays(date, 1) : subDays(date, 1);
  if (view === 'week') return dir === 1 ? addWeeks(date, 1) : subWeeks(date, 1);
  return dir === 1 ? addMonths(date, 1) : subMonths(date, 1);
}

export default function CalendarToolbar({ view, currentDate, onViewChange, onDateChange }: Props) {
  return (
    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mb={2}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<TodayIcon />}
        onClick={() => onDateChange(new Date())}
      >
        Today
      </Button>
      <IconButton size="small" onClick={() => onDateChange(navigate(view, currentDate, -1))}>
        <ChevronLeftIcon />
      </IconButton>
      <IconButton size="small" onClick={() => onDateChange(navigate(view, currentDate, 1))}>
        <ChevronRightIcon />
      </IconButton>
      <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1, ml: 1 }}>
        {getTitle(view, currentDate)}
      </Typography>
      <ToggleButtonGroup
        value={view}
        exclusive
        onChange={(_, v) => v && onViewChange(v)}
        size="small"
      >
        <ToggleButton value="day" sx={{ display: { xs: 'none', md: 'flex' } }}>Day</ToggleButton>
        <ToggleButton value="week" sx={{ display: { xs: 'none', md: 'flex' } }}>Week</ToggleButton>
        <ToggleButton value="month">Month</ToggleButton>
        <ToggleButton value="day" sx={{ display: { md: 'none' } }}>Day</ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
