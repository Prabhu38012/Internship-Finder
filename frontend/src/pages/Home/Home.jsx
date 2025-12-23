import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";
import {
  Briefcase,
  Building2,
  Users,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Clock,
  MapPin,
  Star,
  ChevronRight,
} from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const featuredInternships = [
    {
      id: 1,
      title: "UI/UX Designer Intern",
      company: "Google",
      location: "Remote",
      duration: "3 months",
      image:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop",
      featured: true,
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "Microsoft",
      location: "Bangalore",
      duration: "6 months",
      image:
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=250&fit=crop",
      featured: false,
    },
    {
      id: 3,
      title: "Data Science Intern",
      company: "Amazon",
      location: "Hyderabad",
      duration: "4 months",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop",
      featured: true,
    },
    {
      id: 4,
      title: "Product Management",
      company: "Meta",
      location: "Remote",
      duration: "3 months",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=250&fit=crop",
      featured: false,
    },
  ];

  const stats = [
    { icon: Briefcase, value: "10,000+", label: "Active Internships" },
    { icon: Building2, value: "5,000+", label: "Companies" },
    { icon: Users, value: "100,000+", label: "Students" },
    { icon: TrendingUp, value: "95%", label: "Success Rate" },
  ];

  return (
    <>
      <Helmet>
        <title>InternQuest - Find Your Dream Internship</title>
        <meta
          name="description"
          content="Connect with top companies and find amazing internship opportunities. Build your career with InternQuest."
        />
      </Helmet>

      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero Banner */}
          <div className="relative bg-gradient-to-r from-dark-700 via-dark-700 to-dark-800 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent" />
            <div className="relative flex flex-col md:flex-row items-center">
              <div className="flex-1 p-8 md:p-12">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                  Get Your Due
                </h1>
                <p className="text-gray-400 text-lg mb-6 max-w-md">
                  Join the community of over 45K+ students and take your career
                  to millions of opportunities.
                </p>
                <Link
                  to={user ? "/internships" : "/register"}
                  className="inline-flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-primary-500/20"
                >
                  {user ? "Explore Now" : "Join now"}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <div className="hidden md:block w-80 h-64 m-8">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop"
                  alt="Team collaboration"
                  className="w-full h-full object-cover rounded-2xl"
                />
              </div>
            </div>
          </div>

          {/* Upcoming Opportunities Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">
                Upcoming Opportunities
              </h2>
              <Link
                to="/internships"
                className="flex items-center gap-1 text-gray-400 hover:text-primary-400 font-medium transition-colors"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Internship Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {featuredInternships.map((internship) => (
                <Link
                  key={internship.id}
                  to="/internships"
                  className="group dark-card dark-card-hover overflow-hidden"
                >
                  {/* Card Image */}
                  <div className="relative -mx-6 -mt-6 mb-4">
                    <img
                      src={internship.image}
                      alt={internship.title}
                      className="w-full h-36 object-cover"
                    />
                    {/* Favorite Button */}
                    <button className="absolute top-3 right-3 p-2 rounded-full bg-dark-800/80 text-gray-400 hover:text-yellow-400 transition-colors">
                      <Star
                        className={`w-4 h-4 ${internship.featured ? "fill-yellow-400 text-yellow-400" : ""}`}
                      />
                    </button>
                  </div>

                  {/* Card Content */}
                  <div>
                    <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors mb-1">
                      {internship.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {internship.company}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {internship.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {internship.duration}
                      </div>
                    </div>
                  </div>

                  {/* Arrow on hover */}
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-5 h-5 text-primary-400" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="dark-card text-center">
                  <div className="w-12 h-12 bg-primary-500/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-primary-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    {stat.value}
                  </h3>
                  <p className="text-sm text-gray-400">{stat.label}</p>
                </div>
              );
            })}
          </div>

          {/* Features Section */}
          <div className="grid md:grid-cols-3 gap-5">
            <div className="dark-card">
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                <Briefcase className="w-7 h-7 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Smart Search
              </h3>
              <p className="text-gray-400">
                Find internships that match your skills, interests, and career
                goals with our advanced filtering.
              </p>
            </div>
            <div className="dark-card">
              <div className="w-14 h-14 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                Easy Application
              </h3>
              <p className="text-gray-400">
                Apply to multiple internships with just a few clicks. Track your
                applications in one place.
              </p>
            </div>
            <div className="dark-card">
              <div className="w-14 h-14 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                AI Assistant
              </h3>
              <p className="text-gray-400">
                Get personalized recommendations and career guidance from our
                AI-powered assistant.
              </p>
            </div>
          </div>

          {/* CTA Section */}
          {!user && (
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2240%22%20height%3D%2240%22%20viewBox%3D%220%200%2040%2040%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2220%22%20cy%3D%2220%22%20r%3D%221%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
              <div className="relative">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Ready to Start Your Journey?
                </h2>
                <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
                  Join thousands of students who have found their dream
                  internships through our platform
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-xl"
                  >
                    Sign Up Now
                  </Link>
                  <Link
                    to="/internships"
                    className="bg-primary-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-900 transition-colors border border-white/20"
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
  );
};

export default Home;
