import { User } from '../types';

export const getStoredToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const getStoredUser = (): User | null => {
  const userData = localStorage.getItem('userData');
  return userData ? JSON.parse(userData) : null;
};

export const setAuthData = (token: string, user: User): void => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('userData', JSON.stringify(user));
};

export const clearAuthData = (): void => {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userData');
};

export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};

export const isAdmin = (): boolean => {
  const user = getStoredUser();
  return user?.role === 'admin';
};

export const getCurrentUser = (): User | null => {
  return getStoredUser();
};