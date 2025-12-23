import React from "react";

/**
 * Base Skeleton component for loading states
 * Usage: <Skeleton className="w-32 h-4" />
 */
const Skeleton = ({ className = "", variant = "rectangle", ...props }) => {
  const baseStyles = "animate-pulse bg-slate-700";

  const variants = {
    rectangle: "rounded",
    circle: "rounded-full",
    text: "rounded h-4",
    avatar: "rounded-full w-10 h-10",
    button: "rounded-lg h-10 w-24",
    card: "rounded-2xl",
  };

  return (
    <div
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    />
  );
};

/**
 * Internship Card Skeleton
 */
export const InternshipCardSkeleton = () => (
  <div className="dark-card">
    {/* Header */}
    <div className="flex justify-between items-start mb-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton variant="circle" className="w-8 h-8" />
    </div>

    {/* Details */}
    <div className="space-y-3 mb-4">
      <div className="flex items-center gap-2">
        <Skeleton variant="circle" className="w-4 h-4" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="circle" className="w-4 h-4" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton variant="circle" className="w-4 h-4" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>

    {/* Tags */}
    <div className="flex gap-2 mb-4">
      <Skeleton className="h-6 w-20 rounded-full" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>

    {/* Footer */}
    <div className="flex justify-between items-center pt-4 border-t border-slate-700">
      <Skeleton className="h-3 w-32" />
      <Skeleton variant="button" />
    </div>
  </div>
);

/**
 * KPI Card Skeleton
 */
export const KPICardSkeleton = () => (
  <div className="dark-card">
    <div className="flex items-center justify-between mb-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton variant="circle" className="w-10 h-10" />
    </div>
    <Skeleton className="h-8 w-16 mb-2" />
    <Skeleton className="h-3 w-20" />
  </div>
);

/**
 * Table Row Skeleton
 */
export const TableRowSkeleton = ({ columns = 5 }) => (
  <tr className="border-b border-slate-700">
    {[...Array(columns)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <Skeleton className="h-4 w-full" />
      </td>
    ))}
  </tr>
);

/**
 * Application Card Skeleton
 */
export const ApplicationCardSkeleton = () => (
  <div className="dark-card">
    <div className="flex items-start gap-4">
      <Skeleton variant="avatar" className="w-12 h-12" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * Dashboard Skeleton (Full page)
 */
export const DashboardSkeleton = () => (
  <div className="space-y-6 p-6">
    {/* Greeting */}
    <div className="space-y-2">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-4 w-48" />
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <KPICardSkeleton key={i} />
      ))}
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <Skeleton className="h-6 w-40" />
        {[...Array(3)].map((_, i) => (
          <InternshipCardSkeleton key={i} />
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {[...Array(4)].map((_, i) => (
          <ApplicationCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </div>
);

/**
 * List Skeleton
 */
export const ListSkeleton = ({
  count = 6,
  CardComponent = InternshipCardSkeleton,
}) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
    {[...Array(count)].map((_, i) => (
      <CardComponent key={i} />
    ))}
  </div>
);

export default Skeleton;
