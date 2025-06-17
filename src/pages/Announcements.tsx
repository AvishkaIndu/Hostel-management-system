import React, { useState } from 'react';
import { 
  Bell, 
  Search, 
  Plus, 
  AlertTriangle, 
  Info, 
  Megaphone,
  Calendar,
  Eye,
  Edit3,
  Trash2,
  User
} from 'lucide-react';
import { mockAnnouncements, mockUsers } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import Modal from '../components/Common/Modal';
import ConfirmDialog from '../components/Common/ConfirmDialog';

const Announcements: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [editingAnnouncement, setEditingAnnouncement] = useState<any>(null);

  // State management for announcements
  const [announcements, setAnnouncements] = useState(mockAnnouncements);

  // New announcement form state
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    type: 'general',
    priority: 'medium',
    targetFloors: [] as number[],
  });
  // Handler functions
  const handleAddAnnouncement = () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
        type: 'error'
      });
      return;
    }

    // Check if user has permission (only wardens can create announcements)
    const canCreate = user?.role === 'sub_warden' || user?.role === 'welfare_officer';
    
    if (!canCreate) {
      addNotification({
        title: 'Permission Denied',
        message: 'Only wardens can create announcements.',
        type: 'error'
      });
      return;
    }

    // Create new announcement
    const announcement = {
      id: (announcements.length + 1).toString(),
      title: newAnnouncement.title,
      content: newAnnouncement.content,
      type: newAnnouncement.type as 'general' | 'maintenance' | 'emergency' | 'event',
      priority: newAnnouncement.priority as 'low' | 'medium' | 'high',
      targetFloors: newAnnouncement.targetFloors,
      createdBy: user?.id || '',
      createdDate: new Date(),
      active: true,
    };

    // Add to announcements
    setAnnouncements(prevAnnouncements => [...prevAnnouncements, announcement]);

    // Add notification
    addNotification({
      title: 'Announcement Created',
      message: 'The announcement has been created successfully.',
      type: 'success'
    });

    setShowAddModal(false);
    setNewAnnouncement({
      title: '',
      content: '',
      type: 'general',
      priority: 'medium',
      targetFloors: [],
    });
  };

  const handleViewAnnouncement = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setShowViewModal(true);
  };

  const handleEditAnnouncement = (announcement: any) => {
    setEditingAnnouncement({ ...announcement });
    setShowEditModal(true);
  };

  const handleDeleteAnnouncement = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setShowDeleteDialog(true);
  };
  const handleConfirmDelete = () => {
    if (!selectedAnnouncement) return;

    // Check if user has permission (only wardens can delete announcements)
    const canDelete = user?.role === 'sub_warden' || user?.role === 'welfare_officer';
    
    if (!canDelete) {
      addNotification({
        title: 'Permission Denied',
        message: 'Only wardens can delete announcements.',
        type: 'error'
      });
      setShowDeleteDialog(false);
      return;
    }

    // Remove announcement
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.filter(announcement => announcement.id !== selectedAnnouncement.id)
    );

    // Add notification
    addNotification({
      title: 'Announcement Deleted',
      message: `"${selectedAnnouncement.title}" has been deleted successfully.`,
      type: 'success'
    });

    setShowDeleteDialog(false);
    setSelectedAnnouncement(null);
  };

  const handleUpdateAnnouncement = () => {
    if (!editingAnnouncement) return;

    if (!editingAnnouncement.title.trim() || !editingAnnouncement.content.trim()) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
        type: 'error'
      });
      return;
    }

    // Check if user has permission (only wardens can edit announcements)
    const canEdit = user?.role === 'sub_warden' || user?.role === 'welfare_officer';
    
    if (!canEdit) {
      addNotification({
        title: 'Permission Denied',
        message: 'Only wardens can edit announcements.',
        type: 'error'
      });
      return;
    }

    // Update announcement
    setAnnouncements(prevAnnouncements => 
      prevAnnouncements.map(announcement => 
        announcement.id === editingAnnouncement.id ? editingAnnouncement : announcement
      )
    );

    // Add notification
    addNotification({
      title: 'Announcement Updated',
      message: 'The announcement has been updated successfully.',
      type: 'success'
    });

    setShowEditModal(false);
    setEditingAnnouncement(null);
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = 
      announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || announcement.type === selectedType;
    const matchesPriority = selectedPriority === 'all' || announcement.priority === selectedPriority;
    const matchesActive = !showActiveOnly || announcement.active;
    
    return matchesSearch && matchesType && matchesPriority && matchesActive;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'general':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'emergency':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'event':
        return <Megaphone className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCreatorName = (creatorId: string) => {
    const creator = mockUsers.find(u => u.id === creatorId);
    return creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown';
  };

  const getTargetFloorsText = (floors?: number[]) => {
    if (!floors || floors.length === 0) return 'All floors';
    return `Floor${floors.length > 1 ? 's' : ''} ${floors.join(', ')}`;
  };
  const stats = {
    total: announcements.length,
    active: announcements.filter(a => a.active).length,
    high: announcements.filter(a => a.priority === 'high' && a.active).length,
    emergency: announcements.filter(a => a.type === 'emergency' && a.active).length,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Manage hostel announcements and notifications</p>
        </div>        {(user?.role === 'sub_warden' || user?.role === 'welfare_officer') && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Announcement
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Announcements</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-3xl font-bold text-gray-900">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Megaphone className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-3xl font-bold text-gray-900">{stats.high}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emergency</p>
              <p className="text-3xl font-bold text-gray-900">{stats.emergency}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="general">General</option>
            <option value="maintenance">Maintenance</option>
            <option value="emergency">Emergency</option>
            <option value="event">Event</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="activeOnly"
              checked={showActiveOnly}
              onChange={(e) => setShowActiveOnly(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="activeOnly" className="text-sm font-medium text-gray-700">
              Active only
            </label>
          </div>
        </div>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <div key={announcement.id} className={`rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow ${
            announcement.active ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getTypeIcon(announcement.type)}
                    <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(announcement.type)}`}>
                      {announcement.type}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!announcement.active && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{announcement.content}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>{getCreatorName(announcement.createdBy)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{announcement.createdDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Bell className="w-4 h-4 mr-2" />
                    <span>{getTargetFloorsText(announcement.targetFloors)}</span>
                  </div>
                </div>
              </div>              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleViewAnnouncement(announcement)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                {(user?.role === 'sub_warden' || user?.role === 'welfare_officer') && (
                  <>
                    <button 
                      onClick={() => handleEditAnnouncement(announcement)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDeleteAnnouncement(announcement)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <div className="text-center py-12">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>      )}

      {/* Add Announcement Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Announcement"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={newAnnouncement.title}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
              placeholder="Enter announcement title"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={newAnnouncement.type}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="general">General</option>
                <option value="maintenance">Maintenance</option>
                <option value="emergency">Emergency</option>
                <option value="event">Event</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={newAnnouncement.priority}
                onChange={(e) => setNewAnnouncement({...newAnnouncement, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content *
            </label>
            <textarea
              value={newAnnouncement.content}
              onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
              placeholder="Enter announcement content..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Floors
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map(floor => (
                <label key={floor} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newAnnouncement.targetFloors.includes(floor)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setNewAnnouncement({
                          ...newAnnouncement,
                          targetFloors: [...newAnnouncement.targetFloors, floor]
                        });
                      } else {
                        setNewAnnouncement({
                          ...newAnnouncement,
                          targetFloors: newAnnouncement.targetFloors.filter(f => f !== floor)
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Floor {floor}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddAnnouncement}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Announcement
            </button>
          </div>
        </div>
      </Modal>

      {/* View Announcement Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Announcement Details"
        size="lg"
      >
        {selectedAnnouncement && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedAnnouncement.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedAnnouncement.priority === 'high' ? 'bg-red-100 text-red-800' :
                    selectedAnnouncement.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {selectedAnnouncement.priority}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Created Date</label>
                <p className="mt-1 text-sm text-gray-900">{selectedAnnouncement.createdDate.toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Target Floors</label>
                <p className="mt-1 text-sm text-gray-900">{getTargetFloorsText(selectedAnnouncement.targetFloors)}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
              <p className="mt-1 text-sm text-gray-900">{selectedAnnouncement.content}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Announcement Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Announcement"
        size="lg"
      >
        {editingAnnouncement && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={editingAnnouncement.title}
                onChange={(e) => setEditingAnnouncement({...editingAnnouncement, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={editingAnnouncement.type}
                  onChange={(e) => setEditingAnnouncement({...editingAnnouncement, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="emergency">Emergency</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={editingAnnouncement.priority}
                  onChange={(e) => setEditingAnnouncement({...editingAnnouncement, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content *
              </label>
              <textarea
                value={editingAnnouncement.content}
                onChange={(e) => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateAnnouncement}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Announcement
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Announcement"
        message={selectedAnnouncement ? `Are you sure you want to delete "${selectedAnnouncement.title}"? This action cannot be undone.` : ''}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
};

export default Announcements;
