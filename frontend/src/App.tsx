import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { AuthProvider } from './context/AuthContext';

// Components
import Login from './components/auth/Login';
import PrivateRoute from './components/auth/PrivateRoute';
import Dashboard from './components/dashboard/Dashboard';
import LicenseList from './components/licenses/LicenseList';
import LicenseForm from './components/licenses/LicenseForm';
import Layout from './components/layout/Layout';
import NotFound from './components/common/NotFound';
import Unauthorized from './components/common/Unauthorized';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={
              <Layout requireAuth={false}>
                <Login />
              </Layout>
            } />
            
            {/* Protected Routes with PrivateRoute */}
            <Route element={<PrivateRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/licenses" element={<LicenseList />} />
              <Route path="/licenses/new" element={<LicenseForm />} />
              <Route path="/licenses/:id" element={<LicenseForm />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<PrivateRoute requiredRole="admin" />}>
              <Route path="/admin" element={<div>Admin Panel</div>} />
            </Route>
            
            {/* Redirect root to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Error Routes */}
            <Route path="/unauthorized" element={
              <Layout requireAuth={false}>
                <Unauthorized />
              </Layout>
            } />
            
            <Route path="*" element={
              <Layout requireAuth={false}>
                <NotFound />
              </Layout>
            } />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
