export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'student' | 'sub_warden' | 'welfare_officer';
  studentId?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  roomAssignment?: RoomAssignment;
}

export interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  capacity: number;
  currentOccupancy: number;
  furniture: FurnitureItem[];
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  lastInspection?: Date;
}

export interface FurnitureItem {
  id: string;
  type: 'bed' | 'mattress' | 'desk' | 'chair' | 'wardrobe' | 'clothes_rack' | 'cupboard' | 'other';
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  quantity: number;
  lastMaintenance?: Date;
  notes?: string;
  addedBy?: string;
  addedDate?: Date;
}

export interface RoomAssignment {
  id: string;
  studentId: string;
  roomId: string;
  assignedDate: Date;
  academicYear: string;
  keyStatus: 'with_student' | 'with_warden' | 'lost';
  lastHandoverDate?: Date;
}

export interface Report {
  id: string;
  studentId: string;
  roomId: string;
  type: 'electrical' | 'plumbing' | 'furniture' | 'cleanliness' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  submittedDate: Date;
  assignedTo?: string;
  resolvedDate?: Date;
  images?: string[];
}

export interface RoomRequest {
  id: string;
  studentId: string;
  requestType: 'temporary' | 'interview' | 'medical' | 'other';
  reason: string;
  preferredRooms: string[];
  requestedDate: Date;
  duration: number; // in days
  status: 'pending' | 'approved' | 'denied' | 'expired';
  approvedBy?: string;
  approvalDate?: Date;
  notes?: string;
}

export interface KeyHandover {
  id: string;
  studentId: string;
  roomId: string;
  handoverType: 'student_to_warden' | 'warden_to_student';
  wardenId: string;
  timestamp: Date;
  confirmed: boolean;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'general' | 'maintenance' | 'emergency' | 'event';
  priority: 'low' | 'medium' | 'high';
  targetFloors?: number[];
  createdBy: string;
  createdDate: Date;
  expiryDate?: Date;
  active: boolean;
}