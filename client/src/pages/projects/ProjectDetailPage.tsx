import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Checkbox from '@mui/material/Checkbox';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { format } from 'date-fns';
import { getProject } from '../../services/projectService';
import { getMilestones, createMilestone, toggleMilestone, deleteMilestone } from '../../services/milestoneService';
import { getProjectTasks } from '../../services/taskService';
import { getTodos } from '../../services/todoService';
import { useProjectStore } from '../../store/useProjectStore';
import { useAuthStore } from '../../store/useAuthStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Project } from '../../types/project';
import { Milestone } from '../../types/milestone';
import { Task } from '../../types/task';
import { Todo } from '../../types/todo';
import MilestoneForm from '../../components/forms/MilestoneForm';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { addMember, removeMember } = useProjectStore();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [milestoneDialog, setMilestoneDialog] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const p = await getProject(id);
        setProject(p as any);
        setMilestones((p as any).milestones || []);
        const [t, td] = await Promise.all([getProjectTasks(id), getTodos(id)]);
        setTasks(t);
        setTodos(td);
      } catch {
        navigate('/projects');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  if (loading || !project) return <LoadingSpinner />;

  const isCoach = user?._id === (project.coach as any)._id || user?._id === (project.coach as any);

  const handleInvite = async () => {
    if (!inviteEmail || !id) return;
    setInviteError('');
    try {
      await addMember(id, inviteEmail);
      const updated = await getProject(id);
      setProject(updated as any);
      setInviteEmail('');
    } catch (err: any) {
      setInviteError(err.response?.data?.error || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!id) return;
    await removeMember(id, userId);
    const updated = await getProject(id);
    setProject(updated as any);
  };

  const handleMilestoneToggle = async (milestoneId: string) => {
    const updated = await toggleMilestone(milestoneId);
    setMilestones((prev) => prev.map((m) => (m._id === milestoneId ? updated : m)));
  };

  const handleMilestoneDelete = async (milestoneId: string) => {
    await deleteMilestone(milestoneId);
    setMilestones((prev) => prev.filter((m) => m._id !== milestoneId));
  };

  const handleMilestoneCreate = async (data: any) => {
    const m = await createMilestone(data);
    setMilestones((prev) => [...prev, m]);
    setMilestoneDialog(false);
  };

  return (
    <Box>
      <Box mb={3}>
        <Typography variant="h5" fontWeight={700}>{project.title}</Typography>
        {project.description && (
          <Typography color="text.secondary" mt={0.5}>{project.description}</Typography>
        )}
        {project.deadline && (
          <Chip label={`Due: ${format(new Date(project.deadline), 'MMM d, yyyy')}`} size="small" color="warning" sx={{ mt: 1 }} />
        )}
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Overview" />
        <Tab label={`Tasks (${tasks.length})`} />
        <Tab label={`Todos (${todos.length})`} />
        <Tab label={`Milestones (${milestones.length})`} />
      </Tabs>

      {tab === 0 && (
        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Goal</Typography>
          <Typography color="text.secondary" mb={3}>{project.goal || 'No goal set.'}</Typography>

          <Typography variant="subtitle1" fontWeight={600} mb={1}>Members</Typography>
          <List dense>
            {project.members.map((member) => (
              <ListItem
                key={member._id}
                secondaryAction={
                  isCoach && (
                    <IconButton edge="end" size="small" onClick={() => handleRemoveMember(member._id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )
                }
              >
                <ListItemText primary={member.name} secondary={member.email} />
              </ListItem>
            ))}
          </List>

          {isCoach && (
            <Stack direction="row" spacing={1} mt={2}>
              <TextField
                size="small"
                label="Invite by email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                error={!!inviteError}
                helperText={inviteError}
              />
              <Button variant="outlined" onClick={handleInvite} startIcon={<AddIcon />}>
                Invite
              </Button>
            </Stack>
          )}
        </Box>
      )}

      {tab === 1 && (
        <List>
          {tasks.length === 0 ? (
            <Typography color="text.secondary">No tasks in this project.</Typography>
          ) : (
            tasks.map((task) => (
              <ListItem key={task._id} divider>
                <ListItemText
                  primary={task.title}
                  secondary={`${format(new Date(task.startTime), 'MMM d, h:mm a')} – ${format(new Date(task.endTime), 'h:mm a')}`}
                />
                <Chip label={task.completed ? 'Done' : 'Pending'} size="small" color={task.completed ? 'success' : 'default'} />
              </ListItem>
            ))
          )}
        </List>
      )}

      {tab === 2 && (
        <List>
          {todos.length === 0 ? (
            <Typography color="text.secondary">No todos in this project.</Typography>
          ) : (
            todos.map((todo) => (
              <ListItem key={todo._id} divider>
                <ListItemText
                  primary={todo.title}
                  secondary={todo.deadline ? `Due: ${format(new Date(todo.deadline), 'MMM d, yyyy')}` : 'No deadline'}
                />
                <Chip label={todo.completed ? 'Done' : 'Pending'} size="small" color={todo.completed ? 'success' : 'default'} />
              </ListItem>
            ))
          )}
        </List>
      )}

      {tab === 3 && (
        <Box>
          {isCoach && (
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setMilestoneDialog(true)} sx={{ mb: 2 }}>
              Add Milestone
            </Button>
          )}
          <List>
            {milestones.length === 0 ? (
              <Typography color="text.secondary">No milestones yet.</Typography>
            ) : (
              milestones.map((m) => (
                <ListItem
                  key={m._id}
                  divider
                  secondaryAction={
                    isCoach && (
                      <IconButton size="small" onClick={() => handleMilestoneDelete(m._id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                >
                  <Checkbox checked={m.completed} onChange={() => handleMilestoneToggle(m._id)} />
                  <ListItemText
                    primary={m.title}
                    secondary={m.deadline ? `Due: ${format(new Date(m.deadline), 'MMM d, yyyy')}` : undefined}
                    sx={{ textDecoration: m.completed ? 'line-through' : 'none' }}
                  />
                </ListItem>
              ))
            )}
          </List>

          <Dialog open={milestoneDialog} onClose={() => setMilestoneDialog(false)} maxWidth="xs" fullWidth>
            <DialogTitle>New Milestone</DialogTitle>
            <DialogContent>
              <Box pt={1}>
                <MilestoneForm projectId={id!} onSubmit={handleMilestoneCreate} onCancel={() => setMilestoneDialog(false)} />
              </Box>
            </DialogContent>
          </Dialog>
        </Box>
      )}
    </Box>
  );
}
