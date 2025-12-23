import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Snackbar,
  Fab,
  Grid,
  Pagination,
  CircularProgress,
  Stack,
} from "@mui/material";
import { Add as AddIcon, Refresh as RefreshIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import WishlistCard from "./WishlistCard";
import WishlistDialog from "./WishlistDialog";
import WishlistFilters from "./WishlistFilters";
import WishlistStats from "./WishlistStats";
import { wishlistAPI } from "../../services/api";

const WishlistPage = () => {
  const navigate = useNavigate();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [filters, setFilters] = useState({
    category: "all",
    priority: "all",
    applicationStatus: "all",
    search: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    fetchWishlistData();
    fetchStats();
  }, [filters, pagination.page]);

  const fetchWishlistData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([key, value]) => value && value !== "all",
          ),
        ),
      };

      const response = await wishlistAPI.getWishlist(params);
      setWishlistItems(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        pages: response.data.pagination.pages,
      }));
    } catch (error) {
      showSnackbar("Failed to fetch wishlist items", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await wishlistAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleAddToWishlist = () => {
    navigate("/internships");
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDeleteItem = async (itemId) => {
    if (
      window.confirm(
        "Are you sure you want to remove this item from your wishlist?",
      )
    ) {
      try {
        await wishlistAPI.removeFromWishlist(itemId);
        showSnackbar("Item removed from wishlist");
        fetchWishlistData();
        fetchStats();
      } catch (error) {
        showSnackbar("Failed to remove item", "error");
      }
    }
  };

  const handleViewInternship = (internshipId) => {
    navigate(`/internships/${internshipId}`);
  };

  const handleUpdatePriority = async (itemId, priority) => {
    try {
      await wishlistAPI.updateWishlistItem(itemId, { priority });
      showSnackbar("Priority updated");
      fetchWishlistData();
      fetchStats();
    } catch (error) {
      showSnackbar("Failed to update priority", "error");
    }
  };

  const handleUpdateCategory = async (itemId, category) => {
    try {
      await wishlistAPI.updateWishlistItem(itemId, { category });
      showSnackbar("Category updated");
      fetchWishlistData();
      fetchStats();
    } catch (error) {
      showSnackbar("Failed to update category", "error");
    }
  };

  const handleSetReminder = (item) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSaveItem = async (itemId, data) => {
    try {
      if (itemId) {
        await wishlistAPI.updateWishlistItem(itemId, data);
        showSnackbar("Wishlist item updated");
      } else {
        await wishlistAPI.addToWishlist(data);
        showSnackbar("Added to wishlist");
      }
      fetchWishlistData();
      fetchStats();
    } catch (error) {
      showSnackbar(
        itemId ? "Failed to update item" : "Failed to add item",
        "error",
      );
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleClearFilters = () => {
    setFilters({
      category: "all",
      priority: "all",
      applicationStatus: "all",
      search: "",
    });
  };

  const handlePageChange = (event, page) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingItem(null);
  };

  const handleRefresh = () => {
    fetchWishlistData();
    fetchStats();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          My Wishlist
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddToWishlist}
          >
            Browse Internships
          </Button>
        </Stack>
      </Box>

      <WishlistStats
        stats={stats}
        reminders={stats.remindersDue || 0}
        closingSoon={stats.closingSoon || 0}
      />

      <WishlistFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
        stats={stats}
      />

      {loading ? (
        <Box display="flex" justifyContent="center" py={4}>
          <CircularProgress />
        </Box>
      ) : wishlistItems.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {Object.values(filters).some((f) => f && f !== "all")
              ? "No items match your filters"
              : "Your wishlist is empty"}
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            {Object.values(filters).some((f) => f && f !== "all")
              ? "Try adjusting your filters to see more results"
              : "Start building your wishlist by browsing internships"}
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddToWishlist}
          >
            Browse Internships
          </Button>
        </Box>
      ) : (
        <>
          <AnimatePresence>
            {wishlistItems.map((item) => (
              <WishlistCard
                key={item._id}
                item={item}
                onEdit={handleEditItem}
                onDelete={handleDeleteItem}
                onView={handleViewInternship}
                onUpdatePriority={handleUpdatePriority}
                onUpdateCategory={handleUpdateCategory}
                onSetReminder={handleSetReminder}
              />
            ))}
          </AnimatePresence>

          {pagination.pages > 1 && (
            <Box display="flex" justifyContent="center" mt={4}>
              <Pagination
                count={pagination.pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
                size="large"
              />
            </Box>
          )}
        </>
      )}

      <WishlistDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleSaveItem}
        item={editingItem}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default WishlistPage;
