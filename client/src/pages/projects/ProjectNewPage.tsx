import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import GoalCreationForm from '../../components/forms/GoalCreationForm';

export default function ProjectNewPage() {
  return (
    <Box maxWidth={700}>
      <Typography variant="h5" fontWeight={700} mb={3}>New Goal</Typography>
      <Paper sx={{ p: 3 }}>
        <GoalCreationForm />
      </Paper>
    </Box>
  );
}
