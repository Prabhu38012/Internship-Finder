import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Badge,
  Divider,
  ListItemIcon,
  ListItemText,
  Container,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  NotificationsOutlined,
  AccountCircleOutlined,
  MenuOutlined,
  WorkOutline,
  DashboardOutlined,
  LogoutOutlined,
  FavoriteOutlined,
  SmartToy,
  MessageOutlined
} from '@mui/icons-material'
import { logout } from '../../store/slices/authSlice'
import { setSidebarOpen } from '../../store/slices/uiSlice'
import DynamicSearchBar from '../UI/DynamicSearchBar'
import NotificationCenter from '../Notifications/NotificationCenter'
import NotificationBell from '../Notifications/NotificationBell'

const Header = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const { user, token } = useSelector((state) => state.auth)
  const { unreadCount } = useSelector((state) => state.notifications)
  
  const [anchorEl, setAnchorEl] = useState(null)
  const [notificationAnchor, setNotificationAnchor] = useState(null)
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false)

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleProfileMenuClose = () => {
    setAnchorEl(null)
  }

  const handleNotificationMenuOpen = (event) => {
    setNotificationAnchor(event.currentTarget)
  }

  const handleNotificationMenuClose = () => {
    setNotificationAnchor(null)
  }

  const handleLogout = () => {
    dispatch(logout())
    handleProfileMenuClose()
    navigate('/')
  }

  const handleNavigation = (path) => {
    navigate(path)
    handleProfileMenuClose()
  }

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  return (
    <AppBar position="sticky" sx={{ backgroundColor: 'white', color: 'text.primary', boxShadow: 1 }}>
      <Container maxWidth="xl">
        <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
          {/* Logo and Brand */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isMobile && user && (
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => dispatch(setSidebarOpen(true))}
              >
                <MenuOutlined />
              </IconButton>
            )}
            
            <Link to="/" className="flex items-center gap-2 no-underline">
              <WorkOutline sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 'bold',
                  color: 'primary.main',
                  display: { xs: 'none', sm: 'block' }
                }}
              >
                InternQuest
              </Typography>
            </Link>
          </Box>

          {/* Search Bar - Only on internships pages */}
          {(location.pathname === '/internships' || location.pathname === '/') && (
            <Box sx={{ flex: 1, maxWidth: 600, mx: 3, display: { xs: 'none', md: 'block' } }}>
              <DynamicSearchBar />
            </Box>
          )}

          {/* Navigation Links and Actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {!user ? (
              // Guest Navigation
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/internships"
                  sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                >
                  Browse Internships
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  variant="outlined"
                  size="small"
                >
                  Login
                </Button>
                <Button
                  component={Link}
                  to="/register"
                  variant="contained"
                  size="small"
                >
                  Sign Up
                </Button>
              </>
            ) : (
              // Authenticated User Navigation
              <>
                {!isMobile && (
                  <>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/internships"
                      sx={{ 
                        color: isActive('/internships') ? 'primary.main' : 'text.primary',
                        fontWeight: isActive('/internships') ? 600 : 400
                      }}
                    >
                      Browse
                    </Button>
                    <Button
                      color="inherit"
                      component={Link}
                      to="/dashboard"
                      sx={{ 
                        color: isActive('/dashboard') ? 'primary.main' : 'text.primary',
                        fontWeight: isActive('/dashboard') ? 600 : 400
                      }}
                    >
                      Dashboard
                    </Button>
                    {user.role === 'student' && (
                      <>
                        <Button
                          color="inherit"
                          component={Link}
                          to="/wishlist"
                          sx={{ 
                            color: isActive('/wishlist') ? 'primary.main' : 'text.primary',
                            fontWeight: isActive('/wishlist') ? 600 : 400
                          }}
                        >
                          Wishlist
                        </Button>
                        <Button
                          color="inherit"
                          component={Link}
                          to="/ai"
                          sx={{ 
                            color: isActive('/ai') ? 'primary.main' : 'text.primary',
                            fontWeight: isActive('/ai') ? 600 : 400
                          }}
                        >
                          AI Assistant
                        </Button>
                      </>
                    )}
                    
                    {/* Messages Button - Available to all authenticated users */}
                    <IconButton
                      color="inherit"
                      component={Link}
                      to="/messages"
                      sx={{ 
                        color: isActive('/messages') ? 'primary.main' : 'text.primary'
                      }}
                    >
                      <MessageOutlined />
                    </IconButton>
                    {user.role === 'company' && (
                      <Button
                        color="inherit"
                        component={Link}
                        to="/internships/create"
                        variant="outlined"
                        size="small"
                      >
                        Post Internship
                      </Button>
                    )}
                  </>
                )}

                {/* Notifications */}
                <NotificationBell 
                  onOpenCenter={() => setNotificationCenterOpen(true)}
                  onNavigate={navigate}
                />

                {/* Profile Menu */}
                <IconButton
                  edge="end"
                  onClick={handleProfileMenuOpen}
                  color="inherit"
                >
                  {user.avatar ? (
                    <Avatar src={user.avatar} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  )}
                </IconButton>

                {/* Profile Dropdown Menu */}
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleProfileMenuClose}
                  onClick={handleProfileMenuClose}
                  PaperProps={{
                    elevation: 3,
                    sx: {
                      mt: 1.5,
                      minWidth: 200,
                      '& .MuiMenuItem-root': {
                        px: 2,
                        py: 1,
                      },
                    },
                  }}
                >
                  <MenuItem onClick={() => handleNavigation('/profile')}>
                    <AccountCircleOutlined sx={{ mr: 2 }} />
                    Profile
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('/dashboard')}>
                    <DashboardOutlined sx={{ mr: 2 }} />
                    Dashboard
                  </MenuItem>
                  <MenuItem onClick={() => handleNavigation('/messages')}>
                    <MessageOutlined sx={{ mr: 2 }} />
                    Messages
                  </MenuItem>
                  {user.role === 'student' && (
                    <>
                      <MenuItem onClick={() => handleNavigation('/wishlist')}>
                        <FavoriteOutlined sx={{ mr: 2 }} />
                        Wishlist
                      </MenuItem>
                      <MenuItem onClick={() => handleNavigation('/ai')}>
                        <SmartToy sx={{ mr: 2 }} />
                        AI Assistant
                      </MenuItem>
                    </>
                  )}
                  {user.role === 'company' && (
                    <MenuItem onClick={() => handleNavigation('/company')}>
                      <WorkOutline sx={{ mr: 2 }} />
                      Company Dashboard
                    </MenuItem>
                  )}
                  <MenuItem onClick={handleLogout}>
                    <LogoutOutlined sx={{ mr: 2 }} />
                    Logout
                  </MenuItem>
                </Menu>

              </>
            )}
          </Box>
        </Toolbar>
      </Container>

      {/* Notification Center Drawer */}
      <NotificationCenter
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        onNavigate={navigate}
      />
    </AppBar>
  )
}

export default Header
