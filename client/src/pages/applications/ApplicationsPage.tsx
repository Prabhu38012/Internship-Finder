import React, { useState } from 'react';
import { Calendar, Clock, Building2, MapPin, Eye, MessageCircle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  appliedDate: string;
  status: 'pending' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  type: 'internship' | 'project';
  salary?: string;
  lastUpdate: string;
}

const ApplicationsPage = () => {
  const [applications] = useState([
    {
      id: '1',
      jobTitle: 'Frontend Developer Internship',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      appliedDate: '2024-01-20',
      status: 'interview',
      type: 'internship',
      salary: '$2000/month',
      lastUpdate: '2024-01-25',
    },
    {
      id: '2',
      jobTitle: 'Machine Learning Research Project',
      company: 'AI Innovations Lab',
      location: 'Remote',
      appliedDate: '2024-01-18',
      status: 'reviewing',
      type: 'project',
      salary: '$3500/month',
      lastUpdate: '2024-01-22',
    },
    {
      id: '3',
      jobTitle: 'Mobile App Development Internship',
      company: 'StartupXYZ',
      location: 'New York, NY',
      appliedDate: '2024-01-15',
      status: 'accepted',
      type: 'internship',
      salary: '$2500/month',
      lastUpdate: '2024-01-24',
    },
    {
      id: '4',
      jobTitle: 'Data Science Internship',
      company: 'DataTech Solutions',
      location: 'Boston, MA',
      appliedDate: '2024-01-12',
      status: 'rejected',
      type: 'internship',
      salary: '$2200/month',
      lastUpdate: '2024-01-20',
    },
    {
      id: '5',
      jobTitle: 'Web Development Project',
      company: 'Creative Agency',
      location: 'Los Angeles, CA',
      appliedDate: '2024-01-10',
      status: 'pending',
      type: 'project',
      salary: '$3000/month',
      lastUpdate: '2024-01-10',
    },
  ]);

  const [filterStatus, setFilterStatus] = useState('all');

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'reviewing':
        return <Eye className="w-5 h-5 text-blue-500" />;
      case 'interview':
        return <MessageCircle className="w-5 h-5 text-purple-500" />;
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter(app => 
    filterStatus === 'all' || app.status === filterStatus
  );

  const statusCounts = {
    all: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    reviewing: applications.filter(app => app.status === 'reviewing').length,
    interview: applications.filter(app => app.status === 'interview').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            My <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Applications</span>
          </h1>
          <p className="text-xl text-gray-600">
            Track your application progress and manage your opportunities
          </p>
        </div>

        {/* Status Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-wrap gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {status !== 'all' && getStatusIcon(status)}
                <span className="capitalize">{status === 'all' ? 'All Applications' : status}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  filterStatus === status ? 'bg-white bg-opacity-20' : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {filteredApplications.map((application) => (
            <div
              key={application.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {application.jobTitle}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.type === 'internship' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {application.type.charAt(0).toUpperCase() + application.type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{application.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{application.location}</span>
                      </div>
                      {application.salary && (
                        <div className="flex items-center gap-1">
                          <span className="text-green-600 font-medium">{application.salary}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Applied: {new Date(application.appliedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>Last update: {new Date(application.lastUpdate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 ml-6">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium ${getStatusColor(application.status)}`}>
                      {getStatusIcon(application.status)}
                      <span className="capitalize">{application.status}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                    View Details
                  </button>
                  <button className="flex-1 bg-white border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium">
                    Contact Company
                  </button>
                  {application.status === 'interview' && (
                    <button className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium">
                      Schedule Interview
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredApplications.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus === 'all' 
                ? "You haven't applied to any positions yet." 
                : `No applications with status "${filterStatus}".`}
            </p>
            <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
              Browse Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsPage;