import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  TextField,
  InputAdornment,
  IconButton,
  Autocomplete,
  Paper,
  Box,
  Typography
} from '@mui/material'
import { Search, Clear } from '@mui/icons-material'
import { addToSearchHistory } from '../../store/slices/uiSlice'
import { setFilters } from '../../store/slices/internshipSlice'

const SearchBar = ({ placeholder = "Search internships, companies, skills..." }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()

  const { searchHistory } = useSelector((state) => state.ui)
  const { filters } = useSelector((state) => state.internships)

  const [searchValue, setSearchValue] = useState(filters.search || '')
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setSearchValue(filters.search || '')
  }, [filters.search])

  const handleSearch = (value) => {
    if (value?.trim()) {
      dispatch(addToSearchHistory(value.trim()))
      dispatch(setFilters({ search: value.trim() }))

      // Navigate to internships page if not already there
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
      setSearchValue(value)
      handleSearch(value)
      setOpen(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Autocomplete
        freeSolo
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        value={searchValue}
        onInputChange={(event, newValue) => {
          setSearchValue(newValue)
        }}
        onChange={handleOptionSelect}
        options={searchHistory}
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            size="small"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <Search color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {searchValue && (
                    <IconButton
                      size="small"
                      onClick={handleClear}
                      edge="end"
                    >
                      <Clear />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
              sx: {
                backgroundColor: 'white',
                borderRadius: 2,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'grey.300',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'primary.main',
                },
              }
            }}
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <Search sx={{ mr: 2, color: 'text.secondary' }} />
            <Typography variant="body2">{option}</Typography>
          </Box>
        )}
        PaperComponent={({ children, ...props }) => (
          <Paper {...props} elevation={3}>
            {searchHistory.length > 0 ? (
              children
            ) : (
              <Box sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No recent searches
                </Typography>
              </Box>
            )}
          </Paper>
        )}
      />
    </form>
  )
}

export default SearchBar
