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
  User
} from 'lucide-react';
import { mockRoomRequests, mockUsers, mockRooms } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import Modal from '../components/Common/Modal';

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
    preferredRooms: [] as string[],
  });

  // Handler functions
  const handleAddRequest = () => {
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
  };

  const handleConfirmAction = () => {
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
    if (!editingRequest) return;

    setRequests(prevRequests => 
      prevRequests.map(req => 
        req.id === editingRequest.id ? editingRequest : req
      )
    );

    addNotification({
      title: 'Request Updated',
      message: 'The request has been updated successfully.',
      type: 'success'
    });

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
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'denied':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'temporary':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'interview':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'medical':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'other':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStudentName = (studentId: string) => {
    const student = mockUsers.find(u => u.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown Student';
  };

  const getPreferredRooms = (roomIds: string[]) => {
    return roomIds.map(id => {
      const room = mockRooms.find(r => r.id === id);
      return room?.roomNumber || id;
    }).join(', ');
  };

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    denied: requests.filter(r => r.status === 'denied').length,
  };

  // Check if user can approve requests
  const canApprove = user?.role === 'sub_warden' || user?.role === 'welfare_officer';

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Room Requests</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage student room requests and allocations</p>
        </div>
        
        {user?.role === 'student' && (
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
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Denied</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.denied}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="expired">Expired</option>
          </select>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="temporary">Temporary</option>
            <option value="interview">Interview</option>
            <option value="medical">Medical</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRequests.map((request) => (
                <tr key={request.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {getStudentName(request.studentId)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(request.requestType)}`}>
                      {request.requestType}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                      {request.reason}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Calendar className="w-4 h-4 mr-1" />
                      {request.requestedDate.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getStatusIcon(request.status)}
                      <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleViewRequest(request)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    {canApprove && request.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleApproveRequest(request)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDenyRequest(request)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    
                    {(user?.role === 'student' && request.studentId === user?.id && request.status === 'pending') && (
                      <button
                        onClick={() => handleEditRequest(request)}
                        className="text-orange-600 dark:text-orange-400 hover:text-orange-900 dark:hover:text-orange-300"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredRequests.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No requests found</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {user?.role === 'student' ? 'Get started by creating a new request.' : 'No requests match your current filter.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Add Request Modal */}
      <Modal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)}
        title="New Room Request"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Request Type
            </label>
            <select
              value={newRequest.requestType}
              onChange={(e) => setNewRequest({...newRequest, requestType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="temporary">Temporary Room</option>
              <option value="interview">Interview Room</option>
              <option value="medical">Medical Leave</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reason *
            </label>
            <textarea
              value={newRequest.reason}
              onChange={(e) => setNewRequest({...newRequest, reason: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Please explain why you need this room..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requested Date *
            </label>
            <input
              type="date"
              value={newRequest.requestedDate}
              onChange={(e) => setNewRequest({...newRequest, requestedDate: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration (days)
            </label>
            <input
              type="number"
              min="1"
              max="30"
              value={newRequest.duration}
              onChange={(e) => setNewRequest({...newRequest, duration: parseInt(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
      >
        {selectedRequest && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Student</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{getStudentName(selectedRequest.studentId)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Type</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white capitalize">{selectedRequest.requestType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Date</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRequest.requestedDate.toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Duration</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRequest.duration} days</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Reason</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRequest.reason}</p>
            </div>

            {selectedRequest.preferredRooms.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Preferred Rooms</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{getPreferredRooms(selectedRequest.preferredRooms)}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Status</label>
              <div className="mt-1 flex items-center">
                {getStatusIcon(selectedRequest.status)}
                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                  {selectedRequest.status}
                </span>
              </div>
            </div>

            {selectedRequest.notes && (
              <div>
                <label className="block text-sm font-medium text-gray-500 dark:text-gray-400">Notes</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-white">{selectedRequest.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Edit Request Modal */}
      <Modal 
        isOpen={showEditModal} 
        onClose={() => setShowEditModal(false)}
        title="Edit Request"
      >
        {editingRequest && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Request Type
              </label>
              <select
                value={editingRequest.requestType}
                onChange={(e) => setEditingRequest({...editingRequest, requestType: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="temporary">Temporary Room</option>
                <option value="interview">Interview Room</option>
                <option value="medical">Medical Leave</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason
              </label>
              <textarea
                value={editingRequest.reason}
                onChange={(e) => setEditingRequest({...editingRequest, reason: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Duration (days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={editingRequest.duration}
                onChange={(e) => setEditingRequest({...editingRequest, duration: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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
      </Modal>      {/* Confirmation Dialog */}
      <Modal
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        title={`${actionType === 'approve' ? 'Approve' : 'Deny'} Request`}
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            {selectedRequest ? `Are you sure you want to ${actionType} this ${selectedRequest.requestType} room request?` : ''}
          </p>
          
          {/* Add notes for approval/denial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 dark:placeholder-gray-500"
              placeholder="Add any notes about this decision..."
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowConfirmDialog(false)}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              className={`px-4 py-2 text-white rounded-lg transition-colors ${
                actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {actionType === 'approve' ? 'Approve' : 'Deny'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Requests;
