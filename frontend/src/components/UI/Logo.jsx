import React from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp, ArrowUp } from 'lucide-react'

/**
 * Logo Component - APEX Style
 * Used across all pages (Sidebar, Landing, Footer)
 * Features arrow icons pointing up like the APEX logo
 */

const Logo = ({
    collapsed = false,
    size = 'default',
    showText = true,
    className = ''
}) => {
    const sizes = {
        small: {
            container: 'w-8 h-8',
            icon: 'w-4 h-4',
            text: 'text-lg',
            arrows: 'w-3 h-3'
        },
        default: {
            container: 'w-10 h-10',
            icon: 'w-5 h-5',
            text: 'text-xl',
            arrows: 'w-4 h-4'
        },
        large: {
            container: 'w-14 h-14',
            icon: 'w-7 h-7',
            text: 'text-2xl',
            arrows: 'w-5 h-5'
        }
    }

    const s = sizes[size] || sizes.default

    return (
        <div className={`flex items-center gap-3 ${className}`}>
            {/* Logo Icon - APEX Style with arrows */}
            <div className={`${s.container} bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-lg shadow-blue-500/30`}>
                {/* Arrow pattern like APEX */}
                <div className="flex items-end gap-0.5">
                    <ArrowUp className={`${s.arrows} text-blue-200 opacity-70`} strokeWidth={3} />
                    <ArrowUp className={`${s.icon} text-white`} strokeWidth={3} />
                    <ArrowUp className={`${s.arrows} text-blue-200 opacity-70`} strokeWidth={3} />
                </div>
            </div>

            {/* Brand Text */}
            {showText && !collapsed && (
                <span className={`${s.text} font-bold text-white tracking-tight`}>
                    Intern<span className="text-blue-400">Quest</span>
                </span>
            )}
        </div>
    )
}

// Wrapped with Link for navigation
export const LogoLink = ({ to = '/', ...props }) => (
    <Link to={to}>
        <Logo {...props} />
    </Link>
)

export default Logo
