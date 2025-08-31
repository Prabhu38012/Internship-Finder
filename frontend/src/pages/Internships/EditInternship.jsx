import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment
} from '@mui/material'
import {
  Add,
  Delete,
  LocationOn,
  AttachMoney,
  Business,
  Schedule,
  Work
} from '@mui/icons-material'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'

import { getInternship, updateInternship } from '../../store/slices/internshipSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const EditInternship = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { currentInternship, isLoading } = useSelector((state) => state.internships)
  
  const [skillDialogOpen, setSkillDialogOpen] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    type: 'internship',
    category: '',
    location: {
      type: 'onsite',
      city: '',
      state: '',
      country: '',
      address: ''
    },
    remote: false,
    duration: {
      months: 3,
      startDate: '',
      endDate: ''
    },
    stipend: {
      amount: '',
      currency: 'USD',
      period: 'monthly'
    },
    skills: [],
    applicationDeadline: '',
    positions: 1,
    benefits: [],
    companyInfo: {
      name: '',
      website: '',
      industry: ''
    }
  })

  useEffect(() => {
    if (id) {
      dispatch(getInternship(id))
    }
  }, [dispatch, id])

  useEffect(() => {
    if (currentInternship) {
      setFormData({
        title: currentInternship.title || '',
        description: currentInternship.description || '',
        requirements: currentInternship.requirements || '',
        responsibilities: currentInternship.responsibilities || '',
        type: currentInternship.type || 'internship',
        category: currentInternship.category || '',
        location: {
          type: currentInternship.location?.type || 'onsite',
          city: currentInternship.location?.city || '',
          state: currentInternship.location?.state || '',
          country: currentInternship.location?.country || '',
          address: currentInternship.location?.address || ''
        },
        remote: currentInternship.remote || false,
        duration: {
          months: currentInternship.duration?.months || 3,
          startDate: currentInternship.duration?.startDate ? 
            new Date(currentInternship.duration.startDate).toISOString().split('T')[0] : '',
          endDate: currentInternship.duration?.endDate ? 
            new Date(currentInternship.duration.endDate).toISOString().split('T')[0] : ''
        },
        stipend: {
          amount: currentInternship.stipend?.amount || '',
          currency: currentInternship.stipend?.currency || 'USD',
          period: currentInternship.stipend?.period || 'monthly'
        },
        skills: currentInternship.skills || [],
        applicationDeadline: currentInternship.applicationDeadline ? 
          new Date(currentInternship.applicationDeadline).toISOString().split('T')[0] : '',
        positions: currentInternship.positions || 1,
        benefits: currentInternship.benefits || [],
        companyInfo: {
          name: currentInternship.companyInfo?.name || '',
          website: currentInternship.companyInfo?.website || '',
          industry: currentInternship.companyInfo?.industry || ''
        }
      })
    }
  }, [currentInternship])

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleLocationTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        type
      },
      remote: type === 'remote'
    }))
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
      setSkillDialogOpen(false)
    }
  }

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields')
      return
    }

    dispatch(updateInternship({ id, data: formData }))
      .unwrap()
      .then(() => {
        toast.success('Internship updated successfully!')
        navigate('/company')
      })
      .catch((error) => {
        toast.error(error || 'Failed to update internship')
      })
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading internship details..." />
  }

  if (!currentInternship) {
    return (
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Internship not found
        </Typography>
        <Button variant="outlined" onClick={() => navigate('/company')}>
          Back to Dashboard
        </Button>
      </Container>
    )
  }

  const categories = [
    'Software Development',
    'Data Science',
    'Marketing',
    'Design',
    'Finance',
    'Human Resources',
    'Sales',
    'Operations',
    'Research',
    'Engineering',
    'Product Management',
    'Business Development'
  ]

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Retail',
    'Manufacturing',
    'Consulting',
    'Media',
    'Non-profit',
    'Government',
    'Automotive',
    'Real Estate'
  ]

  return (
    <>
      <Helmet>
        <title>Edit Internship - Internship Finder</title>
        <meta name="description" content="Edit your internship posting details." />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Edit Internship
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Update your internship posting details
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Internship Title *"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        fullWidth
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category *</InputLabel>
                        <Select
                          value={formData.category}
                          label="Category *"
                          onChange={(e) => handleInputChange('category', e.target.value)}
                        >
                          {categories.map((category) => (
                            <MenuItem key={category} value={category}>
                              {category}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={formData.type}
                          label="Type"
                          onChange={(e) => handleInputChange('type', e.target.value)}
                        >
                          <MenuItem value="internship">Internship</MenuItem>
                          <MenuItem value="co-op">Co-op</MenuItem>
                          <MenuItem value="apprenticeship">Apprenticeship</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Description *"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        multiline
                        rows={4}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Requirements"
                        value={formData.requirements}
                        onChange={(e) => handleInputChange('requirements', e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Responsibilities"
                        value={formData.responsibilities}
                        onChange={(e) => handleInputChange('responsibilities', e.target.value)}
                        multiline
                        rows={3}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Location */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Location
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth>
                      <InputLabel>Location Type</InputLabel>
                      <Select
                        value={formData.location.type}
                        label="Location Type"
                        onChange={(e) => handleLocationTypeChange(e.target.value)}
                      >
                        <MenuItem value="onsite">On-site</MenuItem>
                        <MenuItem value="remote">Remote</MenuItem>
                        <MenuItem value="hybrid">Hybrid</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {formData.location.type !== 'remote' && (
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          label="City"
                          value={formData.location.city}
                          onChange={(e) => handleInputChange('location.city', e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <LocationOn />
                              </InputAdornment>
                            ),
                          }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="State"
                          value={formData.location.state}
                          onChange={(e) => handleInputChange('location.state', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Country"
                          value={formData.location.country}
                          onChange={(e) => handleInputChange('location.country', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Duration & Compensation */}
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Duration & Compensation
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <TextField
                        label="Duration (months)"
                        type="number"
                        value={formData.duration.months}
                        onChange={(e) => handleInputChange('duration.months', parseInt(e.target.value))}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Schedule />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Positions Available"
                        type="number"
                        value={formData.positions}
                        onChange={(e) => handleInputChange('positions', parseInt(e.target.value))}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Work />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Start Date"
                        type="date"
                        value={formData.duration.startDate}
                        onChange={(e) => handleInputChange('duration.startDate', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <TextField
                        label="Application Deadline"
                        type="date"
                        value={formData.applicationDeadline}
                        onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={8}>
                      <TextField
                        label="Stipend Amount"
                        type="number"
                        value={formData.stipend.amount}
                        onChange={(e) => handleInputChange('stipend.amount', e.target.value)}
                        fullWidth
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <AttachMoney />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <FormControl fullWidth>
                        <InputLabel>Period</InputLabel>
                        <Select
                          value={formData.stipend.period}
                          label="Period"
                          onChange={(e) => handleInputChange('stipend.period', e.target.value)}
                        >
                          <MenuItem value="hourly">Hourly</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="total">Total</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            {/* Skills Required */}
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Skills Required
                    </Typography>
                    <IconButton
                      onClick={() => setSkillDialogOpen(true)}
                      color="primary"
                    >
                      <Add />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {formData.skills.map((skill, index) => (
                      <Chip
                        key={index}
                        label={skill}
                        onDelete={() => removeSkill(skill)}
                        deleteIcon={<Delete />}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    {formData.skills.length === 0 && (
                      <Typography variant="body2" color="text.secondary">
                        No skills added yet. Click + to add skills.
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Submit Buttons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/company')}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={isLoading}
                >
                  {isLoading ? 'Updating...' : 'Update Internship'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>

        {/* Add Skill Dialog */}
        <Dialog
          open={skillDialogOpen}
          onClose={() => setSkillDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Required Skill</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Skill"
              fullWidth
              variant="outlined"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill()
                }
              }}
              placeholder="e.g., JavaScript, Python, React"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSkillDialogOpen(false)}>Cancel</Button>
            <Button onClick={addSkill} variant="contained" disabled={!newSkill.trim()}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}

export default EditInternship
