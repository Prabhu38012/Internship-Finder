import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Compass,
  LayoutDashboard,
  FileText,
  Heart,
  Bot,
  User,
  LogOut,
  Briefcase,
  Building2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { logout } from "../../store/slices/authSlice";
import { useSidebar } from "./SidebarContext";

/* ==========================================
   SIDEBAR COMPONENT
   - Fixed left navigation (260px expanded, 80px collapsed)
   - Responsive collapse on tablet
   - Active state indicators
   ========================================== */

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Use shared sidebar context for collapse state
  const { isCollapsed, setIsCollapsed } = useSidebar();

  const isActive = (path) => {
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  // Navigation items based on user role
  const getNavItems = () => {
    const commonItems = [
      { icon: Compass, label: "Discover", path: "/internships" },
    ];

    if (!user) {
      return commonItems;
    }

    if (user.role === "student") {
      return [
        ...commonItems,
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        { icon: FileText, label: "Applications", path: "/applications" },
        { icon: Heart, label: "Wishlist", path: "/wishlist" },
        { icon: Bot, label: "AI Assistant", path: "/ai" },
      ];
    }

    if (user.role === "company") {
      return [
        ...commonItems,
        { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
        {
          icon: FileText,
          label: "Applications",
          path: "/company/applications",
        },
      ];
    }

    if (user.role === "admin") {
      return [
        ...commonItems,
        { icon: LayoutDashboard, label: "Admin Panel", path: "/admin" },
        { icon: Building2, label: "Companies", path: "/admin/companies" },
        { icon: User, label: "Users", path: "/admin/users" },
      ];
    }

    return commonItems;
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-slate-900 border-r border-slate-700/50 flex flex-col z-50 transition-all duration-300 ${isCollapsed ? "w-20" : "w-[260px]"
        }`}
    >
      {/* Logo Section */}
      <div className={`p-4 ${isCollapsed ? "px-4" : "p-6"}`}>
        <Link to="/" className="flex items-center gap-3">
          {/* APEX-style Diamond Logo with arrows */}
          <div className="flex-shrink-0 relative">
            <svg
              width={isCollapsed ? "40" : "44"}
              height={isCollapsed ? "40" : "44"}
              viewBox="0 0 100 100"
              fill="none"
            >
              {/* Diamond Shape */}
              <path
                d="M50 5 L95 50 L50 95 L5 50 Z"
                stroke="url(#diamondGradient)"
                strokeWidth="4"
                fill="none"
              />

              {/* Three Arrows */}
              {/* Left Arrow */}
              <path
                d="M30 60 L30 35 L22 43 M30 35 L38 43"
                stroke="url(#arrowGradient1)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Center Arrow (taller) */}
              <path
                d="M50 68 L50 25 L40 37 M50 25 L60 37"
                stroke="url(#arrowGradient2)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Right Arrow */}
              <path
                d="M70 60 L70 35 L62 43 M70 35 L78 43"
                stroke="url(#arrowGradient1)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="diamondGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
                <linearGradient id="arrowGradient1" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#c4b5fd" />
                </linearGradient>
                <linearGradient id="arrowGradient2" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a855f7" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-wide" style={{ color: '#7c3aed' }}>
              INTERN<span style={{ color: '#a855f7' }}>QUEST</span>
            </span>
          )}
        </Link>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-slate-800 border border-slate-600 rounded-full items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors z-50"
        title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isCollapsed ? "justify-center px-3" : ""
                } ${active
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && (
                <span className="font-medium">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div
        className={`p-3 border-t border-slate-700/50 space-y-2 ${isCollapsed ? "px-2" : "p-4"}`}
      >
        {user ? (
          <>
            {/* Post Internship Button (for companies) */}
            {user.role === "company" && (
              <Link
                to="/internships/create"
                className={`flex items-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium ${isCollapsed ? "justify-center px-2" : "justify-center px-4"
                  }`}
                title={isCollapsed ? "Post Internship" : undefined}
              >
                <Plus className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && <span>Post Internship</span>}
              </Link>
            )}

            {/* Profile Link */}
            <Link
              to="/profile"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isCollapsed ? "justify-center px-3" : ""
                } ${isActive("/profile")
                  ? "bg-blue-600/20 text-blue-400"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              title={isCollapsed ? "Profile" : undefined}
            >
              <User className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Profile</span>}
            </Link>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 w-full text-left rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${isCollapsed ? "justify-center px-3" : ""
                }`}
              title={isCollapsed ? "Logout" : undefined}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium">Logout</span>}
            </button>
          </>
        ) : (
          <>
            {!isCollapsed ? (
              <>
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium border border-slate-600"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium"
                >
                  Register
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="flex items-center justify-center w-full p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors"
                title="Sign In"
              >
                <User className="w-5 h-5" />
              </Link>
            )}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
