import Chip from '@mui/material/Chip';

interface Props {
  role: 'student' | 'coach';
}

export default function RoleBadge({ role }: Props) {
  return (
    <Chip
      label={role.charAt(0).toUpperCase() + role.slice(1)}
      size="small"
      color={role === 'coach' ? 'secondary' : 'primary'}
      variant="outlined"
    />
  );
}
