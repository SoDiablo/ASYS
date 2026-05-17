import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const MainLayout = ({ children }) => {
  const { user } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      // For now, create mock notifications based on user role
      const mockNotifications = [
        {
          id: 1,
          message: 'Welcome to ASYS Smart Building System',
          type: 'info',
          is_read: false,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          message: 'Your profile has been updated successfully',
          type: 'success',
          is_read: false,
          created_at: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      
      setNotifications(mockNotifications);
      setUnreadCount(mockNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    setUnreadCount(0);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <div className="flex min-h-screen bg-surface">
      {/* TopNavBar */}
      <header className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 font-sans text-sm tracking-tight w-full border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center h-16 px-8 fixed top-0 z-50">
        <div className="text-xl font-black tracking-tighter text-neutral-900 dark:text-white uppercase">ASYS</div>
        <div className="flex items-center gap-6">
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors duration-200"
            >
              <span className="material-symbols-outlined">notifications</span>
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
              )}
            </button>
            
            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-neutral-800 shadow-lg border border-neutral-200 dark:border-neutral-700 max-h-96 overflow-y-auto z-50">
                <div className="p-4 border-b border-neutral-200 dark:border-neutral-700 flex justify-between items-center">
                  <h3 className="font-bold text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button 
                      onClick={markAllAsRead}
                      className="text-xs text-red-600 hover:text-red-700 font-medium"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                
                {notifications.length > 0 ? (
                  <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => markAsRead(notification.id)}
                        className={`p-4 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer transition-colors ${
                          !notification.is_read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex gap-3">
                          <span className={`material-symbols-outlined text-xl ${getNotificationColor(notification.type)}`}>
                            {getNotificationIcon(notification.type)}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm text-neutral-900 dark:text-neutral-100">{notification.message}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                          {!notification.is_read && (
                            <span className="w-2 h-2 bg-primary rounded-full mt-2"></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-4xl mb-2 block opacity-20">notifications_off</span>
                    <p className="text-sm">No notifications</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3 pl-4 border-l border-neutral-100 dark:border-neutral-800">
            <div className="text-right hidden sm:block">
              <div className="font-bold leading-none">{user?.name || 'User'}</div>
              <div className="text-xs text-on-surface-variant">{user?.email}</div>
            </div>
            <span className="material-symbols-outlined text-3xl">account_circle</span>
          </div>
        </div>
      </header>

      <Sidebar />
      
      <main className="ml-64 pt-16 flex-1 overflow-auto min-h-screen">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;
