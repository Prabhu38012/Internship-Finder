import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Clock, DollarSign, Building2, Star, Bookmark } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'internship' | 'project';
  duration: string;
  salary?: string;
  description: string;
  requirements: string[];
  skills: string[];
  postedDate: string;
  deadline: string;
  rating: number;
  isBookmarked: boolean;
}

const JobsPage: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    location: '',
    duration: '',
    skills: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);

  // Mock data for demonstration
  useEffect(() => {
    const mockJobs: Job[] = [
      {
        id: '1',
        title: 'Frontend Developer Internship',
        company: 'TechCorp Inc.',
        location: 'San Francisco, CA',
        type: 'internship',
        duration: '3 months',
        salary: '$2000/month',
        description: 'Join our dynamic team to work on cutting-edge web applications using React and TypeScript.',
        requirements: ['React', 'TypeScript', 'CSS', 'Git'],
        skills: ['React', 'TypeScript', 'JavaScript', 'CSS'],
        postedDate: '2024-01-15',
        deadline: '2024-02-15',
        rating: 4.8,
        isBookmarked: false,
      },
      {
        id: '2',
        title: 'Machine Learning Research Project',
        company: 'AI Innovations Lab',
        location: 'Remote',
        type: 'project',
        duration: '6 months',
        salary: '$3500/month',
        description: 'Work on groundbreaking AI research projects with our team of PhD researchers.',
        requirements: ['Python', 'TensorFlow', 'PyTorch', 'Statistics'],
        skills: ['Python', 'Machine Learning', 'Data Science', 'Research'],
        postedDate: '2024-01-10',
        deadline: '2024-02-20',
        rating: 4.9,
        isBookmarked: true,
      },
      {
        id: '3',
        title: 'Mobile App Development Internship',
        company: 'StartupXYZ',
        location: 'New York, NY',
        type: 'internship',
        duration: '4 months',
        salary: '$2500/month',
        description: 'Build innovative mobile applications using React Native and work with a fast-paced startup team.',
        requirements: ['React Native', 'JavaScript', 'Mobile Development'],
        skills: ['React Native', 'JavaScript', 'Mobile Development', 'UI/UX'],
        postedDate: '2024-01-12',
        deadline: '2024-02-10',
        rating: 4.6,
        isBookmarked: false,
      },
    ];
    setJobs(mockJobs);
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = !filters.type || job.type === filters.type;
    const matchesLocation = !filters.location || job.location.toLowerCase().includes(filters.location.toLowerCase());
    const matchesDuration = !filters.duration || job.duration.includes(filters.duration);
    
    return matchesSearch && matchesType && matchesLocation && matchesDuration;
  });

  const toggleBookmark = (jobId: string) => {
    setJobs(jobs.map(job => 
      job.id === jobId ? { ...job, isBookmarked: !job.isBookmarked } : job
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find Your Perfect <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Opportunity</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover internships and projects that match your skills and career goals
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, company, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
            >
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Types</option>
                    <option value="internship">Internship</option>
                    <option value="project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    placeholder="Enter location..."
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                  <select
                    value={filters.duration}
                    onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Any Duration</option>
                    <option value="1">1-2 months</option>
                    <option value="3">3-4 months</option>
                    <option value="6">6+ months</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredJobs.length}</span> opportunities
          </p>
        </div>

        {/* Job Listings */}
        <div className="grid gap-6">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {job.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        job.type === 'internship' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        <span>{job.company}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{job.duration}</span>
                      </div>
                      {job.salary && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          <span>{job.salary}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.skills.slice(0, 4).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span>{job.rating}</span>
                        </div>
                        <span>Posted {new Date(job.postedDate).toLocaleDateString()}</span>
                        <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => toggleBookmark(job.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        job.isBookmarked
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${job.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium">
                    View Details
                  </button>
                  {user && user.role === 'student' && (
                    <button className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium">
                      Apply Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No opportunities found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;