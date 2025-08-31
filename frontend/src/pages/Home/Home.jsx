import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  Container,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Paper
} from '@mui/material'
import {
  WorkOutline,
  BusinessOutlined,
  PeopleOutlined,
  TrendingUpOutlined,
  SearchOutlined,
  SendOutlined,
  CheckCircleOutlined
} from '@mui/icons-material'
import { Helmet } from 'react-helmet-async'
import SearchBar from '../../components/UI/SearchBar'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const features = [
    {
      icon: <SearchOutlined sx={{ fontSize: 40 }} />,
      title: 'Smart Search',
      description: 'Find internships that match your skills, interests, and career goals with our advanced filtering system.'
    },
    {
      icon: <SendOutlined sx={{ fontSize: 40 }} />,
      title: 'Easy Application',
      description: 'Apply to multiple internships with just a few clicks. Track your applications in one place.'
    },
    {
      icon: <CheckCircleOutlined sx={{ fontSize: 40 }} />,
      title: 'Verified Companies',
      description: 'Connect with legitimate companies that are verified by our team for your safety and security.'
    }
  ]

  const stats = [
    { icon: <WorkOutline />, value: '10,000+', label: 'Active Internships' },
    { icon: <BusinessOutlined />, value: '5,000+', label: 'Companies' },
    { icon: <PeopleOutlined />, value: '100,000+', label: 'Students' },
    { icon: <TrendingUpOutlined />, value: '95%', label: 'Success Rate' }
  ]

  const categories = [
    'Software Development',
    'Data Science',
    'Digital Marketing',
    'UI/UX Design',
    'Business Development',
    'Finance',
    'Content Writing',
    'Graphic Design'
  ]

  return (
    <>
      <Helmet>
        <title>Internship Finder - Find Your Dream Internship</title>
        <meta name="description" content="Connect with top companies and find amazing internship opportunities. Build your career with Internship Finder." />
      </Helmet>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  lineHeight: 1.2
                }}
              >
                Find Your Dream Internship
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  mb: 4,
                  opacity: 0.9,
                  fontWeight: 400,
                  fontSize: { xs: '1.1rem', md: '1.25rem' }
                }}
              >
                Connect with top companies and kickstart your career with amazing internship opportunities
              </Typography>

              <Box sx={{ mb: 4, maxWidth: 500 }}>
                <SearchBar placeholder="Search by role, company, or skills..." />
              </Box>

              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {!user ? (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      to="/register"
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'grey.100' },
                        px: 4,
                        py: 1.5
                      }}
                    >
                      Get Started
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      component={Link}
                      to="/internships"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' },
                        px: 4,
                        py: 1.5
                      }}
                    >
                      Browse Internships
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="contained"
                      size="large"
                      component={Link}
                      to="/dashboard"
                      sx={{
                        bgcolor: 'white',
                        color: 'primary.main',
                        '&:hover': { bgcolor: 'grey.100' },
                        px: 4,
                        py: 1.5
                      }}
                    >
                      Go to Dashboard
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      component={Link}
                      to="/internships"
                      sx={{
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' },
                        px: 4,
                        py: 1.5
                      }}
                    >
                      Browse Internships
                    </Button>
                  </>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: { xs: 'none', md: 'block' },
                  textAlign: 'center'
                }}
              >
                <img
                  src="/api/placeholder/600/400"
                  alt="Students working"
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 56,
                    height: 56,
                    mb: 1
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" component="div" fontWeight="bold" color="primary.main">
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            textAlign="center"
            gutterBottom
            sx={{ mb: 6, fontWeight: 'bold' }}
          >
            Why Choose Internship Finder?
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 2,
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' }
                  }}
                >
                  <CardContent>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
          sx={{ mb: 6, fontWeight: 'bold' }}
        >
          Popular Categories
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 2,
            justifyContent: 'center',
            mb: 4
          }}
        >
          {categories.map((category, index) => (
            <Chip
              key={index}
              label={category}
              variant="outlined"
              size="large"
              clickable
              onClick={() => navigate(`/internships?category=${encodeURIComponent(category)}`)}
              sx={{
                fontSize: '1rem',
                py: 2,
                px: 1,
                '&:hover': {
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderColor: 'primary.main'
                }
              }}
            />
          ))}
        </Box>

        <Box sx={{ textAlign: 'center' }}>
          <Button
            variant="outlined"
            size="large"
            component={Link}
            to="/internships"
            sx={{ px: 4, py: 1.5 }}
          >
            View All Categories
          </Button>
        </Box>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            Ready to Start Your Journey?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
            Join thousands of students who have found their dream internships through our platform
          </Typography>
          
          {!user ? (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                component={Link}
                to="/register"
                sx={{
                  bgcolor: 'white',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'grey.100' },
                  px: 4,
                  py: 1.5
                }}
              >
                Sign Up Now
              </Button>
              <Button
                variant="outlined"
                size="large"
                component={Link}
                to="/internships"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  '&:hover': { borderColor: 'grey.100', bgcolor: 'rgba(255,255,255,0.1)' },
                  px: 4,
                  py: 1.5
                }}
              >
                Browse Internships
              </Button>
            </Box>
          ) : (
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/internships"
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': { bgcolor: 'grey.100' },
                px: 4,
                py: 1.5
              }}
            >
              Find Your Next Opportunity
            </Button>
          )}
        </Container>
      </Box>
    </>
  )
}

export default Home
