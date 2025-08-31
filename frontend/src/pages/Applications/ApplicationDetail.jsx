import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import {
  Person,
  Business,
  Email,
  Phone,
  School,
  Work,
  Download,
  Edit,
  Check,
  Close
} from '@mui/icons-material'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import { getApplication, updateApplicationStatus } from '../../store/slices/applicationSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const ApplicationDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { application, isLoading } = useSelector((state) => state.applications)
  const { user } = useSelector((state) => state.auth)
  
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')

  useEffect(() => {
    if (id) {
      dispatch(getApplication(id))
    }
  }, [dispatch, id])

  const handleStatusUpdate = () => {
    dispatch(updateApplicationStatus({ id, status: newStatus, note: statusNote }))
      .unwrap()
      .then(() => {
        toast.success('Application status updated successfully')
        setStatusDialogOpen(false)
        setStatusNote('')
      })
      .catch((error) => {
        toast.error(error || 'Failed to update status')
      })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      case 'reviewing': return 'info'
      case 'shortlisted': return 'primary'
      case 'interviewed': return 'secondary'
      case 'withdrawn': return 'default'
      default: return 'default'
    }
  }

  const getTimelineIcon = (status) => {
    switch (status) {
      case 'accepted': return <Check />
      case 'rejected': return <Close />
      default: return null
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading application details..." />
  }

  if (!application) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Application not found
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/applications')}>
          Back to Applications
        </Button>
      </Container>
    )
  }

  const isCompany = user?.role === 'company'
  const canUpdateStatus = isCompany && application.company._id === user._id

  return (
    <>
      <Helmet>
        <title>Application Details - Internship Finder</title>
        <meta name="description" content="View detailed information about the internship application." />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                      {application.internship.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Business color="action" />
                      <Typography variant="h6" color="text.secondary">
                        {application.internship.companyName}
                      </Typography>
                    </Box>
                    <Chip
                      label={application.status}
                      color={getStatusColor(application.status)}
                      size="large"
                    />
                  </Box>
                  
                  {canUpdateStatus && (
                    <Button
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() => {
                        setNewStatus(application.status)
                        setStatusDialogOpen(true)
                      }}
                    >
                      Update Status
                    </Button>
                  )}
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Applicant Information (for companies) */}
                {isCompany && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Applicant Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Avatar
                            src={application.applicant.avatar}
                            sx={{ width: 60, height: 60 }}
                          >
                            {application.applicant.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight="bold">
                              {application.applicant.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {application.applicant.email}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          {application.applicant.phone && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Phone fontSize="small" color="action" />
                              <Typography variant="body2">
                                {application.applicant.phone}
                              </Typography>
                            </Box>
                          )}
                          {application.applicant.studentProfile?.university && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <School fontSize="small" color="action" />
                              <Typography variant="body2">
                                {application.applicant.studentProfile.university}
                              </Typography>
                            </Box>
                          )}
                          {application.applicant.studentProfile?.degree && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Work fontSize="small" color="action" />
                              <Typography variant="body2">
                                {application.applicant.studentProfile.degree}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Skills */}
                    {application.applicant.studentProfile?.skills?.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Skills:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {application.applicant.studentProfile.skills.map((skill, index) => (
                            <Chip key={index} label={skill} size="small" variant="outlined" />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Cover Letter */}
                {application.coverLetter && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Cover Letter
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {application.coverLetter}
                    </Typography>
                  </Box>
                )}

                {/* Resume */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Resume
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Download />}
                    href={application.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download Resume
                  </Button>
                </Box>

                {/* Additional Documents */}
                {application.additionalDocuments?.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Additional Documents
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {application.additionalDocuments.map((doc, index) => (
                        <Button
                          key={index}
                          variant="outlined"
                          startIcon={<Download />}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          {doc.name}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Application Timeline */}
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Application Timeline
                  </Typography>
                  <List>
                    {application.timeline?.map((event, index) => (
                      <ListItem key={index} sx={{ pl: 0 }}>
                        <ListItemIcon>
                          <Chip
                            icon={getTimelineIcon(event.status)}
                            label={event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                            color={getStatusColor(event.status)}
                            size="small"
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={format(new Date(event.date), 'MMM dd, yyyy HH:mm')}
                          secondary={event.note}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Internship Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Internship Details
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Type
                    </Typography>
                    <Typography variant="body2">
                      {application.internship.type}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body2">
                      {application.internship.location?.type === 'remote' 
                        ? 'Remote' 
                        : `${application.internship.location?.city}`
                      }
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Application Date
                    </Typography>
                    <Typography variant="body2">
                      {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={application.status}
                      color={getStatusColor(application.status)}
                      size="small"
                    />
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/applications')}
                    fullWidth
                  >
                    Back to Applications
                  </Button>
                  {!isCompany && (
                    <Button
                      variant="outlined"
                      href={`/internships/${application.internship._id}`}
                      fullWidth
                    >
                      View Internship
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Status Update Dialog */}
        <Dialog
          open={statusDialogOpen}
          onClose={() => setStatusDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Application Status</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={newStatus}
                  label="Status"
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="reviewing">Reviewing</MenuItem>
                  <MenuItem value="shortlisted">Shortlisted</MenuItem>
                  <MenuItem value="interviewed">Interviewed</MenuItem>
                  <MenuItem value="accepted">Accepted</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Note (Optional)"
                multiline
                rows={3}
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Add a note about this status update..."
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStatusUpdate}
              variant="contained"
              disabled={!newStatus}
            >
              Update Status
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default ApplicationDetail
