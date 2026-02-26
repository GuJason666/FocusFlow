import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import { useAuthStore } from '../../store/useAuthStore';
import RoleBadge from '../../components/common/RoleBadge';

export default function SettingsPage() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <Box maxWidth={500}>
      <Typography variant="h5" fontWeight={700} mb={3}>Settings</Typography>

      <Paper sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 24 }}>
            {user.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={600}>{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
            <Box mt={0.5}><RoleBadge role={user.role} /></Box>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle2" color="text.secondary" mb={2}>
          Account
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Member since: {new Date(user.createdAt).toLocaleDateString()}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Button variant="outlined" color="error" onClick={logout} fullWidth>
          Sign Out
        </Button>
      </Paper>
    </Box>
  );
}
