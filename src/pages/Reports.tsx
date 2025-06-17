import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Edit3,
  Calendar,
  User,
  MapPin
} from 'lucide-react';
import { mockReports, mockUsers, mockRooms } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import Modal from '../components/Common/Modal';

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [editingReport, setEditingReport] = useState<any>(null);

  // State management for reports
  const [reports, setReports] = useState(mockReports);

  // New report form state
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    type: 'electrical',
    priority: 'medium',
    roomId: '',  });
  // Handler functions
  const handleAddReport = () => {
    if (!newReport.title.trim() || !newReport.description.trim()) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
        type: 'error'
      });
      return;
    }

    // Create new report
    const report = {
      id: (reports.length + 1).toString(),
      studentId: user?.id || '1',
      roomId: newReport.roomId,
      type: newReport.type as 'electrical' | 'plumbing' | 'furniture' | 'cleanliness' | 'other',
      title: newReport.title,
      description: newReport.description,
      priority: newReport.priority as 'low' | 'medium' | 'high' | 'urgent',
      status: 'pending' as const,
      submittedDate: new Date(),
    };

    // Add to reports
    setReports(prevReports => [...prevReports, report]);

    // Add notification
    addNotification({
      title: 'Report Submitted',
      message: 'Your report has been submitted successfully.',
      type: 'success'
    });

    setShowAddModal(false);
    setNewReport({
      title: '',
      description: '',
      type: 'electrical',
      priority: 'medium',
      roomId: '',
    });
  };

  const handleViewReport = (report: any) => {
    setSelectedReport(report);
    setShowViewModal(true);
  };

  const handleEditReport = (report: any) => {
    setEditingReport({ ...report });
    setShowEditModal(true);
  };
  const handleUpdateReport = () => {
    if (!editingReport) return;

    if (!editingReport.title.trim() || !editingReport.description.trim()) {
      addNotification({
        title: 'Validation Error',
        message: 'Please fill in all required fields.',
        type: 'error'
      });
      return;
    }

    // Update report
    setReports(prevReports => 
      prevReports.map(report => 
        report.id === editingReport.id ? editingReport : report
      )
    );

    // Add notification
    addNotification({
      title: 'Report Updated',
      message: 'The report has been updated successfully.',
      type: 'success'
    });

    setShowEditModal(false);
    setEditingReport(null);
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || report.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || report.priority === selectedPriority;
    const matchesType = selectedType === 'all' || report.type === selectedType;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-orange-500" />;
      case 'in_progress':
        return <AlertTriangle className="w-4 h-4 text-blue-500" />;
      case 'resolved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'closed':
        return <XCircle className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
    total: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Maintenance Reports</h1>
          <p className="text-gray-600 mt-1">Track and manage maintenance requests</p>        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Report
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Reports</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-3xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
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
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="electrical">Electrical</option>
            <option value="plumbing">Plumbing</option>
            <option value="furniture">Furniture</option>
            <option value="cleanliness">Cleanliness</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map((report) => (
          <div key={report.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(report.status)}
                    <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{report.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <User className="w-4 h-4 mr-2" />
                    <span>{getStudentName(report.studentId)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>Room {getRoomNumber(report.roomId)}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{report.submittedDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleViewReport(report)}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View
                </button>
                {(user?.role === 'sub_warden' || user?.role === 'welfare_officer') && (
                  <button 
                    onClick={() => handleEditReport(report)}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Edit3 className="w-4 h-4 mr-1" />
                    Update
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>      {filteredReports.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Add Report Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Submit New Maintenance Report"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={newReport.title}
              onChange={(e) => setNewReport({...newReport, title: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={newReport.description}
              onChange={(e) => setNewReport({...newReport, description: e.target.value})}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Detailed description of the maintenance issue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={newReport.type}
                onChange={(e) => setNewReport({...newReport, type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="electrical">Electrical</option>
                <option value="plumbing">Plumbing</option>
                <option value="furniture">Furniture</option>
                <option value="cleanliness">Cleanliness</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority *
              </label>
              <select
                value={newReport.priority}
                onChange={(e) => setNewReport({...newReport, priority: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room *
              </label>
              <select
                value={newReport.roomId}
                onChange={(e) => setNewReport({...newReport, roomId: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select room</option>
                {mockRooms.slice(0, 10).map(room => (
                  <option key={room.id} value={room.id}>Room {room.roomNumber}</option>
                ))}
              </select>
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
              onClick={handleAddReport}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit Report
            </button>
          </div>
        </div>
      </Modal>

      {/* View Report Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Report Details"
        size="lg"
      >
        {selectedReport && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-900">{selectedReport.title}</h3>
              <div className="flex space-x-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(selectedReport.priority)}`}>
                  {selectedReport.priority}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedReport.status)}`}>
                  {selectedReport.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <p className="text-gray-900 capitalize">{selectedReport.type}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                <p className="text-gray-900">{getStudentName(selectedReport.studentId)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <p className="text-gray-900">Room {getRoomNumber(selectedReport.roomId)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Submitted Date</label>
                <p className="text-gray-900">{selectedReport.submittedDate.toLocaleDateString()}</p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <p className="text-gray-900">{selectedReport.description}</p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Report Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Update Report Status"
        size="lg"
      >
        {editingReport && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">{editingReport.title}</h4>
              <p className="text-gray-600 text-sm">{editingReport.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={editingReport.status}
                  onChange={(e) => setEditingReport({...editingReport, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={editingReport.priority}
                  onChange={(e) => setEditingReport({...editingReport, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any notes about the progress or resolution"
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
                onClick={handleUpdateReport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Report
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Reports;
