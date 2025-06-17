import React, { useState } from 'react';
import { 
  MessageSquare, 
  Search, 
  Plus, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Eye,
  Edit3,
  Calendar,
  User,
  MapPin,
  Timer
} from 'lucide-react';
import { mockRoomRequests, mockUsers, mockRooms } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import Modal from '../components/Common/Modal';
import ConfirmDialog from '../components/Common/ConfirmDialog';

const Requests: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [editingRequest, setEditingRequest] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'deny' | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');

  // Mock request state management (in real app, this would be from a state management library)
  const [requests, setRequests] = useState(mockRoomRequests);

  // New request form state
  const [newRequest, setNewRequest] = useState({
    requestType: 'temporary',
    reason: '',
    requestedDate: '',
    duration: 1,
    preferredRooms: [] as string[],  });

  // Handler functions  const handleAddRequest = () => {
    if (!newRequest.reason.trim() || !newRequest.requestedDate) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
        type: 'error'
      });
      return;
    }

    // Create new request
    const request = {
      id: (requests.length + 1).toString(),
      studentId: user?.id || '1',
      requestType: newRequest.requestType as 'temporary' | 'interview' | 'medical' | 'other',
      reason: newRequest.reason,
      preferredRooms: newRequest.preferredRooms,
      requestedDate: new Date(newRequest.requestedDate),
      duration: newRequest.duration,
      status: 'pending' as const,
    };

    // Add to requests
    setRequests(prevRequests => [...prevRequests, request]);

    // Add notification
    addNotification({
      title: 'Request Submitted',
      message: 'Your room request has been submitted successfully.',
      type: 'success'
    });

    // Reset form
    setShowAddModal(false);
    setNewRequest({
      requestType: 'temporary',
      reason: '',
      requestedDate: '',
      duration: 1,
      preferredRooms: [],
    });
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setShowViewModal(true);
  };

  const handleEditRequest = (request: any) => {
    setEditingRequest({ ...request });
    setShowEditModal(true);
  };

  const handleApproveRequest = (request: any) => {
    setSelectedRequest(request);
    setActionType('approve');
    setShowConfirmDialog(true);
  };

  const handleDenyRequest = (request: any) => {
    setSelectedRequest(request);
    setActionType('deny');
    setShowConfirmDialog(true);
  };  const handleConfirmAction = () => {
    if (!selectedRequest || !actionType) return;

    // Check if user has permission to approve/deny requests
    const canApprove = user?.role === 'sub_warden' || user?.role === 'welfare_officer';
    
    if (!canApprove) {
      addNotification({
        title: 'Permission Denied',
        message: 'Only wardens can approve or deny requests.',
        type: 'error'
      });
      setShowConfirmDialog(false);
      return;
    }

    // Update request status
    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === selectedRequest.id 
          ? { 
              ...req, 
              status: actionType === 'approve' ? 'approved' : 'denied',
              approvedBy: user?.id,
              approvalDate: new Date(),
              notes: approvalNotes || undefined
            }
          : req
      )
    );

    // Get student info for notification
    const student = mockUsers.find(u => u.id === selectedRequest.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Student';

    // Add notification
    addNotification({
      title: `Request ${actionType === 'approve' ? 'Approved' : 'Denied'}`,
      message: `${studentName}'s ${selectedRequest.requestType} request has been ${actionType}d.`,
      type: actionType === 'approve' ? 'success' : 'warning'
    });

    // Reset states
    setShowConfirmDialog(false);
    setSelectedRequest(null);
    setActionType(null);
    setApprovalNotes('');
  };

  const handleUpdateRequest = () => {
    console.log('Updating request:', editingRequest);
    setShowEditModal(false);
    setEditingRequest(null);
  };
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || request.status === selectedStatus;
    const matchesType = selectedType === 'all' || request.requestType === selectedType;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'denied':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'expired':
        return <AlertTriangle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'denied':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'temporary':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-purple-100 text-purple-800';
      case 'medical':
        return 'bg-red-100 text-red-800';
      case 'other':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStudentName = (studentId: string) => {
    const student = mockUsers.find(u => u.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  const getPreferredRooms = (roomIds: string[]) => {
    return roomIds.map(roomId => {
      const room = mockRooms.find(r => r.id === roomId);
      return room ? room.roomNumber : 'Unknown';
    }).join(', ');
  };
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    denied: requests.filter(r => r.status === 'denied').length,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Requests</h1>
          <p className="text-gray-600 mt-1">Manage student room requests and allocations</p>
        </div>        {user?.role === 'student' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pending}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-3xl font-bold text-gray-900">{stats.approved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Denied</p>
              <p className="text-3xl font-bold text-gray-900">{stats.denied}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by reason..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="temporary">Temporary</option>
            <option value="interview">Interview</option>
            <option value="medical">Medical</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(request.status)}
                    <h3 className="text-lg font-semibold text-gray-900 capitalize">
                      {request.requestType} Room Request
                    </h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(request.requestType)}`}>
                      {request.requestType}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>

                <p className="text-gray-600 mb-4">{request.reason}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>{getStudentName(request.studentId)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span title={getPreferredRooms(request.preferredRooms)}>
                      {request.preferredRooms.length} preferred room{request.preferredRooms.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{request.requestedDate.toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Timer className="w-4 h-4 mr-2" />
                    <span>{request.duration} day{request.duration !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleViewRequest(request)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                {(user?.role === 'sub_warden' || user?.role === 'welfare_officer') && request.status === 'pending' && (
                  <>
                    <button 
                      onClick={() => handleApproveRequest(request)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg hover:bg-green-200 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </button>
                    <button 
                      onClick={() => handleDenyRequest(request)}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Deny
                    </button>
                  </>
                )}
                {user?.role === 'student' && request.studentId === user.id && request.status === 'pending' && (
                  <button 
                    onClick={() => handleEditRequest(request)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>      )}

      {/* Add Request Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="New Room Request"
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Type *
              </label>
              <select
                value={newRequest.requestType}
                onChange={(e) => setNewRequest({...newRequest, requestType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="temporary">Temporary</option>
                <option value="interview">Interview</option>
                <option value="medical">Medical</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (days) *
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={newRequest.duration}
                onChange={(e) => setNewRequest({...newRequest, duration: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Requested Date *
            </label>
            <input
              type="date"
              value={newRequest.requestedDate}
              onChange={(e) => setNewRequest({...newRequest, requestedDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason for Request *
            </label>
            <textarea
              value={newRequest.reason}
              onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
              placeholder="Please explain why you need this room..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddRequest}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Request
            </button>
          </div>
        </div>
      </Modal>

      {/* View Request Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Request Details"
        size="lg"
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Request Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{selectedRequest.requestType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRequest.status)}`}>
                    {selectedRequest.status}
                  </span>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Requested Date</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.requestedDate.toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Duration</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRequest.duration} days</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason</label>
              <p className="mt-1 text-sm text-gray-900">{selectedRequest.reason}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Preferred Rooms</label>
              <p className="mt-1 text-sm text-gray-900">{getPreferredRooms(selectedRequest.preferredRooms)}</p>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Request Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Request"
        size="lg"
      >
        {editingRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Request Type *
                </label>
                <select
                  value={editingRequest.requestType}
                  onChange={(e) => setEditingRequest({...editingRequest, requestType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="temporary">Temporary</option>
                  <option value="interview">Interview</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (days) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={editingRequest.duration}
                  onChange={(e) => setEditingRequest({...editingRequest, duration: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Request *
              </label>
              <textarea
                value={editingRequest.reason}
                onChange={(e) => setEditingRequest({...editingRequest, reason: e.target.value})}
                rows={3}
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
                onClick={handleUpdateRequest}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Request
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Action Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmAction}
        title={`${actionType === 'approve' ? 'Approve' : 'Deny'} Request`}
        message={selectedRequest ? `Are you sure you want to ${actionType} this ${selectedRequest.requestType} room request?` : ''}
        confirmText={actionType === 'approve' ? 'Approve' : 'Deny'}
        type={actionType === 'approve' ? 'success' : 'warning'}
      />
    </div>
  );
};

export default Requests;
