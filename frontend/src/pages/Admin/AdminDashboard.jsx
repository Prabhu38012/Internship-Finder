import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
  Tabs,
  Tab
} from '@mui/material'
import {
  People,
  Business,
  Work,
  Assessment,
  MoreVert,
  Check,
  Close,
  Visibility,
  Block
} from '@mui/icons-material'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

import LoadingSpinner from '../../components/UI/LoadingSpinner'

const AdminDashboard = () => {
  const { user } = useSelector((state) => state.auth)
  const [currentTab, setCurrentTab] = useState(0)
  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // Mock data - replace with actual API calls
  const [stats, setStats] = useState({
    totalUsers: 1250,
    totalCompanies: 85,
    totalInternships: 320,
    pendingVerifications: 12
  })

  const [users, setUsers] = useState([])
  const [companies, setCompanies] = useState([])
  const [internships, setInternships] = useState([])

  useEffect(() => {
    // Fetch admin data
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setIsLoading(true)
    try {
      // Mock API calls - replace with actual endpoints
      setUsers([
        {
          _id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'student',
          status: 'active',
          createdAt: new Date(),
          avatar: null
        },
        {
          _id: '2',
          name: 'Jane Smith',
          email: 'jane@company.com',
          role: 'company',
          status: 'pending',
          createdAt: new Date(),
          avatar: null
        }
      ])

      setCompanies([
        {
          _id: '1',
          name: 'Tech Corp',
          email: 'hr@techcorp.com',
          status: 'verified',
          internshipsCount: 5,
          createdAt: new Date()
        },
        {
          _id: '2',
          name: 'StartupXYZ',
          email: 'jobs@startupxyz.com',
          status: 'pending',
          internshipsCount: 2,
          createdAt: new Date()
        }
      ])

      setInternships([
        {
          _id: '1',
          title: 'Software Developer Intern',
          companyName: 'Tech Corp',
          status: 'active',
          applicationsCount: 25,
          createdAt: new Date()
        },
        {
          _id: '2',
          title: 'Marketing Intern',
          companyName: 'StartupXYZ',
          status: 'pending',
          applicationsCount: 8,
          createdAt: new Date()
        }
      ])
    } catch (error) {
      toast.error('Failed to fetch admin data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue)
  }

  const handleMenuOpen = (event, item) => {
    setAnchorEl(event.currentTarget)
    setSelectedItem(item)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
    setSelectedItem(null)
  }

  const handleApprove = () => {
    toast.success('Item approved successfully')
    handleMenuClose()
  }

  const handleReject = () => {
    toast.success('Item rejected successfully')
    handleMenuClose()
  }

  const handleBlock = () => {
    toast.success('Item blocked successfully')
    handleMenuClose()
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'verified': return 'success'
      case 'pending': return 'warning'
      case 'blocked':
      case 'rejected': return 'error'
      default: return 'default'
    }
  }

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
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
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return <LoadingSpinner message="Loading admin dashboard..." />
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Internship Finder</title>
        <meta name="description" content="Admin panel for managing users, companies, and internships." />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage users, companies, and internship postings
          </Typography>
        </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={<People />}
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Companies"
              value={stats.totalCompanies}
              icon={<Business />}
              color="info"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Internships"
              value={stats.totalInternships}
              icon={<Work />}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending Reviews"
              value={stats.pendingVerifications}
              icon={<Assessment />}
              color="warning"
            />
          </Grid>
        </Grid>

        {/* Management Tabs */}
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={currentTab} onChange={handleTabChange}>
              <Tab label="Users" />
              <Tab label="Companies" />
              <Tab label="Internships" />
            </Tabs>
          </Box>

          {/* Users Tab */}
          {currentTab === 0 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>User</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Joined</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user._id} hover>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
                            {user.name.charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {user.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color={getStatusColor(user.status)}
                        />
                      </TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, user)}
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
          )}

          {/* Companies Tab */}
          {currentTab === 1 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Company</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Internships</TableCell>
                    <TableCell>Registered</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {company.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{company.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={company.status}
                          size="small"
                          color={getStatusColor(company.status)}
                        />
                      </TableCell>
                      <TableCell>{company.internshipsCount}</TableCell>
                      <TableCell>
                        {format(new Date(company.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          onClick={(e) => handleMenuOpen(e, company)}
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
          )}

          {/* Internships Tab */}
          {currentTab === 2 && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Applications</TableCell>
                    <TableCell>Posted</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {internships.map((internship) => (
                    <TableRow key={internship._id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {internship.title}
                        </Typography>
                      </TableCell>
                      <TableCell>{internship.companyName}</TableCell>
                      <TableCell>
                        <Chip
                          label={internship.status}
                          size="small"
                          color={getStatusColor(internship.status)}
                        />
                      </TableCell>
                      <TableCell>{internship.applicationsCount}</TableCell>
                      <TableCell>
                        {format(new Date(internship.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell align="right">
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
          )}
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => {}}>
            <Visibility sx={{ mr: 1 }} />
            View Details
          </MenuItem>
          <MenuItem onClick={handleApprove}>
            <Check sx={{ mr: 1 }} />
            Approve
          </MenuItem>
          <MenuItem onClick={handleReject}>
            <Close sx={{ mr: 1 }} />
            Reject
          </MenuItem>
          <MenuItem onClick={handleBlock} sx={{ color: 'error.main' }}>
            <Block sx={{ mr: 1 }} />
            Block
          </MenuItem>
        </Menu>
      </Container>
    </>
  )
}

export default AdminDashboard
