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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !startTime || !endTime) return;
    await onSubmit({
      title,
      description,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      recurring: recurring ? { frequency: frequency as any } : undefined,
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
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving…' : 'Save Task'}
        </Button>
      </Stack>
    </Stack>
  );
}
