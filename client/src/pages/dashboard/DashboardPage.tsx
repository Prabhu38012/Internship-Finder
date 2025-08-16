import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import StudentDashboard from './StudentDashboard';
import CompanyDashboard from './CompanyDashboard';
import AdminDashboard from './AdminDashboard';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  switch (user.role) {
    case 'student':
      return <StudentDashboard />;
    case 'company':
      return <CompanyDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <div>Invalid user role</div>;
  }
};

export default DashboardPage;