import React from "react";

/**
 * KPICard - Reusable stat card for dashboard metrics
 * @param {string} title - Card label text
 * @param {string|number} value - Display value
 * @param {React.Component} icon - Lucide icon component
 * @param {string} iconBg - Tailwind background color class for icon
 * @param {string} trend - Optional trend indicator (e.g., "+12%")
 * @param {boolean} trendUp - Whether trend is positive
 */
const KPICard = ({
  title,
  value,
  icon: Icon,
  iconBg = "bg-blue-500",
  trend,
  trendUp = true,
}) => {
  return (
    <div className="bg-slate-800 rounded-xl p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-start justify-between">
        {/* Text Content */}
        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {trend && (
            <p
              className={`text-sm font-medium flex items-center gap-1 ${trendUp ? "text-green-400" : "text-red-400"}`}
            >
              <span>{trendUp ? "↑" : "↓"}</span>
              <span>{trend}</span>
            </p>
          )}
        </div>

        {/* Icon */}
        <div className={`${iconBg} p-3 rounded-xl`}>
          {Icon && <Icon className="w-6 h-6 text-white" />}
        </div>
      </div>
    </div>
  );
};

export default KPICard;
