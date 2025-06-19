import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  List, 
  ListItem, 
  ListItemText, 
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  Assessment, 
  Warning, 
  CheckCircle, 
  Info 
} from '@mui/icons-material';
import { format } from 'date-fns';
import { licenseApi } from '../../services/api';
import { DashboardStats, License, ActivityLog } from '../../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiringLicenses, setExpiringLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch dashboard stats
        const dashboardStats = await licenseApi.getDashboardStats();
        setStats(dashboardStats);
        
        // Fetch expiring licenses
        const expiring = await licenseApi.getExpiringLicenses(30);
        setExpiringLicenses(expiring);
        
        setLoading(false);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 4 }}>
        <Box sx={{ flex: '1 1 300px' }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Assessment sx={{ fontSize: 40, mr: 2, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" component="div">
                  {stats?.totalLicenses || 0}
                </Typography>
                <Typography color="text.secondary">
                  Total Licenses
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px' }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Warning sx={{ fontSize: 40, mr: 2, color: 'warning.main' }} />
              <Box>
                <Typography variant="h5" component="div">
                  {stats?.expiringLicenses || 0}
                </Typography>
                <Typography color="text.secondary">
                  Expiring Soon (30 days)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
        
        <Box sx={{ flex: '1 1 300px' }}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Info sx={{ fontSize: 40, mr: 2, color: 'error.main' }} />
              <Box>
                <Typography variant="h5" component="div">
                  {stats?.overdueLicenses || 0}
                </Typography>
                <Typography color="text.secondary">
                  Overdue Licenses
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
      
      {/* Upcoming Renewals and Activity Log */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        <Box sx={{ flex: '1 1 400px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Upcoming Renewals
            </Typography>
            
            {expiringLicenses.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No upcoming renewals in the next 30 days.
              </Typography>
            ) : (
              <List>
                {expiringLicenses.slice(0, 5).map((license) => (
                  <React.Fragment key={license.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={license.software_name}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {license.vendor}
                            </Typography>
                            {` — Expires on ${format(new Date(license.expiration_date), 'MMM dd, yyyy')}`}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>
        
        <Box sx={{ flex: '1 1 400px' }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            
            {!stats || stats.recentActivity.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No recent activity.
              </Typography>
            ) : (
              <List>
                {stats.recentActivity.map((activity: ActivityLog) => (
                  <React.Fragment key={activity.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={`${activity.action} ${activity.table_name}`}
                        secondary={
                          <>
                            <Typography component="span" variant="body2" color="text.primary">
                              {activity.username}
                            </Typography>
                            {` — ${format(new Date(activity.created_at), 'MMM dd, yyyy HH:mm')}`}
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
