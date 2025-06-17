import React, { useState } from 'react';
import { 
  User, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationsContext';
import ProfilePhotoUpload from '../components/Common/ProfilePhotoUpload';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    emergencyContact: user?.emergencyContact || '',
  });

  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    maintenanceAlerts: true,
    announcementAlerts: true,
    keyHandoverAlerts: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];  const handleProfileSave = () => {
    // Handle profile save
    console.log('Profile saved:', profileData);
    
    addNotification({
      title: 'Profile Updated',
      message: 'Your profile has been updated successfully.',
      type: 'success'
    });
  };

  const handleNotificationSave = () => {
    // Handle notification save
    console.log('Notifications saved:', notificationSettings);
    
    addNotification({
      title: 'Settings Saved',
      message: 'Notification preferences have been saved.',
      type: 'success'
    });
  };

  const handleSecuritySave = () => {
    // Handle security save
    console.log('Security saved:', securitySettings);
    
    addNotification({
      title: 'Security Updated',
      message: 'Security settings have been updated.',
      type: 'success'
    });
  };

  const handlePasswordChange = () => {
    // Handle password change
    addNotification({
      title: 'Password Changed',
      message: 'Your password has been changed successfully.',
      type: 'success'
    });
  };

  const handleAppearanceSave = () => {
    // Handle appearance save
    addNotification({
      title: 'Appearance Saved',
      message: 'Your appearance preferences have been saved.',
      type: 'success'
    });
  };

  return (    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64">
          <nav className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <ul className="space-y-2">
              {tabs.map((tab) => (
                <li key={tab.id}>
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-r-4 border-blue-700 dark:border-blue-500'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1">          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <User className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Profile Information</h2>
              </div><div className="space-y-6">
                <div className="flex items-center space-x-6">                  <ProfilePhotoUpload 
                    currentPhoto={profilePhoto || undefined}
                    onPhotoChange={setProfilePhoto}
                    size="lg"
                  />                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">{user?.role?.replace('_', ' ')}</p>
                    {user?.studentId && (
                      <p className="text-sm text-gray-500 dark:text-gray-500">Student ID: {user.studentId}</p>
                    )}
                  </div>
                </div>                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData({...profileData, phoneNumber: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>                  {user?.role === 'student' && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="tel"
                        value={profileData.emergencyContact}
                        onChange={(e) => setProfileData({...profileData, emergencyContact: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleProfileSave}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Bell className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Notification Preferences</h2>
              </div>

              <div className="space-y-6">
                {Object.entries(notificationSettings).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                      <p className="text-sm text-gray-500">
                        {key === 'emailNotifications' && 'Receive notifications via email'}
                        {key === 'pushNotifications' && 'Receive push notifications in browser'}
                        {key === 'maintenanceAlerts' && 'Get notified about maintenance updates'}
                        {key === 'announcementAlerts' && 'Receive new announcement notifications'}
                        {key === 'keyHandoverAlerts' && 'Get notified about key handover requests'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          [key]: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    onClick={handleNotificationSave}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-bold text-gray-900">Security Settings</h2>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Two-Factor Authentication
                    </label>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.twoFactorAuth}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,                        twoFactorAuth: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-900">
                      Login Alerts
                    </label>
                    <p className="text-sm text-gray-500">
                      Get notified when someone logs into your account
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={securitySettings.loginAlerts}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        loginAlerts: e.target.checked                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-600 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:after:bg-gray-300 after:border-gray-300 dark:after:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Timeout (minutes)
                  </label>
                  <select
                    value={securitySettings.sessionTimeout}                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      sessionTimeout: Number(e.target.value)
                    })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={120}>2 hours</option>
                  </select>
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Change Password
                  </label>
                  <div className="space-y-4">
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Current password"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>                    <input
                      type="password"
                      placeholder="New password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    <input
                      type="password"
                      placeholder="Confirm new password"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3 mt-4">
                    <button
                      onClick={handlePasswordChange}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Change Password
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleSecuritySave}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Security Settings
                  </button>
                </div>
              </div>
            </div>
          )}          {/* Appearance Settings */}
          {activeTab === 'appearance' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Palette className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance & Display</h2>
              </div><div className="space-y-6">                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                    Theme Preference
                  </label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { key: 'light', label: 'Light', icon: '☀️' },
                      { key: 'dark', label: 'Dark', icon: '🌙' },
                      { key: 'system', label: 'System', icon: '💻' }
                    ].map((themeOption) => (
                      <div key={themeOption.key} className="relative">
                        <input
                          type="radio"
                          name="theme"
                          value={themeOption.key}
                          checked={themeOption.key === 'system' 
                            ? theme === (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
                            : theme === themeOption.key
                          }                          onChange={() => {
                            if (themeOption.key === 'system') {
                              setTheme(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                            } else {
                              setTheme(themeOption.key as 'light' | 'dark');
                            }
                          }}
                          className="sr-only peer"
                        />                        <label 
                          htmlFor={themeOption.key}
                          className="flex flex-col items-center p-4 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer peer-checked:border-blue-500 peer-checked:bg-blue-50 dark:peer-checked:bg-blue-900/20 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                          <span className="text-2xl mb-2">{themeOption.icon}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{themeOption.label}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Language
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date Format
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="mm/dd/yyyy">MM/DD/YYYY</option>
                    <option value="dd/mm/yyyy">DD/MM/YYYY</option>
                    <option value="yyyy-mm-dd">YYYY-MM-DD</option>
                  </select>
                </div><div className="flex justify-end">
                  <button 
                    onClick={handleAppearanceSave}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Appearance
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
