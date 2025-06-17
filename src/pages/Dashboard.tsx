import React from 'react';
import { 
  Building, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Key,
  TrendingUp,
  Calendar,
  Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { mockRooms, mockReports, mockRoomRequests, mockAnnouncements } from '../utils/mockData';
import StudentDashboard from './StudentDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // If user is a student, show student dashboard
  if (user?.role === 'student') {
    return <StudentDashboard />;
  }

  // Calculate statistics
  const totalRooms = mockRooms.length;
  const occupiedRooms = mockRooms.filter(room => room.status === 'occupied').length;
  const availableRooms = mockRooms.filter(room => room.status === 'available').length;
  
  const pendingReports = mockReports.filter(report => report.status === 'pending').length;
  const activeRequests = mockRoomRequests.filter(request => request.status === 'pending').length;
  const activeAnnouncements = mockAnnouncements.filter(ann => ann.active).length;

  const occupancyRate = ((occupiedRooms / totalRooms) * 100).toFixed(1);

  const stats = [
    {
      title: 'Total Rooms',
      value: totalRooms,
      icon: Building,
      color: 'bg-blue-500',
      change: '+2%',
      subtitle: `${occupancyRate}% occupied`
    },
    {
      title: 'Available Rooms',
      value: availableRooms,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: '-5%',
      subtitle: 'Ready for assignment'
    },
    {
      title: 'Pending Reports',
      value: pendingReports,
      icon: AlertTriangle,
      color: 'bg-orange-500',
      change: '+12%',
      subtitle: 'Requires attention'
    },
    {
      title: 'Active Requests',
      value: activeRequests,
      icon: Clock,
      color: 'bg-purple-500',
      change: '+8%',
      subtitle: 'Awaiting approval'
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: 'report',
      title: 'New maintenance report submitted',
      description: 'Room G01 - Faulty light switch',
      time: '2 hours ago',
      icon: AlertTriangle,
      color: 'text-orange-500'
    },
    {
      id: 2,
      type: 'request',
      title: 'Room request approved',
      description: 'Temporary room for interview - Student ID: STU2024001',
      time: '4 hours ago',
      icon: CheckCircle,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'key',
      title: 'Key handover completed',
      description: 'Room 301 - Student to Warden',
      time: '6 hours ago',
      icon: Key,
      color: 'text-blue-500'
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-blue-100 dark:text-blue-200 text-lg">
              Here's an overview of today's hostel operations.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <Building className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{totalRooms}</div>
            <div className="text-blue-100 dark:text-blue-200 text-sm">Total Rooms</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{occupancyRate}%</div>
            <div className="text-blue-100 dark:text-blue-200 text-sm">Occupancy Rate</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{pendingReports}</div>
            <div className="text-blue-100 dark:text-blue-200 text-sm">Pending Reports</div>
          </div>
          <div className="bg-white bg-opacity-20 rounded-lg p-4">
            <div className="text-2xl font-bold">{activeRequests}</div>
            <div className="text-blue-100 dark:text-blue-200 text-sm">Active Requests</div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center text-sm text-green-600 dark:text-green-400">
                <TrendingUp className="w-4 h-4 mr-1" />
                {stat.change}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
            <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">{stat.title}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h2>
            <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center`}>
                  <activity.icon className={`w-4 h-4 ${activity.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.title}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{activity.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active Announcements */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Announcements</h2>
            <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {activeAnnouncements} Active
            </span>
          </div>
          <div className="space-y-4">
            {mockAnnouncements.filter(ann => ann.active).map((announcement) => (
              <div key={announcement.id} className={`p-4 rounded-lg border-l-4 ${
                announcement.priority === 'high' ? 'border-red-500 bg-red-50 dark:bg-red-900/20' :
                announcement.priority === 'medium' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white">{announcement.title}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    announcement.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400' :
                    announcement.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400'
                  }`}>
                    {announcement.priority}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{announcement.content}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  {announcement.createdDate.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Demo Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Test Notifications</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => addNotification({
              title: 'New Room Request',
              message: 'A student has requested a temporary room for interviews.',
              type: 'info'
            })}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Bell className="w-4 h-4 mr-2" />
            Add Info Notification
          </button>
          <button
            onClick={() => addNotification({
              title: 'Maintenance Completed',
              message: 'The faulty light switch in Room G01 has been fixed.',
              type: 'success'
            })}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Add Success Notification
          </button>
          <button
            onClick={() => addNotification({
              title: 'Water Supply Alert',
              message: 'Water supply will be interrupted tomorrow from 10 AM to 2 PM.',
              type: 'warning'
            })}
            className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Add Warning Notification
          </button>
          <button
            onClick={() => addNotification({
              title: 'System Error',
              message: 'Unable to process your request. Please try again later.',
              type: 'error'
            })}
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Add Error Notification
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;