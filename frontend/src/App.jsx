import React, { useEffect, lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Helmet } from "react-helmet-async";

// Components - Always loaded (small, needed for layout)
import Layout from "./components/Layout/Layout";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import LoadingSpinner from "./components/UI/LoadingSpinner";
import { DashboardSkeleton } from "./components/UI/Skeleton";

// ===== EAGER LOADED PAGES (Critical path) =====
// These load immediately - needed for first paint
import Home from "./pages/Home/Home";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import NotFound from "./pages/NotFound/NotFound";

// ===== LAZY LOADED PAGES (Code splitting) =====
// These load on-demand to reduce initial bundle size
const InternshipList = lazy(() => import("./pages/Internships/InternshipList"));
const InternshipDetail = lazy(
  () => import("./pages/Internships/InternshipDetail"),
);
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const Applications = lazy(() => import("./pages/Applications/Applications"));
const ApplicationDetail = lazy(
  () => import("./pages/Applications/ApplicationDetail"),
);
const CreateInternship = lazy(
  () => import("./pages/Internships/CreateInternship"),
);
const EditInternship = lazy(() => import("./pages/Internships/EditInternship"));
const CompanyDashboard = lazy(() => import("./pages/Company/CompanyDashboard"));
const ApplicationManagement = lazy(
  () => import("./pages/Company/ApplicationManagement"),
);
const CompanyRegistration = lazy(
  () => import("./pages/Company/CompanyRegistration"),
);
const PostInternship = lazy(() => import("./pages/Company/PostInternship"));
const AdminDashboard = lazy(() => import("./pages/Admin/AdminDashboard"));
const WishlistPage = lazy(() => import("./components/Wishlist/WishlistPage"));
const AIDashboard = lazy(() => import("./pages/AI/AIDashboard"));
const Messages = lazy(() => import("./pages/Messages/Messages"));

// Redux actions
import { getMe, setInitialized, clearAuth } from "./store/slices/authSlice";
// Socket hook
import useSocket from "./hooks/useSocket";

// Page loading fallback component
const PageSkeleton = () => (
  <div className="p-6">
    <DashboardSkeleton />
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { user, token, isLoading, isInitialized } = useSelector(
    (state) => state.auth,
  );

  // Initialize socket connection
  useSocket(token);

  useEffect(() => {
    // Initialize auth state on app load
    if (!isInitialized) {
      if (token && !user) {
        dispatch(getMe())
          .unwrap()
          .catch(() => {
            dispatch(clearAuth());
          })
          .finally(() => {
            dispatch(setInitialized());
          });
      } else {
        dispatch(setInitialized());
      }
    }
  }, [dispatch, token, user, isInitialized]);

  if (!isInitialized || (token && !user && isLoading)) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Helmet>
        <title>InternQuest - Find Your Dream Internship</title>
        <meta
          name="description"
          content="Connect with top companies and find amazing internship opportunities. Build your career with InternQuest."
        />
      </Helmet>

      {/* Suspense boundary for lazy-loaded routes */}
      <Suspense fallback={<PageSkeleton />}>
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
              element={
                user ? <Navigate to="/dashboard" replace /> : <Register />
              }
            />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              {/* Common Protected Routes */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="applications" element={<Applications />} />
              <Route path="applications/:id" element={<ApplicationDetail />} />
              <Route path="ai" element={<AIDashboard />} />

              {/* Student Routes */}
              <Route element={<ProtectedRoute allowedRoles={["student"]} />}>
                <Route path="wishlist" element={<WishlistPage />} />
              </Route>

              {/* Messages Routes (accessible to all authenticated users) */}
              <Route path="messages" element={<Messages />} />

              {/* Company Routes */}
              <Route element={<ProtectedRoute allowedRoles={["company"]} />}>
                <Route
                  path="company/dashboard"
                  element={<CompanyDashboard />}
                />
                <Route
                  path="company/applications"
                  element={<ApplicationManagement />}
                />
                <Route
                  path="company/register"
                  element={<CompanyRegistration />}
                />
                <Route path="internships/create" element={<PostInternship />} />
                <Route
                  path="internships/edit/:id"
                  element={<EditInternship />}
                />
              </Route>

              {/* Admin Routes */}
              <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                <Route path="admin" element={<AdminDashboard />} />
              </Route>
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
