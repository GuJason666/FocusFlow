import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProjectsListPage() {
  const navigate = useNavigate();
  const { projects, loading, fetchProjects } = useProjectStore();
  const user = useAuthStore((s) => s.user);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700}>Projects</Typography>
        {user?.role === 'coach' && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/projects/new')}>
            New Project
          </Button>
        )}
      </Box>

      {projects.length === 0 ? (
        <Typography color="text.secondary">No projects yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {projects.map((project) => (
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
                      <Chip label={`Coach: ${project.coach.name}`} size="small" variant="outlined" />
                      {project.deadline && (
                        <Chip label={`Due: ${format(new Date(project.deadline), 'MMM d, yyyy')}`} size="small" color="warning" variant="outlined" />
                      )}
                      <Chip label={`${project.members.length} members`} size="small" />
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
