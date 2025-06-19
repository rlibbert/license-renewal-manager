import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { LockOutlined as LockIcon } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Unauthorized: React.FC = () => {
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  const handleGoBack = () => {
    navigate(-1); // Go back to the previous page
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '70vh'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: 500
        }}
      >
        <LockIcon color="error" sx={{ fontSize: 80, mb: 2 }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Access Denied
        </Typography>
        
        <Typography variant="body1" align="center" sx={{ mb: 2 }}>
          You don't have permission to access this page.
        </Typography>
        
        {authState.user && (
          <Typography variant="body2" align="center" sx={{ mb: 4 }}>
            Your current role: <strong>{authState.user.role}</strong>
          </Typography>
        )}
        
        <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={handleGoBack}
          >
            Go Back
          </Button>
          
          <Button
            variant="contained"
            color="primary"
            component={Link}
            to="/dashboard"
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Unauthorized;
