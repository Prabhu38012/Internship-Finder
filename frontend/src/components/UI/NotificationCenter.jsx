import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  IconButton,
  Badge,
  Popover,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Divider,
  Button,
  Chip,
  Paper,
} from "@mui/material";
import {
  Notifications,
  NotificationsNone,
  Work,
  Business,
  Schedule,
  CheckCircle,
  Info,
  Warning,
  Error,
  Clear,
  MarkEmailRead,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { format, formatDistanceToNow } from "date-fns";
import {
  markNotificationAsRead,
  markAllAsRead,
  clearNotifications,
} from "../../store/slices/notificationSlice";
import useSocket from "../../hooks/useSocket";

const NotificationCenter = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount } = useSelector(
    (state) => state.notifications,
  );
  const [anchorEl, setAnchorEl] = useState(null);
  const { socket } = useSocket();

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
    if (socket) {
      socket.emit("notification:read", notificationId);
    }
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead());
    if (socket) {
      socket.emit("notifications:mark_all_read");
    }
  };

  const handleClearAll = () => {
    dispatch(clearNotifications());
    if (socket) {
      socket.emit("notifications:clear_all");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "application":
        return <Work color="primary" />;
      case "interview":
        return <Schedule color="warning" />;
      case "offer":
        return <CheckCircle color="success" />;
      case "company":
        return <Business color="info" />;
      case "system":
        return <Info color="action" />;
      case "warning":
        return <Warning color="warning" />;
      case "error":
        return <Error color="error" />;
      default:
        return <Notifications color="action" />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "application":
        return "primary";
      case "interview":
        return "warning";
      case "offer":
        return "success";
      case "company":
        return "info";
      case "warning":
        return "warning";
      case "error":
        return "error";
      default:
        return "default";
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton
        onClick={handleClick}
        color="inherit"
        sx={{
          position: "relative",
          "&:hover": {
            backgroundColor: "rgba(255, 255, 255, 0.1)",
          },
        }}
      >
        <Badge badgeContent={unreadCount} color="error">
          {unreadCount > 0 ? <Notifications /> : <NotificationsNone />}
        </Badge>
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 500,
            borderRadius: 2,
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          },
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6" fontWeight="bold">
              Notifications
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  onClick={handleMarkAllAsRead}
                  startIcon={<MarkEmailRead />}
                >
                  Mark All Read
                </Button>
              )}
              <IconButton size="small" onClick={handleClearAll}>
                <Clear />
              </IconButton>
            </Box>
          </Box>

          {/* Notifications List */}
          <Box sx={{ maxHeight: 400, overflow: "auto" }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 4, textAlign: "center" }}>
                <NotificationsNone
                  sx={{ fontSize: 48, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="body1" color="text.secondary">
                  No notifications yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  We'll notify you when something important happens
                </Typography>
              </Box>
            ) : (
              <List sx={{ p: 0 }}>
                <AnimatePresence>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <ListItem
                        sx={{
                          bgcolor: notification.read
                            ? "transparent"
                            : "action.hover",
                          borderLeft: notification.read ? "none" : `4px solid`,
                          borderLeftColor: `${getNotificationColor(notification.type)}.main`,
                          "&:hover": {
                            bgcolor: "action.selected",
                          },
                          cursor: "pointer",
                        }}
                        onClick={() =>
                          !notification.read &&
                          handleMarkAsRead(notification.id)
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            sx={{
                              bgcolor: `${getNotificationColor(notification.type)}.light`,
                              color: `${getNotificationColor(notification.type)}.main`,
                            }}
                          >
                            {getNotificationIcon(notification.type)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                fontWeight={
                                  notification.read ? "normal" : "medium"
                                }
                                sx={{ flex: 1 }}
                              >
                                {notification.title}
                              </Typography>
                              {!notification.read && (
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: "primary.main",
                                  }}
                                />
                              )}
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
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {formatDistanceToNow(
                                    new Date(notification.createdAt),
                                    { addSuffix: true },
                                  )}
                                </Typography>
                                <Chip
                                  label={notification.type}
                                  size="small"
                                  color={getNotificationColor(
                                    notification.type,
                                  )}
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < notifications.length - 1 && <Divider />}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </List>
            )}
          </Box>

          {/* Footer */}
          {notifications.length > 0 && (
            <Box
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                textAlign: "center",
              }}
            >
              <Button variant="text" size="small" onClick={handleClose}>
                View All Notifications
              </Button>
            </Box>
          )}
        </motion.div>
      </Popover>
    </>
  );
};

export default NotificationCenter;
