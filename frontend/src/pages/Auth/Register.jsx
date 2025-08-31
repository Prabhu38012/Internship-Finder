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
      toast.success('Registration successful! Welcome to Internship Finder.')
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
        <title>Sign Up - Internship Finder</title>
        <meta name="description" content="Create your Internship Finder account and start your journey to find amazing internship opportunities." />
      </Helmet>

      <Container component="main" maxWidth="md" sx={{ py: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Join Internship Finder
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Create your account and start connecting with amazing opportunities
            </Typography>

            {isError && (
              <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
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
                  />
                </Grid>
              </Grid>

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
                  `Create ${selectedRole === 'student' ? 'Student' : 'Company'} Account`
                )}
              </Button>

              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  By creating an account, you agree to our{' '}
                  <Link to="/terms" className="text-primary-600 hover:text-primary-700 no-underline">
                    Terms of Service
                  </Link>{' '}
                  and{' '}
                  <Link to="/privacy" className="text-primary-600 hover:text-primary-700 no-underline">
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
                  <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium no-underline">
                    Sign in here
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

export default Register
