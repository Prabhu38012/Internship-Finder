import React, { useState, useEffect } from "react";
import {
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { Favorite, FavoriteBorder } from "@mui/icons-material";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { wishlistAPI } from "../../services/api";
import { addNotification } from "../../store/slices/notificationSlice";

const WishlistButton = ({
  internship,
  size = "medium",
  showLabel = false,
  onWishlistChange = null,
}) => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.auth);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [wishlistItem, setWishlistItem] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Check if internship is in wishlist on component mount
  useEffect(() => {
    if (user && token && internship?._id) {
      checkWishlistStatus();
    }
  }, [user, token, internship?._id]);

  const checkWishlistStatus = async () => {
    try {
      const response = await wishlistAPI.getWishlist();
      const wishlistItems = response.data.data || [];
      const existingItem = wishlistItems.find(
        (item) => item.internship?._id === internship._id,
      );

      if (existingItem) {
        setIsInWishlist(true);
        setWishlistItem(existingItem);
      } else {
        setIsInWishlist(false);
        setWishlistItem(null);
      }
    } catch (error) {
      console.error("Error checking wishlist status:", error);
    }
  };

  const handleWishlistToggle = async (event) => {
    event.stopPropagation(); // Prevent card click events

    if (!user || !token) {
      setSnackbar({
        open: true,
        message: "Please login to add items to wishlist",
        severity: "warning",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isInWishlist && wishlistItem) {
        // Remove from wishlist
        await wishlistAPI.removeFromWishlist(wishlistItem._id);
        setIsInWishlist(false);
        setWishlistItem(null);

        setSnackbar({
          open: true,
          message: "Removed from wishlist",
          severity: "info",
        });

        // Emit real-time update
        if (window.socket) {
          window.socket.emit("wishlist_removed", {
            userId: user._id,
            internshipId: internship._id,
            wishlistItemId: wishlistItem._id,
          });
        }

        // Add notification
        dispatch(
          addNotification({
            type: "wishlist_removed",
            title: "Removed from Wishlist",
            message: `${internship.title} has been removed from your wishlist`,
            data: { internshipId: internship._id },
          }),
        );
      } else {
        // Add to wishlist with quick dialog for basic info
        const wishlistData = {
          internshipId: internship._id,
          notes: `Interested in ${internship.title} at ${internship.companyName}`,
          priority: "medium",
          category: "interested",
          applicationStatus: "not_applied",
          tags: ["Quick Add"],
        };

        const response = await wishlistAPI.addToWishlist(wishlistData);
        const newWishlistItem = response.data.data;

        setIsInWishlist(true);
        setWishlistItem(newWishlistItem);

        setSnackbar({
          open: true,
          message: "Added to wishlist! Click to edit details.",
          severity: "success",
        });

        // Emit real-time update
        if (window.socket) {
          window.socket.emit("wishlist_added", {
            userId: user._id,
            internshipId: internship._id,
            wishlistItem: newWishlistItem,
          });
        }

        // Add notification
        dispatch(
          addNotification({
            type: "wishlist_added",
            title: "Added to Wishlist",
            message: `${internship.title} has been added to your wishlist`,
            data: { internshipId: internship._id },
          }),
        );
      }

      // Notify parent component of change
      if (onWishlistChange) {
        onWishlistChange(isInWishlist, wishlistItem);
      }
    } catch (error) {
      console.error("Error toggling wishlist:", error);
      setSnackbar({
        open: true,
        message: error.response?.data?.message || "Failed to update wishlist",
        severity: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return null; // Don't show wishlist button for non-authenticated users
  }

  return (
    <>
      <Tooltip
        title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        arrow
      >
        <span>
          <IconButton
            onClick={handleWishlistToggle}
            disabled={isLoading}
            size={size}
            sx={{
              color: isInWishlist ? "error.main" : "action.active",
              "&:hover": {
                color: isInWishlist ? "error.dark" : "error.main",
                transform: "scale(1.1)",
              },
              transition: "all 0.2s ease-in-out",
            }}
          >
            {isLoading ? (
              <CircularProgress size={size === "small" ? 16 : 24} />
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={isInWishlist ? "filled" : "outline"}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {isInWishlist ? <Favorite /> : <FavoriteBorder />}
                </motion.div>
              </AnimatePresence>
            )}
          </IconButton>
          {showLabel && (
            <span style={{ marginLeft: 8, fontSize: "0.875rem" }}>
              {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
            </span>
          )}
        </span>
      </Tooltip>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default WishlistButton;
