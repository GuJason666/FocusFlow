import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, startOfWeek, endOfWeek, addWeeks } from 'date-fns';
import { useTaskStore } from '../../store/useTaskStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TasksPage() {
  const navigate = useNavigate();
  const { tasks, loading, fetchTasksInRange, toggleComplete, deleteTask } = useTaskStore();

  useEffect(() => {
    const start = startOfWeek(new Date(), { weekStartsOn: 0 });
    const end = endOfWeek(addWeeks(new Date(), 2), { weekStartsOn: 0 });
    fetchTasksInRange(start.toISOString(), end.toISOString());
  }, [fetchTasksInRange]);

  if (loading) return <LoadingSpinner />;

  const sorted = [...tasks].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Tasks</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/tasks/new')}>
          New Task
        </Button>
      </Box>

      {tasks.length === 0 ? (
        <Typography color="text.secondary">No tasks found.</Typography>
      ) : (
        <List>
          {sorted.map((task) => (
            <ListItem
              key={task._id}
              divider
              sx={{ opacity: task.completed ? 0.6 : 1 }}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => deleteTask(task._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <Checkbox checked={task.completed} onChange={() => toggleComplete(task._id)} />
              <ListItemText
                primary={task.title}
                secondary={`${format(new Date(task.startTime), 'MMM d, h:mm a')} – ${format(new Date(task.endTime), 'h:mm a')}`}
                sx={{ textDecoration: task.completed ? 'line-through' : 'none', cursor: 'pointer' }}
                onClick={() => !task._virtual && navigate(`/tasks/${task._id}`)}
              />
              {task.isRecurringTemplate && <Chip label="Recurring" size="small" sx={{ mr: 1 }} />}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
