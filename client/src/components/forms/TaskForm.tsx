import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { Task } from '../../types/task';
import { addHours } from 'date-fns';
import { CATEGORIES } from '../../constants/categories';

interface Props {
  initial?: Partial<Task>;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function TaskForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [startTime, setStartTime] = useState<Date | null>(
    initial?.startTime ? new Date(initial.startTime) : new Date()
  );
  const [endTime, setEndTime] = useState<Date | null>(
    initial?.endTime ? new Date(initial.endTime) : addHours(new Date(), 1)
  );
  const [recurring, setRecurring] = useState(!!initial?.recurring?.frequency);
  const [frequency, setFrequency] = useState<string>(initial?.recurring?.frequency ?? 'daily');
  const [category, setCategory] = useState(initial?.category ?? 'Other');
  const [reminderEnabled, setReminderEnabled] = useState(initial?.reminderHours != null);
  const [reminderHours, setReminderHours] = useState<number>(initial?.reminderHours ?? 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;
    await onSubmit({
      title,
      description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      recurring: recurring ? { frequency: frequency as any } : undefined,
      category,
      reminderHours: reminderEnabled ? reminderHours : null,
    });
  };

  return (
    <Stack component="form" onSubmit={handleSubmit} spacing={2}>
      <TextField
        label="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        fullWidth
      />
      <TextField
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        rows={2}
        fullWidth
      />
      <DateTimePicker
        label="Start Time"
        value={startTime}
        onChange={(v) => setStartTime(v)}
      />
      <DateTimePicker
        label="End Time"
        value={endTime}
        onChange={(v) => setEndTime(v)}
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
      <FormControlLabel
        control={<Switch checked={recurring} onChange={(e) => setRecurring(e.target.checked)} />}
        label="Recurring"
      />
      {recurring && (
        <TextField
          select
          label="Frequency"
          value={frequency}
          onChange={(e) => setFrequency(e.target.value)}
          fullWidth
        >
          <MenuItem value="daily">Daily</MenuItem>
          <MenuItem value="weekly">Weekly</MenuItem>
          <MenuItem value="monthly">Monthly</MenuItem>
        </TextField>
      )}
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
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving…' : 'Save Task'}
        </Button>
      </Stack>
    </Stack>
  );
}
