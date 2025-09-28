import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { User } from '../types';
import { getCurrentUser, setAuthData } from '../utils/auth';
import './Profile.css';

const Profile: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    studentId: '',
    phone: '',
    department: '',
    year: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const years = ['1st', '2nd', '3rd', '4th', 'Graduate'];

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setProfileData({
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        email: currentUser.email,
        studentId: currentUser.studentId,
        phone: currentUser.phone,
        department: currentUser.department,
        year: currentUser.year
      });
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();

      if (response.success && response.data) {
        const userData = response.data.user;
        setUser(userData);
        setProfileData({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          studentId: userData.studentId,
          phone: userData.phone,
          department: userData.department,
          year: userData.year
        });
      } else {
        setError(response.message || 'Failed to load profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await authAPI.updateProfile(profileData);

      if (response.success && response.data) {
        const updatedUser = response.data.user;
        setUser(updatedUser);

        // Update auth data in localStorage
        const token = localStorage.getItem('authToken');
        if (token) {
          setAuthData(token, updatedUser);
        }

        setSuccess('Profile updated successfully!');
        setIsEditing(false);
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setSaving(true);

    try {
      const response = await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setShowPasswordForm(false);
      } else {
        setError(response.message || 'Failed to change password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        studentId: user.studentId,
        phone: user.phone,
        department: user.department,
        year: user.year
      });
    }
    setIsEditing(false);
    setError('');
  };

  if (loading) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="error-message">Failed to load user profile</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            <span>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
          </div>
          <div className="profile-info">
            <h1>{user.firstName} {user.lastName}</h1>
            <p className="profile-role">{user.role === 'admin' ? 'Administrator' : 'Student'}</p>
            <p className="profile-email">{user.email}</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError('')} className="error-close">×</button>
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
            <button onClick={() => setSuccess('')} className="success-close">×</button>
          </div>
        )}

        <div className="profile-content">
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-btn"
                >
                  Edit Profile
                </button>
              )}
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="studentId">Student ID</label>
                  <input
                    type="text"
                    id="studentId"
                    name="studentId"
                    value={profileData.studentId}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={profileData.department}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="year">Academic Year</label>
                  <select
                    id="year"
                    name="year"
                    value={profileData.year}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    required
                  >
                    {years.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {isEditing && (
                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="cancel-btn"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="profile-section">
            <div className="section-header">
              <h2>Security</h2>
              {!showPasswordForm && (
                <button
                  onClick={() => setShowPasswordForm(true)}
                  className="edit-btn"
                >
                  Change Password
                </button>
              )}
            </div>

            {showPasswordForm && (
              <form onSubmit={handlePasswordSubmit} className="password-form">
                <div className="form-group">
                  <label htmlFor="currentPassword">Current Password</label>
                  <input
                    type="password"
                    id="currentPassword"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="newPassword">New Password</label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword">Confirm New Password</label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    minLength={6}
                  />
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                      });
                    }}
                    className="cancel-btn"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={saving}
                  >
                    {saving ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}

            {!showPasswordForm && (
              <div className="password-info">
                <p>Last updated: {new Date(user.updatedAt).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="profile-section">
            <h2>Account Statistics</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Member Since</span>
                <span className="stat-value">
                  {new Date(user.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Registrations</span>
                <span className="stat-value">
                  {user.registrations?.length || 0}
                </span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Account Status</span>
                <span className={`stat-value ${user.isActive ? 'active' : 'inactive'}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;