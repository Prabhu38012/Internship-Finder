import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  LinearProgress
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Business,
  Work,
  People,
  TrendingUp,
  Schedule,
  LocationOn
} from '@mui/icons-material'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import { getMyInternships, deleteInternship } from '../../store/slices/internshipSlice'
import { getCompanyApplications } from '../../store/slices/applicationSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'

const CompanyDashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { user } = useSelector((state) => state.auth)
  const { myInternships, isLoading } = useSelector((state) => state.internships)
  const { companyApplications } = useSelector((state) => state.applications)
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedInternship, setSelectedInternship] = useState(null)

  useEffect(() => {
    dispatch(getMyInternships())
    dispatch(getCompanyApplications({ limit: 10 }))
  }, [dispatch])

  const handleMenuOpen = (event, internship) => {
    setAnchorEl(event.currentTarget)
    setSelectedInternship(internship)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedInternship(null)
  }

  const handleEdit = () => {
    if (selectedInternship) {
      navigate(`/internships/edit/${selectedInternship._id}`)
    }
    handleMenuClose()
  }

  const handleDelete = () => {
    if (selectedInternship) {
      if (window.confirm('Are you sure you want to delete this internship?')) {
        dispatch(deleteInternship(selectedInternship._id))
          .unwrap()
          .then(() => {
            toast.success('Internship deleted successfully')
          })
          .catch((error) => {
            toast.error(error || 'Failed to delete internship')
          })
      }
    }
    handleMenuClose()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'draft': return 'warning'
      case 'closed': return 'error'
      case 'expired': return 'default'
      default: return 'default'
    }
  }

  const StatCard = ({ title, value, icon, color = 'primary', subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="overline">
              {title}
            </Typography>
            <Typography variant="h4" component="div" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return <LoadingSpinner message="Loading company dashboard..." />
  }

  const activeInternships = myInternships?.filter(i => i.status === 'active') || []
  const totalApplications = myInternships?.reduce((sum, i) => sum + (i.applicationsCount || 0), 0) || 0
  const pendingApplications = companyApplications?.filter(a => a.status === 'pending').length || 0

  return (
    <>
      <Helmet>
        <title>Company Dashboard - Internship Finder</title>
        <meta name="description" content="Manage your company's internship postings and applications." />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Company Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your internship postings and review applications
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
            component={Link}
            to="/internships/create"
            size="large"
          >
            Post New Internship
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Internships"
              value={activeInternships.length}
              icon={<Work />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Applications"
              value={totalApplications}
              icon={<People />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Review"
              value={pendingApplications}
              icon={<Schedule />}
              color="warning"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Views"
              value={myInternships?.reduce((sum, i) => sum + (i.views || 0), 0) || 0}
              icon={<TrendingUp />}
              color="success"
            />
          </Grid>
        </Grid>

        <Grid container spacing={4}>
          {/* Internships Table */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Your Internships
                  </Typography>
                  <Button
                    component={Link}
                    to="/internships/create"
                    startIcon={<Add />}
                    size="small"
                  >
                    Add New
                  </Button>
                </Box>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Applications</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Posted</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {myInternships?.map((internship) => (
                        <TableRow key={internship._id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="bold">
                                {internship.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {internship.category}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LocationOn fontSize="small" color="action" />
                              <Typography variant="body2">
                                {internship.location?.type === 'remote' 
                                  ? 'Remote' 
                                  : internship.location?.city || 'Not specified'
                                }
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {internship.applicationsCount || 0}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={internship.status || 'active'}
                              size="small"
                              color={getStatusColor(internship.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {format(new Date(internship.createdAt), 'MMM dd')}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              component={Link}
                              to={`/internships/${internship._id}`}
                              size="small"
                            >
                              <Visibility />
                            </IconButton>
                            <IconButton
                              onClick={(e) => handleMenuOpen(e, internship)}
                              size="small"
                            >
                              <MoreVert />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {myInternships?.length === 0 && (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" gutterBottom>
                      No internships posted yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Start by creating your first internship posting
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      component={Link}
                      to="/internships/create"
                    >
                      Post Your First Internship
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Applications */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Applications
                  </Typography>
                  <Button
                    component={Link}
                    to="/applications"
                    size="small"
                  >
                    View All
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {companyApplications?.slice(0, 5).map((application) => (
                    <Box
                      key={application._id}
                      sx={{
                        p: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:hover': { bgcolor: 'action.hover' }
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Avatar
                          src={application.applicant?.avatar}
                          sx={{ width: 32, height: 32 }}
                        >
                          {application.applicant?.name?.charAt(0)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {application.applicant?.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {application.internship?.title}
                          </Typography>
                        </Box>
                        <Chip
                          label={application.status}
                          size="small"
                          color={application.status === 'pending' ? 'warning' : 'default'}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Applied {format(new Date(application.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                  ))}

                  {companyApplications?.length === 0 && (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No applications received yet
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card sx={{ mt: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    component={Link}
                    to="/internships/create"
                    fullWidth
                  >
                    Post New Internship
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<People />}
                    component={Link}
                    to="/applications"
                    fullWidth
                  >
                    Review Applications
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Business />}
                    component={Link}
                    to="/profile"
                    fullWidth
                  >
                    Update Company Profile
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => navigate(`/internships/${selectedInternship?._id}`)}>
            <Visibility sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleEdit}>
            <Edit sx={{ mr: 1 }} />
            Edit
          </MenuItem>
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        </Menu>
      </Container>
    </>
  )
}

export default CompanyDashboard
