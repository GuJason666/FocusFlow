import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useTodoStore } from '../../store/useTodoStore';
import TodoForm from '../../components/forms/TodoForm';

export default function TodoNewPage() {
  const navigate = useNavigate();
  const createTodo = useTodoStore((s) => s.createTodo);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createTodo(data);
      navigate('/todos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" fontWeight={700} mb={3}>New Todo</Typography>
      <Paper sx={{ p: 3 }}>
        <TodoForm onSubmit={handleSubmit} onCancel={() => navigate('/todos')} loading={loading} />
      </Paper>
    </Box>
  );
}
