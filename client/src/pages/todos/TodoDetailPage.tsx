import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import { format } from 'date-fns';
import { getTodos } from '../../services/todoService';
import { useTodoStore } from '../../store/useTodoStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Todo } from '../../types/todo';
import TodoForm from '../../components/forms/TodoForm';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function TodoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { todos, fetchTodos, updateTodo, deleteTodo, toggleComplete } = useTodoStore();
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useEffect(() => {
    fetchTodos().finally(() => setLoading(false));
  }, [fetchTodos]);

  const todo = todos.find((t) => t._id === id);

  if (loading) return <LoadingSpinner />;
  if (!todo) return <Typography>Todo not found.</Typography>;

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
        <Chip label={todo.completed ? 'Done' : 'Pending'} size="small" color={todo.completed ? 'success' : 'default'} />
        {todo.convertedToTaskId && <Chip label="Scheduled" size="small" color="primary" />}
      </Box>

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
          {todo.deadline && (
            <Typography variant="body2" color="text.secondary" mb={3}>
              Deadline: {format(new Date(todo.deadline), 'MMM d, yyyy')}
            </Typography>
          )}
          <Box display="flex" gap={1}>
            {!todo.convertedToTaskId && (
              <>
                <Button variant="outlined" onClick={() => setEditing(true)}>Edit</Button>
                <Button variant="outlined" onClick={() => toggleComplete(todo._id)}>
                  {todo.completed ? 'Mark Incomplete' : 'Mark Complete'}
                </Button>
              </>
            )}
            <Button variant="outlined" color="error" onClick={() => setDeleteOpen(true)}>Delete</Button>
          </Box>
        </Paper>
      )}

      <ConfirmDialog
        open={deleteOpen}
        title="Delete Todo"
        message="Are you sure you want to delete this todo?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </Box>
  );
}
