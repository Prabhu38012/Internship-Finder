import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Briefcase, 
  Users, 
  TrendingUp, 
  Star,
  ArrowRight,
  CheckCircle,
  Building,
  MapPin,
  Clock
} from 'lucide-react';

const HomePage: React.FC = () => {
  const stats = [
    { label: 'Active Internships', value: '5,000+', icon: Briefcase },
    { label: 'Students Placed', value: '25,000+', icon: Users },
    { label: 'Partner Companies', value: '1,500+', icon: Building },
    { label: 'Success Rate', value: '94%', icon: TrendingUp }
  ];

  const featuredJobs = [
    {
      id: 1,
      title: 'Frontend Development Intern',
      company: 'TechCorp Solutions',
      location: 'San Francisco, CA',
      type: 'Remote',
      duration: '3 months',
      tags: ['React', 'TypeScript', 'UI/UX'],
      salary: '$2,500/month',
      logo: '/api/placeholder/40/40'
    },
    {
      id: 2,
      title: 'Data Science Internship',
      company: 'DataFlow Inc',
      location: 'New York, NY',
      type: 'Hybrid',
      duration: '6 months',
      tags: ['Python', 'ML', 'Analytics'],
      salary: '$3,000/month',
      logo: '/api/placeholder/40/40'
    },
    {
      id: 3,
      title: 'Mobile App Developer',
      company: 'AppVentures',
      location: 'Austin, TX',
      type: 'On-site',
      duration: '4 months',
      tags: ['React Native', 'iOS', 'Android'],
      salary: '$2,800/month',
      logo: '/api/placeholder/40/40'
    }
  ];

  const features = [
    {
      title: 'Smart Matching',
      description: 'Our AI-powered system matches you with internships based on your skills and preferences.',
      icon: TrendingUp
    },
    {
      title: 'Verified Companies',
      description: 'All partner companies are verified and committed to providing quality learning experiences.',
      icon: CheckCircle
    },
    {
      title: 'Career Support',
      description: 'Get access to mentorship, career guidance, and professional development resources.',
      icon: Users
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
              Find Your{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Dream Internship
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Connect with top companies, gain real-world experience, and launch your career 
              with internships and projects tailored to your skills.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-12">
              <div className="flex flex-col md:flex-row gap-4 bg-white rounded-2xl p-2 shadow-2xl border border-gray-100">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search internships, projects, or companies..."
                    className="w-full pl-12 pr-4 py-4 bg-transparent focus:outline-none text-gray-700 text-lg"
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Location"
                    className="w-full md:w-64 pl-12 pr-4 py-4 bg-transparent focus:outline-none text-gray-700 text-lg border-l border-gray-200"
                  />
                </div>
                <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:scale-105 transition-all duration-200">
                  Search Jobs
                </button>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/jobs"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200"
              >
                Browse Opportunities
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
              >
                Create Account
                <Users className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Opportunities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover hand-picked internships and projects from top companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Briefcase className="h-6 w-6 text-white" />
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                    {job.type}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {job.title}
                </h3>
                <p className="text-gray-600 font-medium mb-4">
                  {job.company}
                </p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <div className="flex items-center text-gray-500">
                    <Clock className="h-4 w-4 mr-2" />
                    <span className="text-sm">{job.duration}</span>
                  </div>
                  <div className="text-lg font-bold text-blue-600">
                    {job.salary}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {job.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-lg"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                
                <Link
                  to={`/jobs/${job.id}`}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-semibold text-center block hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/jobs"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
            >
              View All Jobs
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose InternFinder?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We provide the tools and connections you need to succeed in your career journey
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-gradient-to-r from-blue-100 to-purple-100 w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                  <feature.icon className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who have launched their careers with us
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transform hover:scale-105 transition-all duration-200"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center px-8 py-4 bg-transparent text-white font-semibold rounded-lg border-2 border-white hover:bg-white hover:text-blue-600 transition-all duration-200"
            >
              Explore Opportunities
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;