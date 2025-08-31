import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  Work,
  Business,
  LocationOn,
  Schedule,
  Refresh,
  Visibility
} from '@mui/icons-material'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts'
import { motion } from 'framer-motion'
import AnimatedCard from './AnimatedCard'

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f97316']

const DynamicDashboard = ({ data }) => {
  const { user } = useSelector((state) => state.auth)
  const [refreshing, setRefreshing] = useState(false)
  const [viewMode, setViewMode] = useState('overview')

  const mockData = {
    stats: {
      totalInternships: 1247,
      newThisWeek: 89,
      applications: 156,
      interviews: 12,
      offers: 3
    },
    categoryData: [
      { name: 'Software Dev', value: 35, count: 437 },
      { name: 'Data Science', value: 20, count: 249 },
      { name: 'Design', value: 15, count: 187 },
      { name: 'Marketing', value: 12, count: 150 },
      { name: 'Business', value: 10, count: 125 },
      { name: 'Other', value: 8, count: 99 }
    ],
    trendData: [
      { month: 'Jan', internships: 120, applications: 45 },
      { month: 'Feb', internships: 135, applications: 52 },
      { month: 'Mar', internships: 148, applications: 61 },
      { month: 'Apr', internships: 162, applications: 58 },
      { month: 'May', internships: 178, applications: 67 },
      { month: 'Jun', internships: 195, applications: 73 }
    ],
    topCompanies: [
      { name: 'Google', logo: '/api/placeholder/40/40', openings: 25, growth: 15 },
      { name: 'Microsoft', logo: '/api/placeholder/40/40', openings: 22, growth: 12 },
      { name: 'Amazon', logo: '/api/placeholder/40/40', openings: 18, growth: -5 },
      { name: 'Meta', logo: '/api/placeholder/40/40', openings: 16, growth: 8 },
      { name: 'Netflix', logo: '/api/placeholder/40/40', openings: 12, growth: 20 }
    ],
    locationData: [
      { city: 'Bangalore', count: 245, percentage: 35 },
      { city: 'Mumbai', count: 189, percentage: 27 },
      { city: 'Delhi', count: 156, percentage: 22 },
      { city: 'Hyderabad', count: 98, percentage: 14 },
      { city: 'Pune', count: 67, percentage: 10 }
    ]
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000)
  }

  const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
    <AnimatedCard>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color={color}>
              {value}
            </Typography>
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                {change > 0 ? (
                  <TrendingUp color="success" fontSize="small" />
                ) : (
                  <TrendingDown color="error" fontSize="small" />
                )}
                <Typography
                  variant="body2"
                  color={change > 0 ? 'success.main' : 'error.main'}
                  sx={{ ml: 0.5 }}
                >
                  {Math.abs(change)}% this week
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.light`, color: `${color}.main` }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </AnimatedCard>
  )

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Dashboard Analytics
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Real-time insights into internship trends and opportunities
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={refreshing}>
              <motion.div
                animate={{ rotate: refreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: refreshing ? Infinity : 0 }}
              >
                <Refresh />
              </motion.div>
            </IconButton>
          </Tooltip>
          <Tooltip title="Change View">
            <IconButton onClick={() => setViewMode(viewMode === 'overview' ? 'detailed' : 'overview')}>
              <Visibility />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Total Internships"
            value={mockData.stats.totalInternships.toLocaleString()}
            change={12}
            icon={<Work />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="New This Week"
            value={mockData.stats.newThisWeek}
            change={8}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="My Applications"
            value={mockData.stats.applications}
            change={-3}
            icon={<Schedule />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Interviews"
            value={mockData.stats.interviews}
            change={25}
            icon={<Business />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard
            title="Offers"
            value={mockData.stats.offers}
            change={50}
            icon={<TrendingUp />}
            color="success"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* Category Distribution */}
        <Grid item xs={12} lg={6}>
          <AnimatedCard delay={0.2}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Internships by Category
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockData.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mockData.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                </PieChart>
              </ResponsiveContainer>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                {mockData.categoryData.map((item, index) => (
                  <Chip
                    key={item.name}
                    label={`${item.name} (${item.count})`}
                    size="small"
                    sx={{ 
                      bgcolor: COLORS[index % COLORS.length],
                      color: 'white',
                      '& .MuiChip-label': { fontWeight: 'medium' }
                    }}
                  />
                ))}
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        {/* Trend Analysis */}
        <Grid item xs={12} lg={6}>
          <AnimatedCard delay={0.3}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Monthly Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mockData.trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <RechartsTooltip />
                  <Area
                    type="monotone"
                    dataKey="internships"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="applications"
                    stackId="2"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </AnimatedCard>
        </Grid>

        {/* Top Companies */}
        <Grid item xs={12} lg={6}>
          <AnimatedCard delay={0.4}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Top Hiring Companies
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {mockData.topCompanies.map((company, index) => (
                  <motion.div
                    key={company.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: 'background.default',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={company.logo} sx={{ width: 40, height: 40 }}>
                          {company.name[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {company.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {company.openings} open positions
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {company.growth > 0 ? (
                          <TrendingUp color="success" fontSize="small" />
                        ) : (
                          <TrendingDown color="error" fontSize="small" />
                        )}
                        <Typography
                          variant="body2"
                          color={company.growth > 0 ? 'success.main' : 'error.main'}
                          fontWeight="medium"
                        >
                          {Math.abs(company.growth)}%
                        </Typography>
                      </Box>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>

        {/* Location Distribution */}
        <Grid item xs={12} lg={6}>
          <AnimatedCard delay={0.5}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                Top Locations
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {mockData.locationData.map((location, index) => (
                  <motion.div
                    key={location.city}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2" fontWeight="medium">
                            {location.city}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {location.count} positions
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={location.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: 'action.hover',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            bgcolor: COLORS[index % COLORS.length]
                          }
                        }}
                      />
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </CardContent>
          </AnimatedCard>
        </Grid>
      </Grid>
    </Box>
  )
}

export default DynamicDashboard
