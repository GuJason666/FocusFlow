import { useEffect, useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import LinearProgress from '@mui/material/LinearProgress';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import {
  startOfWeek, endOfWeek, subWeeks,
  startOfMonth, endOfMonth, subMonths,
  isWithinInterval,
} from 'date-fns';
import { useCoachStudentStore } from '../../store/useCoachStudentStore';
import { getCoachStudentTodos } from '../../services/coachStudentService';
import { Todo } from '../../types/todo';
import LoadingSpinner from '../../components/common/LoadingSpinner';

interface PeriodStats {
  label: string;
  planned: number;
  completed: number;
}

function StatCard({ stats }: { stats: PeriodStats }) {
  const rate = stats.planned > 0 ? Math.round((stats.completed / stats.planned) * 100) : 0;
  return (
    <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
      <Typography variant="subtitle1" fontWeight={700} mb={2}>{stats.label}</Typography>
      <Stack spacing={1.5}>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">Todos Assigned</Typography>
          <Typography variant="body2" fontWeight={600}>{stats.planned}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between">
          <Typography variant="body2" color="text.secondary">Todos Completed</Typography>
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
          <Typography variant="caption" color="text.secondary">No todos assigned for this period.</Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default function CoachDashboard() {
  const { students, fetchStudents } = useCoachStudentStore();
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const lastMonthStart = startOfMonth(subMonths(now, 1));
  const thisMonthEnd   = endOfMonth(now);

  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  useEffect(() => {
    setLoading(true);
    getCoachStudentTodos(
      lastMonthStart.toISOString(),
      thisMonthEnd.toISOString(),
      selectedStudent === 'all' ? undefined : selectedStudent
    )
      .then(setTodos)
      .catch(() => setTodos([]))
      .finally(() => setLoading(false));
  }, [selectedStudent]);

  const stats = useMemo((): PeriodStats[] => {
    const thisWeekStart  = startOfWeek(now, { weekStartsOn: 0 });
    const thisWeekEnd    = endOfWeek(now, { weekStartsOn: 0 });
    const lastWeekStart  = startOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
    const lastWeekEnd    = endOfWeek(subWeeks(now, 1), { weekStartsOn: 0 });
    const thisMonthStart = startOfMonth(now);

    const inRange = (t: Todo, start: Date, end: Date) =>
      t.weekOf ? isWithinInterval(new Date(t.weekOf), { start, end }) : false;

    const make = (label: string, start: Date, end: Date): PeriodStats => {
      const group = todos.filter((t) => inRange(t, start, end));
      return { label, planned: group.length, completed: group.filter((t) => t.completed).length };
    };

    return [
      make('Last Week',  lastWeekStart,  lastWeekEnd),
      make('This Week',  thisWeekStart,  thisWeekEnd),
      make('Last Month', lastMonthStart, endOfMonth(subMonths(now, 1))),
      make('This Month', thisMonthStart, thisMonthEnd),
    ];
  }, [todos]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Coach Dashboard</Typography>
        <TextField
          select
          size="small"
          value={selectedStudent}
          onChange={(e) => setSelectedStudent(e.target.value)}
          sx={{ minWidth: 200 }}
          label="Student"
        >
          <MenuItem value="all">All Students</MenuItem>
          {students.map((rel) => (
            <MenuItem key={rel.student._id} value={rel.student._id}>
              {rel.student.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Typography variant="subtitle2" color="text.secondary" mb={1}>Weekly</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={3}>
        <StatCard stats={stats[0]} />
        <StatCard stats={stats[1]} />
      </Stack>

      <Typography variant="subtitle2" color="text.secondary" mb={1}>Monthly</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <StatCard stats={stats[2]} />
        <StatCard stats={stats[3]} />
      </Stack>
    </Box>
  );
}
