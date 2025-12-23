import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import Sidebar from './Sidebar'
import Header from './Header'
import Footer from './Footer'
import FloatingChatbot from '../UI/FloatingChatbot'
import { SidebarProvider, useSidebar } from './SidebarContext'

/* ==========================================
   LAYOUT WRAPPER (inner component)
   Uses sidebar context for dynamic margin
   ========================================== */
const LayoutContent = () => {
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)
  const { isCollapsed } = useSidebar()

  // Pages where we hide sidebar (auth pages)
  const noSidebarPages = ['/login', '/register']
  const showSidebar = !noSidebarPages.includes(location.pathname)

  return (
    <div className="min-h-screen bg-[#0F1220] flex">
      {/* Sidebar */}
      {showSidebar && <Sidebar />}

      {/* Main Content Area */}
      <div
        className={`flex flex-col flex-1 transition-all duration-300 ${showSidebar ? (isCollapsed ? 'ml-20' : 'ml-[260px]') : ''
          }`}
      >
        {/* Header */}
        {showSidebar && <Header />}

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>

        {/* Footer */}
        {showSidebar && <Footer />}
      </div>

      {/* Floating AI Chatbot */}
      <FloatingChatbot />
    </div>
  )
}

/* ==========================================
   LAYOUT COMPONENT
   Provides sidebar context to children
   ========================================== */
const Layout = () => {
  return (
    <SidebarProvider>
      <LayoutContent />
    </SidebarProvider>
  )
}

export default Layout
