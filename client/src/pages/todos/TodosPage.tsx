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
import Divider from '@mui/material/Divider';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { addDays, format } from 'date-fns';
import { useTodoStore } from '../../store/useTodoStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCoachStudentStore } from '../../store/useCoachStudentStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { User } from '../../types/user';

export default function TodosPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const isCoach = user?.role === 'coach';
  const { todos, loading, fetchTodos, toggleComplete, deleteTodo } = useTodoStore();
  const { fetchStudents } = useCoachStudentStore();

  useEffect(() => {
    fetchTodos();
    if (isCoach) fetchStudents();
  }, [fetchTodos, fetchStudents, isCoach]);

  if (loading) return <LoadingSpinner />;

  const weekTodos = todos.filter((t) => !!t.weekOf);

  const groups = new Map<string, typeof weekTodos>();
  for (const todo of weekTodos) {
    const key = todo.weekOf!;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(todo);
  }

  const sortedKeys = Array.from(groups.keys()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  const getCoachName = (assignedBy: any): string => {
    if (!assignedBy) return '';
    if (typeof assignedBy === 'object' && (assignedBy as User).name) {
      return (assignedBy as User).name;
    }
    return '';
  };

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Todos</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/todos/new')}>
          New Todo
        </Button>
      </Box>

      {sortedKeys.length === 0 ? (
        <Typography color="text.secondary">No todos found.</Typography>
      ) : (
        sortedKeys.map((weekKey) => {
          const sunday = new Date(weekKey);
          const saturday = addDays(sunday, 6);
          const header = `${format(sunday, 'MMM d')} – ${format(saturday, 'MMM d')}`;
          const group = groups.get(weekKey)!;

          return (
            <Box key={weekKey} mb={3}>
              <Typography variant="subtitle2" color="text.secondary" mb={0.5}>
                {header}
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <List disablePadding>
                {group.map((todo) => {
                  const isCoachAssigned = !!todo.assignedBy;
                  const coachName = getCoachName(todo.assignedBy);
                  const canDelete = isCoach || !isCoachAssigned;
                  const canToggle = !todo.convertedToTaskId;

                  return (
                    <ListItem
                      key={todo._id}
                      divider
                      sx={{ opacity: todo.completed || todo.convertedToTaskId ? 0.6 : 1 }}
                      secondaryAction={
                        canDelete ? (
                          <IconButton edge="end" size="small" onClick={() => deleteTodo(todo._id)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        ) : undefined
                      }
                    >
                      <Checkbox
                        checked={todo.completed}
                        onChange={() => canToggle && !isCoachAssigned && toggleComplete(todo._id)}
                        disabled={!canToggle || isCoachAssigned}
                      />
                      <ListItemText
                        primary={todo.title}
                        secondary={todo.deadline ? `Due: ${format(new Date(todo.deadline), 'MMM d, yyyy')}` : 'No deadline'}
                        sx={{ textDecoration: todo.completed ? 'line-through' : 'none', cursor: 'pointer' }}
                        onClick={() => navigate(`/todos/${todo._id}`)}
                      />
                      {todo.category && (
                        <Chip label={todo.category} size="small" variant="outlined" sx={{ mr: 0.5 }} />
                      )}
                      {/* Coach view: show how many students assigned */}
                      {isCoach && todo.assignedToStudents && todo.assignedToStudents.length > 0 && (
                        <Chip
                          label={`${todo.assignedToStudents.length} student${todo.assignedToStudents.length !== 1 ? 's' : ''}`}
                          size="small"
                          color="secondary"
                          sx={{ mr: 0.5 }}
                        />
                      )}
                      {/* Student view: show coach name */}
                      {!isCoach && coachName && (
                        <Chip label={`From: ${coachName}`} size="small" color="info" sx={{ mr: 0.5 }} />
                      )}
                      {todo.convertedToTaskId && (
                        <Chip label="Scheduled" size="small" color="primary" sx={{ mr: 1 }} />
                      )}
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          );
        })
      )}
    </Box>
  );
}
