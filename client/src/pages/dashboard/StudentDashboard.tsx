import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Briefcase, 
  Clock, 
  TrendingUp, 
  BookOpen, 
  Bell,
  MapPin,
  Calendar,
  Star,
  ArrowRight,
  Eye,
  Heart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = {
    applicationsSubmitted: 12,
    applicationsInReview: 5,
    interviewsScheduled: 2,
    savedJobs: 8
  };

  const recentApplications = [
    {
      id: '1',
      jobTitle: 'Frontend Developer Intern',
      company: 'TechCorp Solutions',
      status: 'Under Review',
      appliedDate: '2025-01-10',
      logo: '/api/placeholder/40/40'
    },
    {
      id: '2',
      jobTitle: 'Data Science Internship',
      company: 'DataFlow Inc',
      status: 'Interview Scheduled',
      appliedDate: '2025-01-08',
      logo: '/api/placeholder/40/40'
    },
    {
      id: '3',
      jobTitle: 'UX Designer Intern',
      company: 'DesignHub',
      status: 'Application Sent',
      appliedDate: '2025-01-06',
      logo: '/api/placeholder/40/40'
    }
  ];

  const recommendedJobs = [
    {
      id: '1',
      title: 'React Developer Intern',
      company: 'StartupXYZ',
      location: 'Remote',
      type: 'Internship',
      matchScore: 95,
      postedDate: '2 days ago',
      tags: ['React', 'JavaScript', 'Node.js']
    },
    {
      id: '2',
      title: 'Machine Learning Project',
      company: 'AI Innovations',
      location: 'San Francisco, CA',
      type: 'Project',
      matchScore: 88,
      postedDate: '1 day ago',
      tags: ['Python', 'TensorFlow', 'Data Analysis']
    }
  ];

  const upcomingInterviews = [
    {
      id: '1',
      jobTitle: 'Data Science Internship',
      company: 'DataFlow Inc',
      date: '2025-01-15',
      time: '2:00 PM',
      type: 'Video Call'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'under review':
        return 'bg-yellow-100 text-yellow-800';
      case 'interview scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'application sent':
        return 'bg-gray-100 text-gray-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.profile?.firstName || 'Student'}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your internship journey
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applicationsSubmitted}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Review</p>
                <p className="text-2xl font-bold text-gray-900">{stats.applicationsInReview}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Interviews</p>
                <p className="text-2xl font-bold text-gray-900">{stats.interviewsScheduled}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Saved Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{stats.savedJobs}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Heart className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Applications */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recent Applications</h2>
                  <Link 
                    to="/applications"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recentApplications.map((application) => (
                  <div key={application.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Briefcase className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {application.jobTitle}
                          </h3>
                          <p className="text-gray-600">{application.company}</p>
                          <p className="text-sm text-gray-500">
                            Applied on {new Date(application.appliedDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Recommended for You</h2>
                  <Link 
                    to="/jobs"
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                  >
                    View All
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
              <div className="divide-y divide-gray-100">
                {recommendedJobs.map((job) => (
                  <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-medium text-green-600">
                              {job.matchScore}% match
                            </span>
                          </div>
                        </div>
                        <p className="text-gray-600 mb-2">{job.company}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center">
                            <Briefcase className="h-4 w-4 mr-1" />
                            {job.type}
                          </div>
                          <span>{job.postedDate}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {job.tags.map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Link
                        to={`/jobs/${job.id}`}
                        className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Apply
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upcoming Interviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Upcoming Interviews</h2>
              </div>
              <div className="p-6">
                {upcomingInterviews.length > 0 ? (
                  upcomingInterviews.map((interview) => (
                    <div key={interview.id} className="bg-blue-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {interview.jobTitle}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{interview.company}</p>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(interview.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-2" />
                          {interview.time} ({interview.type})
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500">No upcoming interviews</p>
                  </div>
                )}
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Profile Strength</h2>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Profile Completion</span>
                      <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Resume uploaded</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>Skills added</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                      <span>Add portfolio projects</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-gray-400 rounded-full mr-2"></div>
                      <span>Complete bio section</span>
                    </div>
                  </div>
                  <Link 
                    to="/profile"
                    className="block text-center py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Complete Profile
                  </Link>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <Link
                    to="/jobs"
                    className="block w-full text-left px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Briefcase className="h-5 w-5 mr-3" />
                      Browse New Jobs
                    </div>
                  </Link>
                  <Link
                    to="/profile"
                    className="block w-full text-left px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 mr-3" />
                      Update Profile
                    </div>
                  </Link>
                  <Link
                    to="/applications"
                    className="block w-full text-left px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center">
                      <Eye className="h-5 w-5 mr-3" />
                      Track Applications
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;