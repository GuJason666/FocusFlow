import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import {
  startOfWeek, endOfWeek, subWeeks,
  startOfMonth, endOfMonth, subMonths,
  isWithinInterval,
} from 'date-fns';
import { useTaskStore } from '../../store/useTaskStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { CATEGORIES } from '../../constants/categories';

interface PeriodStats {
  label: string;
  planned: number;
  completed: number;
}

function StatCard({ stats, onClick }: { stats: PeriodStats; onClick?: () => void }) {
  const rate = stats.planned > 0 ? Math.round((stats.completed / stats.planned) * 100) : 0;

  return (
    <Paper
      variant="outlined"
      onClick={onClick}
      sx={{ p: 3, flex: 1, cursor: 'pointer', '&:hover': { bgcolor: 'grey.50' } }}
    >
      <Typography variant="subtitle1" fontWeight={700} mb={2}>
        {stats.label}
      </Typography>
      <Stack spacing={1.5}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">Tasks Planned</Typography>
          <Typography variant="body2" fontWeight={600}>{stats.planned}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">Tasks Completed</Typography>
          <Typography variant="body2" fontWeight={600}>{stats.completed}</Typography>
        </Box>
        <Divider />
        <Box>
          <Box display="flex" justifyContent="space-between" mb={0.5}>
            <Typography variant="body2" color="text.secondary">Completion Rate</Typography>
            <Typography
              variant="body2"
              fontWeight={700}
              color={rate >= 80 ? 'success.main' : rate >= 50 ? 'warning.main' : 'error.main'}
            >
              {rate}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={rate}
            color={rate >= 80 ? 'success' : rate >= 50 ? 'warning' : 'error'}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Box>
        {stats.planned === 0 && (
          <Typography variant="caption" color="text.secondary">
            No tasks scheduled for this period.
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { tasks, loading, fetchTasksInRange } = useTaskStore();
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const now = new Date();
  const thisWeekStart  = startOfWeek(now, { weekStartsOn: 0 });
  const thisWeekEnd    = endOfWeek(now, { weekStartsOn: 0 });
  const lastWeekStart  = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
  const lastWeekEnd    = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
  const thisMonthStart = startOfMonth(now);
  const thisMonthEnd   = endOfMonth(now);
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const lastMonthEnd   = endOfMonth(subMonths(now, 1));

  useEffect(() => {
    fetchTasksInRange(lastMonthStart.toISOString(), thisMonthEnd.toISOString());
  }, []);

  const stats = useMemo((): PeriodStats[] => {
    const concrete = tasks.filter((t) =>
      !t._virtual && !t.isRecurringTemplate &&
      (categoryFilter === 'All' || t.category === categoryFilter)
    );

    const inRange = (t: typeof tasks[0], start: Date, end: Date) =>
      isWithinInterval(new Date(t.startTime), { start, end });

    const slice = (start: Date, end: Date) => concrete.filter((t) => inRange(t, start, end));

    const make = (label: string, start: Date, end: Date): PeriodStats => {
      const group = slice(start, end);
      return { label, planned: group.length, completed: group.filter((t) => t.completed).length };
    };

    return [
      make('Last Week',  lastWeekStart,  lastWeekEnd),
      make('This Week',  thisWeekStart,  thisWeekEnd),
      make('Last Month', lastMonthStart, lastMonthEnd),
      make('This Month', thisMonthStart, thisMonthEnd),
    ];
  }, [tasks, categoryFilter]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>
        Dashboard
      </Typography>
      <ToggleButtonGroup
        value={categoryFilter}
        exclusive
        onChange={(_, val) => { if (val) setCategoryFilter(val); }}
        size="small"
        sx={{ mb: 3, flexWrap: 'wrap', gap: 0.5 }}
      >
        <ToggleButton value="All">All</ToggleButton>
        {CATEGORIES.map((c) => <ToggleButton key={c} value={c}>{c}</ToggleButton>)}
      </ToggleButtonGroup>

      <Typography variant="subtitle2" color="text.secondary" mb={1}>Weekly</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <StatCard
          stats={stats[0]}
          onClick={() => navigate('/calendar', { state: { date: lastWeekStart.toISOString(), view: 'week' } })}
        />
        <StatCard
          stats={stats[1]}
          onClick={() => navigate('/calendar', { state: { date: thisWeekStart.toISOString(), view: 'week' } })}
        />
      </Stack>
      <Typography variant="subtitle2" color="text.secondary" mb={1}>Monthly</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <StatCard
          stats={stats[2]}
          onClick={() => navigate('/calendar', { state: { date: lastMonthStart.toISOString(), view: 'month' } })}
        />
        <StatCard
          stats={stats[3]}
          onClick={() => navigate('/calendar', { state: { date: thisMonthStart.toISOString(), view: 'month' } })}
        />
      </Stack>
    </Box>
  );
}
