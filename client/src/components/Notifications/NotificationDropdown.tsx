import React from 'react';
import { Bell, Check, X, Clock, Briefcase, User, MessageCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'application' | 'message' | 'job_match' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  data?: {
    jobId?: string;
    applicationId?: string;
    url?: string;
  };
}

const NotificationDropdown = () => {
  // Mock notifications - in real app, this would come from API/context
  const notifications: Notification[] = [
    {
      id: '1',
      type: 'application',
      title: 'Application Update',
      message: 'Your application for Frontend Developer at TechCorp has been reviewed',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      data: { applicationId: '123' }
    },
    {
      id: '2',
      type: 'job_match',
      title: 'New Job Match',
      message: 'We found a new internship that matches your profile: Data Science Intern',
      read: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      data: { jobId: '456' }
    },
    {
      id: '3',
      type: 'message',
      title: 'New Message',
      message: 'TechCorp has sent you a message regarding your application',
      read: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    }
  ];

  const getIcon = (type) => {
    switch (type) {
      case 'application':
        return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'job_match':
        return <User className="h-4 w-4 text-green-500" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const markAsRead = (id) => {
    // TODO: Implement mark as read functionality
    console.log('Mark notification as read:', id);
  };

  const markAllAsRead = () => {
    // TODO: Implement mark all as read functionality
    console.log('Mark all notifications as read');
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-100 z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <Bell className="h-8 w-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No notifications yet</p>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`px-4 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                !notification.read ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className={`text-sm font-medium ${
                        !notification.read ? 'text-gray-900' : 'text-gray-700'
                      }`}>
                        {notification.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </div>
                    </div>
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50">
          <button className="w-full text-center text-sm text-blue-600 font-medium hover:text-blue-700 transition-colors">
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;