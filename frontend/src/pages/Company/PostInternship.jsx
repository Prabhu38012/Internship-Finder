import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Divider
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { internshipAPI } from '../../services/api';
import useSocket from '../../hooks/useSocket';

const categories = [
  'Software Development',
  'Data Science',
  'Machine Learning',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Digital Marketing',
  'Business Development',
  'Finance',
  'Human Resources',
  'Content Writing',
  'Graphic Design',
  'Sales',
  'Operations',
  'Research',
  'Other'
];

const skillsList = [
  'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'Angular', 'Vue.js',
  'HTML/CSS', 'SQL', 'MongoDB', 'AWS', 'Docker', 'Git', 'Machine Learning',
  'Data Analysis', 'Figma', 'Adobe Creative Suite', 'Marketing', 'SEO',
  'Content Writing', 'Social Media', 'Project Management', 'Communication',
  'Leadership', 'Problem Solving', 'Teamwork'
];

const PostInternship = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { socket } = useSocket();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'internship',
    duration: '',
    startDate: null,
    applicationDeadline: null,
    location: {
      type: 'onsite',
      city: '',
      state: '',
      country: 'India',
      address: ''
    },
    stipend: {
      amount: '',
      currency: 'INR',
      period: 'month'
    },
    requirements: {
      skills: [],
      experience: 'fresher',
      education: 'any',
      minCGPA: ''
    },
    responsibilities: '',
    benefits: [],
    applicationProcess: 'platform',
    externalUrl: '',
    isUrgent: false,
    maxApplications: ''
  });

  const [availableBenefits] = useState([
    'Certificate', 'Stipend', 'Flexible Hours', 'Remote Work', 
    'Mentorship', 'Full-time Offer Potential', 'Learning Resources',
    'Networking Opportunities', 'Project Ownership', 'Team Collaboration'
  ]);

  useEffect(() => {
    // Set default location from company profile
    if (user?.companyProfile?.headquarters) {
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          city: user.companyProfile.headquarters.city || '',
          state: user.companyProfile.headquarters.state || ''
        }
      }));
    }
  }, [user]);

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    setError('');
  };

  const handleDateChange = (field) => (date) => {
    setFormData(prev => ({
      ...prev,
      [field]: date
    }));
  };

  const handleSkillsChange = (event) => {
    setFormData(prev => ({
      ...prev,
      requirements: {
        ...prev.requirements,
        skills: event.target.value
      }
    }));
  };

  const handleBenefitsChange = (event) => {
    setFormData(prev => ({
      ...prev,
      benefits: event.target.value
    }));
  };

  const handleSwitchChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked
    }));
  };

  const validateForm = () => {
    if (!formData.title || !formData.description || !formData.category) {
      setError('Please fill in all required fields');
      return false;
    }

    if (!formData.location.city || !formData.location.state) {
      setError('Please provide location details');
      return false;
    }

    if (!formData.startDate || !formData.applicationDeadline) {
      setError('Please set start date and application deadline');
      return false;
    }

    if (dayjs(formData.applicationDeadline).isBefore(dayjs())) {
      setError('Application deadline must be in the future');
      return false;
    }

    if (dayjs(formData.startDate).isBefore(dayjs(formData.applicationDeadline))) {
      setError('Start date must be after application deadline');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const internshipData = {
        ...formData,
        startDate: formData.startDate.toISOString(),
        applicationDeadline: formData.applicationDeadline.toISOString(),
        stipend: {
          ...formData.stipend,
          amount: formData.stipend.amount ? parseFloat(formData.stipend.amount) : 0
        },
        requirements: {
          ...formData.requirements,
          minCGPA: formData.requirements.minCGPA ? parseFloat(formData.requirements.minCGPA) : null
        },
        maxApplications: formData.maxApplications ? parseInt(formData.maxApplications) : null
      };

      const response = await internshipAPI.create(internshipData);
      
      setSuccess('Internship posted successfully! Students will be notified in real-time.');
      
      // Emit real-time notification via socket
      if (socket) {
        socket.emit('internship_posted', {
          internship: response.data,
          companyName: user.companyName
        });
      }

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/company/dashboard');
      }, 2000);

    } catch (error) {
      setError(error.response?.data?.message || 'Failed to post internship. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Post New Internship
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Create a new internship opportunity and reach thousands of talented students instantly
            </Typography>
          </Box>

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

          <form onSubmit={handleSubmit}>
            <Grid container spacing={4}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Internship Title *"
                          value={formData.title}
                          onChange={handleInputChange('title')}
                          required
                          placeholder="e.g., Frontend Developer Intern"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth required>
                          <InputLabel>Category *</InputLabel>
                          <Select
                            value={formData.category}
                            onChange={handleInputChange('category')}
                            label="Category *"
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
                        <TextField
                          fullWidth
                          label="Duration *"
                          value={formData.duration}
                          onChange={handleInputChange('duration')}
                          required
                          placeholder="e.g., 3 months, 6 months"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description *"
                          multiline
                          rows={6}
                          value={formData.description}
                          onChange={handleInputChange('description')}
                          required
                          placeholder="Describe the internship role, what the intern will learn, and your company culture..."
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Location & Dates */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Location & Timeline
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Work Type</InputLabel>
                          <Select
                            value={formData.location.type}
                            onChange={handleInputChange('location.type')}
                            label="Work Type"
                          >
                            <MenuItem value="onsite">On-site</MenuItem>
                            <MenuItem value="remote">Remote</MenuItem>
                            <MenuItem value="hybrid">Hybrid</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="City *"
                          value={formData.location.city}
                          onChange={handleInputChange('location.city')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="State *"
                          value={formData.location.state}
                          onChange={handleInputChange('location.state')}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Application Deadline *"
                            value={formData.applicationDeadline}
                            onChange={handleDateChange('applicationDeadline')}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true
                              }
                            }}
                            minDate={dayjs().add(1, 'day')}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DatePicker
                            label="Start Date *"
                            value={formData.startDate}
                            onChange={handleDateChange('startDate')}
                            slotProps={{
                              textField: {
                                fullWidth: true,
                                required: true
                              }
                            }}
                            minDate={formData.applicationDeadline || dayjs().add(7, 'day')}
                          />
                        </LocalizationProvider>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Compensation & Requirements */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Compensation & Requirements
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={4}>
                        <TextField
                          fullWidth
                          label="Stipend Amount"
                          type="number"
                          value={formData.stipend.amount}
                          onChange={handleInputChange('stipend.amount')}
                          placeholder="0 for unpaid"
                        />
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Currency</InputLabel>
                          <Select
                            value={formData.stipend.currency}
                            onChange={handleInputChange('stipend.currency')}
                            label="Currency"
                          >
                            <MenuItem value="INR">INR (₹)</MenuItem>
                            <MenuItem value="USD">USD ($)</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Period</InputLabel>
                          <Select
                            value={formData.stipend.period}
                            onChange={handleInputChange('stipend.period')}
                            label="Period"
                          >
                            <MenuItem value="month">Per Month</MenuItem>
                            <MenuItem value="week">Per Week</MenuItem>
                            <MenuItem value="total">Total Amount</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Required Skills</InputLabel>
                          <Select
                            multiple
                            value={formData.requirements.skills}
                            onChange={handleSkillsChange}
                            label="Required Skills"
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                          >
                            {skillsList.map((skill) => (
                              <MenuItem key={skill} value={skill}>
                                {skill}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Experience Level</InputLabel>
                          <Select
                            value={formData.requirements.experience}
                            onChange={handleInputChange('requirements.experience')}
                            label="Experience Level"
                          >
                            <MenuItem value="fresher">Fresher</MenuItem>
                            <MenuItem value="0-1">0-1 years</MenuItem>
                            <MenuItem value="1-2">1-2 years</MenuItem>
                            <MenuItem value="2+">2+ years</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Benefits</InputLabel>
                          <Select
                            multiple
                            value={formData.benefits}
                            onChange={handleBenefitsChange}
                            label="Benefits"
                            renderValue={(selected) => (
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                {selected.map((value) => (
                                  <Chip key={value} label={value} size="small" />
                                ))}
                              </Box>
                            )}
                          >
                            {availableBenefits.map((benefit) => (
                              <MenuItem key={benefit} value={benefit}>
                                {benefit}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Additional Details */}
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Additional Details
                    </Typography>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Key Responsibilities"
                          multiline
                          rows={4}
                          value={formData.responsibilities}
                          onChange={handleInputChange('responsibilities')}
                          placeholder="List the main tasks and responsibilities the intern will handle..."
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Maximum Applications"
                          type="number"
                          value={formData.maxApplications}
                          onChange={handleInputChange('maxApplications')}
                          placeholder="Leave empty for unlimited"
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={formData.isUrgent}
                              onChange={handleSwitchChange('isUrgent')}
                            />
                          }
                          label="Mark as Urgent Hiring"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/company/dashboard')}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    startIcon={loading && <CircularProgress size={20} />}
                  >
                    {loading ? 'Posting...' : 'Post Internship'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default PostInternship;
