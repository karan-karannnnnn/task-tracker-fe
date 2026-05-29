import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import api from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Stack,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const STATUS_LABELS = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

const STATUS_COLORS = {
  pending: 'warning',
  in_progress: 'info',
  completed: 'success',
};

const STATUS_NEXT = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: null,
};

const STATUS_NEXT_LABEL = {
  pending: 'Start Task',
  in_progress: 'Mark Completed',
  completed: null,
};

const PAGE_SIZE = 9;

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [message, setMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/users/${user.id}/tasks`);
      console.log('Fetched tasks:', data);
      setTasks(Array.isArray(data?.data) ? data.data : []);
    } catch {
      showMessage('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleStatusUpdate = async (task) => {
    const nextStatus = STATUS_NEXT[task.status];
    if (!nextStatus) return;
    setUpdating(task.id);
    try {
      await api.put(`/tasks/${task.id}`, { status: nextStatus });
      showMessage('Task status updated');
      fetchTasks();
    } catch {
      showMessage('Failed to update task status', 'error');
    } finally {
      setUpdating(null);
    }
  };

  const filtered = statusFilter
    ? tasks.filter((t) => t.status === statusFilter)
    : tasks;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [statusFilter]);

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Welcome banner */}
        <Box
          sx={{
            mb: 4, p: 3, borderRadius: 3,
            background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
            color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Welcome back, {user?.name}! 👋
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
              You have {stats.pending} pending and {stats.inProgress} in-progress tasks.
            </Typography>
          </Box>
          <CheckCircleIcon sx={{ fontSize: 56, opacity: 0.2 }} />
        </Box>

        {/* Stats */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {[
            { label: 'Total Tasks', value: stats.total, gradient: 'linear-gradient(135deg,#4F46E5,#818CF8)', icon: '📋' },
            { label: 'Pending', value: stats.pending, gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)', icon: '⏳' },
            { label: 'In Progress', value: stats.inProgress, gradient: 'linear-gradient(135deg,#3B82F6,#93C5FD)', icon: '🔄' },
            { label: 'Completed', value: stats.completed, gradient: 'linear-gradient(135deg,#10B981,#6EE7B7)', icon: '✅' },
          ].map((s) => (
            <Grid item xs={6} sm={3} key={s.label}>
              <Paper
                sx={{
                  p: 2.5, borderRadius: 3, background: s.gradient,
                  color: 'white', textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                }}
              >
                <Typography sx={{ fontSize: 28, lineHeight: 1 }}>{s.icon}</Typography>
                <Typography variant="h4" fontWeight={800} sx={{ my: 0.5 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600 }}>{s.label}</Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {message && (
          <Alert severity={message.type === 'error' ? 'error' : 'success'} sx={{ mb: 3, borderRadius: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* Tasks panel */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <Box
            sx={{
              px: 3, py: 2.5,
              borderBottom: '1px solid', borderColor: 'divider',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexWrap: 'wrap', gap: 1,
            }}
          >
            <Typography variant="h6">My Tasks</Typography>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ p: 3 }}>
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography fontSize={48}>📭</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {tasks.length === 0 ? 'No tasks assigned to you yet.' : 'No tasks match this filter.'}
                </Typography>
              </Box>
            ) : (
              <>
                <Grid container spacing={2.5}>
                  {paginated.map((task) => {
                    const cardAccent = {
                      pending: '#F59E0B',
                      in_progress: '#3B82F6',
                      completed: '#10B981',
                    }[task.status] || '#4F46E5';
                    return (
                      <Grid item xs={12} sm={6} md={4} key={task.id}>
                        <Card
                          sx={{
                            height: '100%', display: 'flex', flexDirection: 'column',
                            borderTop: `4px solid ${cardAccent}`,
                            transition: 'box-shadow 0.2s, transform 0.2s',
                            '&:hover': { boxShadow: '0 8px 30px rgba(0,0,0,0.12)', transform: 'translateY(-2px)' },
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                              <Chip
                                label={STATUS_LABELS[task.status]}
                                color={STATUS_COLORS[task.status]}
                                size="small"
                              />
                              {task.due_date && (
                                <Typography variant="caption" color="text.secondary">
                                  📅 {new Date(task.due_date).toLocaleDateString()}
                                </Typography>
                              )}
                            </Stack>
                            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
                              {task.title}
                            </Typography>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary" sx={{
                                display: '-webkit-box', WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical', overflow: 'hidden',
                              }}>
                                {task.description}
                              </Typography>
                            )}
                          </CardContent>
                          <CardActions sx={{ px: 2, pb: 2 }}>
                            {STATUS_NEXT[task.status] ? (
                              <Button
                                variant="contained"
                                size="small"
                                fullWidth
                                onClick={() => handleStatusUpdate(task)}
                                disabled={updating === task.id}
                                startIcon={updating === task.id ? <CircularProgress size={14} color="inherit" /> : null}
                              >
                                {updating === task.id ? 'Updating…' : STATUS_NEXT_LABEL[task.status]}
                              </Button>
                            ) : (
                              <Stack direction="row" alignItems="center" spacing={0.5} sx={{ px: 1 }}>
                                <CheckCircleIcon color="success" fontSize="small" />
                                <Typography variant="body2" color="success.main" fontWeight={600}>Completed</Typography>
                              </Stack>
                            )}
                          </CardActions>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>

                {totalPages > 1 && (
                  <Stack alignItems="center" sx={{ mt: 3 }}>
                    <Pagination count={totalPages} page={page}
                      onChange={(_, value) => setPage(value)} color="primary" />
                  </Stack>
                )}
              </>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

