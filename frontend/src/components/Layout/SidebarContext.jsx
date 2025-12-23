import React, { createContext, useContext, useState } from 'react'

// Context for sidebar collapsed state
const SidebarContext = createContext({
    isCollapsed: false,
    setIsCollapsed: () => { },
})

export const SidebarProvider = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            {children}
        </SidebarContext.Provider>
    )
}

export const useSidebar = () => useContext(SidebarContext)

export default SidebarContext
