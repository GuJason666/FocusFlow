import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { format } from 'date-fns';
import { useTodoStore } from '../../store/useTodoStore';
import { useAuthStore } from '../../store/useAuthStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import TodoForm from '../../components/forms/TodoForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { User } from '../../types/user';

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { todos, fetchTodos, updateTodo, deleteTodo, toggleComplete } = useTodoStore();
  const user = useAuthStore((s) => s.user);
  const isCoach = user?.role === 'coach';
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchTodos().finally(() => setLoading(false));
  }, [fetchTodos]);

  const todo = todos.find((t) => t._id === id);

  if (loading) return <LoadingSpinner />;
  if (!todo) return <Typography>Todo not found.</Typography>;

  const isCoachAssigned = !!todo.assignedBy;
  const coachName = typeof todo.assignedBy === 'object'
    ? (todo.assignedBy as User).name
    : '';

  // Students cannot edit or delete coach-assigned todos
  const canEdit = isCoach || !isCoachAssigned;
  const canDelete = isCoach || !isCoachAssigned;

  const handleUpdate = async (data: any) => {
    if (!id) return;
    await updateTodo(id, data);
    setEditing(false);
  };

  const handleDelete = async () => {
    if (!id) return;
    await deleteTodo(id);
    navigate('/todos');
  };

  return (
    <Box maxWidth={600}>
      <Box display="flex" alignItems="center" gap={1} mb={3}>
        <Typography variant="h5" fontWeight={700} flexGrow={1}>{todo.title}</Typography>
        <Chip
          label={todo.completed ? 'Done' : 'Pending'}
          size="small"
          color={todo.completed ? 'success' : 'default'}
        />
        {todo.convertedToTaskId && <Chip label="Scheduled" size="small" color="primary" />}
      </Box>

      {isCoachAssigned && coachName && (
        <Alert severity="info" icon={false} sx={{ mb: 2 }}>
          Assigned by coach: <strong>{coachName}</strong>
        </Alert>
      )}

      {todo.convertedToTaskId && (
        <Alert severity="info" sx={{ mb: 2 }}>This todo has been converted to a scheduled task.</Alert>
      )}

      {editing ? (
        <Paper sx={{ p: 3 }}>
          <TodoForm initial={todo} onSubmit={handleUpdate} onCancel={() => setEditing(false)} />
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1" mb={2}>{todo.description || 'No description.'}</Typography>
          {todo.weekOf && (
            <Typography variant="body2" color="text.secondary" mb={1}>
              Week: {format(new Date(todo.weekOf), 'MMM d')} – {format(new Date(new Date(todo.weekOf).getTime() + 6 * 86400000), 'MMM d, yyyy')}
            </Typography>
          )}
          {todo.deadline && (
            <Typography variant="body2" color="text.secondary" mb={3}>
              Deadline: {format(new Date(todo.deadline), 'MMM d, yyyy')}
            </Typography>
          )}
          <Box display="flex" gap={1} flexWrap="wrap">
            {canEdit && !todo.convertedToTaskId && (
              <>
                <Button variant="outlined" onClick={() => setEditing(true)}>Edit</Button>
                <Button variant="outlined" onClick={() => toggleComplete(todo._id)}>
                  {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
              </>
            )}
            {canDelete && (
              <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            )}
          </Box>
        </Paper>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Todo"
        message={
          todo.assignedToStudents && todo.assignedToStudents.length > 0
            ? `Delete this todo? It will also be removed for all ${todo.assignedToStudents.length} assigned student(s).`
            : 'Are you sure you want to delete this todo?'
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Box>
  );
}
