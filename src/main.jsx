import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import './index.css'
import App from './App.jsx'

const theme = createTheme({
  palette: {
    primary: { main: '#4F46E5', light: '#818CF8', dark: '#3730A3' },
    secondary: { main: '#7C3AED', light: '#A78BFA', dark: '#5B21B6' },
    success: { main: '#10B981' },
    warning: { main: '#F59E0B' },
    info: { main: '#3B82F6' },
    error: { main: '#EF4444' },
    background: { default: '#F1F5F9', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 600, borderRadius: 8 },
        contained: {
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
          boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
          '&:hover': { boxShadow: '0 6px 20px rgba(79,70,229,0.5)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
        elevation3: { boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: { boxShadow: '0 2px 12px rgba(0,0,0,0.06)', borderRadius: 12 },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 6 } },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700, background: '#F8FAFC' } },
    },
  },
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </StrictMode>,
)
