import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  TextField,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material'
import {
  Edit,
  PhotoCamera,
  Add,
  Delete,
  Upload,
  Download,
  Business,
  School,
  Work,
  LocationOn,
  Email,
  Phone
} from '@mui/icons-material'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'

import { updateProfile } from '../../store/slices/authSlice'
import userService from '../../services/userService'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const Profile = () => {
  const dispatch = useDispatch()
  const { user, isLoading } = useSelector((state) => state.auth)
  
  const [editMode, setEditMode] = useState(false)
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [skillDialogOpen, setSkillDialogOpen] = useState(false)
  const [newSkill, setNewSkill] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    studentProfile: {
      university: '',
      degree: '',
      major: '',
      graduationYear: '',
      gpa: '',
      skills: []
    },
    companyProfile: {
      companyName: '',
      industry: '',
      companySize: '',
      website: '',
      description: ''
    }
  })

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        bio: user.bio || '',
        location: {
          city: user.location?.city || '',
          state: user.location?.state || '',
          country: user.location?.country || ''
        },
        studentProfile: {
          university: user.studentProfile?.university || '',
          degree: user.studentProfile?.degree || '',
          major: user.studentProfile?.major || '',
          graduationYear: user.studentProfile?.graduationYear || '',
          gpa: user.studentProfile?.gpa || '',
          skills: user.studentProfile?.skills || []
        },
        companyProfile: {
          companyName: user.companyProfile?.companyName || '',
          industry: user.companyProfile?.industry || '',
          companySize: user.companyProfile?.companySize || '',
          website: user.companyProfile?.website || '',
          description: user.companyProfile?.description || ''
        }
      })
    }
  }, [user])

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

  const handleSave = () => {
    dispatch(updateProfile(formData))
      .unwrap()
      .then(() => {
        toast.success('Profile updated successfully')
        setEditMode(false)
      })
      .catch((error) => {
        toast.error(error || 'Failed to update profile')
      })
  }

  const handleAvatarUpload = async () => {
    if (!selectedFile) return

    const formDataUpload = new FormData()
    formDataUpload.append('avatar', selectedFile)

    try {
      setUploading(true)
      await userService.updateProfile(formDataUpload)
      toast.success('Avatar updated successfully')
      setAvatarDialogOpen(false)
      setSelectedFile(null)
      // Refresh user data
      dispatch(updateProfile({}))
    } catch (error) {
      toast.error('Failed to update avatar')
    } finally {
      setUploading(false)
    }
  }

  const handleResumeUpload = async (file) => {
    const token = localStorage.getItem('token')
    
    try {
      setUploading(true)
      await userService.uploadResume(file, token)
      toast.success('Resume uploaded successfully')
      // Refresh user data
      dispatch(updateProfile({}))
    } catch (error) {
      toast.error('Failed to upload resume')
    } finally {
      setUploading(false)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !formData.studentProfile.skills.includes(newSkill.trim())) {
      handleInputChange('studentProfile.skills', [...formData.studentProfile.skills, newSkill.trim()])
      setNewSkill('')
      setSkillDialogOpen(false)
    }
  }

  const removeSkill = (skillToRemove) => {
    handleInputChange('studentProfile.skills', 
      formData.studentProfile.skills.filter(skill => skill !== skillToRemove)
    )
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading profile..." />
  }

  return (
    <>
      <Helmet>
        <title>Profile - InternQuest</title>
        <meta name="description" content="Manage your profile information and preferences." />
      </Helmet>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          {/* Profile Header */}
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={user?.avatar}
                      sx={{ width: 120, height: 120 }}
                    >
                      {user?.name?.charAt(0)}
                    </Avatar>
                    <IconButton
                      sx={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' }
                      }}
                      size="small"
                      onClick={() => setAvatarDialogOpen(true)}
                    >
                      <PhotoCamera fontSize="small" />
                    </IconButton>
                  </Box>
                  
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                      {user?.name}
                    </Typography>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      {user?.role === 'student' ? 'Student' : user?.role === 'company' ? 'Company' : 'Admin'}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Email fontSize="small" color="action" />
                        <Typography variant="body2">{user?.email}</Typography>
                      </Box>
                      {user?.phone && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Phone fontSize="small" color="action" />
                          <Typography variant="body2">{user?.phone}</Typography>
                        </Box>
                      )}
                      {user?.location?.city && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2">
                            {user.location.city}, {user.location.country}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                  
                  <Button
                    variant={editMode ? "contained" : "outlined"}
                    startIcon={<Edit />}
                    onClick={() => editMode ? handleSave() : setEditMode(true)}
                  >
                    {editMode ? 'Save Changes' : 'Edit Profile'}
                  </Button>
                  
                  {editMode && (
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setEditMode(false)
                        // Reset form data
                        setFormData({
                          name: user?.name || '',
                          email: user?.email || '',
                          phone: user?.phone || '',
                          bio: user?.bio || '',
                          location: user?.location || { city: '', state: '', country: '' },
                          studentProfile: user?.studentProfile || {},
                          companyProfile: user?.companyProfile || {}
                        })
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Basic Information */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Bio"
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!editMode}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Box>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="City"
                    value={formData.location.city}
                    onChange={(e) => handleInputChange('location.city', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="State"
                    value={formData.location.state}
                    onChange={(e) => handleInputChange('location.state', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                  <TextField
                    label="Country"
                    value={formData.location.country}
                    onChange={(e) => handleInputChange('location.country', e.target.value)}
                    disabled={!editMode}
                    fullWidth
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Student Profile */}
          {user?.role === 'student' && (
            <>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Education
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        label="University"
                        value={formData.studentProfile.university}
                        onChange={(e) => handleInputChange('studentProfile.university', e.target.value)}
                        disabled={!editMode}
                        fullWidth
                      />
                      <TextField
                        label="Degree"
                        value={formData.studentProfile.degree}
                        onChange={(e) => handleInputChange('studentProfile.degree', e.target.value)}
                        disabled={!editMode}
                        fullWidth
                      />
                      <TextField
                        label="Major"
                        value={formData.studentProfile.major}
                        onChange={(e) => handleInputChange('studentProfile.major', e.target.value)}
                        disabled={!editMode}
                        fullWidth
                      />
                      <TextField
                        label="Graduation Year"
                        value={formData.studentProfile.graduationYear}
                        onChange={(e) => handleInputChange('studentProfile.graduationYear', e.target.value)}
                        disabled={!editMode}
                        type="number"
                        fullWidth
                      />
                      <TextField
                        label="GPA"
                        value={formData.studentProfile.gpa}
                        onChange={(e) => handleInputChange('studentProfile.gpa', e.target.value)}
                        disabled={!editMode}
                        type="number"
                        inputProps={{ step: 0.01, min: 0, max: 4 }}
                        fullWidth
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Skills
                      </Typography>
                      {editMode && (
                        <IconButton
                          onClick={() => setSkillDialogOpen(true)}
                          color="primary"
                        >
                          <Add />
                        </IconButton>
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {formData.studentProfile.skills.map((skill, index) => (
                        <Chip
                          key={index}
                          label={skill}
                          onDelete={editMode ? () => removeSkill(skill) : undefined}
                          deleteIcon={editMode ? <Delete /> : undefined}
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {formData.studentProfile.skills.length === 0 && (
                        <Typography variant="body2" color="text.secondary">
                          No skills added yet
                        </Typography>
                      )}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Typography variant="h6" gutterBottom>
                      Resume
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      {user?.studentProfile?.resume ? (
                        <Button
                          startIcon={<Download />}
                          href={user.studentProfile.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download Resume
                        </Button>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No resume uploaded
                        </Typography>
                      )}
                      
                      <input
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                        id="resume-upload"
                        type="file"
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            handleResumeUpload(e.target.files[0])
                          }
                        }}
                      />
                      <label htmlFor="resume-upload">
                        <Button
                          variant="outlined"
                          component="span"
                          startIcon={<Upload />}
                          disabled={uploading}
                        >
                          Upload Resume
                        </Button>
                      </label>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}

          {/* Company Profile */}
          {user?.role === 'company' && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Company Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Company Name"
                        value={formData.companyProfile.companyName}
                        onChange={(e) => handleInputChange('companyProfile.companyName', e.target.value)}
                        disabled={!editMode}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Industry"
                        value={formData.companyProfile.industry}
                        onChange={(e) => handleInputChange('companyProfile.industry', e.target.value)}
                        disabled={!editMode}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <FormControl fullWidth disabled={!editMode}>
                        <InputLabel>Company Size</InputLabel>
                        <Select
                          value={formData.companyProfile.companySize}
                          label="Company Size"
                          onChange={(e) => handleInputChange('companyProfile.companySize', e.target.value)}
                        >
                          <MenuItem value="1-10">1-10 employees</MenuItem>
                          <MenuItem value="11-50">11-50 employees</MenuItem>
                          <MenuItem value="51-200">51-200 employees</MenuItem>
                          <MenuItem value="201-500">201-500 employees</MenuItem>
                          <MenuItem value="501-1000">501-1000 employees</MenuItem>
                          <MenuItem value="1000+">1000+ employees</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        label="Website"
                        value={formData.companyProfile.website}
                        onChange={(e) => handleInputChange('companyProfile.website', e.target.value)}
                        disabled={!editMode}
                        fullWidth
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Company Description"
                        value={formData.companyProfile.description}
                        onChange={(e) => handleInputChange('companyProfile.description', e.target.value)}
                        disabled={!editMode}
                        multiline
                        rows={4}
                        fullWidth
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Avatar Upload Dialog */}
        <Dialog
          open={avatarDialogOpen}
          onClose={() => setAvatarDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="avatar-upload"
                type="file"
                onChange={(e) => setSelectedFile(e.target.files[0])}
              />
              <label htmlFor="avatar-upload">
                <Button variant="outlined" component="span" startIcon={<PhotoCamera />}>
                  Choose Image
                </Button>
              </label>
              {selectedFile && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Selected: {selectedFile.name}
                </Typography>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAvatarDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleAvatarUpload}
              variant="contained"
              disabled={!selectedFile || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add Skill Dialog */}
        <Dialog
          open={skillDialogOpen}
          onClose={() => setSkillDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Add Skill</DialogTitle>
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

export default Profile
