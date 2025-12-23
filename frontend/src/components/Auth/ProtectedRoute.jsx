import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import LoadingSpinner from "../UI/LoadingSpinner";
import { getMe, setInitialized, clearAuth } from "../../store/slices/authSlice";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const { user, token, isLoading, isInitialized } = useSelector(
    (state) => state.auth,
  );

  useEffect(() => {
    // If we have a token but no user data, try to fetch user
    if (token && !user && !isLoading) {
      dispatch(getMe())
        .unwrap()
        .catch(() => {
          // If getMe fails, clear auth state
          dispatch(clearAuth());
        })
        .finally(() => {
          dispatch(setInitialized());
        });
    } else if (!token && !isInitialized) {
      dispatch(setInitialized());
    } else if (token && user && !isInitialized) {
      dispatch(setInitialized());
    }
  }, [token, user, isLoading, isInitialized, dispatch]);

  // Show loading while checking authentication
  if (!isInitialized || (token && !user && isLoading)) {
    return <LoadingSpinner />;
  }

  if (!token || !user) {
    // Redirect to login with return url
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
