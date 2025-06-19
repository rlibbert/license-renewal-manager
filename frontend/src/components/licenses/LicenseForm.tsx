import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Button, 
  FormControlLabel, 
  Switch, 
  Grid, 
  MenuItem, 
  CircularProgress, 
  Alert,
  Divider,
  InputAdornment,
  IconButton
} from '@mui/material';
import { 
  Save as SaveIcon, 
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { licenseApi } from '../../services/api';
import { License, LicenseFormData } from '../../types';
import { useAuth } from '../../context/AuthContext';

// License types options
const licenseTypes = [
  'Per User',
  'Per Device',
  'Site License',
  'Subscription',
  'Perpetual',
  'Volume',
  'Enterprise',
  'Other'
];

const LicenseForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();
  const { authState } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState<LicenseFormData>({
    software_name: '',
    vendor: '',
    license_type: '',
    purchase_date: '',
    expiration_date: '',
    auto_renewal: false,
    contact_name: '',
    contact_email: '',
    license_key: '',
    notes: ''
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showLicenseKey, setShowLicenseKey] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  
  // Load license data if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      fetchLicense(parseInt(id));
    }
  }, [isEditMode, id]);
  
  const fetchLicense = async (licenseId: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const license = await licenseApi.getLicenseById(licenseId);
      
      // Format dates for form inputs (YYYY-MM-DD)
      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      };
      
      setFormData({
        software_name: license.software_name,
        vendor: license.vendor,
        license_type: license.license_type,
        purchase_date: formatDate(license.purchase_date),
        expiration_date: formatDate(license.expiration_date),
        auto_renewal: license.auto_renewal,
        contact_name: license.contact_name,
        contact_email: license.contact_email,
        license_key: license.license_key || '',
        notes: license.notes || ''
      });
      
      // Set file URL if exists
      if (license.license_file_path) {
        setFileUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/${license.license_file_path}`);
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load license');
      setLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      // Add file to form data if selected
      const submitData: LicenseFormData = {
        ...formData,
        licenseFile: selectedFile || undefined
      };
      
      if (isEditMode && id) {
        // Update existing license
        await licenseApi.updateLicense(parseInt(id), submitData);
        setSuccess('License updated successfully');
      } else {
        // Create new license
        await licenseApi.createLicense(submitData);
        setSuccess('License created successfully');
        
        // Reset form after successful creation
        if (!isEditMode) {
          setFormData({
            software_name: '',
            vendor: '',
            license_type: '',
            purchase_date: '',
            expiration_date: '',
            auto_renewal: false,
            contact_name: '',
            contact_email: '',
            license_key: '',
            notes: ''
          });
          setSelectedFile(null);
        }
      }
      
      setLoading(false);
      
      // Navigate back to licenses list after a short delay
      setTimeout(() => {
        navigate('/licenses');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to save license');
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    navigate('/licenses');
  };
  
  // Check if user has permission to edit
  const canEdit = authState.user?.role === 'admin' || authState.user?.role === 'editor';
  
  if (!canEdit) {
    return (
      <Alert severity="error">
        You don't have permission to {isEditMode ? 'edit' : 'create'} licenses.
      </Alert>
    );
  }
  
  if (loading && isEditMode) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {isEditMode ? 'Edit License' : 'Add New License'}
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
      
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h6" gutterBottom>
            Software Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                required
                fullWidth
                label="Software Name"
                name="software_name"
                value={formData.software_name}
                onChange={handleInputChange}
              />
            </Box>
            
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                required
                fullWidth
                label="Vendor"
                name="vendor"
                value={formData.vendor}
                onChange={handleInputChange}
              />
            </Box>
            
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                required
                fullWidth
                select
                label="License Type"
                name="license_type"
                value={formData.license_type}
                onChange={handleInputChange}
              >
                {licenseTypes.map(option => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                fullWidth
                label="License Key"
                name="license_key"
                type={showLicenseKey ? 'text' : 'password'}
                value={formData.license_key}
                onChange={handleInputChange}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowLicenseKey(!showLicenseKey)}
                        edge="end"
                      >
                        {showLicenseKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            License Dates
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ flex: '1 1 200px' }}>
              <TextField
                required
                fullWidth
                label="Purchase Date"
                name="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Box sx={{ flex: '1 1 200px' }}>
              <TextField
                required
                fullWidth
                label="Expiration Date"
                name="expiration_date"
                type="date"
                value={formData.expiration_date}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            
            <Box sx={{ flex: '1 1 200px', display: 'flex', alignItems: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.auto_renewal}
                    onChange={handleSwitchChange}
                    name="auto_renewal"
                    color="primary"
                  />
                }
                label="Auto Renewal"
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Contact Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                required
                fullWidth
                label="Contact Name"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleInputChange}
              />
            </Box>
            
            <Box sx={{ flex: '1 1 300px' }}>
              <TextField
                required
                fullWidth
                label="Contact Email"
                name="contact_email"
                type="email"
                value={formData.contact_email}
                onChange={handleInputChange}
              />
            </Box>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Typography variant="h6" gutterBottom>
            Additional Information
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
            <Box>
              <TextField
                fullWidth
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleInputChange}
              />
            </Box>
            
            <Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<UploadIcon />}
              >
                {selectedFile ? 'Change License File' : 'Upload License File'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected file: {selectedFile.name}
                </Typography>
              )}
              
              {fileUrl && !selectedFile && (
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2">
                    Current file: <a href={fileUrl} target="_blank" rel="noopener noreferrer">View License File</a>
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleCancel}
              startIcon={<CancelIcon />}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={24} /> : <SaveIcon />}
            >
              {isEditMode ? 'Update License' : 'Create License'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default LicenseForm;
