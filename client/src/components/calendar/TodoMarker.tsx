import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import { Todo } from '../../types/todo';

interface Props {
  todos: Todo[];
}

export default function TodoMarker({ todos }: Props) {
  if (todos.length === 0) return null;
  return (
    <Box display="flex" flexWrap="wrap" gap={0.25} mt={0.25}>
      {todos.map((t) => (
        <Tooltip key={t._id} title={t.title}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: t.completed ? '#9CA3AF' : '#F59E0B',
            }}
          />
        </Tooltip>
      ))}
    </Box>
  );
}
