import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Alert from '@mui/material/Alert';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { format } from 'date-fns';
import { Course } from '../../types/course';
import { Task } from '../../types/task';
import { getCourse, getUpcomingLectures } from '../../services/courseService';
import { useCourseStore } from '../../store/useCourseStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

const PERIODS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'E1', 'E2', 'E3'];
const DAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
];

const PERIOD_LABELS: Record<string, string> = {
  '1': 'P1 7:25', '2': 'P2 8:30', '3': 'P3 9:35', '4': 'P4 10:40',
  '5': 'P5 11:45', '6': 'P6 12:50', '7': 'P7 1:55', '8': 'P8 3:00',
  '9': 'P9 4:05', '10': 'P10 5:10', '11': 'P11 6:15',
  'E1': 'E1 7:20pm', 'E2': 'E2 8:20pm', 'E3': 'E3 9:20pm',
};

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { deleteCourse } = useCourseStore();

  const [course, setCourse] = useState<Course | null>(null);
  const [lectures, setLectures] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([getCourse(id), getUpcomingLectures(id)])
      .then(([c, l]) => {
        setCourse(c);
        setLectures(l);
      })
      .catch((err) => setError(err.response?.data?.error || 'Failed to load course'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteCourse(id);
      navigate('/courses');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete course');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <Box>
      <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/courses')}>Back to Courses</Button>
    </Box>
  );
  if (!course) return null;

  const scheduleSet = new Set(course.schedule.map((s) => `${s.dayOfWeek}-${s.period}`));

  return (
    <Box maxWidth={800}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/courses')} sx={{ mb: 2 }}>
        Back to Courses
      </Button>

      <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={3}>
        <Box>
          <Typography variant="h5" fontWeight={700}>{course.courseCode}</Typography>
          <Typography variant="h6" color="text.secondary">{course.courseName}</Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {format(new Date(course.termStart), 'MMM d, yyyy')} – {format(new Date(course.termEnd), 'MMM d, yyyy')}
          </Typography>
          {course.reminderHours != null && (
            <Typography variant="body2" color="text.secondary">
              Reminder: {course.reminderHours === 0 ? 'At start time' : `${course.reminderHours}h before`}
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
        >
          Delete Course
        </Button>
      </Box>

      <Typography variant="subtitle2" fontWeight={700} mb={1}>Lecture Schedule</Typography>
      <Paper variant="outlined" sx={{ p: 1, mb: 3, overflowX: 'auto' }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '90px repeat(6, 1fr)',
            gap: 0.5,
            minWidth: 480,
          }}
        >
          <Box />
          {DAYS.map((d) => (
            <Box key={d.value} sx={{ textAlign: 'center', py: 0.5 }}>
              <Typography variant="caption" fontWeight={700}>{d.label}</Typography>
            </Box>
          ))}
          {PERIODS.map((period) => (
            <>
              <Box key={`label-${period}`} sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {PERIOD_LABELS[period]}
                </Typography>
              </Box>
              {DAYS.map((d) => {
                const key = `${d.value}-${period}`;
                const active = scheduleSet.has(key);
                return (
                  <Box
                    key={key}
                    sx={{
                      minHeight: 32,
                      borderRadius: 1,
                      bgcolor: active ? 'primary.main' : 'grey.100',
                    }}
                  />
                );
              })}
            </>
          ))}
        </Box>
      </Paper>

      <Typography variant="subtitle2" fontWeight={700} mb={1}>Upcoming Lectures</Typography>
      {lectures.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No upcoming lectures found.</Typography>
      ) : (
        <Paper variant="outlined">
          <List disablePadding>
            {lectures.map((lec) => (
              <ListItem key={lec._id} divider>
                <ListItemText
                  primary={lec.title}
                  secondary={format(new Date(lec.startTime), 'EEE, MMM d · h:mm a')}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Course"
        message={`Delete ${course.courseCode}? All ${course.schedule.length > 0 ? 'lecture' : ''} tasks for this course will be permanently removed.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Box>
  );
}
