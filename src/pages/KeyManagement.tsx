import React, { useState } from 'react';
import { 
  Key, 
  Search, 
  Plus, 
  ArrowRightLeft, 
  CheckCircle, 
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  Eye
} from 'lucide-react';
import { mockRoomAssignments, mockUsers, mockRooms } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import Modal from '../components/Common/Modal';
import ConfirmDialog from '../components/Common/ConfirmDialog';

const KeyManagement: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // State management for assignments
  const [assignments, setAssignments] = useState(mockRoomAssignments);
  
  // Modal states
  const [showHandoverModal, setShowHandoverModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [handoverData, setHandoverData] = useState({
    handoverType: 'student_to_warden',
    notes: ''
  });
  // Mock key handover data
  const mockKeyHandovers = [
    {
      id: '1',
      studentId: '1',
      roomId: 'room_g_1',
      handoverType: 'student_to_warden' as const,
      wardenId: '2',
      timestamp: new Date('2024-01-15T14:30:00'),
      confirmed: true,
      notes: 'Key handover for room inspection'
    },
  ];

  // Handler functions
  const handleNewHandover = () => {
    setShowHandoverModal(true);
  };

  const handleViewAssignment = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const handleKeyHandover = (assignment: any) => {
    setSelectedAssignment(assignment);
    setShowConfirmDialog(true);
  };
  const handleConfirmHandover = () => {
    if (!selectedAssignment) return;

    // Check if user has permission (only wardens can confirm key handovers)
    const canConfirm = user?.role === 'sub_warden' || user?.role === 'welfare_officer';
    
    if (!canConfirm) {
      addNotification({
        title: 'Permission Denied',
        message: 'Only wardens can confirm key handovers.',
        type: 'error'
      });
      setShowConfirmDialog(false);
      return;
    }

    // Update assignment status
    setAssignments(prevAssignments => 
      prevAssignments.map(assignment => 
        assignment.id === selectedAssignment.id 
          ? { 
              ...assignment, 
              keyStatus: assignment.keyStatus === 'with_student' ? 'with_warden' : 'with_student',
              lastHandoverDate: new Date(),
            }
          : assignment
      )
    );

    // Get student info for notification
    const student = mockUsers.find(u => u.id === selectedAssignment.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : 'Student';
    const room = mockRooms.find(r => r.id === selectedAssignment.roomId);
    const roomNumber = room?.roomNumber || 'Unknown Room';

    // Add notification
    addNotification({
      title: 'Key Handover Confirmed',
      message: `Key handover for ${studentName} (${roomNumber}) has been confirmed.`,
      type: 'success'
    });

    setShowConfirmDialog(false);
    setSelectedAssignment(null);
  };

  const handleSaveHandover = () => {
    if (!handoverData.handoverType) {
      addNotification({
        title: 'Validation Error',
        message: 'Please select a handover type.',
        type: 'error'
      });
      return;
    }

    // Check if user has permission (only wardens can create handovers)
    const canCreateHandover = user?.role === 'sub_warden' || user?.role === 'welfare_officer';
    
    if (!canCreateHandover) {
      addNotification({
        title: 'Permission Denied',
        message: 'Only wardens can create key handovers.',
        type: 'error'
      });
      return;
    }    // Create new handover record (in real app, this would be saved to database)
    // const newHandover = {
    //   id: (mockKeyHandovers.length + 1).toString(),
    //   studentId: selectedAssignment?.studentId || '',
    //   roomId: selectedAssignment?.roomId || '',
    //   handoverType: handoverData.handoverType as 'student_to_warden' | 'warden_to_student',
    //   wardenId: user?.id || '',
    //   timestamp: new Date(),
    //   confirmed: true,
    //   notes: handoverData.notes
    // };

    // Add notification
    addNotification({
      title: 'Handover Recorded',
      message: 'Key handover has been recorded successfully.',
      type: 'success'
    });

    setShowHandoverModal(false);
    setHandoverData({ handoverType: 'student_to_warden', notes: '' });
  };

  const filteredAssignments = assignments.filter(assignment => {
    const student = mockUsers.find(u => u.id === assignment.studentId);
    const room = mockRooms.find(r => r.id === assignment.roomId);
    
    const matchesSearch = 
      (student && (student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  student.lastName.toLowerCase().includes(searchTerm.toLowerCase()))) ||
      (room && room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = selectedStatus === 'all' || assignment.keyStatus === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'with_student':
        return 'bg-green-100 text-green-800';
      case 'with_warden':
        return 'bg-orange-100 text-orange-800';
      case 'lost':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'with_student':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'with_warden':
        return <ArrowRightLeft className="w-4 h-4 text-orange-500" />;
      case 'lost':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStudentName = (studentId: string) => {
    const student = mockUsers.find(u => u.id === studentId);
    return student ? `${student.firstName} ${student.lastName}` : 'Unknown';
  };

  const getRoomNumber = (roomId: string) => {
    const room = mockRooms.find(r => r.id === roomId);
    return room ? room.roomNumber : 'Unknown';
  };

  const stats = {
    total: mockRoomAssignments.length,
    withStudents: mockRoomAssignments.filter(a => a.keyStatus === 'with_student').length,
    withWarden: mockRoomAssignments.filter(a => a.keyStatus === 'with_warden').length,
    lost: mockRoomAssignments.filter(a => a.keyStatus === 'lost').length,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Key Management</h1>
          <p className="text-gray-600 mt-1">Track and manage room key distribution</p>
        </div>        {user?.role === 'sub_warden' && (
          <button 
            onClick={handleNewHandover}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Handover
          </button>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Keys</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Key className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Students</p>
              <p className="text-3xl font-bold text-gray-900">{stats.withStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">With Warden</p>
              <p className="text-3xl font-bold text-gray-900">{stats.withWarden}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <ArrowRightLeft className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lost Keys</p>
              <p className="text-3xl font-bold text-gray-900">{stats.lost}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name or room number..."
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
            <option value="with_student">With Student</option>
            <option value="with_warden">With Warden</option>
            <option value="lost">Lost</option>
          </select>
        </div>
      </div>

      {/* Key Assignments Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Student</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Room</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Key Status</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Assigned Date</th>
                <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">Academic Year</th>
                <th className="text-right px-6 py-4 text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <span className="font-medium text-gray-900">
                        {getStudentName(assignment.studentId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        Room {getRoomNumber(assignment.roomId)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(assignment.keyStatus)}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.keyStatus)}`}>
                        {assignment.keyStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2" />
                      {assignment.assignedDate.toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {assignment.academicYear}
                  </td>                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleViewAssignment(assignment)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {user?.role === 'sub_warden' && (
                        <button 
                          onClick={() => handleKeyHandover(assignment)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <ArrowRightLeft className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAssignments.length === 0 && (
          <div className="text-center py-12">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No key assignments found</h3>
            <p className="text-gray-600">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* Recent Key Handovers */}
      {mockKeyHandovers.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Key Handovers</h2>
          <div className="space-y-4">
            {mockKeyHandovers.map((handover) => (
              <div key={handover.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {getStudentName(handover.studentId)} - Room {getRoomNumber(handover.roomId)}
                    </p>
                    <p className="text-sm text-gray-600">
                      {handover.handoverType.replace('_', ' to ')} • {handover.timestamp.toLocaleString()}
                    </p>
                    {handover.notes && (
                      <p className="text-xs text-gray-500 mt-1">{handover.notes}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {handover.confirmed ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-orange-500" />                  )}
                  <span className={`text-xs font-medium ${handover.confirmed ? 'text-green-600' : 'text-orange-600'}`}>
                    {handover.confirmed ? 'Confirmed' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New Handover Modal */}
      <Modal
        isOpen={showHandoverModal}
        onClose={() => setShowHandoverModal(false)}
        title="New Key Handover"
      >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Handover Type
          </label>
          <select
            value={handoverData.handoverType}
            onChange={(e) => setHandoverData({...handoverData, handoverType: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="student_to_warden">Student to Warden</option>
            <option value="warden_to_student">Warden to Student</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            value={handoverData.notes}
            onChange={(e) => setHandoverData({...handoverData, notes: e.target.value})}
            placeholder="Optional notes about the handover..."
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            onClick={() => setShowHandoverModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveHandover}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Save Handover
          </button>
        </div>
      </div>
    </Modal>

    {/* View Assignment Modal */}
    <Modal
      isOpen={showViewModal}
      onClose={() => setShowViewModal(false)}
      title="Key Assignment Details"
    >
      {selectedAssignment && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Student</label>
              <p className="mt-1 text-sm text-gray-900">{getStudentName(selectedAssignment.studentId)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Room</label>
              <p className="mt-1 text-sm text-gray-900">Room {getRoomNumber(selectedAssignment.roomId)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Key Status</label>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedAssignment.keyStatus)}`}>
                  {selectedAssignment.keyStatus.replace('_', ' ')}
                </span>
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assigned Date</label>
              <p className="mt-1 text-sm text-gray-900">{selectedAssignment.assignedDate.toLocaleDateString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Academic Year</label>
              <p className="mt-1 text-sm text-gray-900">{selectedAssignment.academicYear}</p>
            </div>
          </div>
        </div>
      )}
    </Modal>

    {/* Confirm Handover Dialog */}
    <ConfirmDialog
      isOpen={showConfirmDialog}
      onClose={() => setShowConfirmDialog(false)}
      onConfirm={handleConfirmHandover}
      title="Confirm Key Handover"
      message={selectedAssignment ? `Are you sure you want to process the key handover for ${getStudentName(selectedAssignment.studentId)} - Room ${getRoomNumber(selectedAssignment.roomId)}?` : ''}      confirmText="Confirm Handover"
      type="warning"
    />
    </div>
  );
};

export default KeyManagement;
