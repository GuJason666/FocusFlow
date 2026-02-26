import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CoachDashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { projects, loading, fetchProjects } = useProjectStore();

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  if (loading) return <LoadingSpinner />;

  const myProjects = projects.filter(
    (p) => (p.coach as any)._id === user?._id || (p.coach as any) === user?._id
  );

  const totalMembers = myProjects.reduce((sum, p) => sum + p.members.length, 0);

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Coach Dashboard</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/projects/new')}>
          New Project
        </Button>
      </Box>

      {/* Stats row */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="primary">{myProjects.length}</Typography>
              <Typography variant="body2" color="text.secondary">Projects</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} color="secondary">{totalMembers}</Typography>
              <Typography variant="body2" color="text.secondary">Total Students</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" fontWeight={600} mb={2}>My Projects</Typography>
      {myProjects.length === 0 ? (
        <Typography color="text.secondary">No projects yet. Create one to get started.</Typography>
      ) : (
        <Grid container spacing={2}>
          {myProjects.map((project) => (
            <Grid item xs={12} sm={6} md={4} key={project._id}>
              <Card>
                <CardActionArea onClick={() => navigate(`/projects/${project._id}`)}>
                  <CardContent>
                    <Typography variant="h6" fontWeight={600} gutterBottom noWrap>
                      {project.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap mb={1}>
                      {project.description || 'No description'}
                    </Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      <Chip label={`${project.members.length} students`} size="small" />
                      {project.deadline && (
                        <Chip label={`Due: ${format(new Date(project.deadline), 'MMM d')}`} size="small" color="warning" variant="outlined" />
                      )}
                    </Box>
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
