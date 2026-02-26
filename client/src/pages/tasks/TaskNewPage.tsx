import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useTaskStore } from '../../store/useTaskStore';
import TaskForm from '../../components/forms/TaskForm';

export default function TaskNewPage() {
  const navigate = useNavigate();
  const createTask = useTaskStore((s) => s.createTask);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const task = await createTask(data);
      navigate('/tasks');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" fontWeight={700} mb={3}>New Task</Typography>
      <Paper sx={{ p: 3 }}>
        <TaskForm onSubmit={handleSubmit} onCancel={() => navigate('/tasks')} loading={loading} />
      </Paper>
    </Box>
  );
}
