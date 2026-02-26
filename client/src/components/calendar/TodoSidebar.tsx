import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Paper from '@mui/material/Paper';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Todo } from '../../types/todo';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';

interface DraggableTodoItemProps {
  todo: Todo;
}

function DraggableTodoItem({ todo }: DraggableTodoItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: todo._id,
    data: { todo },
  });

  return (
    <Paper
      ref={setNodeRef}
      elevation={isDragging ? 4 : 1}
      sx={{
        p: 1,
        mb: 0.5,
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transform: CSS.Translate.toString(transform),
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: todo.completed ? 'grey.100' : 'white',
        '&:hover': { bgcolor: 'primary.50' },
      }}
      {...listeners}
      {...attributes}
    >
      <DragIndicatorIcon sx={{ fontSize: 16, color: 'text.disabled', flexShrink: 0 }} />
      <Typography variant="caption" noWrap fontWeight={500}>
        {todo.title}
      </Typography>
    </Paper>
  );
}

interface Props {
  todos: Todo[];
}

export default function TodoSidebar({ todos }: Props) {
  const unscheduled = todos.filter((t) => !t.completed && !t.convertedToTaskId);

  return (
    <Box
      sx={{
        width: 200,
        flexShrink: 0,
        borderLeft: '1px solid',
        borderColor: 'divider',
        pl: 1.5,
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Typography variant="subtitle2" fontWeight={700} mb={1} color="text.secondary">
        Todos ({unscheduled.length})
      </Typography>
      <Typography variant="caption" color="text.disabled" display="block" mb={1}>
        Drag onto calendar to schedule
      </Typography>
      {unscheduled.length === 0 ? (
        <Typography variant="caption" color="text.disabled">
          No pending todos
        </Typography>
      ) : (
        unscheduled.map((todo) => <DraggableTodoItem key={todo._id} todo={todo} />)
      )}
    </Box>
  );
}
