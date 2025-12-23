import React from "react";
import { Link } from "react-router-dom";
import {
  FileSearch,
  SearchX,
  AlertCircle,
  Inbox,
  Users,
  Briefcase,
  Heart,
  MessageSquare,
} from "lucide-react";

/**
 * Professional Empty State Component
 * Used when no data is available to display
 */

// Predefined icons for common empty states
const EMPTY_STATE_ICONS = {
  search: SearchX,
  applications: FileSearch,
  internships: Briefcase,
  users: Users,
  wishlist: Heart,
  messages: MessageSquare,
  error: AlertCircle,
  default: Inbox,
};

const EmptyState = ({
  type = "default",
  icon: CustomIcon,
  title,
  description,
  action,
  secondaryAction,
  className = "",
}) => {
  const Icon =
    CustomIcon || EMPTY_STATE_ICONS[type] || EMPTY_STATE_ICONS.default;

  return (
    <div
      className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
    >
      {/* Icon */}
      <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
        <Icon className="w-10 h-10 text-slate-500" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-white mb-2">
        {title || "No data found"}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-slate-400 max-w-md mb-6">{description}</p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {action &&
          (action.href ? (
            <Link
              to={action.href}
              className="btn-primary flex items-center gap-2"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="btn-primary flex items-center gap-2"
            >
              {action.icon && <action.icon className="w-4 h-4" />}
              {action.label}
            </button>
          ))}

        {secondaryAction &&
          (secondaryAction.href ? (
            <Link
              to={secondaryAction.href}
              className="btn-secondary flex items-center gap-2"
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="w-4 h-4" />
              )}
              {secondaryAction.label}
            </Link>
          ) : (
            <button
              onClick={secondaryAction.onClick}
              className="btn-secondary flex items-center gap-2"
            >
              {secondaryAction.icon && (
                <secondaryAction.icon className="w-4 h-4" />
              )}
              {secondaryAction.label}
            </button>
          ))}
      </div>
    </div>
  );
};

// Pre-configured empty states for common scenarios
export const EmptyApplications = () => (
  <EmptyState
    type="applications"
    title="No applications yet"
    description="Start exploring internships to kickstart your career journey"
    action={{ label: "Browse Internships", href: "/internships" }}
  />
);

export const EmptyInternships = () => (
  <EmptyState
    type="internships"
    title="No internships found"
    description="Try adjusting your filters or search terms to find more opportunities"
    action={{ label: "Clear Filters", onClick: () => {} }}
    secondaryAction={{ label: "Browse All", href: "/internships" }}
  />
);

export const EmptySearchResults = ({ query, onClear }) => (
  <EmptyState
    type="search"
    title={`No results for "${query}"`}
    description="We couldn't find any matches. Try different keywords or browse all listings."
    action={{ label: "Clear Search", onClick: onClear }}
    secondaryAction={{ label: "Browse All", href: "/internships" }}
  />
);

export const EmptyWishlist = () => (
  <EmptyState
    type="wishlist"
    title="Your wishlist is empty"
    description="Save internships you're interested in to keep track of them"
    action={{ label: "Explore Internships", href: "/internships" }}
  />
);

export const EmptyMessages = () => (
  <EmptyState
    type="messages"
    title="No messages yet"
    description="Messages from companies will appear here"
  />
);

export const ErrorState = ({ message, onRetry }) => (
  <EmptyState
    type="error"
    title="Something went wrong"
    description={message || "We couldn't load the data. Please try again."}
    action={{ label: "Try Again", onClick: onRetry }}
  />
);

export const NoCompanyApplications = () => (
  <EmptyState
    type="applications"
    title="No applications received"
    description="Applications will appear here when students apply to your internships"
    action={{ label: "Post Internship", href: "/internships/create" }}
  />
);

export default EmptyState;
