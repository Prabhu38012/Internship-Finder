import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import {
  Home,
  Search,
  Briefcase,
  Heart,
  MessageSquare,
  LayoutDashboard,
  Building2,
  Sparkles,
  User,
  PlayCircle,
  Pause,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { logout } from '../../store/slices/authSlice'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/')
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const menuItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/internships', label: 'Explore', icon: Search },
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, requireAuth: true },
    { path: '/ai', label: 'AI Assistant', icon: Sparkles, requireAuth: true },
  ]

  const studentItems = [
    { path: '/wishlist', label: 'Wishlist', icon: Heart },
    { path: '/applications', label: 'Applications', icon: Briefcase },
  ]

  const companyItems = [
    { path: '/company/dashboard', label: 'My Company', icon: Building2 },
    { path: '/internships/create', label: 'Post Internship', icon: Briefcase },
  ]

  const libraryItems = [
    { path: '/messages', label: 'Messages', icon: MessageSquare, requireAuth: true },
    { path: '/profile', label: 'My Profile', icon: User, requireAuth: true },
  ]

  const MenuItem = ({ item }) => {
    const Icon = item.icon
    const active = isActive(item.path)

    if (item.requireAuth && !user) return null

    return (
      <Link
        to={item.path}
        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
          active
            ? 'bg-gradient-purple text-white shadow-lg shadow-purple-500/30'
            : 'text-gray-300 hover:bg-purple-900/30 hover:text-white'
        }`}
      >
        <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
        <span className="font-medium">{item.label}</span>
        {active && <ChevronRight className="w-4 h-4 ml-auto" />}
      </Link>
    )
  }

  return (
    <div className="w-72 h-screen bg-gradient-to-b from-purple-darker to-purple-dark text-white flex flex-col fixed left-0 top-0 shadow-2xl">
      {/* Profile Section */}
      <div className="p-6 border-b border-purple-800/30">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-purple flex items-center justify-center shadow-lg">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              <span className="text-xl font-bold">{user?.name?.charAt(0)?.toUpperCase() || 'G'}</span>
            )}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg">{user?.name || 'Guest'}</h3>
            <p className="text-xs text-gray-400 capitalize">{user?.role || 'Visitor'}</p>
          </div>
        </div>
        
        {/* Login/Signup Buttons for Guests */}
        {!user && (
          <div className="mt-4 space-y-2">
            <Link
              to="/login"
              className="block w-full bg-gradient-purple text-white text-center py-2.5 rounded-lg font-semibold hover:shadow-lg transition-all hover:scale-105"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="block w-full bg-white/10 text-white text-center py-2.5 rounded-lg font-semibold hover:bg-white/20 transition-all border border-white/30"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {/* Main Menu */}
        <div>
          <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">Menu</h4>
          <div className="space-y-1">
            {menuItems.map((item) => (
              <MenuItem key={item.path} item={item} />
            ))}
          </div>
        </div>

        {/* Role-specific Menu */}
        {user && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
              {user.role === 'student' ? 'Student' : 'Company'}
            </h4>
            <div className="space-y-1">
              {(user.role === 'student' ? studentItems : companyItems).map((item) => (
                <MenuItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Library */}
        {user && (
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">Library</h4>
            <div className="space-y-1">
              {libraryItems.map((item) => (
                <MenuItem key={item.path} item={item} />
              ))}
            </div>
          </div>
        )}

        {/* Logout Button */}
        {user && (
          <div className="mt-4">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-red-900/30 hover:text-red-400 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick Stats Card (Bottom) */}
      {user && (
        <div className="p-4 border-t border-purple-800/30">
          <div className="bg-gradient-to-br from-purple-900/50 to-purple-800/50 rounded-xl p-4 backdrop-blur-sm">
            <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              {user.role === 'student' ? 'Your Progress' : 'Quick Stats'}
            </h4>
            
            {user.role === 'student' ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-purple-200">Applications</span>
                  <span className="text-white font-semibold">12</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-purple-200">Interviews</span>
                  <span className="text-white font-semibold">3</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-purple-200">Saved</span>
                  <span className="text-white font-semibold">8</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-purple-200">Active Posts</span>
                  <span className="text-white font-semibold">5</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-purple-200">Applicants</span>
                  <span className="text-white font-semibold">48</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-purple-200">Pending</span>
                  <span className="text-white font-semibold">12</span>
                </div>
              </div>
            )}
            
            <Link
              to={user.role === 'student' ? '/applications' : '/company/applications'}
              className="mt-3 block w-full bg-white/10 hover:bg-white/20 text-white text-center py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
