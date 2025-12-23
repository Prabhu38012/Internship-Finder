import React from 'react'
import { Link } from 'react-router-dom'
import { Eye, Users, Calendar, Building2 } from 'lucide-react'
import { format } from 'date-fns'

/**
 * InternshipCard - Displays internship info with stats
 * @param {object} internship - Internship data object
 * @param {string} internship.title - Internship title
 * @param {string} internship._id - Internship ID for linking
 * @param {number} internship.views - View count
 * @param {number} internship.applicationsCount - Number of applications
 * @param {string} internship.status - Status: active, closed, draft
 * @param {Date} internship.createdAt - Posted date
 */
const InternshipCard = ({ internship }) => {
    const { title, _id, views = 0, applicationsCount = 0, status = 'active', createdAt } = internship

    // Status badge styling
    const getStatusStyles = (status) => {
        switch (status) {
            case 'active':
                return 'bg-green-500/20 text-green-400 border-green-500/30'
            case 'closed':
                return 'bg-red-500/20 text-red-400 border-red-500/30'
            case 'draft':
                return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
            default:
                return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    return (
        <div className="bg-slate-800 rounded-xl p-4 shadow-md hover:shadow-lg hover:bg-slate-750 transition-all duration-300 border border-slate-700/50">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Company Icon */}
                    <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-5 h-5 text-blue-400" />
                    </div>

                    {/* Title */}
                    <div className="min-w-0 flex-1">
                        <Link
                            to={`/internships/${_id}`}
                            className="text-white font-semibold hover:text-blue-400 transition-colors truncate block"
                        >
                            {title}
                        </Link>
                        <p className="text-sm text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Posted {format(new Date(createdAt), 'MMM dd')}
                        </p>
                    </div>
                </div>

                {/* Status Badge */}
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${getStatusStyles(status)}`}>
                    {status}
                </span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                    <Eye className="w-4 h-4" />
                    <span className="text-white font-medium">{views}</span>
                    <span>views</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span className="text-blue-400 font-medium">{applicationsCount}</span>
                    <span>applications</span>
                </div>
            </div>
        </div>
    )
}

export default InternshipCard
