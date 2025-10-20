import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'
import {
  Briefcase,
  Building2,
  Users,
  TrendingUp,
  Search,
  Send,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Heart,
  Clock
} from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const features = [
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find internships that match your skills, interests, and career goals with our advanced filtering system.',
      gradient: 'from-purple-400 to-pink-400'
    },
    {
      icon: Send,
      title: 'Easy Application',
      description: 'Apply to multiple internships with just a few clicks. Track your applications in one place.',
      gradient: 'from-pink-400 to-rose-400'
    },
    {
      icon: CheckCircle,
      title: 'Verified Companies',
      description: 'Connect with legitimate companies that are verified by our team for your safety and security.',
      gradient: 'from-blue-400 to-cyan-400'
    }
  ]

  const stats = [
    { icon: Briefcase, value: '10,000+', label: 'Active Internships', color: 'purple' },
    { icon: Building2, value: '5,000+', label: 'Companies', color: 'pink' },
    { icon: Users, value: '100,000+', label: 'Students', color: 'blue' },
    { icon: TrendingUp, value: '95%', label: 'Success Rate', color: 'cyan' }
  ]

  const categories = [
    'Software Development',
    'Data Science',
    'Digital Marketing',
    'UI/UX Design',
    'Business Development',
    'Finance',
    'Content Writing',
    'Graphic Design'
  ]

  const trendingInternships = [
    { title: 'UI/UX Designer', company: 'Google', duration: '3 months', gradient: 'from-purple-500 to-pink-500' },
    { title: 'Full Stack Developer', company: 'Microsoft', duration: '6 months', gradient: 'from-blue-500 to-cyan-500' },
    { title: 'Data Analyst', company: 'Amazon', duration: '4 months', gradient: 'from-pink-500 to-rose-500' },
  ]

  return (
    <>
      <Helmet>
        <title>InternQuest - Find Your Dream Internship</title>
        <meta name="description" content="Connect with top companies and find amazing internship opportunities. Build your career with InternQuest." />
      </Helmet>

      <div className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Hero Banner */}
          <div className="relative bg-gradient-purple rounded-3xl overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-transparent to-pink-600/20"></div>
            <div className="relative px-8 py-12 md:px-12 md:py-16 flex items-center justify-between">
              <div className="flex-1 max-w-xl">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Listen to trending opportunities all the time
                </h1>
                <p className="text-purple-100 mb-6 text-lg">
                  With InternQuest, you can get premium internships that match your skills and aspirations
                </p>
                <Link
                  to="/internships"
                  className="inline-flex items-center gap-2 bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-purple-50 transition-colors shadow-lg"
                >
                  Explore Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="hidden md:block">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80"
                  alt="Professional"
                  className="w-64 h-64 rounded-2xl object-cover shadow-2xl"
                />
              </div>
            </div>
          </div>

          {/* Playlists / Categories */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Top Categories</h2>
              <Link to="/internships" className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
                See More
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.slice(0, 4).map((category, index) => {
                const gradients = ['from-purple-400 to-purple-600', 'from-pink-400 to-pink-600', 'from-rose-400 to-rose-600', 'from-blue-400 to-blue-600']
                return (
                  <button
                    key={index}
                    onClick={() => navigate(`/internships?category=${encodeURIComponent(category)}`)}
                    className={`relative h-40 bg-gradient-to-br ${gradients[index % 4]} rounded-2xl p-4 flex flex-col justify-between overflow-hidden group hover:scale-105 transition-transform shadow-lg`}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors"></div>
                    <div className="relative">
                      <Briefcase className="w-8 h-8 text-white/80" />
                    </div>
                    <div className="relative">
                      <h3 className="text-white font-bold">{category}</h3>
                      <p className="text-white/80 text-sm">Explore roles</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column - Trending */}
            <div className="md:col-span-2 space-y-6">
              {/* Trending Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-800">Trending Internships</h2>
                  <Link to="/internships" className="text-purple-600 hover:text-purple-700 font-semibold flex items-center gap-1">
                    See More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
                  {trendingInternships.map((internship, index) => (
                    <Link
                      key={index}
                      to="/internships"
                      className="flex items-center gap-4 p-4 hover:bg-purple-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <span className="text-gray-400 font-semibold w-8">{String(index + 1).padStart(2, '0')}</span>
                      <div className={`w-12 h-12 bg-gradient-to-br ${internship.gradient} rounded-lg flex items-center justify-center shadow-md`}>
                        <Briefcase className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-800">{internship.title}</h4>
                        <p className="text-sm text-gray-500">{internship.company}</p>
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {internship.duration}
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => {
                  const Icon = stat.icon
                  const colorMap = {
                    purple: 'from-purple-500 to-purple-600',
                    pink: 'from-pink-500 to-pink-600',
                    blue: 'from-blue-500 to-blue-600',
                    cyan: 'from-cyan-500 to-cyan-600'
                  }
                  return (
                    <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className={`w-12 h-12 bg-gradient-to-br ${colorMap[stat.color]} rounded-xl flex items-center justify-center mb-3 shadow-md`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">{stat.value}</h3>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Right Column - Featured Card */}
            <div className="md:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Featured Internship */}
                <div className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                  {/* Decorative elements */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/20 rounded-full -ml-12 -mb-12"></div>
                  
                  <div className="relative">
                    <div className="mb-4">
                      <img
                        src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=200&q=80"
                        alt="Featured"
                        className="w-full h-40 object-cover rounded-2xl shadow-xl"
                      />
                    </div>
                    
                    <div className="mb-3">
                      <span className="text-xs font-semibold text-purple-200 uppercase tracking-wide">Featured Opportunity</span>
                      <h3 className="text-xl font-bold text-white mt-1">Software Development Intern</h3>
                      <p className="text-purple-200 text-sm">Google • Remote</p>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Clock className="w-4 h-4" />
                        <span>6 months</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Briefcase className="w-4 h-4" />
                        <span>Full-time</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-white">
                        <Sparkles className="w-4 h-4" />
                        <span>₹50,000/month</span>
                      </div>
                    </div>

                    <Link
                      to="/internships"
                      className="block w-full bg-white text-purple-600 text-center py-3 rounded-xl font-semibold hover:bg-purple-50 transition-colors shadow-lg"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <Link
                      to="/internships"
                      className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                    >
                      <div className="w-10 h-10 bg-gradient-purple rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Search className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">Find Internships</p>
                        <p className="text-xs text-gray-500">Browse 10,000+ opportunities</p>
                      </div>
                    </Link>
                    
                    {user ? (
                      <Link
                        to="/ai"
                        className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">AI Assistant</p>
                          <p className="text-xs text-gray-500">Get personalized help</p>
                        </div>
                      </Link>
                    ) : (
                      <Link
                        to="/register"
                        className="flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors group"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                          <ArrowRight className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800">Get Started</p>
                          <p className="text-xs text-gray-500">Create your account</p>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Why Choose InternQuest?</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{feature.title}</h3>
                    <p className="text-gray-600">{feature.description}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* CTA Section */}
          {!user && (
            <div className="bg-gradient-to-br from-purple-600 via-purple-700 to-pink-600 rounded-3xl p-12 text-center shadow-2xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
              <div className="relative">
                <h2 className="text-4xl font-bold text-white mb-4">Ready to Start Your Journey?</h2>
                <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of students who have found their dream internships through our platform
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link
                    to="/register"
                    className="bg-white text-purple-600 px-8 py-4 rounded-full font-bold hover:bg-purple-50 transition-colors shadow-xl hover:scale-105 transform"
                  >
                    Sign Up Now
                  </Link>
                  <Link
                    to="/internships"
                    className="bg-purple-800 text-white px-8 py-4 rounded-full font-bold hover:bg-purple-900 transition-colors border-2 border-white/30 hover:scale-105 transform"
                  >
                    Browse Internships
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Home
