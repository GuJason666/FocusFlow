import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useProjectStore } from '../../store/useProjectStore';
import { createMilestone } from '../../services/milestoneService';
import { generateTasks } from '../../services/projectService';
import { CATEGORIES } from '../../constants/categories';

const STEPS = ['Goal Info', 'Milestones', 'Weekly Tasks'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const genId = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

interface MilestoneRow {
  id: string;
  title: string;
  deadline: Date | null;
}

interface TaskTemplate {
  id: string;
  title: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  rangeStart: Date | null;
  rangeEnd: Date | null;
  reminderEnabled: boolean;
  reminderHours: number;
}

export default function GoalCreationForm() {
  const navigate = useNavigate();
  const createProject = useProjectStore((s) => s.createProject);

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [conflictCount, setConflictCount] = useState(0);
  const [error, setError] = useState('');

  // Step 0: Goal Info
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [baseline, setBaseline] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');

  // Step 1: Milestones
  const [milestones, setMilestones] = useState<MilestoneRow[]>([
    { id: genId(), title: '', deadline: null },
  ]);

  // Step 2: Recurring Tasks
  const [templates, setTemplates] = useState<TaskTemplate[]>([
    {
      id: genId(),
      title: '',
      daysOfWeek: [1, 3, 5],
      startTime: '09:00',
      endTime: '10:00',
      rangeStart: null,
      rangeEnd: null,
      reminderEnabled: false,
      reminderHours: 1,
    },
  ]);

  const canNext = () => step === 0 ? title.trim().length > 0 : true;

  const handleNext = () => {
    if (step === 0) {
      const baselineNum = parseFloat(baseline);
      const targetNum = parseFloat(target);
      if (!isNaN(baselineNum) && !isNaN(targetNum) && targetNum !== baselineNum && deadline) {
        const today = new Date();
        const totalMs = deadline.getTime() - today.getTime();
        const range = targetNum - baselineNum;
        const unitLabel = unit.trim();
        const generated = [0.25, 0.5, 0.75].map((pct) => {
          const value = baselineNum + range * pct;
          const rounded = Math.round(value * 100) / 100;
          const milestoneDate = new Date(today.getTime() + totalMs * pct);
          return {
            id: genId(),
            title: `Reach ${rounded}${unitLabel} (${pct * 100}%)`,
            deadline: milestoneDate,
          };
        });
        setMilestones(generated);
      }
    }
    setStep((s) => s + 1);
  };

  const addMilestone = () =>
    setMilestones((prev) => [...prev, { id: genId(), title: '', deadline: null }]);

  const removeMilestone = (id: string) =>
    setMilestones((prev) => prev.filter((m) => m.id !== id));

  const updateMilestone = (id: string, field: keyof MilestoneRow, value: any) =>
    setMilestones((prev) => prev.map((m) => (m.id === id ? { ...m, [field]: value } : m)));

  const addTemplate = () =>
    setTemplates((prev) => [
      ...prev,
      {
        id: genId(),
        title: '',
        daysOfWeek: [1, 3, 5],
        startTime: '09:00',
        endTime: '10:00',
        rangeStart: null,
        rangeEnd: deadline,
        reminderEnabled: false,
        reminderHours: 1,
      },
    ]);

  const removeTemplate = (id: string) =>
    setTemplates((prev) => prev.filter((t) => t.id !== id));

  const updateTemplate = (id: string, field: keyof TaskTemplate, value: any) =>
    setTemplates((prev) => prev.map((t) => (t.id === id ? { ...t, [field]: value } : t)));

  const estimatedTaskCount = templates.reduce((sum, tpl) => {
    if (!tpl.rangeStart || !tpl.rangeEnd || tpl.daysOfWeek.length === 0) return sum;
    const days = Math.ceil((tpl.rangeEnd.getTime() - tpl.rangeStart.getTime()) / 86400000);
    return sum + Math.round((days / 7) * tpl.daysOfWeek.length);
  }, 0);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const project = await createProject({
        title,
        description,
        goal: category,
        deadline: deadline?.toISOString(),
      });

      const validMilestones = milestones.filter((m) => m.title.trim());
      await Promise.all(
        validMilestones.map((m) =>
          createMilestone({ projectId: project._id, title: m.title, deadline: m.deadline?.toISOString() })
        )
      );

      const validTemplates = templates.filter(
        (t) => t.title.trim() && t.daysOfWeek.length > 0 && t.rangeStart && t.rangeEnd
      );
      if (validTemplates.length > 0) {
        const result = await generateTasks(
          project._id,
          validTemplates.map((t) => ({
            title: t.title,
            daysOfWeek: t.daysOfWeek,
            startTime: t.startTime,
            endTime: t.endTime,
            rangeStart: t.rangeStart!.toISOString(),
            rangeEnd: t.rangeEnd!.toISOString(),
            reminderHours: t.reminderEnabled ? t.reminderHours : null,
          }))
        );
        if (result.conflictCount > 0) {
          setConflictCount(result.conflictCount);
          setTimeout(() => navigate(`/projects/${project._id}`), 3000);
          return;
        }
      }

      navigate(`/projects/${project._id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Stepper activeStep={step} sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step 0: Goal Info */}
      {step === 0 && (
        <Stack spacing={2}>
          <TextField
            label="Goal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
            placeholder="e.g. Complete a Marathon"
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
            fullWidth
          />
          <TextField
            select
            label="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            fullWidth
          >
            {CATEGORIES.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
          </TextField>
          <DatePicker
            label="Deadline (optional)"
            value={deadline}
            onChange={(v) => setDeadline(v)}
          />
          <Typography variant="subtitle2" color="text.secondary" pt={1}>
            Auto-generate milestones (optional)
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Current baseline"
              value={baseline}
              onChange={(e) => setBaseline(e.target.value)}
              type="number"
              size="small"
              placeholder="e.g. 5"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Target value"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              type="number"
              size="small"
              placeholder="e.g. 42"
              sx={{ flex: 1 }}
            />
            <TextField
              label="Unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              size="small"
              placeholder="e.g. km"
              sx={{ flex: 1 }}
            />
          </Stack>
          {baseline && target && deadline && (
            <Typography variant="caption" color="text.secondary">
              Will auto-generate 3 milestones at 25%, 50%, 75% progress when you click Next.
            </Typography>
          )}
        </Stack>
      )}

      {/* Step 1: Milestones */}
      {step === 1 && (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            Break your goal into key checkpoints. You can skip this step.
          </Typography>
          {milestones.map((m, idx) => (
            <Stack key={m.id} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 20 }}>{idx + 1}.</Typography>
              <TextField
                label="Milestone"
                value={m.title}
                onChange={(e) => updateMilestone(m.id, 'title', e.target.value)}
                fullWidth
                size="small"
                placeholder="e.g. Run 10km in 1 month"
              />
              <DatePicker
                label="By date"
                value={m.deadline}
                onChange={(v) => updateMilestone(m.id, 'deadline', v)}
                slotProps={{ textField: { size: 'small', sx: { width: 160 } } }}
              />
              <IconButton
                onClick={() => removeMilestone(m.id)}
                size="small"
                disabled={milestones.length === 1}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
          <Button
            startIcon={<AddIcon />}
            onClick={addMilestone}
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Milestone
          </Button>
        </Stack>
      )}

      {/* Step 2: Weekly Tasks */}
      {step === 2 && (
        <Stack spacing={3}>
          <Typography variant="body2" color="text.secondary">
            Define recurring weekly tasks. These will be scheduled in your calendar. You can skip this step.
          </Typography>

          {templates.map((t, idx) => (
            <Box key={t.id} sx={{ border: 1, borderColor: 'divider', borderRadius: 1, p: 2 }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="subtitle2">Task {idx + 1}</Typography>
                <IconButton onClick={() => removeTemplate(t.id)} size="small">
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Stack>
              <Stack spacing={2}>
                <TextField
                  label="Task Title"
                  value={t.title}
                  onChange={(e) => updateTemplate(t.id, 'title', e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="e.g. Run 3km"
                />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Days of week
                  </Typography>
                  <ToggleButtonGroup
                    value={t.daysOfWeek}
                    onChange={(_, val) => val.length > 0 && updateTemplate(t.id, 'daysOfWeek', val)}
                    size="small"
                  >
                    {DAYS.map((day, i) => (
                      <ToggleButton key={i} value={i}>
                        {day}
                      </ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Box>
                <Stack direction="row" spacing={2}>
                  <TextField
                    label="Start Time"
                    type="time"
                    value={t.startTime}
                    onChange={(e) => updateTemplate(t.id, 'startTime', e.target.value)}
                    size="small"
                    sx={{ width: 150 }}
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    label="End Time"
                    type="time"
                    value={t.endTime}
                    onChange={(e) => updateTemplate(t.id, 'endTime', e.target.value)}
                    size="small"
                    sx={{ width: 150 }}
                    InputLabelProps={{ shrink: true }}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <DatePicker
                    label="From"
                    value={t.rangeStart}
                    onChange={(v) => updateTemplate(t.id, 'rangeStart', v)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                  <DatePicker
                    label="To"
                    value={t.rangeEnd}
                    onChange={(v) => updateTemplate(t.id, 'rangeEnd', v)}
                    slotProps={{ textField: { size: 'small' } }}
                  />
                </Stack>
                <Stack direction="row" spacing={2} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch
                        checked={t.reminderEnabled}
                        onChange={(e) => updateTemplate(t.id, 'reminderEnabled', e.target.checked)}
                        size="small"
                      />
                    }
                    label="Email reminder"
                  />
                  {t.reminderEnabled && (
                    <TextField
                      label="Hours before"
                      type="number"
                      value={t.reminderHours}
                      onChange={(e) => updateTemplate(t.id, 'reminderHours', Math.max(0, parseInt(e.target.value) || 0))}
                      size="small"
                      sx={{ width: 130 }}
                      inputProps={{ min: 1, max: 72 }}
                    />
                  )}
                </Stack>
              </Stack>
            </Box>
          ))}

          <Button
            startIcon={<AddIcon />}
            onClick={addTemplate}
            variant="outlined"
            size="small"
            sx={{ alignSelf: 'flex-start' }}
          >
            Add Another Task
          </Button>

          {estimatedTaskCount > 0 && (
            <Alert severity="info">
              This will create approximately <strong>{estimatedTaskCount}</strong> tasks in your calendar.
            </Alert>
          )}
        </Stack>
      )}

      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      {conflictCount > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {conflictCount} tasks overlap with existing events. Redirecting to goal page — you can adjust them in the Calendar.
        </Alert>
      )}

      <Stack direction="row" spacing={2} justifyContent="flex-end" mt={4}>
        <Button onClick={() => navigate('/projects')} disabled={submitting}>
          Cancel
        </Button>
        {step > 0 && (
          <Button onClick={() => setStep((s) => s - 1)} disabled={submitting}>
            Back
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button variant="contained" onClick={handleNext} disabled={!canNext()}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !title.trim()}
          >
            {submitting ? 'Creating…' : 'Create Goal'}
          </Button>
        )}
      </Stack>
    </Box>
  );
}
