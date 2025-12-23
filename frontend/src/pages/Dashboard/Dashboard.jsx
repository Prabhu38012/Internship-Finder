import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { format } from 'date-fns'
import toast from 'react-hot-toast'
import {
  Briefcase,
  Users,
  Eye,
  FileText,
  Plus,
  TrendingUp,
  Building2,
  Clock,
  MapPin,
  Edit,
  Trash2,
  MoreVertical,
  CheckCircle
} from 'lucide-react'

/* ==========================================
   REDUX IMPORTS
   ========================================== */
import { getMyApplications, getCompanyApplications } from '../../store/slices/applicationSlice'
import { getMyInternships, deleteInternship } from '../../store/slices/internshipSlice'
import userService from '../../services/userService'
import useSocket from '../../hooks/useSocket'

/* ==========================================
   REUSABLE COMPONENT IMPORTS
   ========================================== */
import { KPICard, QuickActionButton, ActivityFeed } from '../../components/Dashboard'

/* ==========================================
   INTERNQUEST – COMPANY DASHBOARD
   
   Tech Stack: React 18, Vite, Tailwind CSS
   
   Layout:
   - Fixed left sidebar (260px) - handled by Layout.jsx
   - Main content with padding and responsive grid
   - Two-column dashboard: Left 70% / Right 30%
   
   Design System:
   - Background: bg-slate-900 / bg-[#0F1220]
   - Cards: bg-slate-800
   - Accent: text-blue-500, bg-blue-600
   - Rounded: rounded-xl
   - Shadows: shadow-md
   ========================================== */

