import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Paper from '@mui/material/Paper';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { differenceInCalendarDays } from 'date-fns';
import { useCourseStore } from '../../store/useCourseStore';

const STEPS = ['Course Info', 'Weekly Schedule'];

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

export default function CourseCreationForm() {
  const navigate = useNavigate();
  const { createCourse } = useCourseStore();

  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Step 0 fields
  const [courseCode, setCourseCode] = useState('');
  const [courseName, setCourseName] = useState('');
  const [termStart, setTermStart] = useState<Date | null>(null);
  const [termEnd, setTermEnd] = useState<Date | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderHours, setReminderHours] = useState<number>(1);

  // Step 1: selected slots as Set of "dayOfWeek-period"
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

  const toggleSlot = (dow: number, period: string) => {
    const key = `${dow}-${period}`;
    setSelectedSlots((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const estimatedCount = (() => {
    if (!termStart || !termEnd || selectedSlots.size === 0) return 0;
    const days = differenceInCalendarDays(termEnd, termStart) + 1;
    return Math.round((days / 7) * selectedSlots.size);
  })();

  const canNext = courseCode.trim() && courseName.trim() && termStart && termEnd;

  const handleNext = () => {
    setError(null);
    setActiveStep((s) => s + 1);
  };
  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    setInfo(null);
    try {
      const schedule = Array.from(selectedSlots).map((key) => {
        const dashIdx = key.indexOf('-');
        return {
          dayOfWeek: Number(key.slice(0, dashIdx)),
          period: key.slice(dashIdx + 1),
        };
      });
      const result = await createCourse({
        courseCode: courseCode.trim(),
        courseName: courseName.trim(),
        termStart: termStart!.toISOString(),
        termEnd: termEnd!.toISOString(),
        schedule,
        reminderHours: reminderEnabled ? reminderHours : null,
      });
      if (result.bumpedCount > 0) {
        setInfo(`${result.bumpedCount} task(s) were moved to Todos due to schedule conflicts.`);
        setTimeout(() => navigate('/courses'), 2500);
      } else {
        navigate('/courses');
      }
    } catch (err: any) {
      if (err.response?.status === 409) {
        setError(err.response.data.error || 'Schedule conflict detected.');
      } else {
        setError(err.response?.data?.error || 'Failed to create course.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}><StepLabel>{label}</StepLabel></Step>
        ))}
      </Stepper>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {info && <Alert severity="info" sx={{ mb: 2 }}>{info}</Alert>}

      {activeStep === 0 && (
        <Stack spacing={2}>
          <TextField
            label="Course Code"
            placeholder="e.g. COP3530"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Course Name"
            placeholder="e.g. Data Structures"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            required
            fullWidth
          />
          <DatePicker
            label="Term Start Date"
            value={termStart}
            onChange={(v) => setTermStart(v)}
          />
          <DatePicker
            label="Term End Date"
            value={termEnd}
            onChange={(v) => setTermEnd(v)}
          />
          <FormControlLabel
            control={<Switch checked={reminderEnabled} onChange={(e) => setReminderEnabled(e.target.checked)} />}
            label="Email reminder"
          />
          {reminderEnabled && (
            <TextField
              select
              label="Send reminder"
              value={reminderHours}
              onChange={(e) => setReminderHours(Number(e.target.value))}
              fullWidth
            >
              <MenuItem value={0}>At start time (0 hours before)</MenuItem>
              <MenuItem value={1}>1 hour before</MenuItem>
              <MenuItem value={2}>2 hours before</MenuItem>
              <MenuItem value={6}>6 hours before</MenuItem>
              <MenuItem value={12}>12 hours before</MenuItem>
              <MenuItem value={24}>24 hours before</MenuItem>
              <MenuItem value={48}>48 hours before</MenuItem>
            </TextField>
          )}
        </Stack>
      )}

      {activeStep === 1 && (
        <Box>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Click cells to toggle lecture slots. Each selected cell repeats weekly from term start to end.
          </Typography>

          {/* Schedule grid */}
          <Paper variant="outlined" sx={{ p: 1, overflowX: 'auto' }}>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: '90px repeat(6, 1fr)',
                gap: 0.5,
                minWidth: 480,
              }}
            >
              {/* Header row */}
              <Box />
              {DAYS.map((d) => (
                <Box key={d.value} sx={{ textAlign: 'center', py: 0.5 }}>
                  <Typography variant="caption" fontWeight={700}>{d.label}</Typography>
                </Box>
              ))}

              {/* Period rows */}
              {PERIODS.map((period) => (
                <>
                  <Box key={`label-${period}`} sx={{ display: 'flex', alignItems: 'center', pr: 1 }}>
                    <Typography variant="caption" color="text.secondary" noWrap>
                      {PERIOD_LABELS[period]}
                    </Typography>
                  </Box>
                  {DAYS.map((d) => {
                    const key = `${d.value}-${period}`;
                    const selected = selectedSlots.has(key);
                    return (
                      <Box
                        key={key}
                        onClick={() => toggleSlot(d.value, period)}
                        sx={{
                          minHeight: 32,
                          borderRadius: 1,
                          cursor: 'pointer',
                          bgcolor: selected ? 'primary.main' : 'grey.100',
                          '&:hover': { bgcolor: selected ? 'primary.dark' : 'grey.200' },
                          transition: 'background-color 0.15s',
                        }}
                      />
                    );
                  })}
                </>
              ))}
            </Box>
          </Paper>

          {selectedSlots.size > 0 && (
            <Typography variant="body2" color="text.secondary" mt={1}>
              {selectedSlots.size} slot{selectedSlots.size !== 1 ? 's' : ''} selected
              {termStart && termEnd ? ` — ~${estimatedCount} lectures total` : ''}
            </Typography>
          )}
        </Box>
      )}

      <Stack direction="row" spacing={1} justifyContent="flex-end" mt={3}>
        {activeStep > 0 && <Button onClick={handleBack} disabled={submitting}>Back</Button>}
        {activeStep < STEPS.length - 1 ? (
          <Button variant="contained" onClick={handleNext} disabled={!canNext}>
            Next
          </Button>
        ) : (
          <Button variant="contained" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Course'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
