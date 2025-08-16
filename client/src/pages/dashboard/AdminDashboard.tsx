import React from 'react';
import { Navigate } from 'react-router-dom';

const AdminDashboard = () => {
  // Redirect to the main admin dashboard
  return <Navigate to="/admin" replace />;
};

export default AdminDashboard;