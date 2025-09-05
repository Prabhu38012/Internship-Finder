import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  TextField,
  Grid,
  Button,
  Typography,
  Stack
} from '@mui/material';
import {
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const WishlistFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters,
  stats = {} 
}) => {
  const handleFilterChange = (field) => (event) => {
    onFilterChange({
      ...filters,
      [field]: event.target.value
    });
  };

  const getFilterCount = () => {
    return Object.values(filters).filter(value => 
      value && value !== 'all' && value !== ''
    ).length;
  };

  return (
    <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box display="flex" alignItems="center">
          <FilterIcon sx={{ mr: 1 }} />
          <Typography variant="h6">Filters</Typography>
          {getFilterCount() > 0 && (
            <Chip 
              label={`${getFilterCount()} active`} 
              size="small" 
              color="primary" 
              sx={{ ml: 1 }}
            />
          )}
        </Box>
        
        {getFilterCount() > 0 && (
          <Button
            startIcon={<ClearIcon />}
            onClick={onClearFilters}
            size="small"
          >
            Clear All
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Category</InputLabel>
            <Select
              value={filters.category || 'all'}
              onChange={handleFilterChange('category')}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="interested">
                Interested {stats.byCategory?.interested && `(${stats.byCategory.interested})`}
              </MenuItem>
              <MenuItem value="backup">
                Backup {stats.byCategory?.backup && `(${stats.byCategory.backup})`}
              </MenuItem>
              <MenuItem value="dream_job">
                Dream Job {stats.byCategory?.dream_job && `(${stats.byCategory.dream_job})`}
              </MenuItem>
              <MenuItem value="applied">
                Applied {stats.byCategory?.applied && `(${stats.byCategory.applied})`}
              </MenuItem>
              <MenuItem value="rejected">
                Rejected {stats.byCategory?.rejected && `(${stats.byCategory.rejected})`}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Priority</InputLabel>
            <Select
              value={filters.priority || 'all'}
              onChange={handleFilterChange('priority')}
              label="Priority"
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="high">
                High {stats.byPriority?.high && `(${stats.byPriority.high})`}
              </MenuItem>
              <MenuItem value="medium">
                Medium {stats.byPriority?.medium && `(${stats.byPriority.medium})`}
              </MenuItem>
              <MenuItem value="low">
                Low {stats.byPriority?.low && `(${stats.byPriority.low})`}
              </MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Application Status</InputLabel>
            <Select
              value={filters.applicationStatus || 'all'}
              onChange={handleFilterChange('applicationStatus')}
              label="Application Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="not_applied">Not Applied</MenuItem>
              <MenuItem value="planning_to_apply">Planning to Apply</MenuItem>
              <MenuItem value="applied">Applied</MenuItem>
              <MenuItem value="no_longer_interested">No Longer Interested</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            label="Search"
            value={filters.search || ''}
            onChange={handleFilterChange('search')}
            placeholder="Search by title or company..."
          />
        </Grid>
      </Grid>

      {/* Quick Filter Chips */}
      <Box mt={2}>
        <Typography variant="subtitle2" color="text.secondary" mb={1}>
          Quick Filters:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            label="High Priority"
            clickable
            color={filters.priority === 'high' ? 'primary' : 'default'}
            onClick={() => onFilterChange({
              ...filters,
              priority: filters.priority === 'high' ? 'all' : 'high'
            })}
            size="small"
          />
          <Chip
            label="Dream Jobs"
            clickable
            color={filters.category === 'dream_job' ? 'secondary' : 'default'}
            onClick={() => onFilterChange({
              ...filters,
              category: filters.category === 'dream_job' ? 'all' : 'dream_job'
            })}
            size="small"
          />
          <Chip
            label="Not Applied"
            clickable
            color={filters.applicationStatus === 'not_applied' ? 'warning' : 'default'}
            onClick={() => onFilterChange({
              ...filters,
              applicationStatus: filters.applicationStatus === 'not_applied' ? 'all' : 'not_applied'
            })}
            size="small"
          />
          <Chip
            label="Planning to Apply"
            clickable
            color={filters.applicationStatus === 'planning_to_apply' ? 'info' : 'default'}
            onClick={() => onFilterChange({
              ...filters,
              applicationStatus: filters.applicationStatus === 'planning_to_apply' ? 'all' : 'planning_to_apply'
            })}
            size="small"
          />
        </Stack>
      </Box>
    </Box>
  );
};

export default WishlistFilters;
