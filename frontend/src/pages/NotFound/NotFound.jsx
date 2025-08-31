import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Typography, Button, Box } from '@mui/material'
import { Home, ArrowBack } from '@mui/icons-material'

const NotFound = () => {
  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h1"
          sx={{
            fontSize: '6rem',
            fontWeight: 'bold',
            color: 'primary.main',
            mb: 2
          }}
        >
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          The page you're looking for doesn't exist or has been moved.
        </Typography>
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Home />}
          component={Link}
          to="/"
          size="large"
        >
          Go Home
        </Button>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => window.history.back()}
          size="large"
        >
          Go Back
        </Button>
      </Box>
    </Container>
  )
}

export default NotFound
