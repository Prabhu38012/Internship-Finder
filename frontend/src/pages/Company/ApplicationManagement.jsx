import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Divider
} from '@mui/material';
import {
  Visibility,
  MoreVert,
  Email,
  Phone,
  Download,
  CheckCircle,
  Cancel,
  Schedule,
  FilterList,
  Search,
  Refresh
} from '@mui/icons-material';
import { Helmet } from 'react-helmet-async';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

import { getCompanyApplications, updateApplicationStatus } from '../../store/slices/applicationSlice';
import { internshipAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { useSocket } from '../../hooks/useSocket';

const ApplicationManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { companyApplications, isLoading } = useSelector((state) => state.applications);
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [realTimeUpdates, setRealTimeUpdates] = useState([]);

  const socket = useSocket();

  useEffect(() => {
    dispatch(getCompanyApplications());
  }, [dispatch]);

  useEffect(() => {
    if (socket) {
      // Listen for new applications
      socket.on('new_application', (data) => {
        if (data.companyId === user?.id) {
          toast.success(`New application received for ${data.internshipTitle}`);
          setRealTimeUpdates(prev => [...prev, {
            type: 'new',
            message: `New application from ${data.applicantName}`,
            timestamp: new Date()
          }]);
          dispatch(getCompanyApplications());
        }
      });

      // Listen for application withdrawals
      socket.on('application_withdrawn', (data) => {
        if (data.companyId === user?.id) {
          toast.info(`Application withdrawn for ${data.internshipTitle}`);
          setRealTimeUpdates(prev => [...prev, {
            type: 'withdrawn',
            message: `${data.applicantName} withdrew their application`,
            timestamp: new Date()
          }]);
          dispatch(getCompanyApplications());
        }
      });

      return () => {
        socket.off('new_application');
        socket.off('application_withdrawn');
      };
    }
  }, [socket, user?.id, dispatch]);

  const handleMenuOpen = (event, application) => {
    setAnchorEl(event.currentTarget);
    setSelectedApplication(application);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedApplication(null);
  };

  const handleStatusUpdate = () => {
    setNewStatus(selectedApplication?.status || '');
    setStatusNote('');
    setStatusDialog(true);
    handleMenuClose();
  };

  const handleStatusSubmit = async () => {
    if (!selectedApplication || !newStatus) return;

    try {
      await internshipAPI.updateApplicationStatus(selectedApplication._id, newStatus);
      
      // Emit real-time update
      if (socket) {
        socket.emit('application_status_updated', {
          applicationId: selectedApplication._id,
          status: newStatus,
          companyId: user.id,
          applicantId: selectedApplication.applicant._id,
          internshipTitle: selectedApplication.internship.title
        });
      }

      toast.success('Application status updated successfully');
      dispatch(getCompanyApplications());
      setStatusDialog(false);
      setSelectedApplication(null);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewing': return 'info';
      case 'shortlisted': return 'primary';
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'withdrawn': return 'default';
      default: return 'default';
    }
  };

  const getStatusCounts = () => {
    const counts = {
      all: companyApplications?.length || 0,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };

    companyApplications?.forEach(app => {
      if (counts[app.status] !== undefined) {
        counts[app.status]++;
      }
    });

    return counts;
  };

  const filteredApplications = companyApplications?.filter(app => {
    const matchesSearch = !searchTerm || 
      app.applicant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.internship.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || app.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return <LoadingSpinner message="Loading applications..." />;
  }

  return (
    <>
      <Helmet>
        <title>Application Management - InternQuest</title>
        <meta name="description" content="Manage and track internship applications in real-time." />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Application Management
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage internship applications in real-time
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => dispatch(getCompanyApplications())}
          >
            Refresh
          </Button>
        </Box>

        {/* Real-time Updates */}
        {realTimeUpdates.length > 0 && (
          <Card sx={{ mb: 3, bgcolor: 'primary.50' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Updates
              </Typography>
              {realTimeUpdates.slice(-3).map((update, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                  <Chip 
                    size="small" 
                    label={update.type} 
                    color={update.type === 'new' ? 'success' : 'info'} 
                  />
                  <Typography variant="body2">
                    {update.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(update.timestamp, 'HH:mm')}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Filters and Search */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Filter by Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    label="Filter by Status"
                  >
                    <MenuItem value="all">All Applications ({statusCounts.all})</MenuItem>
                    <MenuItem value="pending">Pending ({statusCounts.pending})</MenuItem>
                    <MenuItem value="reviewing">Reviewing ({statusCounts.reviewing})</MenuItem>
                    <MenuItem value="shortlisted">Shortlisted ({statusCounts.shortlisted})</MenuItem>
                    <MenuItem value="accepted">Accepted ({statusCounts.accepted})</MenuItem>
                    <MenuItem value="rejected">Rejected ({statusCounts.rejected})</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(statusCounts).map(([status, count]) => (
                    status !== 'all' && (
                      <Chip
                        key={status}
                        label={`${status}: ${count}`}
                        size="small"
                        color={getStatusColor(status)}
                        variant={filterStatus === status ? 'filled' : 'outlined'}
                        onClick={() => setFilterStatus(status)}
                        clickable
                      />
                    )
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Applications ({filteredApplications.length})
            </Typography>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Applicant</TableCell>
                    <TableCell>Internship</TableCell>
                    <TableCell>Applied Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Experience</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredApplications.map((application) => (
                    <TableRow key={application._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={application.applicant.avatar}
                            sx={{ width: 40, height: 40 }}
                          >
                            {application.applicant.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle2" fontWeight="bold">
                              {application.applicant.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {application.applicant.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {application.internship.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {application.internship.category}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(application.createdAt), 'HH:mm')}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={application.status}
                          size="small"
                          color={getStatusColor(application.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {application.applicant.profile?.experience || 'Not specified'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Profile">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Contact">
                          <IconButton size="small">
                            <Email />
                          </IconButton>
                        </Tooltip>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, application)}
                        >
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {filteredApplications.length === 0 && (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                  No applications found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Applications will appear here once students start applying'
                  }
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {}}>
            <Visibility sx={{ mr: 1 }} />
            View Full Profile
          </MenuItem>
          <MenuItem onClick={() => {}}>
            <Download sx={{ mr: 1 }} />
            Download Resume
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleStatusUpdate}>
            <CheckCircle sx={{ mr: 1 }} />
            Update Status
          </MenuItem>
          <MenuItem onClick={() => {}}>
            <Email sx={{ mr: 1 }} />
            Send Message
          </MenuItem>
        </Menu>

        {/* Status Update Dialog */}
        <Dialog open={statusDialog} onClose={() => setStatusDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 1 }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="reviewing">Reviewing</MenuItem>
                  <MenuItem value="shortlisted">Shortlisted</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Note (Optional)"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status change..."
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleStatusSubmit} 
              variant="contained"
              disabled={!newStatus}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default ApplicationManagement;
