import React, { useState } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { companyAPI } from '../../services/api';
import { setCredentials } from '../../store/slices/authSlice';

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media & Entertainment',
  'Real Estate',
  'Transportation',
  'Energy',
  'Non-Profit',
  'Government',
  'Other'
];

const companySizes = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+'
];

const steps = ['Company Details', 'Contact Information', 'Location & Verification'];

const CompanyRegistration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    // Step 1: Company Details
    companyName: '',
    companyEmail: '',
    password: '',
    confirmPassword: '',
    description: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    website: '',
    linkedinUrl: '',
    
    // Step 2: Contact Information
    hrName: '',
    hrEmail: '',
    hrPhone: '',
    
    // Step 3: Location
    address: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: ''
  });

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError('');
  };

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return formData.companyName && 
               formData.companyEmail && 
               formData.password && 
               formData.confirmPassword &&
               formData.description &&
               formData.industry &&
               formData.companySize &&
               formData.password === formData.confirmPassword;
      case 1:
        return formData.hrName && 
               formData.hrEmail && 
               formData.hrPhone;
      case 2:
        return formData.city && 
               formData.state;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => prev + 1);
    } else {
      setError('Please fill in all required fields');
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(activeStep)) {
      setError('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const registrationData = {
        companyName: formData.companyName,
        companyEmail: formData.companyEmail,
        password: formData.password,
        description: formData.description,
        industry: formData.industry,
        companySize: formData.companySize,
        foundedYear: formData.foundedYear ? parseInt(formData.foundedYear) : undefined,
        website: formData.website,
        linkedinUrl: formData.linkedinUrl,
        hrName: formData.hrName,
        hrEmail: formData.hrEmail,
        hrPhone: formData.hrPhone,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        zipCode: formData.zipCode
      };

      const response = await companyAPI.register(registrationData);
      
      // Store authentication data
      dispatch(setCredentials({
        user: response.data.company,
        token: response.data.token,
        userType: 'company'
      }));

      // Navigate to company dashboard
      navigate('/company/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Name *"
                value={formData.companyName}
                onChange={handleInputChange('companyName')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Company Email *"
                type="email"
                value={formData.companyEmail}
                onChange={handleInputChange('companyEmail')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Password *"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Confirm Password *"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
                required
                error={formData.password !== formData.confirmPassword && formData.confirmPassword !== ''}
                helperText={formData.password !== formData.confirmPassword && formData.confirmPassword !== '' ? 'Passwords do not match' : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Industry *</InputLabel>
                <Select
                  value={formData.industry}
                  onChange={handleInputChange('industry')}
                  label="Industry *"
                >
                  {industries.map((industry) => (
                    <MenuItem key={industry} value={industry}>
                      {industry}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required>
                <InputLabel>Company Size *</InputLabel>
                <Select
                  value={formData.companySize}
                  onChange={handleInputChange('companySize')}
                  label="Company Size *"
                >
                  {companySizes.map((size) => (
                    <MenuItem key={size} value={size}>
                      {size} employees
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Founded Year"
                type="number"
                value={formData.foundedYear}
                onChange={handleInputChange('foundedYear')}
                inputProps={{ min: 1800, max: new Date().getFullYear() }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company Description *"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleInputChange('description')}
                required
                helperText="Describe your company, culture, and what makes it unique"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={handleInputChange('website')}
                placeholder="https://www.yourcompany.com"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="LinkedIn URL"
                value={formData.linkedinUrl}
                onChange={handleInputChange('linkedinUrl')}
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                HR Contact Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                This person will be the primary contact for internship applications
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="HR Contact Name *"
                value={formData.hrName}
                onChange={handleInputChange('hrName')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="HR Email *"
                type="email"
                value={formData.hrEmail}
                onChange={handleInputChange('hrEmail')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="HR Phone Number *"
                value={formData.hrPhone}
                onChange={handleInputChange('hrPhone')}
                required
                placeholder="+91 9876543210"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Company Location
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="City *"
                value={formData.city}
                onChange={handleInputChange('city')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="State *"
                value={formData.state}
                onChange={handleInputChange('state')}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={handleInputChange('country')}
                disabled
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="ZIP Code"
                value={formData.zipCode}
                onChange={handleInputChange('zipCode')}
              />
            </Grid>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ mb: 4, textAlign: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom>
              Company Registration
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Join our platform to post internship opportunities and connect with talented students
            </Typography>
          </Box>

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            {renderStepContent(activeStep)}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
              variant="outlined"
            >
              Back
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading || !validateStep(activeStep)}
                  startIcon={loading && <CircularProgress size={20} />}
                >
                  {loading ? 'Registering...' : 'Complete Registration'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!validateStep(activeStep)}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button
                component="a"
                href="/company/login"
                variant="text"
                size="small"
              >
                Sign In
              </Button>
            </Typography>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
};

export default CompanyRegistration;
