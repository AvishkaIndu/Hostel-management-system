import React, { useState } from 'react';
import { 
  Building, 
  Users, 
  Search, 
  Plus, 
  Edit3, 
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import { mockRooms } from '../utils/mockData';
import { useNotifications } from '../context/NotificationsContext';
import Modal from '../components/Common/Modal';

const Rooms: React.FC = () => {
  const { addNotification } = useNotifications();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [editingRoom, setEditingRoom] = useState<any>(null);

  // State management for rooms
  const [rooms, setRooms] = useState(mockRooms);

  // New room form state - Update room numbering to 1-98
  const [newRoom, setNewRoom] = useState({
    roomNumber: '',
    floor: 0,
    capacity: 2,
    status: 'available',
  });

  // Handler functions
  const handleAddRoom = () => {
    if (!newRoom.roomNumber.trim()) {
      addNotification({
        title: 'Validation Error',
        message: 'Please enter a room number.',
        type: 'error'
      });
      return;
    }

    // Validate room number is between 1-98
    const roomNum = parseInt(newRoom.roomNumber);
    if (isNaN(roomNum) || roomNum < 1 || roomNum > 98) {
      addNotification({
        title: 'Validation Error',
        message: 'Room number must be between 1 and 98.',
        type: 'error'
      });
      return;
    }

    // Check if room number already exists
    const existingRoom = rooms.find(room => room.roomNumber === newRoom.roomNumber);
    if (existingRoom) {
      addNotification({
        title: 'Validation Error',
        message: 'Room number already exists.',
        type: 'error'
      });
      return;
    }

    // Create new room with furniture
    const room = {
      id: `room_${newRoom.floor}_${newRoom.roomNumber}`,
      roomNumber: newRoom.roomNumber,
      floor: newRoom.floor,
      capacity: newRoom.capacity,
      currentOccupancy: 0,
      status: newRoom.status as 'available' | 'occupied' | 'maintenance' | 'reserved',
      furniture: [] as any[], // Empty initially, students will add later
    };

    // Add to rooms
    setRooms(prevRooms => [...prevRooms, room]);

    // Add notification
    addNotification({
      title: 'Room Added',
      message: `Room ${newRoom.roomNumber} has been added successfully.`,
      type: 'success'
    });

    setShowAddModal(false);
    setNewRoom({
      roomNumber: '',
      floor: 0,
      capacity: 2,
      status: 'available',
    });
  };

  const handleViewRoom = (room: any) => {
    setSelectedRoom(room);
    setShowViewModal(true);
  };

  const handleEditRoom = (room: any) => {
    setEditingRoom({ ...room });
    setShowEditModal(true);
  };

  const handleUpdateRoom = () => {
    if (!editingRoom) return;

    if (!editingRoom.roomNumber.trim()) {
      addNotification({
        title: 'Validation Error',
        message: 'Please enter a room number.',
        type: 'error'
      });
      return;
    }

    // Validate room number is between 1-98
    const roomNum = parseInt(editingRoom.roomNumber);
    if (isNaN(roomNum) || roomNum < 1 || roomNum > 98) {
      addNotification({
        title: 'Validation Error',
        message: 'Room number must be between 1 and 98.',
        type: 'error'
      });
      return;
    }

    // Check if room number already exists (exclude current room)
    const existingRoom = rooms.find(room => room.roomNumber === editingRoom.roomNumber && room.id !== editingRoom.id);
    if (existingRoom) {
      addNotification({
        title: 'Validation Error',
        message: 'Room number already exists.',
        type: 'error'
      });
      return;
    }

    // Update room
    setRooms(prevRooms => 
      prevRooms.map(room => 
        room.id === editingRoom.id ? { ...editingRoom, status: editingRoom.status as 'available' | 'occupied' | 'maintenance' | 'reserved' } : room
      )
    );

    // Add notification
    addNotification({
      title: 'Room Updated',
      message: `Room ${editingRoom.roomNumber} has been updated successfully.`,
      type: 'success'
    });

    setShowEditModal(false);
    setEditingRoom(null);
  };

  const filteredRooms = mockRooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = selectedFloor === null || room.floor === selectedFloor;
    const matchesStatus = selectedStatus === 'all' || room.status === selectedStatus;
    
    return matchesSearch && matchesFloor && matchesStatus;
  });

  const floors = [0, 2, 3, 4];
  const floorNames = { 0: 'Ground', 2: '2nd', 3: '3rd', 4: '4th' };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'occupied':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'maintenance':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'reserved':
        return <XCircle className="w-4 h-4 text-purple-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-orange-100 text-orange-800';
      case 'reserved':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Room statistics by floor
  const roomStatsByFloor = floors.map(floor => {
    const floorRooms = mockRooms.filter(room => room.floor === floor);
    return {
      floor,
      total: floorRooms.length,
      occupied: floorRooms.filter(r => r.status === 'occupied').length,
      available: floorRooms.filter(r => r.status === 'available').length,
      maintenance: floorRooms.filter(r => r.status === 'maintenance').length,
    };
  });

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Room Management</h1>
          <p className="text-gray-600 mt-1">Manage hostel rooms and track occupancy</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Room
        </button>
      </div>

      {/* Floor Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {roomStatsByFloor.map((stats) => (
          <div key={stats.floor} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">
                  {floorNames[stats.floor as keyof typeof floorNames]} Floor
                </h3>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-blue-600">Occupied</span>
                <span className="font-medium">{stats.occupied}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-green-600">Available</span>
                <span className="font-medium">{stats.available}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-600">Maintenance</span>
                <span className="font-medium">{stats.maintenance}</span>
              </div>
            </div>
            <div className="mt-4 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(stats.occupied / stats.total) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Floor Filter */}
          <select
            value={selectedFloor || ''}
            onChange={(e) => setSelectedFloor(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Floors</option>
            {floors.map(floor => (
              <option key={floor} value={floor}>
                {floorNames[floor as keyof typeof floorNames]} Floor
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
            <option value="maintenance">Maintenance</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => (
          <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Building className="w-5 h-5 text-gray-600" />
                <h3 className="font-bold text-lg text-gray-900">Room {room.roomNumber}</h3>
              </div>
              <div className="flex items-center space-x-1">
                {getStatusIcon(room.status)}
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(room.status)}`}>
                  {room.status}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Floor</span>
                <span className="font-medium">{floorNames[room.floor as keyof typeof floorNames]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Capacity</span>
                <span className="font-medium">{room.capacity} students</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Occupancy</span>
                <span className="font-medium">{room.currentOccupancy}/{room.capacity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Furniture</span>
                <span className="font-medium">{room.furniture.length} items</span>
              </div>
            </div>

            <div className="flex space-x-2">
              <button 
                onClick={() => handleViewRoom(room)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Eye className="w-4 h-4 mr-1" />
                View
              </button>
              <button 
                onClick={() => handleEditRoom(room)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Add Room Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Room"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Room Number *
              </label>
              <input
                type="text"
                value={newRoom.roomNumber}
                onChange={(e) => setNewRoom({...newRoom, roomNumber: e.target.value})}
                placeholder="e.g., 101"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Floor *
              </label>
              <select
                value={newRoom.floor}
                onChange={(e) => setNewRoom({...newRoom, floor: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={0}>Ground Floor</option>
                <option value={1}>Floor 1</option>
                <option value={2}>Floor 2</option>
                <option value={3}>Floor 3</option>
                <option value={4}>Floor 4</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <select
                value={newRoom.capacity}
                onChange={(e) => setNewRoom({...newRoom, capacity: parseInt(e.target.value)})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>Single (1 person)</option>
                <option value={2}>Double (2 people)</option>
                <option value={3}>Triple (3 people)</option>
                <option value={4}>Quad (4 people)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                value={newRoom.status}
                onChange={(e) => setNewRoom({...newRoom, status: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
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
              onClick={handleAddRoom}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Room
            </button>
          </div>
        </div>
      </Modal>

      {/* View Room Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Room Details"
      >
        {selectedRoom && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Room Number</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRoom.roomNumber}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Floor</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRoom.floor === 0 ? 'Ground Floor' : `Floor ${selectedRoom.floor}`}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Capacity</label>
                <p className="mt-1 text-sm text-gray-900">{selectedRoom.capacity} people</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRoom.status)}`}>
                    {selectedRoom.status}
                  </span>
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Room Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Room"
      >
        {editingRoom && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number *
                </label>
                <input
                  type="text"
                  value={editingRoom.roomNumber}
                  onChange={(e) => setEditingRoom({...editingRoom, roomNumber: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Floor *
                </label>
                <select
                  value={editingRoom.floor}
                  onChange={(e) => setEditingRoom({...editingRoom, floor: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={0}>Ground Floor</option>
                  <option value={1}>Floor 1</option>
                  <option value={2}>Floor 2</option>
                  <option value={3}>Floor 3</option>
                  <option value={4}>Floor 4</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacity *
                </label>
                <select
                  value={editingRoom.capacity}
                  onChange={(e) => setEditingRoom({...editingRoom, capacity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>Single (1 person)</option>
                  <option value={2}>Double (2 people)</option>
                  <option value={3}>Triple (3 people)</option>
                  <option value={4}>Quad (4 people)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={editingRoom.status}
                  onChange={(e) => setEditingRoom({...editingRoom, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRoom}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Room
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Rooms;