import React from 'react'
import { Link } from 'react-router-dom'
import { Box, Container, Grid, Typography, IconButton } from '@mui/material'
import { LinkedIn, Twitter, Facebook, GitHub } from '@mui/icons-material'

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'grey.900',
        color: 'white',
        py: 6,
        mt: 'auto'
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Internship Finder
            </Typography>
            <Typography variant="body2" color="grey.400">
              Connect with top companies and find amazing internship opportunities. 
              Build your career with us.
            </Typography>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              For Students
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/internships" className="text-gray-400 hover:text-white no-underline">
                Browse Internships
              </Link>
              <Link to="/register" className="text-gray-400 hover:text-white no-underline">
                Create Account
              </Link>
              <Link to="/dashboard" className="text-gray-400 hover:text-white no-underline">
                Dashboard
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              For Companies
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/register" className="text-gray-400 hover:text-white no-underline">
                Post Internships
              </Link>
              <Link to="/company" className="text-gray-400 hover:text-white no-underline">
                Company Dashboard
              </Link>
              <Link to="/pricing" className="text-gray-400 hover:text-white no-underline">
                Pricing
              </Link>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Typography variant="h6" gutterBottom>
              Support
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Link to="/help" className="text-gray-400 hover:text-white no-underline">
                Help Center
              </Link>
              <Link to="/contact" className="text-gray-400 hover:text-white no-underline">
                Contact Us
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white no-underline">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-white no-underline">
                Terms of Service
              </Link>
            </Box>
          </Grid>
        </Grid>
        
        <Box
          sx={{
            borderTop: 1,
            borderColor: 'grey.800',
            mt: 4,
            pt: 4,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="body2" color="grey.400">
            © 2024 Internship Finder. All rights reserved.
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton color="inherit" size="small">
              <LinkedIn />
            </IconButton>
            <IconButton color="inherit" size="small">
              <Twitter />
            </IconButton>
            <IconButton color="inherit" size="small">
              <Facebook />
            </IconButton>
            <IconButton color="inherit" size="small">
              <GitHub />
            </IconButton>
          </Box>
        </Box>
      </Container>
    </Box>
  )
}

export default Footer
