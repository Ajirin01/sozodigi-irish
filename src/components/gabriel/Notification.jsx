import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../states/notificationSlice';
import { toast } from 'react-toastify';
import { Link } from 'react-router-dom';
import { PATH } from '../routes/path';

const Notification = () => {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notifications.list);
  const [showNotifications, setShowNotifications] = useState(false);
  const user = useSelector(state => state.auth.user);
  const unreadCount = useSelector(state => state.notifications.unreadCount);

  useEffect(() => {
    dispatch(fetchNotifications());
    
    // Set up polling for new notifications every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchNotifications());
    }, 30000);
    
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    // Show toast for new unread notifications
    const newUnread = notifications.filter(n => !n.isRead && n.isNew);
    if (newUnread.length > 0) {
      newUnread.forEach(notification => {
        toast.info(notification.message, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true
        });
      });
    }
  }, [notifications]);

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showNotifications && !event.target.closest('.notification-container')) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead());
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'appointment':
        return (
          <svg className="h-5 w-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'reminder':
        return (
          <svg className="h-5 w-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'system':
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getNotificationUrl = (notification) => {
    if (notification.type === 'appointment') {
      return user?.role === 'specialist' 
        ? PATH.doctor.appointments
        : PATH.dashboard.appointments;
    }
    return '#';
  };

  return (
    <div className="relative notification-container">
      {/* Notification Bell Icon */}
      <button 
        className={`relative p-2 rounded-full focus:outline-none transition-colors duration-200 ${
          showNotifications ? 'bg-primary-50 text-primary-600' : 'hover:bg-gray-100 text-gray-600'
        }`}
        onClick={toggleNotifications}
        aria-expanded={showNotifications}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {showNotifications && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-50">
          <div className="py-2">
            <div className="px-4 py-2 flex justify-between items-center border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
              {unreadCount > 0 && (
                <button 
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500">
                  No notifications
                </div>
              ) : (
                notifications.map(notification => (
                  <Link
                    key={notification._id}
                    to={getNotificationUrl(notification)}
                    className={`block px-4 py-3 hover:bg-gray-50 ${!notification.isRead ? 'bg-blue-50' : ''}`}
                    onClick={() => !notification.isRead && handleMarkAsRead(notification._id)}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <p className={`text-sm font-medium text-gray-900 ${!notification.isRead ? 'font-semibold' : ''}`}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <span className="ml-3 flex-shrink-0 h-2 w-2 rounded-full bg-blue-600"></span>
                      )}
                    </div>
                  </Link>
                ))
              )}
            </div>
            
            <div className="border-t border-gray-200 px-4 py-2">
              <Link
                to={user?.role === 'specialist' ? PATH.doctor.notifications : PATH.dashboard.notifications}
                className="text-xs text-blue-600 hover:text-blue-800 block text-center"
              >
                View all notifications
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notification;
