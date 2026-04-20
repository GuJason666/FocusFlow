import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import AddIcon from '@mui/icons-material/Add';
import { useCourseStore } from '../../store/useCourseStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CoursesPage() {
  const navigate = useNavigate();
  const { courses, loading, fetchCourses } = useCourseStore();

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Courses</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/courses/new')}>
          Add Course
        </Button>
      </Box>

      {courses.length === 0 ? (
        <Typography color="text.secondary">No courses added yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {courses.map((course) => (
            <Grid item xs={12} sm={6} md={4} key={course._id}>
              <Card variant="outlined">
                <CardActionArea onClick={() => navigate(`/courses/${course._id}`)}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={700}>{course.courseCode}</Typography>
                    <Typography variant="body2" color="text.secondary">{course.courseName}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {course.schedule.length} lecture{course.schedule.length !== 1 ? 's' : ''}/week
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
