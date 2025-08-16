import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Star, 
  Bookmark, 
  Share2,
  Calendar,
  Users,
  Award,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface JobDetail {
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
  responsibilities: string[];
  benefits: string[];
  postedDate: string;
  deadline: string;
  rating: number;
  reviewCount: number;
  applicantCount: number;
  isBookmarked: boolean;
  companyLogo?: string;
  companyDescription: string;
}

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  useEffect(() => {
    // Mock data for demonstration
    const mockJob: JobDetail = {
      id: id || '1',
      title: 'Frontend Developer Internship',
      company: 'TechCorp Inc.',
      location: 'San Francisco, CA',
      type: 'internship',
      duration: '3 months',
      salary: '$2000/month',
      description: 'Join our dynamic team to work on cutting-edge web applications using React and TypeScript. This internship offers hands-on experience with modern web development practices and the opportunity to work alongside senior developers on real-world projects.',
      requirements: ['React', 'TypeScript', 'CSS', 'Git', 'JavaScript ES6+'],
      skills: ['React', 'TypeScript', 'JavaScript', 'CSS', 'HTML', 'Git', 'Responsive Design'],
      responsibilities: [
        'Develop and maintain user-facing web applications',
        'Collaborate with design team to implement UI/UX designs',
        'Write clean, maintainable, and efficient code',
        'Participate in code reviews and team meetings',
        'Learn and apply best practices in web development'
      ],
      benefits: [
        'Competitive stipend',
        'Mentorship from senior developers',
        'Flexible working hours',
        'Learning and development opportunities',
        'Potential for full-time offer'
      ],
      postedDate: '2024-01-15',
      deadline: '2024-02-15',
      rating: 4.8,
      reviewCount: 127,
      applicantCount: 45,
      isBookmarked: false,
      companyDescription: 'TechCorp Inc. is a leading technology company specializing in innovative web solutions and digital transformation services.'
    };

    setTimeout(() => {
      setJob(mockJob);
      setLoading(false);
    }, 500);
  }, [id]);

  const toggleBookmark = () => {
    if (job) {
      setJob({ ...job, isBookmarked: !job.isBookmarked });
    }
  };

  const handleApply = () => {
    if (user && user.role === 'student') {
      setShowApplicationModal(true);
    } else {
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
          <button
            onClick={() => navigate('/jobs')}
            className="text-blue-600 hover:text-blue-700"
          >
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/jobs')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  job.type === 'internship' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'
                }`}>
                  {job.type.charAt(0).toUpperCase() + job.type.slice(1)}
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  <span className="font-medium">{job.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <span>{job.duration}</span>
                </div>
                {job.salary && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    <span className="font-medium text-green-600">{job.salary}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>{job.rating} ({job.reviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{job.applicantCount} applicants</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 ml-6">
              <button
                onClick={toggleBookmark}
                className={`p-3 rounded-lg transition-colors ${
                  job.isBookmarked
                    ? 'bg-red-100 text-red-600 hover:bg-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Bookmark className={`w-5 h-5 ${job.isBookmarked ? 'fill-current' : ''}`} />
              </button>
              <button className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleApply}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-8 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-medium text-lg"
            >
              Apply Now
            </button>
            <button className="px-8 py-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-medium">
              Save for Later
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">About this opportunity</h2>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>

            {/* Responsibilities */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsibilities</h2>
              <ul className="space-y-3">
                {job.responsibilities.map((responsibility, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{responsibility}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
              <div className="flex flex-wrap gap-3">
                {job.requirements.map((requirement, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg font-medium"
                  >
                    {requirement}
                  </span>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-3">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Company Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">About {job.company}</h3>
              <p className="text-gray-700 mb-4">{job.companyDescription}</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span>{job.rating} company rating</span>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Benefits</h3>
              <ul className="space-y-3">
                {job.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Posted</span>
                  <span className="font-medium">{new Date(job.postedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline</span>
                  <span className="font-medium">{new Date(job.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Applicants</span>
                  <span className="font-medium">{job.applicantCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-medium capitalize">{job.type}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Apply for {job.title}</h3>
            <p className="text-gray-600 mb-6">
              Your application will be submitted to {job.company}. Make sure your profile is complete.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowApplicationModal(false);
                  // Handle application submission
                }}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetailPage;