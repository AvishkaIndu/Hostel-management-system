import React, { useState } from 'react';
import { 
  Building, 
  Package, 
  Search, 
  Eye,
  User,
  Calendar,
  Filter
} from 'lucide-react';
import { mockRooms, mockRoomAssignments, mockUsers } from '../utils/mockData';
import { useAuth } from '../context/AuthContext';
import { FurnitureItem } from '../types';
import Modal from '../components/Common/Modal';

const RoomInventory: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const handleViewInventory = (room: any) => {
    setSelectedRoom(room);
    setShowInventoryModal(true);
  };

  const getConditionColor = (condition: FurnitureItem['condition']) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'fair':
        return 'bg-yellow-100 text-yellow-800';
      case 'poor':
        return 'bg-orange-100 text-orange-800';
      case 'broken':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-blue-100 text-blue-800';
      case 'maintenance':
        return 'bg-red-100 text-red-800';
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAssignedStudent = (roomId: string) => {
    const assignment = mockRoomAssignments.find(a => a.roomId === roomId);
    if (!assignment) return null;
    const student = mockUsers.find(u => u.id === assignment.studentId);
    return student ? `${student.firstName} ${student.lastName}` : null;
  };

  const filteredRooms = mockRooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFloor = selectedFloor === null || room.floor === selectedFloor;
    const matchesStatus = selectedStatus === 'all' || room.status === selectedStatus;
    return matchesSearch && matchesFloor && matchesStatus;
  });

  const floorNames = {
    0: 'Ground Floor',
    1: 'First Floor',
    2: 'Second Floor',
    3: 'Third Floor',
    4: 'Fourth Floor'
  };

  const floors = [...new Set(mockRooms.map(room => room.floor))].sort();

  if (user?.role === 'student') {
    return (
      <div className="p-6 space-y-8">
        <div className="text-center py-12">
          <Building className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-1 text-sm text-gray-500">
            Only wardens can view room inventories.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Room Inventories</h1>
        <p className="text-gray-600 mt-1">View furniture and items in each room</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Rooms
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Floor
            </label>
            <select
              value={selectedFloor || ''}
              onChange={(e) => setSelectedFloor(e.target.value ? parseInt(e.target.value) : null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Floors</option>
              {floors.map(floor => (
                <option key={floor} value={floor}>
                  {floorNames[floor as keyof typeof floorNames]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="maintenance">Maintenance</option>
              <option value="reserved">Reserved</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedFloor(null);
                setSelectedStatus('all');
              }}
              className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4 mx-auto" />
            </button>
          </div>
        </div>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRooms.map((room) => {
          const assignedStudent = getAssignedStudent(room.id);
          const totalItems = room.furniture.reduce((sum, item) => sum + item.quantity, 0);
          
          return (
            <div key={room.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Room {room.roomNumber}
                  </h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                    {room.status}
                  </span>
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
                    <span className="text-gray-600">Current Occupancy</span>
                    <span className="font-medium">{room.currentOccupancy}/{room.capacity}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Inventory Items</span>
                    <span className="font-medium">{totalItems} items</span>
                  </div>
                  {assignedStudent && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Assigned Student</span>
                      <span className="font-medium text-blue-600">{assignedStudent}</span>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleViewInventory(room)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Inventory
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
        </div>
      )}

      {/* Room Inventory Modal */}
      <Modal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        title={`Room ${selectedRoom?.roomNumber} - Inventory`}
        size="lg"
      >
        {selectedRoom && (
          <div className="space-y-6">
            {/* Room Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Floor:</span>
                  <span className="ml-2 font-medium">{floorNames[selectedRoom.floor as keyof typeof floorNames]}</span>
                </div>
                <div>
                  <span className="text-gray-500">Capacity:</span>
                  <span className="ml-2 font-medium">{selectedRoom.capacity} students</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoom.status)}`}>
                    {selectedRoom.status}
                  </span>
                </div>
              </div>
              {getAssignedStudent(selectedRoom.id) && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-gray-500 mr-2" />
                    <span className="text-sm text-gray-500">Assigned Student:</span>
                    <span className="ml-2 text-sm font-medium text-blue-600">{getAssignedStudent(selectedRoom.id)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory Items */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Furniture & Items</h3>
              {selectedRoom.furniture.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This room doesn't have any inventory items recorded.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedRoom.furniture.map((item: FurnitureItem) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-lg font-medium text-gray-900 capitalize">
                          {item.type.replace('_', ' ')}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                          {item.condition}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Quantity</span>
                          <span className="font-medium">{item.quantity}</span>
                        </div>
                        {item.notes && (
                          <div className="text-sm">
                            <span className="text-gray-500">Notes:</span>
                            <p className="text-gray-900 mt-1">{item.notes}</p>
                          </div>
                        )}
                        {item.addedDate && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            Added: {item.addedDate.toLocaleDateString()}
                          </div>
                        )}
                        {item.lastMaintenance && (
                          <div className="flex items-center text-xs text-gray-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            Last Maintenance: {item.lastMaintenance.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowInventoryModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default RoomInventory;
