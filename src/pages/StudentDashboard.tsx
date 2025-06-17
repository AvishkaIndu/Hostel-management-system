import React, { useState } from 'react';
import { 
  Home, 
  User, 
  Key, 
  Package, 
  Plus, 
  Edit3,
  Trash2,
  Building
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationsContext';
import { mockRoomAssignments, mockRooms } from '../utils/mockData';
import { FurnitureItem } from '../types';
import Modal from '../components/Common/Modal';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  // Find student's room assignment
  const roomAssignment = mockRoomAssignments.find(assignment => assignment.studentId === user?.id);
  const assignedRoom = roomAssignment ? mockRooms.find(room => room.id === roomAssignment.roomId) : null;
  
  // State for inventory management
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [editingFurniture, setEditingFurniture] = useState<FurnitureItem | null>(null);
  const [furniture, setFurniture] = useState<FurnitureItem[]>(assignedRoom?.furniture || []);
  
  // New furniture form state
  const [newFurniture, setNewFurniture] = useState({
    type: 'bed' as FurnitureItem['type'],
    condition: 'excellent' as FurnitureItem['condition'],
    quantity: 1,
    notes: ''
  });

  const handleAddFurniture = () => {
    if (newFurniture.quantity < 1) {
      addNotification({
        title: 'Validation Error',
        message: 'Quantity must be at least 1.',
        type: 'error'
      });
      return;
    }

    const furnitureItem: FurnitureItem = {
      id: `${newFurniture.type}_${assignedRoom?.id}_${Date.now()}`,
      type: newFurniture.type,
      condition: newFurniture.condition,
      quantity: newFurniture.quantity,
      notes: newFurniture.notes || undefined,
      addedBy: user?.id,
      addedDate: new Date()
    };

    setFurniture(prev => [...prev, furnitureItem]);
    
    addNotification({
      title: 'Furniture Added',
      message: `${furnitureItem.type} has been added to your room inventory.`,
      type: 'success'
    });

    // Reset form
    setNewFurniture({
      type: 'bed',
      condition: 'excellent',
      quantity: 1,
      notes: ''
    });
    setShowInventoryModal(false);
  };

  const handleUpdateFurniture = () => {
    if (!editingFurniture) return;

    if (editingFurniture.quantity < 1) {
      addNotification({
        title: 'Validation Error',
        message: 'Quantity must be at least 1.',
        type: 'error'
      });
      return;
    }

    setFurniture(prev => 
      prev.map(item => 
        item.id === editingFurniture.id ? editingFurniture : item
      )
    );

    addNotification({
      title: 'Furniture Updated',
      message: `${editingFurniture.type} has been updated.`,
      type: 'success'
    });

    setEditingFurniture(null);
  };

  const handleDeleteFurniture = (id: string) => {
    const item = furniture.find(f => f.id === id);
    if (!item) return;

    setFurniture(prev => prev.filter(f => f.id !== id));
    
    addNotification({
      title: 'Furniture Removed',
      message: `${item.type} has been removed from your room inventory.`,
      type: 'success'
    });
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

  const getKeyStatusColor = (status: string) => {
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

  if (!assignedRoom) {
    return (
      <div className="p-6 space-y-8">
        <div className="text-center py-12">
          <Home className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No Room Assigned</h3>
          <p className="mt-1 text-sm text-gray-500">
            You don't have a room assigned yet. Please contact the hostel administration.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Room</h1>
        <p className="text-gray-600 mt-1">Manage your room details and inventory</p>
      </div>

      {/* Room Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Room Details</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Room {assignedRoom.roomNumber}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Home className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Room Number</p>
                <p className="text-lg font-semibold text-gray-900">{assignedRoom.roomNumber}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Building className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Floor</p>
                <p className="text-lg font-semibold text-gray-900">
                  {assignedRoom.floor === 0 ? 'Ground Floor' : `Floor ${assignedRoom.floor}`}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <User className="w-8 h-8 text-purple-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Capacity</p>
                <p className="text-lg font-semibold text-gray-900">{assignedRoom.capacity} students</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center">
              <Key className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Key Status</p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKeyStatusColor(roomAssignment?.keyStatus || 'unknown')}`}>
                  {(roomAssignment?.keyStatus || 'unknown').replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500">Assigned Date</p>
            <p className="text-lg font-semibold text-gray-900">
              {roomAssignment?.assignedDate.toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Academic Year</p>
            <p className="text-lg font-semibold text-gray-900">{roomAssignment?.academicYear}</p>
          </div>
        </div>
      </div>

      {/* Room Inventory */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Room Inventory</h2>
            <button
              onClick={() => setShowInventoryModal(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </button>
          </div>
        </div>

        <div className="p-6">
          {furniture.length === 0 ? (
            <div className="text-center py-8">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inventory items</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add furniture and items to track your room inventory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {furniture.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-medium text-gray-900 capitalize">
                      {item.type.replace('_', ' ')}
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingFurniture(item)}
                        className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteFurniture(item.id)}
                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Quantity</span>
                      <span className="font-medium">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Condition</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConditionColor(item.condition)}`}>
                        {item.condition}
                      </span>
                    </div>
                    {item.notes && (
                      <div className="text-sm">
                        <span className="text-gray-500">Notes:</span>
                        <p className="text-gray-900 mt-1">{item.notes}</p>
                      </div>
                    )}
                    {item.addedDate && (
                      <div className="text-xs text-gray-500">
                        Added: {item.addedDate.toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Furniture Modal */}
      <Modal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        title="Add Furniture Item"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Furniture Type *
              </label>
              <select
                value={newFurniture.type}
                onChange={(e) => setNewFurniture({...newFurniture, type: e.target.value as FurnitureItem['type']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="bed">Bed</option>
                <option value="mattress">Mattress</option>
                <option value="desk">Desk</option>
                <option value="chair">Chair</option>
                <option value="wardrobe">Wardrobe</option>
                <option value="clothes_rack">Clothes Rack</option>
                <option value="cupboard">Cupboard</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condition *
              </label>
              <select
                value={newFurniture.condition}
                onChange={(e) => setNewFurniture({...newFurniture, condition: e.target.value as FurnitureItem['condition']})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="broken">Broken</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              min="1"
              value={newFurniture.quantity}
              onChange={(e) => setNewFurniture({...newFurniture, quantity: parseInt(e.target.value) || 1})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={newFurniture.notes}
              onChange={(e) => setNewFurniture({...newFurniture, notes: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Add any additional notes about this item..."
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowInventoryModal(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddFurniture}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Item
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Furniture Modal */}
      <Modal
        isOpen={!!editingFurniture}
        onClose={() => setEditingFurniture(null)}
        title="Edit Furniture Item"
      >
        {editingFurniture && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Furniture Type *
                </label>
                <select
                  value={editingFurniture.type}
                  onChange={(e) => setEditingFurniture({...editingFurniture, type: e.target.value as FurnitureItem['type']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="bed">Bed</option>
                  <option value="mattress">Mattress</option>
                  <option value="desk">Desk</option>
                  <option value="chair">Chair</option>
                  <option value="wardrobe">Wardrobe</option>
                  <option value="clothes_rack">Clothes Rack</option>
                  <option value="cupboard">Cupboard</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condition *
                </label>
                <select
                  value={editingFurniture.condition}
                  onChange={(e) => setEditingFurniture({...editingFurniture, condition: e.target.value as FurnitureItem['condition']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="poor">Poor</option>
                  <option value="broken">Broken</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                min="1"
                value={editingFurniture.quantity}
                onChange={(e) => setEditingFurniture({...editingFurniture, quantity: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={editingFurniture.notes || ''}
                onChange={(e) => setEditingFurniture({...editingFurniture, notes: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add any additional notes about this item..."
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setEditingFurniture(null)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateFurniture}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Item
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StudentDashboard;
