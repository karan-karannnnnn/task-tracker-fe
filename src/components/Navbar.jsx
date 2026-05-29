import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Chip,
  Box,
  Avatar,
} from '@mui/material';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import LogoutIcon from '@mui/icons-material/Logout';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
        {/* Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AssignmentTurnedInIcon sx={{ fontSize: 28 }} />
          <Typography variant="h6" fontWeight={800} letterSpacing="-0.3px">
            Task Tracker
          </Typography>
        </Box>

        {/* User info + logout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            sx={{
              width: 34, height: 34,
              bgcolor: 'rgba(255,255,255,0.25)',
              fontSize: 13, fontWeight: 700,
              color: 'white',
            }}
          >
            {initials}
          </Avatar>
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
              {user?.name}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              sx={{
                height: 18, fontSize: 10, fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: 0.5,
                bgcolor: 'rgba(255,255,255,0.2)', color: 'white',
              }}
            />
          </Box>
          <Button
            variant="outlined"
            size="small"
            color="inherit"
            onClick={handleLogout}
            startIcon={<LogoutIcon fontSize="small" />}
            sx={{
              borderColor: 'rgba(255,255,255,0.4)',
              '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,0.1)' },
              ml: 0.5,
            }}
          >
            Logout
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
