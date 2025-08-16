import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  Users, 
  Briefcase, 
  FileText, 
  BarChart3, 
  Settings, 
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

const AdminDashboard = () => {
  const location = useLocation();
  const [stats] = useState({
    totalUsers: 1247,
    totalJobs: 89,
    totalApplications: 456,
    pendingReviews: 23,
    activeCompanies: 34,
    newUsersThisMonth: 156,
  });

  const menuItems = [
    { path: '/admin', label: 'Overview', icon: BarChart3 },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/jobs', label: 'Jobs', icon: Briefcase },
    { path: '/admin/applications', label: 'Applications', icon: FileText },
    { path: '/admin/companies', label: 'Companies', icon: Shield },
    { path: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  const isActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/';
    }
    return location.pathname.startsWith(path);
  };

  const OverviewPage = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <TrendingUp className="w-4 h-4" />
                +{stats.newUsersThisMonth} this month
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Jobs</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
              <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                <CheckCircle className="w-4 h-4" />
                {stats.activeCompanies} companies
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Briefcase className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Applications</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
              <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                <Clock className="w-4 h-4" />
                {stats.pendingReviews} pending review
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Applications</h3>
          <div className="space-y-4">
            {[
              { name: 'John Doe', job: 'Frontend Developer', company: 'TechCorp', time: '2 hours ago' },
              { name: 'Jane Smith', job: 'Data Scientist', company: 'AI Labs', time: '4 hours ago' },
              { name: 'Mike Johnson', job: 'Mobile Developer', company: 'StartupXYZ', time: '6 hours ago' },
              { name: 'Sarah Wilson', job: 'UX Designer', company: 'Design Co', time: '8 hours ago' },
            ].map((application, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{application.name}</p>
                  <p className="text-sm text-gray-600">{application.job} at {application.company}</p>
                </div>
                <span className="text-sm text-gray-500">{application.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-6">System Alerts</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Pending Company Verifications</p>
                <p className="text-sm text-yellow-700">5 companies awaiting verification</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-800">System Update Available</p>
                <p className="text-sm text-blue-700">Version 2.1.0 is ready for deployment</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium text-green-800">Performance Metrics</p>
                <p className="text-sm text-green-700">All systems operating normally</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 bg-white rounded-2xl shadow-lg p-6 h-fit">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
              <p className="text-gray-600">System Management</p>
            </div>
            
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive(item.path)
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<OverviewPage />} />
              <Route path="/users" element={<div className="bg-white rounded-2xl shadow-lg p-8"><h2 className="text-2xl font-bold">User Management</h2><p className="text-gray-600 mt-2">Manage user accounts and permissions</p></div>} />
              <Route path="/jobs" element={<div className="bg-white rounded-2xl shadow-lg p-8"><h2 className="text-2xl font-bold">Job Management</h2><p className="text-gray-600 mt-2">Review and manage job postings</p></div>} />
              <Route path="/applications" element={<div className="bg-white rounded-2xl shadow-lg p-8"><h2 className="text-2xl font-bold">Application Management</h2><p className="text-gray-600 mt-2">Monitor application status and reviews</p></div>} />
              <Route path="/companies" element={<div className="bg-white rounded-2xl shadow-lg p-8"><h2 className="text-2xl font-bold">Company Management</h2><p className="text-gray-600 mt-2">Verify and manage company accounts</p></div>} />
              <Route path="/settings" element={<div className="bg-white rounded-2xl shadow-lg p-8"><h2 className="text-2xl font-bold">System Settings</h2><p className="text-gray-600 mt-2">Configure system parameters and preferences</p></div>} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;