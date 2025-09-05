import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  IconButton, 
  Menu, 
  MenuItem, 
  Box, 
  Button,
  Tooltip,
  Avatar,
  Stack
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
  Notifications as NotificationsIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';
import { format, isAfter, differenceInDays } from 'date-fns';
import { motion } from 'framer-motion';

const WishlistCard = ({ 
  item, 
  onEdit, 
  onDelete, 
  onView, 
  onUpdatePriority,
  onUpdateCategory,
  onSetReminder 
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'info';
      default: return 'default';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'dream_job': return 'secondary';
      case 'interested': return 'primary';
      case 'backup': return 'info';
      case 'applied': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'applied': return 'success';
      case 'planning_to_apply': return 'warning';
      case 'not_applied': return 'info';
      case 'no_longer_interested': return 'error';
      default: return 'default';
    }
  };

  const isDeadlineApproaching = () => {
    if (!item.internship?.applicationDeadline) return false;
    const deadline = new Date(item.internship.applicationDeadline);
    const daysLeft = differenceInDays(deadline, new Date());
    return daysLeft <= 7 && daysLeft >= 0;
  };

  const isExpired = () => {
    if (!item.internship?.applicationDeadline) return false;
    return !isAfter(new Date(item.internship.applicationDeadline), new Date());
  };

  const getDaysLeft = () => {
    if (!item.internship?.applicationDeadline) return null;
    return differenceInDays(new Date(item.internship.applicationDeadline), new Date());
  };

  const renderPriorityStars = () => {
    const stars = [];
    for (let i = 0; i < 3; i++) {
      stars.push(
        <IconButton
          key={i}
          size="small"
          onClick={() => {
            const newPriority = i === 0 ? 'high' : i === 1 ? 'medium' : 'low';
            onUpdatePriority(item._id, newPriority);
          }}
        >
          {(item.priority === 'high' && i === 0) ||
           (item.priority === 'medium' && i <= 1) ||
           (item.priority === 'low' && i <= 2) ? (
            <StarIcon color="warning" fontSize="small" />
          ) : (
            <StarBorderIcon fontSize="small" />
          )}
        </IconButton>
      );
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        sx={{ 
          mb: 2, 
          position: 'relative',
          border: isDeadlineApproaching() ? '2px solid #ff9800' : 
                  isExpired() ? '2px solid #f44336' : 'none',
          opacity: isExpired() ? 0.7 : 1
        }}
      >
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="flex-start">
            <Box flex={1}>
              <Typography variant="h6" component="h3" gutterBottom>
                {item.internship?.title}
                {isDeadlineApproaching() && (
                  <Chip 
                    label={`${getDaysLeft()} days left`} 
                    color="warning" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                )}
                {isExpired() && (
                  <Chip 
                    label="Expired" 
                    color="error" 
                    size="small" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                {item.internship?.companyName}
              </Typography>

              <Stack direction="row" spacing={1} mb={2}>
                <Chip 
                  label={item.priority} 
                  color={getPriorityColor(item.priority)} 
                  size="small" 
                />
                <Chip 
                  label={item.category.replace('_', ' ')} 
                  color={getCategoryColor(item.category)} 
                  size="small" 
                />
                <Chip 
                  label={item.applicationStatus.replace('_', ' ')} 
                  color={getApplicationStatusColor(item.applicationStatus)} 
                  size="small" 
                />
              </Stack>

              <Box display="flex" alignItems="center" gap={2} mb={1}>
                {item.internship?.location && (
                  <Box display="flex" alignItems="center">
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" ml={0.5}>
                      {item.internship.location.city || item.internship.location.type}
                    </Typography>
                  </Box>
                )}
                
                {item.internship?.stipend?.amount > 0 && (
                  <Box display="flex" alignItems="center">
                    <MoneyIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary" ml={0.5}>
                      {item.internship.stipend.currency} {item.internship.stipend.amount}
                      /{item.internship.stipend.period}
                    </Typography>
                  </Box>
                )}
              </Box>

              {item.internship?.applicationDeadline && (
                <Box display="flex" alignItems="center" mb={1}>
                  <ScheduleIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" ml={0.5}>
                    Deadline: {format(new Date(item.internship.applicationDeadline), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              )}

              {item.notes && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <strong>Notes:</strong> {item.notes}
                </Typography>
              )}

              {item.tags && item.tags.length > 0 && (
                <Box mt={1}>
                  {item.tags.map((tag, index) => (
                    <Chip 
                      key={index} 
                      label={tag} 
                      size="small" 
                      variant="outlined" 
                      sx={{ mr: 0.5, mb: 0.5 }}
                    />
                  ))}
                </Box>
              )}

              {item.reminderDate && (
                <Box display="flex" alignItems="center" mt={1}>
                  <NotificationsIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary" ml={0.5}>
                    Reminder: {format(new Date(item.reminderDate), 'MMM dd, yyyy')}
                  </Typography>
                </Box>
              )}
            </Box>

            <Box>
              <IconButton onClick={handleMenuClick}>
                <MoreVertIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={() => { onView(item.internship._id); handleMenuClose(); }}>
                  <LaunchIcon fontSize="small" sx={{ mr: 1 }} />
                  View Details
                </MenuItem>
                <MenuItem onClick={() => { onEdit(item); handleMenuClose(); }}>
                  <EditIcon fontSize="small" sx={{ mr: 1 }} />
                  Edit
                </MenuItem>
                <MenuItem onClick={() => { onSetReminder(item); handleMenuClose(); }}>
                  <NotificationsIcon fontSize="small" sx={{ mr: 1 }} />
                  Set Reminder
                </MenuItem>
                <MenuItem 
                  onClick={() => { onDelete(item._id); handleMenuClose(); }}
                  sx={{ color: 'error.main' }}
                >
                  <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
                  Remove
                </MenuItem>
              </Menu>
            </Box>
          </Box>

          <Box display="flex" justifyContent="space-between" alignItems="center" mt={2}>
            <Box display="flex" alignItems="center">
              <Typography variant="caption" color="text.secondary" mr={1}>
                Priority:
              </Typography>
              {renderPriorityStars()}
            </Box>

            <Box display="flex" gap={1}>
              <Button 
                size="small" 
                onClick={() => onView(item.internship._id)}
                startIcon={<LaunchIcon />}
              >
                View
              </Button>
              <Button 
                size="small" 
                variant="outlined" 
                onClick={() => onEdit(item)}
                startIcon={<EditIcon />}
              >
                Edit
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default WishlistCard;
