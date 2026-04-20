import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useTodoStore } from '../../store/useTodoStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCoachStudentStore } from '../../store/useCoachStudentStore';
import TodoForm from '../../components/forms/TodoForm';

export default function TodoNewPage() {
  const navigate = useNavigate();
  const createTodo = useTodoStore((s) => s.createTodo);
  const user = useAuthStore((s) => s.user);
  const { fetchStudents } = useCoachStudentStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.role === 'coach') fetchStudents();
  }, [user, fetchStudents]);

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
