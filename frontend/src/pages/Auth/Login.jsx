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
        <title>Login - Internship Finder</title>
        <meta name="description" content="Login to your Internship Finder account to access your dashboard and apply for internships." />
      </Helmet>

      <Container component="main" maxWidth="sm" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Welcome Back
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Sign in to your account to continue
            </Typography>

            {isError && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {message}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: '100%' }}>
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
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2, py: 1.5 }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <CircularProgress size={24} />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Link to="/forgot-password" className="text-primary-600 hover:text-primary-700 no-underline">
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
                  <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium no-underline">
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  )
}

export default Login
