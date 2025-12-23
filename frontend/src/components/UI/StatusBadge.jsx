import React from "react";
import {
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Star,
  AlertCircle,
  User,
} from "lucide-react";

/**
 * Professional Status Badge Component
 * Consistent styling for application and internship statuses
 */

const STATUS_CONFIG = {
  // Application statuses
  pending: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
    icon: Clock,
    label: "Pending",
  },
  reviewing: {
    bg: "bg-sky-500/20",
    text: "text-sky-400",
    border: "border-sky-500/30",
    icon: Eye,
    label: "Reviewing",
  },
  shortlisted: {
    bg: "bg-purple-500/20",
    text: "text-purple-400",
    border: "border-purple-500/30",
    icon: Star,
    label: "Shortlisted",
  },
  accepted: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCircle,
    label: "Accepted",
  },
  rejected: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: XCircle,
    label: "Rejected",
  },
  withdrawn: {
    bg: "bg-slate-500/20",
    text: "text-slate-400",
    border: "border-slate-500/30",
    icon: User,
    label: "Withdrawn",
  },

  // Internship statuses
  active: {
    bg: "bg-emerald-500/20",
    text: "text-emerald-400",
    border: "border-emerald-500/30",
    icon: CheckCircle,
    label: "Active",
  },
  draft: {
    bg: "bg-slate-500/20",
    text: "text-slate-400",
    border: "border-slate-500/30",
    icon: Clock,
    label: "Draft",
  },
  closed: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    icon: XCircle,
    label: "Closed",
  },
  expired: {
    bg: "bg-orange-500/20",
    text: "text-orange-400",
    border: "border-orange-500/30",
    icon: AlertCircle,
    label: "Expired",
  },

  // Priority levels
  high: {
    bg: "bg-red-500/20",
    text: "text-red-400",
    border: "border-red-500/30",
    label: "High",
  },
  medium: {
    bg: "bg-amber-500/20",
    text: "text-amber-400",
    border: "border-amber-500/30",
    label: "Medium",
  },
  low: {
    bg: "bg-blue-500/20",
    text: "text-blue-400",
    border: "border-blue-500/30",
    label: "Low",
  },

  // Default
  default: {
    bg: "bg-slate-500/20",
    text: "text-slate-400",
    border: "border-slate-500/30",
    label: "Unknown",
  },
};

const StatusBadge = ({
  status,
  size = "default",
  showIcon = false,
  className = "",
}) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.default;
  const Icon = config.icon;

  const sizes = {
    small: "px-2 py-0.5 text-xs",
    default: "px-2.5 py-1 text-xs",
    large: "px-3 py-1.5 text-sm",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium border
        ${config.bg} ${config.text} ${config.border}
        ${sizes[size]}
        ${className}
      `}
    >
      {showIcon && Icon && <Icon className="w-3 h-3" />}
      {config.label}
    </span>
  );
};

// Export individual status functions for convenience
export const PendingBadge = (props) => (
  <StatusBadge status="pending" {...props} />
);
export const ReviewingBadge = (props) => (
  <StatusBadge status="reviewing" {...props} />
);
export const ShortlistedBadge = (props) => (
  <StatusBadge status="shortlisted" {...props} />
);
export const AcceptedBadge = (props) => (
  <StatusBadge status="accepted" {...props} />
);
export const RejectedBadge = (props) => (
  <StatusBadge status="rejected" {...props} />
);
export const ActiveBadge = (props) => (
  <StatusBadge status="active" {...props} />
);

// Helper to get status color for charts/other uses
export const getStatusColor = (status) => {
  const config = STATUS_CONFIG[status?.toLowerCase()] || STATUS_CONFIG.default;
  return {
    bg: config.bg.replace("bg-", "").replace("/20", ""),
    text: config.text.replace("text-", ""),
    border: config.border.replace("border-", "").replace("/30", ""),
  };
};

export default StatusBadge;
