import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuthStore } from '../../store/useAuthStore';
import RoleBadge from '../common/RoleBadge';
import Box from '@mui/material/Box';

interface Props {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: Props) {
  const { user, logout } = useAuthStore();

  return (
    <AppBar position="fixed" elevation={0} sx={{ zIndex: (theme) => theme.zIndex.drawer + 1, borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
      <Toolbar>
        <IconButton edge="start" sx={{ mr: 2, display: { md: 'none' } }} onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" fontWeight={700} sx={{ flexGrow: 1, color: 'primary.main' }}>
          FocusFlow
        </Typography>
        {user && (
          <Box display="flex" alignItems="center" gap={1}>
            <RoleBadge role={user.role} />
            <Typography variant="body2" sx={{ display: { xs: 'none', sm: 'block' } }}>
              {user.name}
            </Typography>
            <Button size="small" onClick={logout} color="inherit">
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
