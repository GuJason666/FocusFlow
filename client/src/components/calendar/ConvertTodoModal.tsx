import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { format, addHours } from 'date-fns';
import { Todo } from '../../types/todo';
import { useTodoStore } from '../../store/useTodoStore';

interface Props {
  open: boolean;
  todo: Todo | null;
  prefillStart: Date | null;
  onClose: () => void;
}

export default function ConvertTodoModal({ open, todo, prefillStart, onClose }: Props) {
  const convertToTask = useTodoStore((s) => s.convertToTask);
  const [startTime, setStartTime] = useState<Date | null>(prefillStart);
  const [endTime, setEndTime] = useState<Date | null>(
    prefillStart ? addHours(prefillStart, 1) : null
  );
  const [loading, setLoading] = useState(false);

  // Update times when prefillStart changes
  const handleOpen = () => {
    if (prefillStart) {
      setStartTime(prefillStart);
      setEndTime(addHours(prefillStart, 1));
    }
  };

  const handleConfirm = async () => {
    if (!todo || !startTime || !endTime) return;
    setLoading(true);
    try {
      await convertToTask(todo._id, startTime.toISOString(), endTime.toISOString());
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth TransitionProps={{ onEnter: handleOpen }}>
      <DialogTitle>Convert Todo to Task</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Schedule <strong>{todo?.title}</strong> on the calendar.
        </Typography>
        <Stack spacing={2}>
          <TimePicker
            label="Start Time"
            value={startTime}
            onChange={(v) => setStartTime(v)}
          />
          <TimePicker
            label="End Time"
            value={endTime}
            onChange={(v) => setEndTime(v)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          disabled={loading || !startTime || !endTime}
        >
          {loading ? 'Converting…' : 'Convert to Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
