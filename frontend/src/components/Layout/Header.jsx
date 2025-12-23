import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Search, Bell, MessageSquare, User, Menu, X } from 'lucide-react'
import { logout } from '../../store/slices/authSlice'
import NotificationCenter from '../Notifications/NotificationCenter'
import NotificationBell from '../Notifications/NotificationBell'

const Header = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/internships?search=${encodeURIComponent(searchQuery)}`)
    }
  }

  return (
    <header className="sticky top-0 z-40 bg-dark-800/90 backdrop-blur-xl border-b border-dark-600">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl">
            <div className="search-bar">
              <Search className="w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search for internships, companies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500"
              />
            </div>
          </form>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Messages */}
                <Link
                  to="/messages"
                  className="p-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-dark-700 transition-all"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                {/* Notifications */}
                <NotificationBell
                  onOpenCenter={() => setNotificationCenterOpen(true)}
                  onNavigate={navigate}
                />

                {/* Profile */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-dark-700 transition-all"
                  >
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-8 h-8 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-semibold">
                        {user.name?.charAt(0)?.toUpperCase()}
                      </div>
                    )}
                  </button>

                  {/* Profile Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 top-12 w-48 bg-dark-700 border border-dark-500 rounded-xl shadow-xl py-2 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-600 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Profile
                      </Link>
                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-gray-300 hover:text-white hover:bg-dark-600 transition-colors"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <hr className="my-2 border-dark-500" />
                      <button
                        onClick={() => {
                          dispatch(logout())
                          setShowProfileMenu(false)
                          navigate('/')
                        }}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white font-medium transition-colors"
                >
                  SIGN IN
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-lg transition-colors"
                >
                  REGISTER
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Notification Center Drawer */}
      <NotificationCenter
        open={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        onNavigate={navigate}
      />
    </header>
  )
}

export default Header
