import React, { useState, useEffect, useCallback } from "react";
import { formatDistanceToNow } from "date-fns";
import { Eye, FileText, CheckCircle, XCircle, Clock, Zap } from "lucide-react";
import socketService from "../../services/socketService";

/* ==========================================
   ACTIVITY FEED COMPONENT
   
   Real-time activity feed for company dashboard
   Shows: views, applications, status changes
   
   Props:
   - maxItems: number (default 10)
   - companyId: string (for filtering)
   ========================================== */

const ActivityFeed = ({ maxItems = 10, companyId }) => {
  const [activities, setActivities] = useState([]);
  const [isLive, setIsLive] = useState(false);

  /* ==========================================
       ACTIVITY TYPE CONFIGURATIONS
       ========================================== */
  const activityConfig = {
    internship_viewed: {
      icon: Eye,
      iconBg: "bg-blue-500/20",
      iconColor: "text-blue-400",
      label: "viewed",
    },
    new_application: {
      icon: FileText,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
      label: "applied to",
    },
    application_accepted: {
      icon: CheckCircle,
      iconBg: "bg-green-500/20",
      iconColor: "text-green-400",
      label: "accepted for",
    },
    application_rejected: {
      icon: XCircle,
      iconBg: "bg-red-500/20",
      iconColor: "text-red-400",
      label: "rejected for",
    },
    application_reviewing: {
      icon: Clock,
      iconBg: "bg-yellow-500/20",
      iconColor: "text-yellow-400",
      label: "under review for",
    },
  };

  /* ==========================================
       ADD NEW ACTIVITY
       Adds to top, limits to maxItems
       ========================================== */
  const addActivity = useCallback(
    (activity) => {
      setActivities((prev) => {
        const newActivities = [
          { ...activity, id: Date.now(), isNew: true },
          ...prev,
        ].slice(0, maxItems);

        // Remove "isNew" flag after animation
        setTimeout(() => {
          setActivities((current) =>
            current.map((a) =>
              a.id === activity.id ? { ...a, isNew: false } : a,
            ),
          );
        }, 1000);

        return newActivities;
      });
    },
    [maxItems],
  );

  /* ==========================================
       SOCKET EVENT LISTENERS
       ========================================== */
  useEffect(() => {
    // Check socket connection
    const checkConnection = () => {
      setIsLive(socketService.getConnectionStatus());
    };

    checkConnection();
    const connectionInterval = setInterval(checkConnection, 5000);

    // Listen for activity events
    const handleActivity = (data) => {
      // Filter by company if companyId provided
      if (companyId && data.companyId !== companyId) return;
      addActivity(data);
    };

    socketService.on("company_activity", handleActivity);
    socketService.on("new_application", (data) => {
      addActivity({
        type: "new_application",
        userName: data.applicantName,
        internshipTitle: data.internshipTitle,
        timestamp: new Date(),
      });
    });

    return () => {
      clearInterval(connectionInterval);
      socketService.off("company_activity", handleActivity);
      socketService.off("new_application");
    };
  }, [companyId, addActivity]);

  /* ==========================================
       RENDER ACTIVITY ITEM
       ========================================== */
  const renderActivity = (activity) => {
    const config =
      activityConfig[activity.type] || activityConfig.internship_viewed;
    const Icon = config.icon;
    const timeAgo = activity.timestamp
      ? formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })
      : "just now";

    return (
      <div
        key={activity.id}
        className={`flex items-start gap-3 p-3 rounded-xl transition-all duration-300 ${
          activity.isNew
            ? "bg-blue-500/10 animate-pulse"
            : "bg-slate-700/30 hover:bg-slate-700/50"
        }`}
      >
        {/* Icon */}
        <div className={`p-2 rounded-lg ${config.iconBg} flex-shrink-0`}>
          <Icon className={`w-4 h-4 ${config.iconColor}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-200">
            <span className="font-medium text-white">{activity.userName}</span>{" "}
            {config.label}{" "}
            <span className="font-medium text-blue-400">
              {activity.internshipTitle}
            </span>
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{timeAgo}</p>
        </div>
      </div>
    );
  };

  /* ==========================================
       COMPONENT RENDER
       ========================================== */
  return (
    <section className="bg-slate-800 rounded-xl shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          Live Activity
        </h2>

        {/* Live Indicator */}
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${isLive ? "bg-green-400 animate-pulse" : "bg-slate-500"}`}
          />
          <span
            className={`text-xs font-medium ${isLive ? "text-green-400" : "text-slate-500"}`}
          >
            {isLive ? "Live" : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Activity List */}
      <div className="p-4 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar">
        {activities.length > 0 ? (
          activities.map(renderActivity)
        ) : (
          /* Empty State */
          <div className="text-center py-8">
            <Zap className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No activity yet</p>
            <p className="text-slate-500 text-xs mt-1">
              Activity will appear here in real-time
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivityFeed;
