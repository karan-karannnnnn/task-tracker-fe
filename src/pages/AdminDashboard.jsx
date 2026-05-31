import { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import TaskTable from '../components/TaskTable';
import TaskForm from '../components/TaskForm';
import api from '../api/axiosInstance';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const TABS = ['Tasks', 'Employees', 'Create Task', 'Activity'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Tasks');
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3500);
  };

  const fetchTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const { data } = await api.get('/tasks');
      const raw = Array.isArray(data?.data) ? data?.data : [];
      const normalized = raw.map((t) => ({
        ...t,
        // prefer nested user name if backend provides user object
        assigned_name: t.user?.name || (t.assigned_name || t.assigned_to?.name || t.assignedTo?.name) || null,
        // normalize assigned_to to id when backend returns object
        assigned_to: typeof t.assigned_to === 'object' && t.assigned_to !== null
          ? t.assigned_to.id
          : t.assigned_to ?? t.assignedTo ?? null,
        // normalize due_date to ISO string
        due_date: t.due_date ?? t.dueDate ?? null,
      }));
      // sort newest first by created timestamp (supports created_at or createdAt)
      normalized.sort((a, b) => {
        const ta = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
        const tb = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
        return tb - ta;
      });
      setTasks(normalized);
    } catch {
      showMessage('Failed to load tasks', 'error');
    } finally {
      setTasksLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const { data } = await api.get('/users');
      const raw = Array.isArray(data?.data) ? data.data : [];
      const filtered = raw.filter((u) => u.role === 'employee');
      filtered.sort((a, b) => {
        const ta = new Date(a.created_at ?? a.createdAt ?? 0).getTime();
        const tb = new Date(b.created_at ?? b.createdAt ?? 0).getTime();
        if (tb !== ta) return tb - ta;
        // fallback to numeric id if available
        const ida = Number(a.id ?? 0);
        const idb = Number(b.id ?? 0);
        return idb - ida;
      });
      setEmployees(filtered);
    } catch {
      showMessage('Failed to load employees', 'error');
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const { data } = await api.get('/activity-logs');
      console.log('Fetched logs:', data);
      setLogs(Array.isArray(data?.data) ? data?.data : []);
    } catch {
      setLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchEmployees();
  }, [fetchTasks, fetchEmployees]);

  const handleCreateTask = async (form) => {
    setFormLoading(true);
    try {
      await api.post('/tasks', form);
      showMessage('Task created successfully');
      setActiveTab('Tasks');
      fetchTasks();
    } catch (err) {
      showMessage(
        err.response?.data?.error ||
          err.response?.data?.errors?.[0]?.msg ||
          'Failed to create task',
        'error'
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateTask = async (form) => {
    setFormLoading(true);
    try {
      await api.put(`/tasks/${editingTask.id}`, form);
      showMessage('Task updated successfully');
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      showMessage(
        err.response?.data?.error || 'Failed to update task',
        'error'
      );
    } finally {
      setFormLoading(false);
    }
  };

  // Stats
  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const TAB_KEYS = ['Tasks', 'Employees', 'Create Task', 'Activity'];
  const tabIndex = TAB_KEYS.indexOf(activeTab);

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="lg" sx={{ py: 4 }}>

        {/* Stats */}
        <Box
          sx={{
            mb: 4,
            display: 'grid',
            gap: { xs: 1, sm: 2 },
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(5, 1fr)',
            },
            alignItems: 'stretch',
          }}
        >
          {[
            { label: 'Total Tasks', value: stats.total, gradient: 'linear-gradient(135deg,#4F46E5,#818CF8)', icon: '📋' },
            { label: 'Pending', value: stats.pending, gradient: 'linear-gradient(135deg,#F59E0B,#FCD34D)', icon: '⏳' },
            { label: 'In Progress', value: stats.inProgress, gradient: 'linear-gradient(135deg,#3B82F6,#93C5FD)', icon: '🔄' },
            { label: 'Completed', value: stats.completed, gradient: 'linear-gradient(135deg,#10B981,#6EE7B7)', icon: '✅' },
            { label: 'Employees', value: employees.length, gradient: 'linear-gradient(135deg,#7C3AED,#A78BFA)', icon: '👥' },
          ].map((s) => (
            <Box key={s.label} sx={{ p: 0 }}>
              <Paper
                sx={{
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 3,
                  background: s.gradient,
                  color: 'white',
                  textAlign: 'center',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-3px)' },
                  minHeight: { xs: 80, sm: 100 },
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Typography sx={{ fontSize: { xs: 18, sm: 22, md: 26 }, lineHeight: 1 }}>{s.icon}</Typography>
                <Typography
                  variant="h4"
                  fontWeight={800}
                  sx={{ my: 0.5, fontSize: { xs: 18, sm: 22, md: 28 } }}
                >
                  {s.value}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontWeight: 600, fontSize: { xs: 12, sm: 13 } }}>{s.label}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>

        {/* Tabs */}
        <Paper sx={{ mb: 3, borderRadius: 3, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          <Tabs
            value={tabIndex === -1 ? 0 : tabIndex}
            onChange={(_, i) => {
              setActiveTab(TAB_KEYS[i]);
              setEditingTask(null);
              if (TAB_KEYS[i] === 'Activity') fetchLogs();
            }}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': { fontWeight: 600, minHeight: 52 },
              '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0' },
            }}
          >
            {TAB_KEYS.map((t) => <Tab key={t} label={t} />)}
          </Tabs>
        </Paper>

        {message && (
          <Alert severity={message.type === 'error' ? 'error' : 'success'} sx={{ mb: 3, borderRadius: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* Tasks tab */}
        {activeTab === 'Tasks' && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            {editingTask ? (
              <>
                <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6">Edit Task</Typography>
                  <Button
                    startIcon={<ArrowBackIcon />}
                    variant="outlined"
                    size="small"
                    onClick={() => setEditingTask(null)}
                    sx={{ ml: 'auto' }}
                  >
                    Back
                  </Button>
                </Stack>
                <TaskForm
                  employees={employees}
                  initialData={editingTask}
                  onSubmit={handleUpdateTask}
                  onCancel={() => setEditingTask(null)}
                  loading={formLoading}
                />
              </>
            ) : tasksLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <Typography variant="h6" sx={{ mb: 2 }}>All Tasks</Typography>
                <TaskTable
                  tasks={tasks}
                  onEdit={(task) => {
                    setEditingTask({
                      ...task,
                      assigned_to: typeof task.assigned_to === 'object' && task.assigned_to !== null
                        ? task.assigned_to.id
                        : task.assigned_to,
                      due_date: task.due_date
                        ? new Date(task.due_date).toISOString().split('T')[0]
                        : '',
                    });
                  }}
                  editLoading={formLoading}
                />
              </>
            )}
          </Paper>
        )}

        {/* Employees tab */}
        {activeTab === 'Employees' && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Employees ({employees.length})
            </Typography>
            {employees.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography fontSize={48}>👥</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>No employees registered yet.</Typography>
              </Box>
            ) : (
              <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>S.No</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((emp, idx) => (
                      <TableRow key={emp.id ?? idx} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ color: 'text.secondary', width: 50 }}>{idx + 1}</TableCell>
                        <TableCell fontWeight={600}>{emp.name}</TableCell>
                        <TableCell color='text.secondary'>{emp.email}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}

        {/* Create Task tab */}
        {activeTab === 'Create Task' && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <Typography variant="h6" sx={{ mb: 3 }}>Create New Task</Typography>
            <TaskForm
              employees={employees}
              onSubmit={handleCreateTask}
              loading={formLoading}
            />
          </Paper>
        )}

        {/* Activity Logs tab */}
        {activeTab === 'Activity' && (
          <Paper sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
            <Stack direction="row" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="h6">Activity Logs</Typography>
              <Button
                startIcon={logsLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                variant="outlined"
                size="small"
                onClick={fetchLogs}
                sx={{ ml: 'auto' }}
                disabled={logsLoading}
                aria-busy={logsLoading}
              >
                {logsLoading ? 'Refreshing…' : 'Refresh'}
              </Button>
            </Stack>
            {logsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                <CircularProgress />
              </Box>
            ) : logs.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Typography fontSize={48}>📭</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>No activity logs available.</Typography>
              </Box>
            ) : (
              <TableContainer sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell>S.No</TableCell>
                      <TableCell>User</TableCell>
                      <TableCell>Action</TableCell>
                      <TableCell>Task</TableCell>
                      <TableCell>Timestamp</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    
                    {logs.map((log, idx) => (
                      <TableRow key={log.id ?? idx} hover sx={{ '&:last-child td': { border: 0 } }}>
                        <TableCell sx={{ color: 'text.secondary', width: 50 }}>{idx + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{log.user?.name || 'System'}</TableCell>
                        <TableCell>{log.action || log.description || '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary' }}>{log.task?.title || '—'}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                          {log.createdAt
                            ? new Date(log.createdAt).toLocaleString()
                            : log.timestamp
                            ? new Date(log.timestamp).toLocaleString()
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        )}
      </Container>
    </Box>
  );
}

