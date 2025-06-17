import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  Building, 
  Users, 
  FileText, 
  MessageSquare, 
  Key, 
  Bell, 
  Settings,
  LogOut,
  Package
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  const navigationItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/rooms', icon: Building, label: 'Rooms', roles: ['sub_warden', 'welfare_officer'] },
    { path: '/room-inventory', icon: Package, label: 'Room Inventory', roles: ['sub_warden', 'welfare_officer'] },
    { path: '/students', icon: Users, label: 'Students', roles: ['sub_warden', 'welfare_officer'] },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/requests', icon: MessageSquare, label: 'Requests' },
    { path: '/keys', icon: Key, label: 'Key Management', roles: ['sub_warden'] },
    { path: '/announcements', icon: Bell, label: 'Announcements' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const filteredItems = navigationItems.filter(item => 
    !item.roles || item.roles.includes(user?.role || '')
  );

  return (
    <div className="bg-white dark:bg-gray-800 h-full shadow-lg border-r border-gray-200 dark:border-gray-700 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Building className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">HostelHub</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {filteredItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-4 border-blue-700 dark:border-blue-500'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;