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
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert
} from '@mui/material'
import {
  LocationOn,
  Business,
  Schedule,
  AttachMoney,
  CalendarToday,
  Person,
  Email,
  Phone,
  Language,
  Bookmark,
  BookmarkBorder,
  Share,
  Report
} from '@mui/icons-material'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import { getInternship, toggleSaveInternship } from '../../store/slices/internshipSlice'
import { applyForInternship } from '../../store/slices/applicationSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const InternshipDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { internship, isLoading } = useSelector((state) => state.internships)
  const { user } = useSelector((state) => state.auth)
  const { isLoading: applicationLoading } = useSelector((state) => state.applications)
  
  const [applyDialogOpen, setApplyDialogOpen] = useState(false)
  const [coverLetter, setCoverLetter] = useState('')
  const [resumeFile, setResumeFile] = useState(null)

  useEffect(() => {
    if (id) {
      dispatch(getInternship(id))
    }
  }, [dispatch, id])

  const handleSave = () => {
    if (!user) {
      navigate('/login')
      return
    }
    dispatch(toggleSaveInternship(id))
  }

  const handleApply = () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (user.role !== 'student') {
      toast.error('Only students can apply for internships')
      return
    }
    setApplyDialogOpen(true)
  }

  const handleSubmitApplication = () => {
    const applicationData = {
      internshipId: id,
      coverLetter,
      resume: resumeFile
    }
    
    dispatch(applyForInternship(applicationData))
      .unwrap()
      .then(() => {
        toast.success('Application submitted successfully!')
        setApplyDialogOpen(false)
        // Refresh internship data to update application status
        dispatch(getInternship(id))
      })
      .catch((error) => {
        toast.error(error || 'Failed to submit application')
      })
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: internship.title,
        text: `Check out this internship opportunity at ${internship.companyName}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Link copied to clipboard!')
    }
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading internship details..." />
  }

  if (!internship) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Internship not found
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/internships')}>
          Browse Internships
        </Button>
      </Container>
    )
  }

  const isExpired = new Date(internship.applicationDeadline) < new Date()
  const canApply = user && user.role === 'student' && !internship.hasApplied && !isExpired

  return (
    <>
      <Helmet>
        <title>{internship.title} at {internship.companyName} - Internship Finder</title>
        <meta name="description" content={internship.description.substring(0, 160)} />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                {/* Header */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 2 }}>
                    <Avatar
                      src={internship.company?.companyProfile?.logo}
                      sx={{ width: 64, height: 64 }}
                    >
                      {internship.companyName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                        {internship.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Business color="action" />
                        <Typography variant="h6" color="text.secondary">
                          {internship.companyName}
                        </Typography>
                        {internship.company?.companyProfile?.verified && (
                          <Chip label="Verified" size="small" color="primary" />
                        )}
                      </Box>
                    </Box>
                  </Box>

                  {/* Status Chips */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip label={internship.category} color="primary" />
                    <Chip label={internship.type} variant="outlined" />
                    {internship.location.type === 'remote' && (
                      <Chip label="Remote" color="success" />
                    )}
                    {internship.urgent && (
                      <Chip label="Urgent Hiring" color="error" />
                    )}
                    {internship.featured && (
                      <Chip label="Featured" color="secondary" />
                    )}
                    {isExpired && (
                      <Chip label="Expired" color="error" variant="outlined" />
                    )}
                  </Box>

                  {/* Quick Info */}
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <LocationOn color="action" />
                        <Typography variant="body2">
                          {internship.location.type === 'remote' 
                            ? 'Remote' 
                            : `${internship.location.city}, ${internship.location.state}`
                          }
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Schedule color="action" />
                        <Typography variant="body2">
                          {internship.duration}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachMoney color="action" />
                        <Typography variant="body2">
                          {internship.stipend.amount > 0 
                            ? `$${internship.stipend.amount}/${internship.stipend.period}`
                            : 'Unpaid'
                          }
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarToday color="action" />
                        <Typography variant="body2">
                          Apply by {format(new Date(internship.applicationDeadline), 'MMM dd, yyyy')}
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Description */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    About this Internship
                  </Typography>
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                    {internship.description}
                  </Typography>
                </Box>

                {/* Responsibilities */}
                {internship.responsibilities?.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Responsibilities
                    </Typography>
                    <List dense>
                      {internship.responsibilities.map((responsibility, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText 
                            primary={`• ${responsibility}`}
                            sx={{ my: 0 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}

                {/* Requirements */}
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" gutterBottom>
                    Requirements
                  </Typography>
                  {internship.requirements.skills?.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Skills Required:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {internship.requirements.skills.map((skill, index) => (
                          <Chip key={index} label={skill} size="small" variant="outlined" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {internship.requirements.education && (
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Education:</strong> {internship.requirements.education}
                    </Typography>
                  )}
                  {internship.requirements.experience && (
                    <Typography variant="body2">
                      <strong>Experience:</strong> {internship.requirements.experience}
                    </Typography>
                  )}
                </Box>

                {/* Benefits */}
                {internship.benefits?.length > 0 && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Benefits
                    </Typography>
                    <List dense>
                      {internship.benefits.map((benefit, index) => (
                        <ListItem key={index} sx={{ px: 0 }}>
                          <ListItemText 
                            primary={`• ${benefit}`}
                            sx={{ my: 0 }}
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            {/* Action Buttons */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                {internship.hasApplied ? (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    You have already applied for this internship.
                    Status: <strong>{internship.applicationStatus}</strong>
                  </Alert>
                ) : isExpired ? (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    Application deadline has passed
                  </Alert>
                ) : null}

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    onClick={handleApply}
                    disabled={!canApply}
                  >
                    {internship.hasApplied ? 'Already Applied' : 'Apply Now'}
                  </Button>
                  
                  {user && user.role === 'student' && (
                    <Button
                      variant="outlined"
                      startIcon={internship.isSaved ? <Bookmark /> : <BookmarkBorder />}
                      onClick={handleSave}
                      fullWidth
                    >
                      {internship.isSaved ? 'Saved' : 'Save'}
                    </Button>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<Share />}
                    onClick={handleShare}
                    fullWidth
                  >
                    Share
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {/* Company Info */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  About {internship.companyName}
                </Typography>
                
                {internship.company?.companyProfile?.description && (
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {internship.company.companyProfile.description}
                  </Typography>
                )}

                {/* Contact Info */}
                {internship.contactInfo && (
                  <Box sx={{ mt: 2 }}>
                    {internship.contactInfo.email && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Email fontSize="small" color="action" />
                        <Typography variant="body2">
                          {internship.contactInfo.email}
                        </Typography>
                      </Box>
                    )}
                    {internship.contactInfo.phone && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Phone fontSize="small" color="action" />
                        <Typography variant="body2">
                          {internship.contactInfo.phone}
                        </Typography>
                      </Box>
                    )}
                    {internship.contactInfo.website && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Language fontSize="small" color="action" />
                        <Typography variant="body2">
                          <a href={internship.contactInfo.website} target="_blank" rel="noopener noreferrer">
                            Company Website
                          </a>
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Internship Stats
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Applications:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {internship.applicationsCount}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Views:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {internship.views}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Posted:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {format(new Date(internship.createdAt), 'MMM dd, yyyy')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Application Dialog */}
        <Dialog
          open={applyDialogOpen}
          onClose={() => setApplyDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Apply for {internship.title}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Cover Letter"
                multiline
                rows={6}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Tell us why you're interested in this internship and what makes you a great fit..."
                fullWidth
              />
              
              <Box>
                <Typography variant="subtitle2" gutterBottom>
                  Resume (Optional - we'll use your profile resume if not provided)
                </Typography>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setApplyDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitApplication}
              variant="contained"
              disabled={applicationLoading}
            >
              {applicationLoading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default InternshipDetail
