import React, { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Helmet } from 'react-helmet-async'

// Components
import Layout from './components/Layout/Layout'
import ProtectedRoute from './components/Auth/ProtectedRoute'
import LoadingSpinner from './components/UI/LoadingSpinner'

// Pages
import Home from './pages/Home/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import InternshipList from './pages/Internships/InternshipList'
import InternshipDetail from './pages/Internships/InternshipDetail'
import Dashboard from './pages/Dashboard/Dashboard'
import Profile from './pages/Profile/Profile'
import Applications from './pages/Applications/Applications'
import ApplicationDetail from './pages/Applications/ApplicationDetail'
import CreateInternship from './pages/Internships/CreateInternship'
import EditInternship from './pages/Internships/EditInternship'
import CompanyDashboard from './pages/Company/CompanyDashboard'
import AdminDashboard from './pages/Admin/AdminDashboard'
import NotFound from './pages/NotFound/NotFound'
import WishlistPage from './components/Wishlist/WishlistPage'

// Redux actions
import { getMe, setInitialized, clearAuth } from './store/slices/authSlice'
// Socket hook
import useSocket from './hooks/useSocket'

function App() {
  const dispatch = useDispatch()
  const { user, token, isLoading, isInitialized } = useSelector((state) => state.auth)
  
  // Initialize socket connection
  useSocket()

  useEffect(() => {
    // Initialize auth state on app load
    if (!isInitialized) {
      if (token && !user) {
        dispatch(getMe())
          .unwrap()
          .catch(() => {
            dispatch(clearAuth())
          })
          .finally(() => {
            dispatch(setInitialized())
          })
      } else {
        dispatch(setInitialized())
      }
    }
  }, [dispatch, token, user, isInitialized])

  if (!isInitialized || (token && !user && isLoading)) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Helmet>
        <title>Internship Finder - Find Your Dream Internship</title>
        <meta name="description" content="Connect with top companies and find amazing internship opportunities. Build your career with Internship Finder." />
      </Helmet>

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="internships" element={<InternshipList />} />
          <Route path="internships/:id" element={<InternshipDetail />} />
          
          {/* Auth Routes - Redirect if already logged in */}
          <Route 
            path="login" 
            element={user ? <Navigate to="/dashboard" replace /> : <Login />} 
          />
          <Route 
            path="register" 
            element={user ? <Navigate to="/dashboard" replace /> : <Register />} 
          />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            {/* Common Protected Routes */}
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profile" element={<Profile />} />
            <Route path="applications" element={<Applications />} />
            <Route path="applications/:id" element={<ApplicationDetail />} />

            {/* Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="wishlist" element={<WishlistPage />} />
            </Route>

            {/* Company Routes */}
            <Route element={<ProtectedRoute allowedRoles={['company']} />}>
              <Route path="company" element={<CompanyDashboard />} />
              <Route path="internships/create" element={<CreateInternship />} />
              <Route path="internships/edit/:id" element={<EditInternship />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </>
  )
}

export default App
