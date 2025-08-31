import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useDebounce } from 'use-debounce'
import {
  Box,
  Drawer,
  Typography,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Chip,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Divider
} from '@mui/material'
import {
  Close,
  ExpandMore,
  FilterList,
  Clear,
  TuneRounded
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { setFilters } from '../../store/slices/internshipSlice'

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

const DynamicFilters = ({ open, onClose }) => {
  const dispatch = useDispatch()
  const { filters } = useSelector((state) => state.internships)
  
  const [localFilters, setLocalFilters] = useState(filters)
  const [debouncedFilters] = useDebounce(localFilters, 500)
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    location: false,
    compensation: false,
    advanced: false
  })

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  // Auto-apply filters with debouncing for better UX
  useEffect(() => {
    if (JSON.stringify(debouncedFilters) !== JSON.stringify(filters)) {
      dispatch(setFilters(debouncedFilters))
    }
  }, [debouncedFilters, dispatch, filters])

  const handleFilterChange = (field, value) => {
    setLocalFilters(prev => ({ ...prev, [field]: value }))
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
      duration: '',
      experience: '',
      skills: []
    }
    setLocalFilters(clearedFilters)
  }

  const getActiveFiltersCount = () => {
    return Object.entries(localFilters).filter(([key, value]) => {
      if (key === 'page' || key === 'limit') return false
      if (Array.isArray(value)) return value.length > 0
      return value && value !== ''
    }).length
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          borderRadius: { xs: 0, sm: '16px 0 0 16px' }
        }
      }}
    >
      <motion.div
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
          {/* Header */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            p: 3,
            borderBottom: 1,
            borderColor: 'divider',
            bgcolor: 'primary.main',
            color: 'primary.contrastText'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TuneRounded />
              <Typography variant="h6" fontWeight="bold">
                Filters
              </Typography>
              <Badge badgeContent={getActiveFiltersCount()} color="secondary">
                <FilterList />
              </Badge>
            </Box>
            <IconButton onClick={onClose} sx={{ color: 'inherit' }}>
              <Close />
            </IconButton>
          </Box>

          {/* Filter Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
            <AnimatePresence>
              {/* Basic Filters */}
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Accordion 
                  expanded={expandedSections.basic}
                  onChange={() => toggleSection('basic')}
                  sx={{ mb: 1 }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      Basic Filters
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={localFilters.category || ''}
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

                      <FormControl fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={localFilters.type || ''}
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
                        <InputLabel>Duration</InputLabel>
                        <Select
                          value={localFilters.duration || ''}
                          label="Duration"
                          onChange={(e) => handleFilterChange('duration', e.target.value)}
                        >
                          <MenuItem value="">Any Duration</MenuItem>
                          <MenuItem value="1-3 months">1-3 months</MenuItem>
                          <MenuItem value="3-6 months">3-6 months</MenuItem>
                          <MenuItem value="6+ months">6+ months</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </motion.div>

              {/* Location Filters */}
              <Accordion 
                expanded={expandedSections.location}
                onChange={() => toggleSection('location')}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Location & Work Mode
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={localFilters.location || ''}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="City, State, or Country"
                    />

                    <FormControlLabel
                      control={
                        <Switch
                          checked={localFilters.remote || false}
                          onChange={(e) => handleFilterChange('remote', e.target.checked)}
                        />
                      }
                      label="Remote Work"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Compensation Filters */}
              <Accordion 
                expanded={expandedSections.compensation}
                onChange={() => toggleSection('compensation')}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Compensation
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Stipend Range (₹ per month)
                    </Typography>
                    <Slider
                      value={[
                        parseInt(localFilters.stipendMin) || 0,
                        parseInt(localFilters.stipendMax) || 100000
                      ]}
                      onChange={(e, newValue) => {
                        handleFilterChange('stipendMin', newValue[0].toString())
                        handleFilterChange('stipendMax', newValue[1].toString())
                      }}
                      valueLabelDisplay="auto"
                      min={0}
                      max={100000}
                      step={5000}
                      marks={[
                        { value: 0, label: '₹0' },
                        { value: 25000, label: '₹25K' },
                        { value: 50000, label: '₹50K' },
                        { value: 100000, label: '₹100K' }
                      ]}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        label="Min Stipend"
                        type="number"
                        value={localFilters.stipendMin || ''}
                        onChange={(e) => handleFilterChange('stipendMin', e.target.value)}
                        sx={{ flex: 1 }}
                        size="small"
                      />
                      <TextField
                        label="Max Stipend"
                        type="number"
                        value={localFilters.stipendMax || ''}
                        onChange={(e) => handleFilterChange('stipendMax', e.target.value)}
                        sx={{ flex: 1 }}
                        size="small"
                      />
                    </Box>
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Advanced Filters */}
              <Accordion 
                expanded={expandedSections.advanced}
                onChange={() => toggleSection('advanced')}
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Typography variant="subtitle1" fontWeight="medium">
                    Advanced
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <FormControl fullWidth>
                      <InputLabel>Experience Level</InputLabel>
                      <Select
                        value={localFilters.experience || ''}
                        label="Experience Level"
                        onChange={(e) => handleFilterChange('experience', e.target.value)}
                      >
                        <MenuItem value="">Any Experience</MenuItem>
                        <MenuItem value="fresher">Fresher</MenuItem>
                        <MenuItem value="0-1 years">0-1 years</MenuItem>
                        <MenuItem value="1-2 years">1-2 years</MenuItem>
                        <MenuItem value="2+ years">2+ years</MenuItem>
                      </Select>
                    </FormControl>

                    <TextField
                      fullWidth
                      label="Required Skills"
                      value={localFilters.skills?.join(', ') || ''}
                      onChange={(e) => handleFilterChange('skills', e.target.value.split(', ').filter(s => s.trim()))}
                      placeholder="React, Node.js, Python..."
                      helperText="Separate skills with commas"
                    />
                  </Box>
                </AccordionDetails>
              </Accordion>
            </AnimatePresence>

            {/* Active Filters */}
            {getActiveFiltersCount() > 0 && (
              <Box sx={{ mt: 3 }}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Active Filters ({getActiveFiltersCount()})
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {Object.entries(localFilters).map(([key, value]) => {
                    if (!value || key === 'page' || key === 'limit' || key === 'search') return null
                    
                    const displayValue = Array.isArray(value) ? value.join(', ') : 
                                       typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                                       value

                    return (
                      <Chip
                        key={key}
                        label={`${key}: ${displayValue}`}
                        onDelete={() => handleFilterChange(key, Array.isArray(value) ? [] : '')}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )
                  })}
                </Box>
              </Box>
            )}
          </Box>

          {/* Footer Actions */}
          <Box sx={{ 
            p: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            bgcolor: 'background.paper'
          }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                onClick={clearFilters}
                startIcon={<Clear />}
                fullWidth
              >
                Clear All
              </Button>
              <Button
                variant="contained"
                onClick={onClose}
                fullWidth
              >
                Apply Filters
              </Button>
            </Box>
          </Box>
        </Box>
      </motion.div>
    </Drawer>
  )
}

export default DynamicFilters
