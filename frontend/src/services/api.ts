import axios, { AxiosResponse } from 'axios';
import {
  AuthResponse,
  ApiResponse,
  Event,
  Registration,
  EventsResponse,
  RegistrationsResponse,
  LoginCredentials,
  RegisterData,
  CreateEventData,
  User
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response: AxiosResponse<AuthResponse> = await api.post('/auth/login', credentials);
    return response.data;
  },

  getProfile: async (): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<User>): Promise<ApiResponse<{ user: User }>> => {
    const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.put('/auth/profile', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.put('/auth/change-password', data);
    return response.data;
  }
};

// Events API
export const eventsAPI = {
  getEvents: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    status?: string;
    sortBy?: string;
    order?: string;
  }): Promise<ApiResponse<EventsResponse>> => {
    const response: AxiosResponse<ApiResponse<EventsResponse>> = await api.get('/events', { params });
    return response.data;
  },

  getEventById: async (id: string): Promise<ApiResponse<{ event: Event }>> => {
    const response: AxiosResponse<ApiResponse<{ event: Event }>> = await api.get(`/events/${id}`);
    return response.data;
  },

  createEvent: async (data: CreateEventData): Promise<ApiResponse<{ event: Event }>> => {
    const response: AxiosResponse<ApiResponse<{ event: Event }>> = await api.post('/events', data);
    return response.data;
  },

  updateEvent: async (id: string, data: Partial<CreateEventData>): Promise<ApiResponse<{ event: Event }>> => {
    const response: AxiosResponse<ApiResponse<{ event: Event }>> = await api.put(`/events/${id}`, data);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/events/${id}`);
    return response.data;
  },

  toggleEventStatus: async (id: string): Promise<ApiResponse<{ event: Event }>> => {
    const response: AxiosResponse<ApiResponse<{ event: Event }>> = await api.patch(`/events/${id}/toggle-status`);
    return response.data;
  },

  getMyEvents: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<EventsResponse>> => {
    const response: AxiosResponse<ApiResponse<EventsResponse>> = await api.get('/events/my/events', { params });
    return response.data;
  }
};

// Registrations API
export const registrationsAPI = {
  registerForEvent: async (eventId: string, notes?: string): Promise<ApiResponse<{ registration: Registration }>> => {
    const response: AxiosResponse<ApiResponse<{ registration: Registration }>> = await api.post(
      `/registrations/events/${eventId}`,
      { notes }
    );
    return response.data;
  },

  getMyRegistrations: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<RegistrationsResponse>> => {
    const response: AxiosResponse<ApiResponse<RegistrationsResponse>> = await api.get('/registrations/my', { params });
    return response.data;
  },

  cancelRegistration: async (registrationId: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.delete(`/registrations/${registrationId}`);
    return response.data;
  },

  getEventRegistrations: async (eventId: string, params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<RegistrationsResponse>> => {
    const response: AxiosResponse<ApiResponse<RegistrationsResponse>> = await api.get(
      `/registrations/events/${eventId}`,
      { params }
    );
    return response.data;
  },

  updateRegistrationStatus: async (
    registrationId: string,
    data: { status: string; notes?: string }
  ): Promise<ApiResponse<{ registration: Registration }>> => {
    const response: AxiosResponse<ApiResponse<{ registration: Registration }>> = await api.patch(
      `/registrations/${registrationId}/status`,
      data
    );
    return response.data;
  },

  submitFeedback: async (
    registrationId: string,
    data: { rating: number; comment?: string }
  ): Promise<ApiResponse<{ registration: Registration }>> => {
    const response: AxiosResponse<ApiResponse<{ registration: Registration }>> = await api.post(
      `/registrations/${registrationId}/feedback`,
      data
    );
    return response.data;
  }
};

export default api;