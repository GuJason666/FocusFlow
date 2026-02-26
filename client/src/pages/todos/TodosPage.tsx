import { useEffect } from 'react';
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
import { format } from 'date-fns';
import { useTodoStore } from '../../store/useTodoStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TodosPage() {
  const navigate = useNavigate();
  const { todos, loading, fetchTodos, toggleComplete, deleteTodo } = useTodoStore();

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Todos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/todos/new')}>
          New Todo
        </Button>
      </Box>

      {todos.length === 0 ? (
        <Typography color="text.secondary">No todos found.</Typography>
      ) : (
        <List>
          {todos.map((todo) => (
            <ListItem
              key={todo._id}
              divider
              sx={{ opacity: todo.completed || todo.convertedToTaskId ? 0.6 : 1 }}
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => deleteTodo(todo._id)}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              }
            >
              <Checkbox
                checked={todo.completed}
                onChange={() => !todo.convertedToTaskId && toggleComplete(todo._id)}
                disabled={!!todo.convertedToTaskId}
              />
              <ListItemText
                primary={todo.title}
                secondary={todo.deadline ? `Due: ${format(new Date(todo.deadline), 'MMM d, yyyy')}` : 'No deadline'}
                sx={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
                onClick={() => navigate(`/todos/${todo._id}`)}
              />
              {todo.convertedToTaskId && <Chip label="Scheduled" size="small" color="primary" sx={{ mr: 1 }} />}
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
