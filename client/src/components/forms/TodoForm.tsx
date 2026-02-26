import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Todo } from '../../types/todo';

interface Props {
  initial?: Partial<Todo>;
  onSubmit: (data: Partial<Todo>) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function TodoForm({ initial, onSubmit, onCancel, loading }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [deadline, setDeadline] = useState<Date | null>(
    initial?.deadline ? new Date(initial.deadline) : null
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    await onSubmit({
      title,
      description,
      deadline: deadline?.toISOString(),
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
      <DatePicker
        label="Deadline (optional)"
        value={deadline}
        onChange={(v) => setDeadline(v)}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving…' : 'Save Todo'}
        </Button>
      </Stack>
    </Stack>
  );
}
