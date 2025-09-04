import React, { useState, useMemo, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  TextField,
  InputAdornment,
  IconButton,
  Paper,
  Box,
  Typography,
  CircularProgress
} from '@mui/material'
import {
  Search,
  Clear
} from '@mui/icons-material'
import { motion } from 'framer-motion'
import { addToSearchHistory } from '../../store/slices/uiSlice'
import { setFilters } from '../../store/slices/internshipSlice'

const DynamicSearchBar = ({ placeholder = "Search internships, companies, skills..." }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const [searchValue, setSearchValue] = useState('')
  const [focused, setFocused] = useState(false)

  const handleSearch = useCallback((value) => {
    if (value?.trim()) {
      dispatch(addToSearchHistory(value.trim()))
      dispatch(setFilters({ search: value.trim() }))
      
      if (location.pathname !== '/internships') {
        navigate('/internships')
      }
    }
  }, [dispatch, navigate, location.pathname])

  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    handleSearch(searchValue)
  }, [handleSearch, searchValue])

  const handleClear = useCallback(() => {
    setSearchValue('')
    dispatch(setFilters({ search: '' }))
  }, [dispatch])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <form onSubmit={handleSubmit}>
        <TextField
          placeholder={placeholder}
          variant="outlined"
          size="medium"
          fullWidth
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="action" />
              </InputAdornment>
            ),
            endAdornment: searchValue && (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={handleClear}
                  edge="end"
                >
                  <Clear />
                </IconButton>
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
      </form>
    </motion.div>
  )
}

export default DynamicSearchBar
