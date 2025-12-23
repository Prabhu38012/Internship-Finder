import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  List,
  Divider,
  Button,
  Chip,
  Stack,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Close as CloseIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  FilterList as FilterIcon,
  Refresh as RefreshIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { AnimatePresence } from "framer-motion";
import NotificationItem from "./NotificationItem";
import { notificationAPI } from "../../services/api";

const NotificationCenter = ({ open, onClose, onNavigate }) => {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState(0);
  const [filters, setFilters] = useState({
    type: "all",
    priority: "all",
    unread: false,
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    if (open) {
      fetchNotifications();
      fetchStats();
    }
  }, [open, selectedTab, filters]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        unread: selectedTab === 1 ? "true" : undefined,
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([key, value]) => value && value !== "all",
          ),
        ),
      };

      const response = await notificationAPI.getNotifications(params);
      setNotifications(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await notificationAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch notification stats:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationAPI.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, read: true } : n)),
      );
      fetchStats();
    } catch (error) {
      console.error("Failed to mark as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      fetchStats();
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      await notificationAPI.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      fetchStats();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleBulkDelete = async () => {
    const selectedIds = notifications
      .filter((n) => (selectedTab === 1 ? !n.read : n.read))
      .map((n) => n._id);

    if (selectedIds.length === 0) return;

    try {
      await notificationAPI.bulkDelete({ notificationIds: selectedIds });
      fetchNotifications();
      fetchStats();
    } catch (error) {
      console.error("Failed to bulk delete:", error);
    }
  };

  const handleAction = (url) => {
    if (url && onNavigate) {
      onNavigate(url);
      onClose();
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const getTabLabel = (index) => {
    switch (index) {
      case 0:
        return `All (${stats.total || 0})`;
      case 1:
        return `Unread (${stats.unread || 0})`;
      case 2:
        return "Settings";
      default:
        return "";
    }
  };

  const renderNotificationList = () => {
    if (loading) {
      return (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      );
    }

    if (notifications.length === 0) {
      return (
        <Box textAlign="center" py={4}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {selectedTab === 1 ? "No unread notifications" : "No notifications"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedTab === 1
              ? "You're all caught up!"
              : "New notifications will appear here"}
          </Typography>
        </Box>
      );
    }

    return (
      <List sx={{ p: 0 }}>
        <AnimatePresence>
          {notifications.map((notification, index) => (
            <React.Fragment key={notification._id}>
              <NotificationItem
                notification={notification}
                onRead={handleMarkAsRead}
                onDelete={handleDelete}
                onAction={handleAction}
              />
              {index < notifications.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </AnimatePresence>
      </List>
    );
  };

  const renderFilters = () => (
    <Box sx={{ p: 2, bgcolor: "grey.50" }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Type</InputLabel>
          <Select
            value={filters.type}
            onChange={handleFilterChange("type")}
            label="Type"
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="wishlist_reminder">Wishlist Reminders</MenuItem>
            <MenuItem value="wishlist_deadline_approaching">
              Deadline Alerts
            </MenuItem>
            <MenuItem value="new_similar_internship">New Matches</MenuItem>
            <MenuItem value="application_status_update">
              Application Updates
            </MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Priority</InputLabel>
          <Select
            value={filters.priority}
            onChange={handleFilterChange("priority")}
            label="Priority"
          >
            <MenuItem value="all">All Priorities</MenuItem>
            <MenuItem value="high">High</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="low">Low</MenuItem>
          </Select>
        </FormControl>

        <Button
          startIcon={<RefreshIcon />}
          onClick={fetchNotifications}
          size="small"
        >
          Refresh
        </Button>
      </Stack>
    </Box>
  );

  const renderSettings = () => (
    <Box sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Notification Preferences
      </Typography>

      <Stack spacing={2}>
        <Alert severity="info">
          Notification preferences can be managed in your profile settings.
        </Alert>

        <Button
          variant="outlined"
          onClick={() => onNavigate("/profile/settings")}
          fullWidth
        >
          Go to Settings
        </Button>
      </Stack>
    </Box>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: 400, md: 500 },
          maxWidth: "100vw",
        },
      }}
    >
      <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Typography variant="h6">Notifications</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mt: 1 }}>
            <Tab label={getTabLabel(0)} />
            <Tab
              label={
                <Badge badgeContent={stats.unread} color="error">
                  {getTabLabel(1)}
                </Badge>
              }
            />
            <Tab label="Settings" />
          </Tabs>
        </Box>

        {/* Actions Bar */}
        {selectedTab < 2 && (
          <Box sx={{ p: 2, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" spacing={1} justifyContent="space-between">
              <Stack direction="row" spacing={1}>
                {stats.unread > 0 && (
                  <Button
                    startIcon={<MarkReadIcon />}
                    onClick={handleMarkAllAsRead}
                    size="small"
                  >
                    Mark All Read
                  </Button>
                )}
                <Button
                  startIcon={<DeleteIcon />}
                  onClick={handleBulkDelete}
                  size="small"
                  color="error"
                >
                  Clear {selectedTab === 1 ? "Read" : "All"}
                </Button>
              </Stack>

              <IconButton
                size="small"
                onClick={() => setFilters({ type: "all", priority: "all" })}
              >
                <FilterIcon />
              </IconButton>
            </Stack>
          </Box>
        )}

        {/* Filters */}
        {selectedTab < 2 && renderFilters()}

        {/* Content */}
        <Box sx={{ flex: 1, overflow: "auto" }}>
          {selectedTab === 2 ? renderSettings() : renderNotificationList()}
        </Box>

        {/* Load More */}
        {selectedTab < 2 && pagination.pages > pagination.page && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
            <Button
              fullWidth
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={loading}
            >
              Load More
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationCenter;
