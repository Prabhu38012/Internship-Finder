import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import FloatingChatbot from '../UI/FloatingChatbot'

const Layout = () => {
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  
  // Pages where we show sidebar (not on auth pages)
  const noSidebarPages = ['/login', '/register']
  const showSidebar = !noSidebarPages.includes(location.pathname)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}
      
      {/* Main Content Area */}
      <div className={`flex flex-col flex-1 ${showSidebar ? 'ml-72' : ''}`}>
        {/* Compact Header - only show on pages with sidebar */}
        {showSidebar && (
          <div className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-40 shadow-sm">
            <div className="px-8 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 max-w-xl">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search internships, companies..."
                      className="w-full px-4 py-2 pl-10 bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                    />
                    <svg
                      className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center gap-4 ml-6">
                  <button className="p-2 hover:bg-purple-100 rounded-full transition-colors">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
        
        {/* Footer - only show if not on auth pages */}
        {!noSidebarPages.includes(location.pathname) && <Footer />}
      </div>
      
      {/* Floating AI Chatbot */}
      <FloatingChatbot />
    </div>
  )
}

export default Layout
