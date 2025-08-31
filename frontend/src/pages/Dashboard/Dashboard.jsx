import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Avatar,
  LinearProgress,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material'
import {
  WorkOutline,
  BusinessOutlined,
  TrendingUpOutlined,
  NotificationsOutlined,
  PersonOutlined,
  AssignmentOutlined,
  BookmarkOutlined,
  AddCircleOutlined,
  VisibilityOutlined
} from '@mui/icons-material'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'

import { getMyApplications } from '../../store/slices/applicationSlice'
import { getMyInternships } from '../../store/slices/internshipSlice'
import { getNotifications } from '../../store/slices/notificationSlice'
import userService from '../../services/userService'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import DynamicDashboard from '../../components/UI/DynamicDashboard'
import AnimatedCard from '../../components/UI/AnimatedCard'
import useSocket from '../../hooks/useSocket'

const Dashboard = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const { user } = useSelector((state) => state.auth)
  const { applications, stats: applicationStats } = useSelector((state) => state.applications)
  const { myInternships } = useSelector((state) => state.internships)
  const { notifications, unreadCount } = useSelector((state) => state.notifications)
  
  const [dashboardStats, setDashboardStats] = React.useState(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [showAnalytics, setShowAnalytics] = React.useState(false)
  
  // Initialize socket for real-time updates
  useSocket()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        // Fetch dashboard stats
        const statsResponse = await userService.getDashboardStats(localStorage.getItem('token'))
        setDashboardStats(statsResponse.data)
        
        // Fetch role-specific data
        if (user?.role === 'student') {
          dispatch(getMyApplications({ limit: 5 }))
        } else if (user?.role === 'company') {
          dispatch(getMyInternships({ limit: 5 }))
        }
        
        // Fetch notifications
        dispatch(getNotifications({ limit: 5 }))
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [dispatch, user])

  if (isLoading) {
    return <LoadingSpinner message="Loading dashboard..." />
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      case 'reviewing': return 'info'
      default: return 'default'
    }
  }

  const StatCard = ({ title, value, icon, color = 'primary', subtitle, delay = 0 }) => (
    <AnimatedCard delay={delay} hover={true}>
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
    </AnimatedCard>
  )

  return (
    <>
      <Helmet>
        <title>Dashboard - Internship Finder</title>
        <meta name="description" content="Your personal dashboard to manage applications, internships, and profile." />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Welcome Section */}
        <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Welcome back, {user?.name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user?.role === 'student' 
                ? "Here's your application progress and new opportunities"
                : user?.role === 'company'
                ? "Manage your internship postings and applications"
                : "Admin dashboard overview"
              }
            </Typography>
          </Box>
          <Button
            variant={showAnalytics ? "contained" : "outlined"}
            onClick={() => setShowAnalytics(!showAnalytics)}
            startIcon={<TrendingUpOutlined />}
          >
            {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
          </Button>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {user?.role === 'student' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Applications"
                  value={dashboardStats?.totalApplications || 0}
                  icon={<AssignmentOutlined />}
                  color="primary"
                  delay={0.1}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pending"
                  value={dashboardStats?.pendingApplications || 0}
                  icon={<WorkOutline />}
                  color="warning"
                  delay={0.2}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Accepted"
                  value={dashboardStats?.acceptedApplications || 0}
                  icon={<TrendingUpOutlined />}
                  color="success"
                  delay={0.3}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Saved"
                  value={dashboardStats?.savedInternships || 0}
                  icon={<BookmarkOutlined />}
                  color="info"
                  delay={0.4}
                />
              </Grid>
            </>
          )}

          {user?.role === 'company' && (
            <>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Internships"
                  value={dashboardStats?.activeInternships || 0}
                  icon={<WorkOutline />}
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Applications"
                  value={dashboardStats?.totalApplications || 0}
                  icon={<AssignmentOutlined />}
                  color="info"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pending Review"
                  value={dashboardStats?.pendingApplications || 0}
                  icon={<NotificationsOutlined />}
                  color="warning"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Views"
                  value={dashboardStats?.totalViews || 0}
                  icon={<VisibilityOutlined />}
                  color="success"
                />
              </Grid>
            </>
          )}
        </Grid>

        {/* Dynamic Analytics Dashboard */}
        {showAnalytics && (
          <Box sx={{ mb: 4 }}>
            <DynamicDashboard data={dashboardStats} />
          </Box>
        )}

        <Grid container spacing={3}>
          {/* Profile Completion */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Profile Completion
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={dashboardStats?.profileCompletion || 0}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    {dashboardStats?.profileCompletion || 0}% Complete
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<PersonOutlined />}
                  component={Link}
                  to="/profile"
                  fullWidth
                >
                  Complete Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Activity */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    {user?.role === 'student' ? 'Recent Applications' : 'Recent Internships'}
                  </Typography>
                  <Button
                    component={Link}
                    to={user?.role === 'student' ? '/applications' : '/company'}
                    size="small"
                  >
                    View All
                  </Button>
                </Box>

                {user?.role === 'student' && (
                  <List>
                    {applications?.slice(0, 5).map((application, index) => (
                      <React.Fragment key={application._id}>
                        <ListItem
                          sx={{ px: 0 }}
                          secondaryAction={
                            <Chip
                              label={application.status}
                              size="small"
                              color={getStatusColor(application.status)}
                            />
                          }
                        >
                          <ListItemIcon>
                            <WorkOutline />
                          </ListItemIcon>
                          <ListItemText
                            primary={application.internship?.title}
                            secondary={`${application.internship?.companyName} • Applied ${format(new Date(application.createdAt), 'MMM dd')}`}
                          />
                        </ListItem>
                        {index < applications.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                    {applications?.length === 0 && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="No applications yet"
                          secondary="Start applying to internships to see them here"
                        />
                      </ListItem>
                    )}
                  </List>
                )}

                {user?.role === 'company' && (
                  <List>
                    {myInternships?.slice(0, 5).map((internship, index) => (
                      <React.Fragment key={internship._id}>
                        <ListItem
                          sx={{ px: 0 }}
                          secondaryAction={
                            <Chip
                              label={`${internship.applicationsCount} applications`}
                              size="small"
                              color="primary"
                            />
                          }
                        >
                          <ListItemIcon>
                            <BusinessOutlined />
                          </ListItemIcon>
                          <ListItemText
                            primary={internship.title}
                            secondary={`Posted ${format(new Date(internship.createdAt), 'MMM dd')} • ${internship.views} views`}
                          />
                        </ListItem>
                        {index < myInternships.length - 1 && <Divider />}
                      </React.Fragment>
                    ))}
                    {myInternships?.length === 0 && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText
                          primary="No internships posted yet"
                          secondary="Create your first internship posting"
                        />
                      </ListItem>
                    )}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {user?.role === 'student' && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<WorkOutline />}
                        component={Link}
                        to="/internships"
                        fullWidth
                      >
                        Browse Internships
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AssignmentOutlined />}
                        component={Link}
                        to="/applications"
                        fullWidth
                      >
                        View Applications
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<BookmarkOutlined />}
                        component={Link}
                        to="/saved"
                        fullWidth
                      >
                        Saved Internships
                      </Button>
                    </>
                  )}

                  {user?.role === 'company' && (
                    <>
                      <Button
                        variant="contained"
                        startIcon={<AddCircleOutlined />}
                        component={Link}
                        to="/internships/create"
                        fullWidth
                      >
                        Post New Internship
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<BusinessOutlined />}
                        component={Link}
                        to="/company"
                        fullWidth
                      >
                        Manage Internships
                      </Button>
                      <Button
                        variant="outlined"
                        startIcon={<AssignmentOutlined />}
                        component={Link}
                        to="/applications"
                        fullWidth
                      >
                        Review Applications
                      </Button>
                    </>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Notifications */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    Recent Notifications
                  </Typography>
                  {unreadCount > 0 && (
                    <Chip label={`${unreadCount} unread`} size="small" color="error" />
                  )}
                </Box>

                <List>
                  {notifications?.slice(0, 5).map((notification, index) => (
                    <React.Fragment key={notification._id}>
                      <ListItem sx={{ px: 0 }}>
                        <ListItemIcon>
                          <NotificationsOutlined color={notification.read ? 'disabled' : 'primary'} />
                        </ListItemIcon>
                        <ListItemText
                          primary={notification.title}
                          secondary={`${notification.message} • ${format(new Date(notification.createdAt), 'MMM dd')}`}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontWeight: notification.read ? 'normal' : 'bold'
                            }
                          }}
                        />
                      </ListItem>
                      {index < notifications.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                  {notifications?.length === 0 && (
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText
                        primary="No notifications"
                        secondary="You're all caught up!"
                      />
                    </ListItem>
                  )}
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  )
}

export default Dashboard
