import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Divider,
  CircularProgress,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Grid
} from '@mui/material'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'

import { register as registerUser, reset } from '../../store/slices/authSlice'

const schema = yup.object({
  name: yup.string().min(2, 'Name must be at least 2 characters').required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string().oneOf(['student', 'company'], 'Please select a role').required('Role is required'),
  phone: yup.string().optional(),
})

const Register = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      role: 'student'
    }
  })

  const selectedRole = watch('role')

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess || user) {
      toast.success('Registration successful! Welcome to InternQuest.')
      navigate('/dashboard')
    }

    dispatch(reset())
  }, [user, isError, isSuccess, message, navigate, dispatch])

  const onSubmit = (data) => {
    const { confirmPassword, ...userData } = data
    dispatch(registerUser(userData))
  }

  return (
    <>
      <Helmet>
        <title>Sign Up - InternQuest</title>
        <meta name="description" content="Create your InternQuest account and start your journey to find amazing internship opportunities." />
      </Helmet>

      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        background: 'linear-gradient(135deg, #faf5ff 0%, #fdf4ff 50%, #f0f9ff 100%)'
      }}>
        {/* Left Side - Gradient Background */}
        <Box sx={{ 
          display: { xs: 'none', md: 'flex' },
          flex: 1,
          background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 50%, #e879f9 100%)',
          position: 'relative',
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          p: 6
        }}>
          {/* Decorative elements */}
          <Box sx={{
            position: 'absolute',
            top: '20%',
            right: '10%',
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }} />
          
          <Box sx={{ position: 'relative', textAlign: 'center', color: 'white', zIndex: 1, maxWidth: 500 }}>
            <Typography variant="h2" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
              Start Your Journey
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 4, fontWeight: 300 }}>
              Join thousands of students and companies building successful careers
            </Typography>
            <Box sx={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              backdropFilter: 'blur(10px)',
              borderRadius: 3,
              p: 3,
              mt: 4
            }}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ✓ Access to 10,000+ internship opportunities
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                ✓ Connect with top companies
              </Typography>
              <Typography variant="body1">
                ✓ AI-powered recommendations
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Right Side - Form */}
        <Container component="main" maxWidth="md" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          py: 8,
          flex: 1
        }}>
          <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
            <Paper elevation={0} sx={{ 
              p: 5,
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 10px 40px rgba(168, 85, 247, 0.1)'
            }}>
              <Box sx={{ mb: 4 }}>
                <Typography component="h1" variant="h4" gutterBottom fontWeight="bold" color="primary.main">
                  Join InternQuest
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create your account and start connecting with amazing opportunities
                </Typography>
              </Box>

              {isError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {message}
                </Alert>
              )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormControl component="fieldset" sx={{ mb: 2 }}>
                    <FormLabel component="legend">I am a:</FormLabel>
                    <RadioGroup
                      row
                      value={selectedRole}
                      onChange={(e) => {
                        setValue('role', e.target.value)
                      }}
                    >
                      <FormControlLabel
                        value="student"
                        control={<Radio />}
                        label="Student looking for internships"
                      />
                      <FormControlLabel
                        value="company"
                        control={<Radio />}
                        label="Company posting internships"
                      />
                    </RadioGroup>
                    {errors.role && (
                      <Typography variant="caption" color="error">
                        {errors.role.message}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    autoComplete="name"
                    autoFocus
                    {...register('name')}
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    autoComplete="tel"
                    {...register('phone')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    autoComplete="email"
                    {...register('email')}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    autoComplete="new-password"
                    {...register('password')}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type="password"
                    autoComplete="new-password"
                    {...register('confirmPassword')}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: 'primary.main',
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ 
                  mt: 3, 
                  mb: 2, 
                  py: 1.5,
                  borderRadius: 2,
                  background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
                  boxShadow: '0 4px 14px rgba(168, 85, 247, 0.4)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #9333ea 0%, #a855f7 100%)',
                    boxShadow: '0 6px 20px rgba(168, 85, 247, 0.5)',
                  }
                }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  `Create ${selectedRole === 'student' ? 'Student' : 'Company'} Account`
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" style={{ color: '#a855f7', textDecoration: 'none' }}>
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" style={{ color: '#a855f7', textDecoration: 'none' }}>
                    Privacy Policy
                  </Link>
                </Typography>
              </Box>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link to="/login" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>
                    Sign in here
                  </Link>
                </Typography>
              </Box>
            </Box>
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  )
}

export default Register
