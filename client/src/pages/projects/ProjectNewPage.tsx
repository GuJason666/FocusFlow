import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { useProjectStore } from '../../store/useProjectStore';
import ProjectForm from '../../components/forms/ProjectForm';

export default function ProjectNewPage() {
  const navigate = useNavigate();
  const createProject = useProjectStore((s) => s.createProject);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const project = await createProject(data);
      navigate(`/projects/${project._id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxWidth={600}>
      <Typography variant="h5" fontWeight={700} mb={3}>New Project</Typography>
      <Paper sx={{ p: 3 }}>
        <ProjectForm onSubmit={handleSubmit} onCancel={() => navigate('/projects')} loading={loading} />
      </Paper>
    </Box>
  );
}
