import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams } from 'react-router-dom'
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material'
import {
  LocationOn,
  Business,
  Schedule,
  AttachMoney,
  FilterList,
  Close,
  BookmarkBorder,
  Bookmark,
  Language,
  OpenInNew
} from '@mui/icons-material'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'

import { getInternships, getInternshipsWithExternal, setFilters, setPagination, toggleSaveInternship } from '../../store/slices/internshipSlice'
import LoadingSpinner from '../../components/UI/LoadingSpinner'
import DynamicSearchBar from '../../components/UI/DynamicSearchBar'
import DynamicFilters from '../../components/UI/DynamicFilters'
import AnimatedCard from '../../components/UI/AnimatedCard'
import InfiniteScrollList from '../../components/UI/InfiniteScrollList'
import useSocket from '../../hooks/useSocket'
import WishlistButton from '../../components/Wishlist/WishlistButton'

const categories = [
  'Software Development',
  'Data Science',
  'Machine Learning',
  'Web Development',
  'Mobile Development',
  'UI/UX Design',
  'Digital Marketing',
  'Business Development',
  'Finance',
  'Human Resources',
  'Content Writing',
  'Graphic Design',
  'Sales',
  'Operations',
  'Research',
  'Other'
]

const InternshipList = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const dispatch = useDispatch()
  const [searchParams, setSearchParams] = useSearchParams()

  const { internships, filters, pagination, isLoading } = useSelector((state) => state.internships)
  const { user } = useSelector((state) => state.auth)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState(filters)
  const [includeExternal, setIncludeExternal] = useState(false)
  const [hasNextPage, setHasNextPage] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Initialize socket connection for real-time updates
  const { socket } = useSocket()

  useEffect(() => {
    // Initialize filters from URL params
    const urlFilters = {
      search: searchParams.get('search') || '',
      category: searchParams.get('category') || '',
      location: searchParams.get('location') || '',
      type: searchParams.get('type') || '',
      remote: searchParams.get('remote') === 'true',
      stipendMin: searchParams.get('stipendMin') || '',
      stipendMax: searchParams.get('stipendMax') || '',
    }

    dispatch(setFilters(urlFilters))
    setLocalFilters(urlFilters)
  }, [searchParams, dispatch])

  useEffect(() => {
    // Fetch internships when filters change
    const params = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit
    }

    if (includeExternal) {
      dispatch(getInternshipsWithExternal(params))
    } else {
      dispatch(getInternships(params))
    }
  }, [dispatch, filters, pagination.page, pagination.limit, includeExternal])

  const handleFilterChange = (field, value) => {
    const newFilters = { ...localFilters, [field]: value }
    setLocalFilters(newFilters)
  }

  const applyFilters = () => {
    dispatch(setFilters(localFilters))

    // Update URL params
    const params = new URLSearchParams()
    Object.entries(localFilters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString())
      }
    })
    setSearchParams(params)

    setFiltersOpen(false)
  }

  const clearFilters = () => {
    const clearedFilters = {
      search: '',
      category: '',
      location: '',
      type: '',
      remote: false,
      stipendMin: '',
      stipendMax: '',
    }
    setLocalFilters(clearedFilters)
    dispatch(setFilters(clearedFilters))
    setSearchParams({})
  }

  const handlePageChange = (event, page) => {
    dispatch(setPagination({ page }))
  }

  const loadMoreInternships = async () => {
    if (isLoadingMore || !hasNextPage) return

    setIsLoadingMore(true)
    try {
      const nextPage = pagination.page + 1
      const params = {
        ...filters,
        page: nextPage,
        limit: pagination.limit
      }

      if (includeExternal) {
        await dispatch(getInternshipsWithExternal(params))
      } else {
        await dispatch(getInternships(params))
      }

      setHasNextPage(nextPage < pagination.pages)
    } catch (error) {
      console.error('Error loading more internships:', error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleSaveInternship = (internshipId) => {
    if (user) {
      dispatch(toggleSaveInternship(internshipId))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success'
      case 'urgent': return 'error'
      case 'featured': return 'primary'
      default: return 'default'
    }
  }

  const FilterDrawer = () => (
    <Box sx={{ width: 300, p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Filters</Typography>
        <IconButton onClick={() => setFiltersOpen(false)}>
          <Close />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={localFilters.category}
            label="Category"
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          label="Location"
          value={localFilters.location}
          onChange={(e) => handleFilterChange('location', e.target.value)}
          placeholder="City, State, or Country"
        />

        <FormControl fullWidth>
          <InputLabel>Type</InputLabel>
          <Select
            value={localFilters.type}
            label="Type"
            onChange={(e) => handleFilterChange('type', e.target.value)}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="internship">Internship</MenuItem>
            <MenuItem value="project">Project</MenuItem>
            <MenuItem value="full-time">Full-time</MenuItem>
            <MenuItem value="part-time">Part-time</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Work Mode</InputLabel>
          <Select
            value={localFilters.remote ? 'remote' : 'onsite'}
            label="Work Mode"
            onChange={(e) => handleFilterChange('remote', e.target.value === 'remote')}
          >
            <MenuItem value="">All Modes</MenuItem>
            <MenuItem value="remote">Remote</MenuItem>
            <MenuItem value="onsite">On-site</MenuItem>
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            label="Min Stipend"
            type="number"
            value={localFilters.stipendMin}
            onChange={(e) => handleFilterChange('stipendMin', e.target.value)}
            sx={{ flex: 1 }}
          />
          <TextField
            label="Max Stipend"
            type="number"
            value={localFilters.stipendMax}
            onChange={(e) => handleFilterChange('stipendMax', e.target.value)}
            sx={{ flex: 1 }}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          <Button variant="contained" onClick={applyFilters} fullWidth>
            Apply Filters
          </Button>
          <Button variant="outlined" onClick={clearFilters} fullWidth>
            Clear
          </Button>
        </Box>
      </Box>
    </Box>
  )

  return (
    <>
      <Helmet>
        <title>Browse Internships - InternQuest</title>
        <meta name="description" content="Browse and search through thousands of internship opportunities from top companies." />
      </Helmet>

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Find Your Perfect Internship
          </Typography>

          {/* Search and Filter Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, maxWidth: 600 }}>
              <DynamicSearchBar />
            </Box>
            <Button
              variant={includeExternal ? "contained" : "outlined"}
              startIcon={<Language />}
              onClick={() => setIncludeExternal(!includeExternal)}
              sx={{ minWidth: 140 }}
              color={includeExternal ? "primary" : "inherit"}
            >
              Include External
            </Button>
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={() => setFiltersOpen(true)}
              sx={{ minWidth: 120 }}
            >
              Filters
            </Button>
          </Box>

          {/* Active Filters */}
          {Object.entries(filters).some(([key, value]) => value && key !== 'page' && key !== 'limit') && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {Object.entries(filters).map(([key, value]) => {
                if (!value || key === 'page' || key === 'limit') return null
                return (
                  <Chip
                    key={key}
                    label={`${key}: ${value}`}
                    onDelete={() => handleFilterChange(key, key === 'remote' ? false : '')}
                    size="small"
                  />
                )
              })}
              <Button size="small" onClick={clearFilters}>
                Clear All
              </Button>
            </Box>
          )}

          {/* Results Count */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              {pagination.total} internships found
            </Typography>
            {includeExternal && internships.length > 0 && (
              <Typography variant="caption" color="primary" sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
                px: 1,
                py: 0.5,
                borderRadius: 1
              }}>
                <Language fontSize="small" />
                Including external sources
              </Typography>
            )}
          </Box>
        </Box>

        {/* Content */}
        {isLoading ? (
          <LoadingSpinner message="Loading internships..." />
        ) : (
          <>
            {/* Internship Cards */}
            <Grid container spacing={3}>
              {internships.map((internship, index) => (
                <Grid item xs={12} md={6} lg={4} key={internship._id || internship.id}>
                  <AnimatedCard
                    delay={index * 0.1}
                    direction="up"
                    hover={true}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Header */}
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Typography variant="h6" component="h3" gutterBottom sx={{ mb: 0 }}>
                              {internship.title}
                            </Typography>
                            {internship.isExternal && (
                              <Chip
                                label={internship.source}
                                size="small"
                                color="secondary"
                                icon={<Language fontSize="small" />}
                              />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Business fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {internship.companyName || internship.company?.name || internship.company}
                            </Typography>
                            {internship.company?.companyProfile?.verified && (
                              <Chip label="Verified" size="small" color="primary" />
                            )}
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {user && user.role === 'student' && (
                            <WishlistButton
                              internship={internship}
                              size="small"
                            />
                          )}
                          {user && user.role === 'student' && !internship.isExternal && (
                            <IconButton
                              onClick={() => handleSaveInternship(internship._id)}
                              color={internship.isSaved ? 'primary' : 'default'}
                              size="small"
                            >
                              {internship.isSaved ? <Bookmark /> : <BookmarkBorder />}
                            </IconButton>
                          )}
                        </Box>
                      </Box>

                      {/* Details */}
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn fontSize="small" color="action" />
                          <Typography variant="body2">
                            {internship.location.type === 'remote' ? 'Remote' :
                              `${internship.location.city}, ${internship.location.state}`}
                          </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule fontSize="small" color="action" />
                          <Typography variant="body2">
                            {internship.duration}
                          </Typography>
                        </Box>

                        {internship.stipend?.amount > 0 && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachMoney fontSize="small" color="action" />
                            <Typography variant="body2">
                              {internship.stipend.currency === 'INR' ? '₹' : '$'}{internship.stipend.amount}/{internship.stipend.period}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Description */}
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {internship.description ? internship.description.substring(0, 150) + '...' : 'No description available'}
                      </Typography>

                      {/* Tags */}
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip label={internship.category} size="small" />
                        <Chip label={internship.type} size="small" variant="outlined" />
                        {internship.urgent && (
                          <Chip label="Urgent" size="small" color="error" />
                        )}
                        {internship.featured && (
                          <Chip label="Featured" size="small" color="primary" />
                        )}
                      </Box>

                      {/* Footer */}
                      <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          {internship.applicationDeadline ?
                            `Deadline: ${format(new Date(internship.applicationDeadline), 'MMM dd, yyyy')}` :
                            `Posted: ${internship.postedDate ? format(new Date(internship.postedDate), 'MMM dd, yyyy') : 'Recently'}`
                          }
                        </Typography>
                        {internship.isExternal ? (
                          <Button
                            component="a"
                            href={internship.applyUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variant="contained"
                            size="small"
                            endIcon={<OpenInNew />}
                          >
                            Apply
                          </Button>
                        ) : (
                          <Button
                            component={Link}
                            to={`/internships/${internship._id}`}
                            variant="contained"
                            size="small"
                          >
                            View Details
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}

            {/* No Results */}
            {internships.length === 0 && !isLoading && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" gutterBottom>
                  No internships found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Try adjusting your search criteria or filters
                </Typography>
                <Button variant="outlined" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </Box>
            )}
          </>
        )}

        {/* Dynamic Filter Drawer */}
        <DynamicFilters
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
        />
      </Container>
    </>
  )
}

export default InternshipList
