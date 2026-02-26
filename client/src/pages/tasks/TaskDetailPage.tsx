import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { format } from 'date-fns';
import { getTask } from '../../services/taskService';
import { useTaskStore } from '../../store/useTaskStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Task } from '../../types/task';
import TaskForm from '../../components/forms/TaskForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { updateTask, deleteTask, toggleComplete } = useTaskStore();
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getTask(id).then(setTask).catch(() => navigate('/tasks')).finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <LoadingSpinner />;
  if (!task) return null;

  const handleUpdate = async (data: any) => {
    if (!id) return;
    await updateTask(id, data);
    const updated = await getTask(id);
    setTask(updated);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteTask(id);
    navigate('/tasks');
  };

  return (
    <Box maxWidth={600}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Typography variant="h5" fontWeight={700} flexGrow={1}>{task.title}</Typography>
        <Chip label={task.completed ? 'Done' : 'Pending'} size="small" color={task.completed ? 'success' : 'default'} />
        {task.isRecurringTemplate && <Chip label="Recurring" size="small" />}
      </Box>

      {editing ? (
        <Paper sx={{ p: 3 }}>
          <TaskForm initial={task} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" mb={2}>{task.description || 'No description.'}</Typography>
          <Typography variant="body2" color="text.secondary">
            Start: {format(new Date(task.startTime), 'MMM d, yyyy h:mm a')}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            End: {format(new Date(task.endTime), 'MMM d, yyyy h:mm a')}
          </Typography>
          <Box display="flex" gap={1}>
            <Button variant="outlined" onClick={() => setEditing(true)}>Edit</Button>
            <Button variant="outlined" onClick={() => toggleComplete(task._id)}>
              {task.completed ? 'Mark Incomplete' : 'Mark Complete'}
            </Button>
            <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>Delete</Button>
          </Box>
        </Paper>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Box>
  );
}
