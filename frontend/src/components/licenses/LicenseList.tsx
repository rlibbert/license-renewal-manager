import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { 
  Add as AddIcon, 
  Search as SearchIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { Link, useNavigate } from 'react-router-dom';
import { licenseApi } from '../../services/api';
import { License } from '../../types';
import { useAuth } from '../../context/AuthContext';

const LicenseList: React.FC = () => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<License | null>(null);
  
  const { authState } = useAuth();
  const navigate = useNavigate();
  
  // Filter states
  const [expirationStart, setExpirationStart] = useState('');
  const [expirationEnd, setExpirationEnd] = useState('');
  const [licenseType, setLicenseType] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  useEffect(() => {
    fetchLicenses();
  }, []);

  const fetchLicenses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await licenseApi.searchLicenses(
        searchTerm || undefined,
        expirationStart || undefined,
        expirationEnd || undefined,
        licenseType || undefined,
        contactEmail || undefined
      );
      
      setLicenses(result);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || 'Failed to load licenses');
      setLoading(false);
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = () => {
    fetchLicenses();
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setExpirationStart('');
    setExpirationEnd('');
    setLicenseType('');
    setContactEmail('');
    
    // Reset to default search
    setTimeout(() => {
      fetchLicenses();
    }, 0);
  };

  const handleDeleteClick = (license: License) => {
    setLicenseToDelete(license);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!licenseToDelete) return;
    
    try {
      await licenseApi.deleteLicense(licenseToDelete.id);
      setDeleteDialogOpen(false);
      setLicenseToDelete(null);
      
      // Refresh the license list
      fetchLicenses();
    } catch (err: any) {
      setError(err.message || 'Failed to delete license');
      setDeleteDialogOpen(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLicenseToDelete(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Licenses</Typography>
        
        {(authState.user?.role === 'admin' || authState.user?.role === 'editor') && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            component={Link}
            to="/licenses/new"
          >
            Add License
          </Button>
        )}
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: showFilters ? 2 : 0 }}>
          <TextField
            label="Search"
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{ mr: 2 }}
          />
          
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ minWidth: 120 }}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button
            variant="outlined"
            onClick={handleSearch}
            sx={{ ml: 2 }}
          >
            Search
          </Button>
          
          <Button
            variant="text"
            onClick={handleClearSearch}
            sx={{ ml: 1 }}
          >
            Clear
          </Button>
        </Box>
        
        {showFilters && (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <TextField
              label="Expiration From"
              type="date"
              size="small"
              value={expirationStart}
              onChange={(e) => setExpirationStart(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              label="Expiration To"
              type="date"
              size="small"
              value={expirationEnd}
              onChange={(e) => setExpirationEnd(e.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              label="License Type"
              size="small"
              value={licenseType}
              onChange={(e) => setLicenseType(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              label="Contact Email"
              size="small"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              sx={{ minWidth: 200 }}
            />
          </Box>
        )}
      </Paper>
      
      {/* Licenses Table */}
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="licenses table">
          <TableHead>
            <TableRow>
              <TableCell>Software</TableCell>
              <TableCell>Vendor</TableCell>
              <TableCell>License Type</TableCell>
              <TableCell>Expiration Date</TableCell>
              <TableCell>Auto Renewal</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {licenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No licenses found
                </TableCell>
              </TableRow>
            ) : (
              licenses
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((license) => (
                  <TableRow key={license.id}>
                    <TableCell component="th" scope="row">
                      {license.software_name}
                    </TableCell>
                    <TableCell>{license.vendor}</TableCell>
                    <TableCell>{license.license_type}</TableCell>
                    <TableCell>
                      {format(new Date(license.expiration_date), 'MMM dd, yyyy')}
                      {new Date(license.expiration_date) < new Date() && (
                        <Chip 
                          label="Expired" 
                          color="error" 
                          size="small" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                      {new Date(license.expiration_date) > new Date() && 
                       new Date(license.expiration_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) && (
                        <Chip 
                          label="Expiring Soon" 
                          color="warning" 
                          size="small" 
                          sx={{ ml: 1 }} 
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      {license.auto_renewal ? (
                        <Chip label="Yes" color="success" size="small" />
                      ) : (
                        <Chip label="No" color="default" size="small" />
                      )}
                    </TableCell>
                    <TableCell>
                      {license.contact_name}
                      <Typography variant="body2" color="text.secondary">
                        {license.contact_email}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color="primary" 
                        component={Link} 
                        to={`/licenses/${license.id}`}
                        size="small"
                      >
                        <EditIcon />
                      </IconButton>
                      
                      {authState.user?.role === 'admin' && (
                        <IconButton 
                          color="error" 
                          onClick={() => handleDeleteClick(license)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={licenses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the license for {licenseToDelete?.software_name}? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LicenseList;
