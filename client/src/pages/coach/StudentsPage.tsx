import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { useCoachStudentStore } from '../../store/useCoachStudentStore';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ConfirmDialog from '../../components/common/ConfirmDialog';

export default function StudentsPage() {
  const { students, loading, fetchStudents, addStudent, removeStudent } = useCoachStudentStore();
  const [email, setEmail] = useState('');
  const [addError, setAddError] = useState<string | null>(null);
  const [addLoading, setAddLoading] = useState(false);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleAdd = async () => {
    if (!email.trim()) return;
    setAddLoading(true);
    setAddError(null);
    try {
      await addStudent(email.trim());
      setEmail('');
    } catch (err: any) {
      setAddError(err.response?.data?.error || 'Failed to add student');
    } finally {
      setAddLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget) return;
    await removeStudent(removeTarget);
    setRemoveTarget(null);
  };

  const removeTargetStudent = students.find((r) => r.student._id === removeTarget)?.student;

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} mb={3}>Students</Typography>

      {/* Add student */}
      <Box display="flex" gap={1} mb={3} maxWidth={480}>
        <TextField
          label="Student email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          size="small"
          fullWidth
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={handleAdd}
          disabled={addLoading || !email.trim()}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Add
        </Button>
      </Box>

      {addError && <Alert severity="error" sx={{ mb: 2 }}>{addError}</Alert>}

      {students.length === 0 ? (
        <Typography color="text.secondary">No students added yet.</Typography>
      ) : (
        <Grid container spacing={2}>
          {students.map((rel) => (
            <Grid item xs={12} sm={6} md={4} key={rel._id}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle1" fontWeight={600}>{rel.student.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{rel.student.email}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => setRemoveTarget(rel.student._id)}
                  >
                    Remove
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove Student"
        message={`Remove ${removeTargetStudent?.name ?? 'this student'} from your coaching?`}
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
      />
    </Box>
  );
}