const Dashboard = () => {
  /* ==========================================
     STATE & HOOKS
     ========================================== */
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Redux state
  const { user } = useSelector((state) => state.auth)
  const { applications } = useSelector((state) => state.applications)
  const { myInternships } = useSelector((state) => state.internships)
  const { companyApplications } = useSelector((state) => state.applications)

  // Local state
  const [dashboardStats, setDashboardStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState(null)

  // Real-time socket connection
  useSocket()

  /* ==========================================
     DATA FETCHING
     ========================================== */
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)

        // Fetch dashboard stats from API
        const statsResponse = await userService.getDashboardStats(localStorage.getItem('token'))
        setDashboardStats(statsResponse.data)

        // Fetch role-specific data
        if (user?.role === 'student') {
          dispatch(getMyApplications({ limit: 5 }))
        } else if (user?.role === 'company') {
          dispatch(getMyInternships())
          dispatch(getCompanyApplications({ limit: 10 }))
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchDashboardData()
    }
  }, [dispatch, user])

  /* ==========================================
     EVENT HANDLERS
     ========================================== */

  // Handle internship deletion with confirmation
  const handleDelete = (internship) => {
    if (window.confirm(`Are you sure you want to delete "${internship.title}"?`)) {
      dispatch(deleteInternship(internship._id))
        .unwrap()
        .then(() => toast.success('Internship deleted successfully'))
        .catch((error) => toast.error(error || 'Failed to delete internship'))
    }
    setActiveMenu(null)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setActiveMenu(null)
    if (activeMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [activeMenu])

  /* ==========================================
     UTILITY FUNCTIONS
     ========================================== */

  // Status badge styling for internships (active, draft, closed, expired)
  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/20 text-green-400 border-green-500/30',
      draft: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      closed: 'bg-red-500/20 text-red-400 border-red-500/30',
      expired: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
    return styles[status] || styles.active
  }

  // Status badge styling for applications
  const getAppStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400',
      accepted: 'bg-green-500/20 text-green-400',
      rejected: 'bg-red-500/20 text-red-400',
      reviewing: 'bg-blue-500/20 text-blue-400',
      shortlisted: 'bg-purple-500/20 text-purple-400'
    }
    return styles[status] || styles.pending
  }

  /* ==========================================
     LOADING STATE
     ========================================== */
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F1220] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  /* ==========================================
     COMPANY DASHBOARD VIEW
     Two-column layout: 70% left / 30% right
     ========================================== */
  if (user?.role === 'company') {
    // Calculate KPI values
    const activeInternships = myInternships?.filter(i => i.status === 'active') || []
    const totalApplications = myInternships?.reduce((sum, i) => sum + (i.applicationsCount || 0), 0) || 0
    const pendingApplications = companyApplications?.filter(a => a.status === 'pending').length || 0
    const totalViews = myInternships?.reduce((sum, i) => sum + (i.views || 0), 0) || 0

    return (
      <>
        <Helmet>
          <title>Company Dashboard - InternQuest</title>
          <meta name="description" content="Manage your internship postings and review applications." />
        </Helmet>

        {/* ==========================================
            MAIN CONTAINER
            Background: bg-[#0F1220]
            Padding: p-6
            ========================================== */}
        <div className="min-h-screen bg-[#0F1220] p-6">

          {/* ==========================================
              PAGE HEADER
              Flex layout with title left, CTA right
              ========================================== */}
          <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                Company Dashboard
              </h1>
              <p className="text-slate-400">
                Manage your internship postings and review applications
              </p>
            </div>

            {/* Primary CTA Button */}
            <Link
              to="/internships/create"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-blue-600/25"
            >
              <Plus className="w-5 h-5" />
              Post New Internship
            </Link>
          </header>

          {/* ==========================================
              KPI STATS ROW
              4-column grid, responsive stacking
              ========================================== */}
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <KPICard
              title="Active Internships"
              value={activeInternships.length}
              icon={Briefcase}
              iconBg="bg-blue-600"
            />
            <KPICard
              title="Total Applications"
              value={totalApplications}
              icon={Users}
              iconBg="bg-green-600"
            />
            <KPICard
              title="Pending Review"
              value={pendingApplications}
              icon={Clock}
              iconBg="bg-yellow-600"
            />
            <KPICard
              title="Total Views"
              value={totalViews}
              icon={TrendingUp}
              iconBg="bg-purple-600"
            />
          </section>

          {/* ==========================================
              TWO-COLUMN LAYOUT
              Left: 70% (8 cols), Right: 30% (4 cols)
              Gap: gap-6
              ========================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ==========================================
                LEFT COLUMN (70%)
                Primary content: Internship management table
                ========================================== */}
            <main className="lg:col-span-8">

              {/* Internship Table Card */}
              <section className="bg-slate-800 rounded-xl shadow-md overflow-hidden">

                {/* Card Header */}
                <div className="flex items-center justify-between p-5 border-b border-slate-700">
                  <h2 className="text-lg font-semibold text-white">
                    Your Internships
                  </h2>
                  <Link
                    to="/internships/create"
                    className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add New
                  </Link>
                </div>

                {/* Table Content */}
                {myInternships?.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      {/* Table Header */}
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Title
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden md:table-cell">
                            Location
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Applications
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                            Posted
                          </th>
                          <th className="px-5 py-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>

                      {/* Table Body */}
                      <tbody className="divide-y divide-slate-700">
                        {myInternships.map((internship) => (
                          <tr
                            key={internship._id}
                            className="hover:bg-slate-700/30 transition-colors"
                          >
                            {/* Title Column */}
                            <td className="px-5 py-4">
                              <div>
                                <p className="font-medium text-white">{internship.title}</p>
                                <p className="text-sm text-slate-400">{internship.category}</p>
                              </div>
                            </td>

                            {/* Location Column (hidden on mobile) */}
                            <td className="px-5 py-4 hidden md:table-cell">
                              <div className="flex items-center gap-2 text-slate-300">
                                <MapPin className="w-4 h-4 text-slate-500 flex-shrink-0" />
                                <span className="truncate">
                                  {internship.location?.type === 'remote'
                                    ? 'Remote'
                                    : internship.location?.city || 'Not specified'}
                                </span>
                              </div>
                            </td>

                            {/* Applications Count */}
                            <td className="px-5 py-4">
                              <span className="font-medium text-white">
                                {internship.applicationsCount || 0}
                              </span>
                            </td>

                            {/* Status Badge */}
                            <td className="px-5 py-4">
                              <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusBadge(internship.status || 'active')}`}>
                                {internship.status || 'active'}
                              </span>
                            </td>

                            {/* Posted Date (hidden on small screens) */}
                            <td className="px-5 py-4 hidden sm:table-cell">
                              <span className="text-slate-300 text-sm">
                                {format(new Date(internship.createdAt), 'MMM dd')}
                              </span>
                            </td>

                            {/* Actions Column */}
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-1 relative">
                                {/* View Button */}
                                <Link
                                  to={`/internships/${internship._id}`}
                                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </Link>

                                {/* More Actions Dropdown */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setActiveMenu(activeMenu === internship._id ? null : internship._id)
                                  }}
                                  className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-lg transition-colors"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>

                                {/* Dropdown Menu */}
                                {activeMenu === internship._id && (
                                  <div
                                    className="absolute right-0 top-full mt-1 w-36 bg-slate-700 rounded-xl shadow-xl border border-slate-600 z-20 overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      onClick={() => {
                                        navigate(`/internships/edit/${internship._id}`)
                                        setActiveMenu(null)
                                      }}
                                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-600 transition-colors"
                                    >
                                      <Edit className="w-4 h-4" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={() => handleDelete(internship)}
                                      className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-slate-600 transition-colors"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                      Delete
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  /* Empty State */
                  <div className="text-center py-16">
                    <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-white mb-2">
                      No internships posted yet
                    </h3>
                    <p className="text-slate-400 mb-6">
                      Start attracting talent by posting your first internship
                    </p>
                    <Link
                      to="/internships/create"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                      Post Your First Internship
                    </Link>
                  </div>
                )}
              </section>
            </main>

            {/* ==========================================
                RIGHT COLUMN (30%)
                Secondary widgets: Live Activity + Quick Actions
                ========================================== */}
            <aside className="lg:col-span-4 space-y-6">

              {/* ==========================================
                  LIVE ACTIVITY FEED
                  Real-time updates for company
                  ========================================== */}
              <ActivityFeed companyId={user?._id} maxItems={8} />

              {/* ==========================================
                  QUICK ACTIONS WIDGET
                  ========================================== */}
              <section className="bg-slate-800 rounded-xl p-5 shadow-md">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <QuickActionButton
                    to="/internships/create"
                    icon={Plus}
                    label="Post New Internship"
                    variant="primary"
                  />
                  <QuickActionButton
                    to="/company/applications"
                    icon={FileText}
                    label="Review Applications"
                    variant="outline"
                  />
                  <QuickActionButton
                    to="/profile"
                    icon={Building2}
                    label="Update Company Profile"
                    variant="outline"
                  />
                </div>
              </section>
            </aside>
          </div>
        </div>
      </>
    )
  }

  /* ==========================================
     STUDENT DASHBOARD VIEW
     Similar two-column layout for students
     ========================================== */
  return (
    <>
      <Helmet>
        <title>Dashboard - InternQuest</title>
        <meta name="description" content="View your internship applications and saved opportunities." />
      </Helmet>

      <div className="min-h-screen bg-[#0F1220] p-6">

        {/* Page Header */}
        <header className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-slate-400">
            Track your applications and discover new opportunities
          </p>
        </header>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* LEFT COLUMN (70%) */}
          <main className="lg:col-span-8 space-y-6">

            {/* Quick Actions */}
            <section className="bg-slate-800 rounded-xl p-6 shadow-md">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <QuickActionButton
                  to="/internships"
                  icon={Briefcase}
                  label="Browse Internships"
                  variant="primary"
                />
                <QuickActionButton
                  to="/applications"
                  icon={FileText}
                  label="My Applications"
                  variant="outline"
                />
                <QuickActionButton
                  to="/wishlist"
                  icon={CheckCircle}
                  label="Saved Internships"
                  variant="outline"
                />
              </div>
            </section>

            {/* Recent Applications */}
            <section className="bg-slate-800 rounded-xl p-6 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
                <Link to="/applications" className="text-sm text-blue-400 hover:text-blue-300">
                  View All →
                </Link>
              </div>

              <div className="space-y-4">
                {applications?.slice(0, 5).map((app) => (
                  <div key={app._id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-xl hover:bg-slate-700 transition-colors">
                    <div>
                      <p className="font-medium text-white">{app.internship?.title}</p>
                      <p className="text-sm text-slate-400">{app.internship?.company?.name}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getAppStatusBadge(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                ))}

                {(!applications || applications.length === 0) && (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400 mb-2">No applications yet</p>
                    <Link to="/internships" className="text-blue-400 hover:text-blue-300 font-medium">
                      Browse internships →
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </main>

          {/* RIGHT COLUMN (30%) */}
          <aside className="lg:col-span-4 space-y-6">

            {/* KPI Cards */}
            <KPICard
              title="Applications Sent"
              value={dashboardStats?.applicationsCount || applications?.length || 0}
              icon={FileText}
              iconBg="bg-blue-600"
            />
            <KPICard
              title="Under Review"
              value={applications?.filter(a => a.status === 'reviewing').length || 0}
              icon={Clock}
              iconBg="bg-yellow-600"
            />
            <KPICard
              title="Accepted"
              value={applications?.filter(a => a.status === 'accepted').length || 0}
              icon={CheckCircle}
              iconBg="bg-green-600"
            />

            {/* Profile Completion Widget */}
            <section className="bg-slate-800 rounded-xl p-5 shadow-md">
              <h3 className="font-semibold text-white mb-3">Profile Completion</h3>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Progress</span>
                  <span className="text-white font-medium">
                    {dashboardStats?.profileCompletion || 60}%
                  </span>
                </div>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${dashboardStats?.profileCompletion || 60}%` }}
                  />
                </div>
              </div>
              <Link to="/profile" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Complete your profile →
              </Link>
            </section>
          </aside>
        </div>
      </div>
    </>
  )
}

export default Dashboard
