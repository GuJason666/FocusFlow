import { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import ListItemText from '@mui/material/ListItemText';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { startOfWeek } from 'date-fns';
import { Todo } from '../../types/todo';
import { CATEGORIES } from '../../constants/categories';
import { useAuthStore } from '../../store/useAuthStore';
import { useCoachStudentStore } from '../../store/useCoachStudentStore';

interface Props {
  initial?: Partial<Todo>;
  onSubmit: (data: Partial<Todo> & { assignedToStudents?: string[] }) => Promise<void>;
  onCancel?: () => void;
  loading?: boolean;
}

export default function TodoForm({ initial, onSubmit, onCancel, loading }: Props) {
  const user = useAuthStore((s) => s.user);
  const isCoach = user?.role === 'coach';
  const { students } = useCoachStudentStore();

  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [deadline, setDeadline] = useState<Date | null>(
    initial?.deadline ? new Date(initial.deadline) : null
  );
  const [category, setCategory] = useState(initial?.category ?? 'Other');
  const [weekOf, setWeekOf] = useState<Date | null>(
    initial?.weekOf ? new Date(initial.weekOf) : null
  );
  const [assignedToStudents, setAssignedToStudents] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    const weekOfDate = weekOf ? startOfWeek(weekOf, { weekStartsOn: 0 }) : undefined;
    await onSubmit({
      title,
      description,
      deadline: deadline?.toISOString(),
      category,
      weekOf: weekOfDate?.toISOString(),
      ...(isCoach && assignedToStudents.length > 0 ? { assignedToStudents } : {}),
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
        label="Week (pick any day in target week)"
        value={weekOf}
        onChange={(v) => setWeekOf(v)}
      />
      <DatePicker
        label="Deadline (optional)"
        value={deadline}
        onChange={(v) => setDeadline(v)}
      />

      {isCoach && students.length > 0 && (
        <FormControl fullWidth>
          <InputLabel>Assign to Students</InputLabel>
          <Select
            multiple
            value={assignedToStudents}
            onChange={(e) => setAssignedToStudents(e.target.value as string[])}
            input={<OutlinedInput label="Assign to Students" />}
            renderValue={(selected) =>
              students
                .filter((r) => (selected as string[]).includes(r.student._id))
                .map((r) => r.student.name)
                .join(', ')
            }
          >
            {students.map((rel) => (
              <MenuItem key={rel.student._id} value={rel.student._id}>
                <Checkbox checked={assignedToStudents.includes(rel.student._id)} />
                <ListItemText primary={rel.student.name} secondary={rel.student.email} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Stack direction="row" spacing={1} justifyContent="flex-end">
        {onCancel && <Button onClick={onCancel}>Cancel</Button>}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? 'Saving…' : 'Save Todo'}
        </Button>
      </Stack>
    </Stack>
  );
}
