import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MaintenanceModal from '../MaintenanceModal/MaintenanceModal';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);

  const managerLinks = [
    { path: '/manager', label: 'Dashboard', icon: 'dashboard' },
    { path: '/manager/dues', label: 'Dues Management', icon: 'payments' },
    { path: '/manager/maintenance', label: 'Maintenance', icon: 'engineering' },
    { path: '/manager/announcements', label: 'Announcements', icon: 'campaign' },
    { path: '/manager/reservations', label: 'Reservations', icon: 'event_seat' },
    { path: '/manager/common-areas', label: 'Common Areas', icon: 'meeting_room' },
    { path: '/manager/parking', label: 'Parking', icon: 'local_parking' },
    { path: '/manager/users', label: 'Users', icon: 'people' }
  ];

  const residentLinks = [
    { path: '/resident', label: 'Dashboard', icon: 'dashboard' },
    { path: '/resident/dues', label: 'Payments', icon: 'payments' },
    { path: '/resident/maintenance', label: 'Maintenance', icon: 'engineering' },
    { path: '/resident/reservations', label: 'Reservations', icon: 'event_seat' },
    { path: '/resident/parking', label: 'Parking', icon: 'local_parking' },
    { path: '/resident/announcements', label: 'Announcements', icon: 'campaign' }
  ];

  const securityLinks = [
    { path: '/security', label: 'Dashboard', icon: 'dashboard' },
    { path: '/security/visitors', label: 'Visitor Management', icon: 'directions_car' }
  ];

  const links = user?.role === 'admin' ? managerLinks : 
                user?.role === 'resident' ? residentLinks : 
                securityLinks;

  const portalName = user?.role === 'admin' ? 'Manager Portal' : 
                     user?.role === 'resident' ? 'Resident Portal' : 
                     'Security Portal';

  return (
    <>
      <aside className="bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-50 font-sans text-sm font-medium h-screen w-64 border-r border-neutral-100 dark:border-neutral-800 fixed left-0 top-0 flex flex-col pt-20 pb-8 px-4 z-40 transition-all duration-300">
        <div className="mb-8 px-2">
          <h2 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1">{portalName}</h2>
          <p className="text-[10px] text-on-surface-variant/60">Site Management</p>
        </div>

        <nav className="flex-1 space-y-1">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-3 px-3 py-2.5 transition-all duration-300 ${
                  isActive
                    ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-sm'
                    : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:translate-x-1'
                }`}
              >
                <span className="material-symbols-outlined">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 space-y-1">
          {user?.role === 'resident' && (
            <button
              onClick={() => setShowMaintenanceModal(true)}
              className="w-full bg-primary text-on-primary py-3 mb-4 font-bold tracking-tight hover:opacity-90 transition-opacity"
            >
              New Request
            </button>
          )}
          <Link
            to="/settings"
            className="flex items-center gap-3 px-3 py-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-300"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-all duration-300"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Maintenance Modal */}
      <MaintenanceModal
        isOpen={showMaintenanceModal}
        onClose={() => setShowMaintenanceModal(false)}
        onSuccess={() => {
          // Optionally refresh data or navigate
        }}
      />
    </>
  );
};

export default Sidebar;
