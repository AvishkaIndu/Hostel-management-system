import { Room, Report, RoomRequest, Announcement, User, RoomAssignment } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@university.edu',
    firstName: 'John',
    lastName: 'Doe',
    role: 'student',
    studentId: 'STU2024001',
    phoneNumber: '+1234567890',
    emergencyContact: '+1234567891',
  },
  {
    id: '2',
    email: 'warden@university.edu',
    firstName: 'Alice',
    lastName: 'Smith',
    role: 'sub_warden',
    phoneNumber: '+1234567892',
  },
  {
    id: '3',
    email: 'welfare@university.edu',
    firstName: 'Bob',
    lastName: 'Johnson',
    role: 'welfare_officer',
    phoneNumber: '+1234567893',
  },
];

export const mockRooms: Room[] = [
  // Ground floor rooms (15 rooms)
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `room_g_${i + 1}`,
    roomNumber: `G${String(i + 1).padStart(2, '0')}`,
    floor: 0,
    capacity: 2,
    currentOccupancy: Math.floor(Math.random() * 3),
    furniture: [
      { id: `bed_g_${i + 1}_1`, type: 'bed' as const, condition: 'good' as const },
      { id: `bed_g_${i + 1}_2`, type: 'bed' as const, condition: 'excellent' as const },
      { id: `desk_g_${i + 1}`, type: 'desk' as const, condition: 'good' as const },
      { id: `chair_g_${i + 1}`, type: 'chair' as const, condition: 'fair' as const },
    ],
    status: ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)] as any,
  })),
  // 2nd floor rooms (28 rooms)
  ...Array.from({ length: 28 }, (_, i) => ({
    id: `room_2_${i + 1}`,
    roomNumber: `2${String(i + 1).padStart(2, '0')}`,
    floor: 2,
    capacity: 2,
    currentOccupancy: Math.floor(Math.random() * 3),
    furniture: [
      { id: `bed_2_${i + 1}_1`, type: 'bed' as const, condition: 'good' as const },
      { id: `bed_2_${i + 1}_2`, type: 'bed' as const, condition: 'excellent' as const },
      { id: `desk_2_${i + 1}`, type: 'desk' as const, condition: 'good' as const },
      { id: `chair_2_${i + 1}`, type: 'chair' as const, condition: 'fair' as const },
    ],
    status: ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)] as any,
  })),
  // 3rd floor rooms (28 rooms)
  ...Array.from({ length: 28 }, (_, i) => ({
    id: `room_3_${i + 1}`,
    roomNumber: `3${String(i + 1).padStart(2, '0')}`,
    floor: 3,
    capacity: 2,
    currentOccupancy: Math.floor(Math.random() * 3),
    furniture: [
      { id: `bed_3_${i + 1}_1`, type: 'bed' as const, condition: 'good' as const },
      { id: `bed_3_${i + 1}_2`, type: 'bed' as const, condition: 'excellent' as const },
      { id: `desk_3_${i + 1}`, type: 'desk' as const, condition: 'good' as const },
      { id: `chair_3_${i + 1}`, type: 'chair' as const, condition: 'fair' as const },
    ],
    status: ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)] as any,
  })),
  // 4th floor rooms (27 rooms)
  ...Array.from({ length: 27 }, (_, i) => ({
    id: `room_4_${i + 1}`,
    roomNumber: `4${String(i + 1).padStart(2, '0')}`,
    floor: 4,
    capacity: 2,
    currentOccupancy: Math.floor(Math.random() * 3),
    furniture: [
      { id: `bed_4_${i + 1}_1`, type: 'bed' as const, condition: 'good' as const },
      { id: `bed_4_${i + 1}_2`, type: 'bed' as const, condition: 'excellent' as const },
      { id: `desk_4_${i + 1}`, type: 'desk' as const, condition: 'good' as const },
      { id: `chair_4_${i + 1}`, type: 'chair' as const, condition: 'fair' as const },
    ],
    status: ['available', 'occupied', 'maintenance'][Math.floor(Math.random() * 3)] as any,
  })),
];

export const mockReports: Report[] = [
  {
    id: '1',
    studentId: '1',
    roomId: 'room_g_1',
    type: 'electrical',
    title: 'Faulty Light Switch',
    description: 'The main light switch in my room is not working properly. It flickers and sometimes doesn\'t turn on at all.',
    priority: 'medium',
    status: 'pending',
    submittedDate: new Date('2024-01-15'),
  },
  {
    id: '2',
    studentId: '1',
    roomId: 'room_g_1',
    type: 'furniture',
    title: 'Broken Chair',
    description: 'One of the study chairs has a broken leg and is unsafe to use.',
    priority: 'low',
    status: 'in_progress',
    submittedDate: new Date('2024-01-12'),
    assignedTo: '2',
  },
];

export const mockRoomRequests: RoomRequest[] = [
  {
    id: '1',
    studentId: '1',
    requestType: 'interview',
    reason: 'I have a virtual job interview and need a quiet environment.',
    preferredRooms: ['room_2_15', 'room_3_20'],
    requestedDate: new Date('2024-01-20'),
    duration: 1,
    status: 'pending',
  },
];

export const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'Scheduled Power Outage',
    content: 'There will be a scheduled power outage on January 18th from 10:00 AM to 2:00 PM for maintenance work.',
    type: 'maintenance',
    priority: 'high',
    targetFloors: [2, 3, 4],
    createdBy: '2',
    createdDate: new Date('2024-01-16'),
    active: true,
  },
  {
    id: '2',
    title: 'Room Inspection Notice',
    content: 'Monthly room inspections will be conducted next week. Please ensure your rooms are tidy.',
    type: 'general',
    priority: 'medium',
    createdBy: '2',
    createdDate: new Date('2024-01-14'),
    active: true,
  },
];

export const mockRoomAssignments: RoomAssignment[] = [
  {
    id: '1',
    studentId: '1',
    roomId: 'room_g_1',
    assignedDate: new Date('2023-09-01'),
    academicYear: '2023-24',
    keyStatus: 'with_student',
  },
];