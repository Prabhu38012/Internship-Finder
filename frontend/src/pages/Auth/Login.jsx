import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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
  CircularProgress
} from '@mui/material'
import { Helmet } from 'react-helmet-async'
import toast from 'react-hot-toast'

import { login, reset } from '../../store/slices/authSlice'

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required'),
})

const Login = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const { user, isLoading, isError, isSuccess, message } = useSelector((state) => state.auth)
  
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  })

  useEffect(() => {
    if (isError) {
      toast.error(message)
    }

    if (isSuccess && user) {
      toast.success('Login successful!')
      navigate(from, { replace: true })
    }

    return () => {
      dispatch(reset())
    }
  }, [user, isError, isSuccess, message, navigate, dispatch, from])

  const onSubmit = (data) => {
    dispatch(login(data))
  }

  return (
    <>
      <Helmet>
        <title>Login - InternQuest</title>
        <meta name="description" content="Login to your InternQuest account to access your dashboard and apply for internships." />
      </Helmet>

      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex',
        background: 'linear-gradient(135deg, #faf5ff 0%, #fdf4ff 50%, #f0f9ff 100%)'
      }}>
        {/* Left Side - Form */}
        <Container component="main" maxWidth="sm" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          py: 8,
          flex: 1
        }}>
          <Box sx={{ width: '100%', maxWidth: 480, mx: 'auto' }}>
            <Paper elevation={0} sx={{ 
              p: 5,
              borderRadius: 3,
              background: 'white',
              boxShadow: '0 10px 40px rgba(168, 85, 247, 0.1)'
            }}>
              <Box sx={{ mb: 4 }}>
                <Typography component="h1" variant="h4" gutterBottom fontWeight="bold" color="primary.main">
                  Welcome Back
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Sign in to your account to continue your journey
                </Typography>
              </Box>

              {isError && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                  {message}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Email Address"
                  type="email"
                  autoComplete="email"
                  autoFocus
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
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Password"
                  type="password"
                  autoComplete="current-password"
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
                    'Sign In'
                  )}
                </Button>

                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Link to="/forgot-password" style={{ color: '#a855f7', textDecoration: 'none', fontSize: '0.875rem' }}>
                    Forgot your password?
                  </Link>
                </Box>

                <Divider sx={{ my: 3 }}>
                  <Typography variant="body2" color="text.secondary">
                    OR
                  </Typography>
                </Divider>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Don't have an account?{' '}
                    <Link to="/register" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>
                      Sign up here
                    </Link>
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Container>

        {/* Right Side - Gradient Background */}
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
            top: '10%',
            right: '10%',
            width: 200,
            height: 200,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: '15%',
            left: '15%',
            width: 150,
            height: 150,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
          }} />
          
          <Box sx={{ position: 'relative', textAlign: 'center', color: 'white', zIndex: 1 }}>
            <Typography variant="h2" gutterBottom fontWeight="bold" sx={{ mb: 3 }}>
              InternQuest
            </Typography>
            <Typography variant="h5" sx={{ opacity: 0.9, mb: 4, fontWeight: 300 }}>
              Your gateway to amazing internship opportunities
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold">10K+</Typography>
                <Typography variant="body2">Active Internships</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold">5K+</Typography>
                <Typography variant="body2">Companies</Typography>
              </Box>
              <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h3" fontWeight="bold">100K+</Typography>
                <Typography variant="body2">Students</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  )
}

export default Login
