import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { useDebounce } from 'use-debounce'
import {
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete,
  Paper,
  Box,
  Typography,
  Chip,
  Avatar,
  CircularProgress,
  Divider
} from '@mui/material'
import {
  Search,
  Clear,
  TrendingUp,
  History,
  Business,
  LocationOn,
  Category,
  School
} from '@mui/icons-material'
import { motion, AnimatePresence } from 'framer-motion'
import { addToSearchHistory } from '../../store/slices/uiSlice'
import { setFilters, searchSuggestions } from '../../store/slices/internshipSlice'

const DynamicSearchBar = ({ placeholder = "Search internships, companies, skills..." }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const { searchHistory, trendingSearches } = useSelector((state) => state.ui)
  const { filters, suggestions, isLoadingSuggestions } = useSelector((state) => state.internships)
  
  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [debouncedSearchValue] = useDebounce(searchValue, 300)
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)

  useEffect(() => {
    setSearchValue(filters.search || '')
  }, [filters.search])

  // Fetch suggestions when debounced value changes
  useEffect(() => {
    if (debouncedSearchValue && debouncedSearchValue.length > 2) {
      dispatch(searchSuggestions(debouncedSearchValue))
    }
  }, [debouncedSearchValue, dispatch])

  // Categorized suggestions
  const categorizedSuggestions = useMemo(() => {
    const categories = {
      companies: [],
      skills: [],
      locations: [],
      categories: [],
      recent: searchHistory.slice(0, 5),
      trending: trendingSearches || []
    }

    if (suggestions) {
      suggestions.forEach(item => {
        switch (item.type) {
          case 'company':
            categories.companies.push(item)
            break
          case 'skill':
            categories.skills.push(item)
            break
          case 'location':
            categories.locations.push(item)
            break
          case 'category':
            categories.categories.push(item)
            break
        }
      })
    }

    return categories
  }, [suggestions, searchHistory, trendingSearches])

  const handleSearch = (value) => {
    if (value?.trim()) {
      dispatch(addToSearchHistory(value.trim()))
      dispatch(setFilters({ search: value.trim() }))
      
      if (location.pathname !== '/internships') {
        navigate('/internships')
      }
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    handleSearch(searchValue)
    setOpen(false)
  }

  const handleClear = () => {
    setSearchValue('')
    dispatch(setFilters({ search: '' }))
  }

  const handleOptionSelect = (event, value) => {
    if (value) {
      const searchTerm = typeof value === 'string' ? value : value.text || value.name
      setSearchValue(searchTerm)
      handleSearch(searchTerm)
      setOpen(false)
    }
  }

  const renderSuggestionGroup = (title, items, icon, color = 'primary') => {
    if (!items || items.length === 0) return null

    return (
      <Box key={title}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1, 
          px: 2, 
          py: 1, 
          bgcolor: 'grey.50' 
        }}>
          {icon}
          <Typography variant="caption" fontWeight="medium" color="text.secondary">
            {title}
          </Typography>
        </Box>
        {items.map((item, index) => (
          <Box
            key={`${title}-${index}`}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              px: 2,
              py: 1,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.hover'
              }
            }}
            onClick={() => handleOptionSelect(null, item)}
          >
            {item.avatar && (
              <Avatar src={item.avatar} sx={{ width: 24, height: 24 }}>
                {item.name?.[0]}
              </Avatar>
            )}
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2">
                {item.text || item.name || item}
              </Typography>
              {item.subtitle && (
                <Typography variant="caption" color="text.secondary">
                  {item.subtitle}
                </Typography>
              )}
            </Box>
            {item.count && (
              <Chip 
                label={item.count} 
                size="small" 
                variant="outlined" 
                color={color}
              />
            )}
          </Box>
        ))}
        <Divider />
      </Box>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit}>
        <Autocomplete
          freeSolo
          open={open && (focused || searchValue.length > 0)}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          value={searchValue}
          onInputChange={(event, newValue) => {
            setSearchValue(newValue)
          }}
          onChange={handleOptionSelect}
          options={[]}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder={placeholder}
              variant="outlined"
              size="medium"
              fullWidth
              onFocus={() => {
                setFocused(true)
                setOpen(true)
              }}
              onBlur={() => setFocused(false)}
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <motion.div
                      animate={{ rotate: focused ? 90 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Search color="action" />
                    </motion.div>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <AnimatePresence>
                      {isLoadingSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <CircularProgress size={20} />
                        </motion.div>
                      )}
                      {searchValue && !isLoadingSuggestions && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                        >
                          <IconButton
                            size="small"
                            onClick={handleClear}
                            edge="end"
                          >
                            <Clear />
                          </IconButton>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: 'white',
                  borderRadius: 3,
                  transition: 'all 0.2s ease-in-out',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'grey.300',
                    borderWidth: 2,
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                  },
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 3px rgba(245, 158, 11, 0.1)',
                  },
                  transform: focused ? 'scale(1.02)' : 'scale(1)',
                }
              }}
            />
          )}
          PaperComponent={({ children, ...props }) => (
            <Paper 
              {...props} 
              elevation={8}
              sx={{
                mt: 1,
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: 400,
                overflowY: 'auto'
              }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                {searchValue.length === 0 ? (
                  <Box>
                    {renderSuggestionGroup(
                      'Trending', 
                      categorizedSuggestions.trending, 
                      <TrendingUp fontSize="small" color="error" />,
                      'error'
                    )}
                    {renderSuggestionGroup(
                      'Recent Searches', 
                      categorizedSuggestions.recent, 
                      <History fontSize="small" color="action" />
                    )}
                  </Box>
                ) : (
                  <Box>
                    {renderSuggestionGroup(
                      'Companies', 
                      categorizedSuggestions.companies, 
                      <Business fontSize="small" color="primary" />
                    )}
                    {renderSuggestionGroup(
                      'Skills & Technologies', 
                      categorizedSuggestions.skills, 
                      <School fontSize="small" color="secondary" />
                    )}
                    {renderSuggestionGroup(
                      'Locations', 
                      categorizedSuggestions.locations, 
                      <LocationOn fontSize="small" color="success" />
                    )}
                    {renderSuggestionGroup(
                      'Categories', 
                      categorizedSuggestions.categories, 
                      <Category fontSize="small" color="info" />
                    )}
                  </Box>
                )}
                
                {searchValue.length > 0 && Object.values(categorizedSuggestions).every(arr => arr.length === 0) && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No suggestions found for "{searchValue}"
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Press Enter to search anyway
                    </Typography>
                  </Box>
                )}
              </motion.div>
            </Paper>
          )}
        />
      </form>
    </motion.div>
  )
}

export default DynamicSearchBar
