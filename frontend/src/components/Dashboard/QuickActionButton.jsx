import React from 'react'
import { Link } from 'react-router-dom'

/**
 * QuickActionButton - Styled button for dashboard quick actions
 * @param {string} to - React Router link path
 * @param {React.Component} icon - Lucide icon component
 * @param {string} label - Button label text
 * @param {string} variant - 'primary' | 'secondary' | 'outline'
 */
const QuickActionButton = ({ to, icon: Icon, label, variant = 'outline' }) => {
    const baseStyles = 'flex items-center gap-3 w-full px-4 py-3 rounded-xl font-medium transition-all duration-200 border'

    const variantStyles = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 shadow-md hover:shadow-lg',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600 hover:border-slate-500',
        outline: 'bg-transparent hover:bg-slate-700/50 text-slate-300 hover:text-white border-slate-600 hover:border-slate-500',
    }

    return (
        <Link to={to} className={`${baseStyles} ${variantStyles[variant]}`}>
            {Icon && <Icon className="w-5 h-5" />}
            <span>{label}</span>
        </Link>
    )
}

export default QuickActionButton
