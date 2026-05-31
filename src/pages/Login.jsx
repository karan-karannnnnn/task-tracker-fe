import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosInstance';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Tabs,
  Tab,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import bcrypt from 'bcryptjs';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import GroupsIcon from '@mui/icons-material/Groups';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function Login() {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [error, setError] = useState('');
  const [toast, setToast] = useState({ open: false, message: '', success: false });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/login', {
          email: form.email,
          password: form.password,
        });
        login(data?.data?.token, data?.data?.user);
        navigate(data?.data?.user?.role === 'admin' ? '/admin' : '/employee');
      } else {
        const response = await api.post('/auth/register', form);
        setMode('login');
        const msg = response?.data?.message || 'Registration successful';
        setToast({ open: true, message: msg, success: true });
        setError('');
        setForm((prev) => ({ ...prev, name: '' }));
      }
    } catch (err) {
      // console.log(err?.response);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0]?.msg ||
        'Something went wrong';
      setError(msg);
      setToast({ open: true, message: msg, success: false });
    } finally {
      setLoading(false);
    }
  };

  // Forgot / Reset Password flow
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState('request'); // 'request' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotToken, setForgotToken] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotShowPassword, setForgotShowPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState(null);

  const openForgot = () => {
    setForgotOpen(true);
    setForgotStep('request');
    setForgotEmail(form.email || '');
    setForgotToken('');
    setForgotNewPassword('');
    setForgotMessage(null);
  };

  const handleSendReset = async () => {
    setForgotLoading(true);
    setForgotMessage(null);
    try {
      const { data } = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotMessage(data?.message || 'Reset instructions sent to your email');
      setForgotStep('reset');
    } catch (err) {
      setForgotMessage(err.response?.data?.message || 'Failed to send reset email');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleDoReset = async () => {
    if (!forgotToken || !forgotNewPassword) {
      setForgotMessage('Please provide token and a new password');
      return;
    }
    setForgotLoading(true);
    setForgotMessage(null);
    try {
      
      const payload = { token: forgotToken, password: forgotNewPassword };
      const { data } = await api.post('/auth/reset-password', payload);
      setForgotMessage(data?.message || 'Password reset successful. Please login.');
      setForgotStep('done');
    } catch (err) {
      setForgotMessage(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left hero panel */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(145deg, #4F46E5 0%, #7C3AED 60%, #A855F7 100%)',
          color: 'white',
          p: 6,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative blobs */}
        <Box sx={{
          position: 'absolute', top: -80, right: -80, width: 300, height: 300,
          borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
        }} />
        <Box sx={{
          position: 'absolute', bottom: -60, left: -60, width: 250, height: 250,
          borderRadius: '50%', background: 'rgba(255,255,255,0.05)',
        }} />

        <AssignmentTurnedInIcon sx={{ fontSize: 64, mb: 2, opacity: 0.95 }} />
        <Typography variant="h4" fontWeight={800} textAlign="center" gutterBottom>
          Task Tracker
        </Typography>
        <Typography variant="body1" textAlign="center" sx={{ opacity: 0.85, maxWidth: 320, mb: 5 }}>
          Streamline your team's productivity with smart task management.
        </Typography>

        <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 320 }}>
          {[
            { icon: <TrackChangesIcon />, text: 'Real-time task tracking' },
            { icon: <GroupsIcon />, text: 'Team collaboration made easy' },
            { icon: <AssignmentTurnedInIcon />, text: 'Progress at a glance' },
          ].map((item) => (
            <Stack key={item.text} direction="row" alignItems="center" spacing={1.5}
              sx={{ background: 'rgba(255,255,255,0.12)', borderRadius: 2, px: 2, py: 1.2 }}>
              <Box sx={{ opacity: 0.9 }}>{item.icon}</Box>
              <Typography variant="body2" fontWeight={500}>{item.text}</Typography>
            </Stack>
          ))}
        </Stack>
      </Box>

      {/* Right form panel */}
      <Box
        sx={{
          flex: { xs: 1, md: '0 0 440px' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          p: 4,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, mb: 3 }}>
            <AssignmentTurnedInIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight={800} color="primary">Task Tracker</Typography>
          </Box>

          <Typography variant="h5" fontWeight={700} gutterBottom>
            {mode === 'login' ? 'Welcome back 👋' : 'Create account'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            {mode === 'login'
              ? 'Sign in to continue to your dashboard.'
              : 'Join your team on Task Tracker.'}
          </Typography>

          <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden', mb: 3 }}>
            <Tabs
              value={mode === 'login' ? 0 : 1}
              onChange={(_, i) => { setMode(i === 0 ? 'login' : 'register'); setError(''); }}
              variant="fullWidth"
              sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
            >
              <Tab label="Sign In" sx={{ fontWeight: 600 }} />
              <Tab label="Register" sx={{ fontWeight: 600 }} />
            </Tabs>

            <Box component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
              <Stack spacing={2.5}>

                {mode === 'register' && (
                  <TextField label="Full Name" name="name" value={form.name}
                    onChange={handleChange} placeholder="John Doe" required size="small" fullWidth />
                )}

                <TextField label="Email" name="email" type="email" value={form.email}
                  onChange={handleChange} placeholder="you@example.com" required size="small" fullWidth />

                <TextField label="Password" name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={handleChange}
                  placeholder={mode === 'register' ? 'At least 6 characters' : ''}
                  required size="small" fullWidth
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end" size="small">
                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {mode === 'login' && (
                  <Typography
                    variant="body2"
                    onClick={openForgot}
                    sx={{ color: 'primary.main', cursor: 'pointer', textDecoration: 'underline', alignSelf: 'flex-end' }}
                  >
                    Forgot password?
                  </Typography>
                )}

                {mode === 'register' && (
                  <FormControl size="small" fullWidth>
                    <InputLabel>Role</InputLabel>
                    <Select name="role" value={form.role} label="Role" onChange={handleChange}>
                      <MenuItem value="employee">Employee</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                  </FormControl>
                )}

                <Button type="submit" variant="contained" fullWidth size="large"
                  disabled={loading}
                  sx={{ py: 1.2, fontSize: '0.95rem' }}
                  startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
                >
                  {loading
                    ? mode === 'login' ? 'Signing in...' : 'Registering...'
                    : mode === 'login' ? 'Sign In' : 'Create Account'}
                </Button>
              </Stack>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={toast.success ? 'success' : 'error'}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          sx={{ width: '100%' }}
        >
          {toast.message}
        </Alert>
      </Snackbar>

      <Dialog open={forgotOpen} onClose={() => setForgotOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {forgotMessage && (
            <Alert severity="info" sx={{ mb: 2 }}>{forgotMessage}</Alert>
          )}

          {forgotStep === 'request' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Email" type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} fullWidth size="small" />
              <Typography variant="body2" color="text.secondary">Enter your account email to receive reset instructions. If you received a token, switch to the Reset step.</Typography>
            </Stack>
          )}

          {forgotStep === 'reset' && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField label="Reset Token" value={forgotToken} onChange={(e) => setForgotToken(e.target.value)} fullWidth size="small" />
              <TextField
                label="New Password"
                type={forgotShowPassword ? 'text' : 'password'}
                value={forgotNewPassword}
                onChange={(e) => setForgotNewPassword(e.target.value)}
                fullWidth
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setForgotShowPassword((p) => !p)} edge="end" size="small">
                        {forgotShowPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Typography variant="body2" color="text.secondary">Paste the token from your email and choose a new password.</Typography>
            </Stack>
          )}

          {forgotStep === 'done' && (
            <Typography sx={{ mt: 1 }}>Password successfully reset. You can now sign in.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotOpen(false)} disabled={forgotLoading}>Close</Button>
          {forgotStep === 'request' && (
            <Button onClick={handleSendReset} disabled={forgotLoading || !forgotEmail} variant="contained">
              {forgotLoading ? 'Sending...' : 'Send Reset Email'}
            </Button>
          )}
          {forgotStep === 'reset' && (
            <Button onClick={handleDoReset} disabled={forgotLoading || !forgotToken || !forgotNewPassword} variant="contained">
              {forgotLoading ? 'Resetting...' : 'Reset Password'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

