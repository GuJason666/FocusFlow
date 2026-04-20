import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import CourseCreationForm from '../../components/forms/CourseCreationForm';

export default function CourseNewPage() {
  return (
    <Box maxWidth={800}>
      <Typography variant="h5" fontWeight={700} mb={3}>Add Course</Typography>
      <Paper sx={{ p: 3 }}>
        <CourseCreationForm />
      </Paper>
    </Box>
  );
}
