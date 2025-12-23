import React from "react";
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  Schedule as ScheduleIcon,
  Work as WorkIcon,
  Person as PersonIcon,
  Star as StarIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
} from "@mui/icons-material";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";

const NotificationItem = ({
  notification,
  onRead,
  onDelete,
  onAction,
  showActions = true,
}) => {
  const getNotificationIcon = (type) => {
    const iconProps = { fontSize: "small" };

    switch (type) {
      case "wishlist_reminder":
      case "wishlist_deadline_approaching":
        return <ScheduleIcon {...iconProps} color="warning" />;
      case "new_similar_internship":
      case "new_internship_match":
        return <WorkIcon {...iconProps} color="primary" />;
      case "wishlist_internship_updated":
        return <InfoIcon {...iconProps} color="info" />;
      case "wishlist_internship_expired":
        return <WarningIcon {...iconProps} color="error" />;
      case "application_received":
      case "application_status_update":
        return <CheckCircleIcon {...iconProps} color="success" />;
      case "profile_view":
        return <PersonIcon {...iconProps} color="secondary" />;
      default:
        return <NotificationsIcon {...iconProps} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "info";
      default:
        return "default";
    }
  };

  const handleItemClick = () => {
    if (!notification.read) {
      onRead(notification._id);
    }

    if (notification.data?.url) {
      onAction(notification.data.url);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(notification._id);
  };

  const handleExternalAction = (e) => {
    e.stopPropagation();
    if (notification.data?.url) {
      onAction(notification.data.url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      <ListItem
        sx={{
          bgcolor: notification.read ? "transparent" : "action.hover",
          borderLeft: notification.read ? "none" : `4px solid`,
          borderLeftColor: notification.read
            ? "transparent"
            : `${getPriorityColor(notification.priority)}.main`,
          cursor: "pointer",
          "&:hover": {
            bgcolor: "action.selected",
          },
        }}
        onClick={handleItemClick}
      >
        <ListItemAvatar>
          <Avatar
            sx={{
              bgcolor: notification.read
                ? "grey.300"
                : `${getPriorityColor(notification.priority)}.light`,
              width: 40,
              height: 40,
            }}
          >
            {getNotificationIcon(notification.type)}
          </Avatar>
        </ListItemAvatar>

        <ListItemText
          primary={
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: notification.read ? "normal" : "bold",
                  color: notification.read ? "text.secondary" : "text.primary",
                }}
              >
                {notification.title}
              </Typography>
              <Box display="flex" alignItems="center" gap={1}>
                <Chip
                  label={notification.priority}
                  color={getPriorityColor(notification.priority)}
                  size="small"
                />
                {notification.data?.actionRequired && (
                  <Chip
                    label="Action Required"
                    color="warning"
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          }
          secondary={
            <Box>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 0.5 }}
              >
                {notification.message}
              </Typography>

              {/* Additional metadata */}
              {notification.data?.internshipId && (
                <Typography variant="caption" color="text.secondary">
                  Related to:{" "}
                  {notification.data.internshipId.title || "Internship"}
                </Typography>
              )}

              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mt={1}
              >
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(notification.createdAt), {
                    addSuffix: true,
                  })}
                </Typography>

                {showActions && (
                  <Box display="flex" gap={0.5}>
                    {notification.data?.url && (
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={handleExternalAction}
                          sx={{ opacity: 0.7, "&:hover": { opacity: 1 } }}
                        >
                          <LaunchIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete">
                      <IconButton
                        size="small"
                        onClick={handleDelete}
                        sx={{
                          opacity: 0.7,
                          "&:hover": { opacity: 1, color: "error.main" },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </Box>
            </Box>
          }
        />
      </ListItem>
    </motion.div>
  );
};

export default NotificationItem;
