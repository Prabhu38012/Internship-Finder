import React, { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Bookmark,
  Globe,
  ExternalLink,
  ChevronRight,
} from "lucide-react";
import WishlistButton from "../components/Wishlist/WishlistButton";

/**
 * Memoized Internship Card Component
 * Prevents unnecessary re-renders when used in lists
 * Only re-renders if internship data or user changes
 */
const InternshipCard = memo(
  ({ internship, user, onViewDetails }) => {
    const isExternal = internship.isExternal || internship.source;

    // Memoized formatters to avoid recreating on each render
    const formatStipend = useCallback(() => {
      if (!internship.stipend?.amount && !internship.salary) return "Unpaid";
      const amount = internship.stipend?.amount || internship.salary;
      const currency = internship.stipend?.currency || "$";
      const period = internship.stipend?.period || "month";
      return `${currency}${amount?.toLocaleString()}/${period}`;
    }, [internship.stipend, internship.salary]);

    const formatDeadline = useCallback(() => {
      if (!internship.applicationDeadline) return "No deadline";
      return `Apply by ${format(new Date(internship.applicationDeadline), "MMM d, yyyy")}`;
    }, [internship.applicationDeadline]);

    const getLocationType = useCallback(() => {
      const type =
        internship.location?.type || internship.locationType || "onsite";
      return type.charAt(0).toUpperCase() + type.slice(1);
    }, [internship.location, internship.locationType]);

    return (
      <div className="dark-card dark-card-hover group relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
              {internship.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-400 text-sm">
              <Building2 className="w-4 h-4" />
              <span>
                {internship.companyName ||
                  internship.company?.name ||
                  internship.company}
              </span>
              {internship.company?.companyProfile?.verified && (
                <span className="badge badge-primary text-xs">Verified</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-1">
            {user && user.role === "student" && !isExternal && (
              <WishlistButton internship={internship} size="small" />
            )}
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <MapPin className="w-4 h-4" />
            <span>
              {internship.location?.city
                ? `${internship.location.city}${internship.location.country ? `, ${internship.location.country}` : ""}`
                : getLocationType()}
            </span>
            {isExternal && (
              <span className="badge badge-gray text-xs">External</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" />
            <span>{internship.duration || "Duration not specified"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <DollarSign className="w-4 h-4" />
            <span>{formatStipend()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {internship.category && (
            <span className="badge badge-primary">{internship.category}</span>
          )}
          {internship.type && (
            <span className="badge badge-gray">{internship.type}</span>
          )}
          {internship.urgent && (
            <span className="badge badge-warning">Urgent</span>
          )}
          {internship.featured && (
            <span className="badge badge-success">Featured</span>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-dark-500">
          <span className="text-xs text-gray-500">{formatDeadline()}</span>

          {isExternal ? (
            <a
              href={internship.applyUrl || internship.url}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary text-sm py-2 flex items-center gap-1"
              aria-label={`Apply externally for ${internship.title}`}
            >
              Apply <ExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <Link
              to={`/internships/${internship._id || internship.id}`}
              className="btn-primary text-sm py-2 flex items-center gap-1"
              aria-label={`View details for ${internship.title}`}
            >
              View Details <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for React.memo
    // Only re-render if these specific props change
    return (
      prevProps.internship._id === nextProps.internship._id &&
      prevProps.internship.title === nextProps.internship.title &&
      prevProps.user?.id === nextProps.user?.id
    );
  },
);

InternshipCard.displayName = "InternshipCard";

export default InternshipCard;
