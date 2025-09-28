export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  phone: string;
  department: string;
  year: string;
  role: 'student' | 'admin';
  isActive: boolean;
  registrations?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  category: EventCategory;
  organizer: string;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  maxParticipants: number;
  registrationFee: number;
  requirements: string[];
  tags: string[];
  imageUrl?: string;
  isActive: boolean;
  createdBy: User;
  registrations: Registration[];
  registrationCount: number;
  availableSpots: number;
  isRegistrationOpen: boolean;
  eventStatus: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  _id: string;
  user: User;
  event: Event;
  registrationDate: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  notes?: string;
  attendanceStatus: AttendanceStatus;
  feedback?: {
    rating: number;
    comment: string;
    submittedAt: string;
  };
  registrationNumber: string;
  createdAt: string;
  updatedAt: string;
}

export type EventCategory =
  | 'Technical'
  | 'Cultural'
  | 'Sports'
  | 'Workshop'
  | 'Seminar'
  | 'Competition'
  | 'Social'
  | 'Other';

export type EventStatus =
  | 'open'
  | 'full'
  | 'registration_closed'
  | 'completed'
  | 'cancelled';

export type RegistrationStatus =
  | 'confirmed'
  | 'waitlist'
  | 'cancelled';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'refunded'
  | 'not_required';

export type AttendanceStatus =
  | 'not_attended'
  | 'attended'
  | 'partially_attended';

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalEvents?: number;
  totalRegistrations?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface EventsResponse {
  events: Event[];
  pagination: PaginationInfo;
}

export interface RegistrationsResponse {
  registrations: Registration[];
  pagination: PaginationInfo;
  stats?: {
    total: number;
    confirmed: number;
    waitlist: number;
    cancelled: number;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  studentId: string;
  phone: string;
  department: string;
  year: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  category: EventCategory;
  organizer: string;
  venue: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  registrationDeadline: string;
  maxParticipants: number;
  registrationFee: number;
  requirements?: string[];
  tags?: string[];
  imageUrl?: string;
}