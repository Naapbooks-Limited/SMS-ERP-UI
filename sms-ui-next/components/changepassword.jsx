// changepassword.jsx
"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import CallFor from '@/utilities/CallFor';

const ChangePasswordScreen = () => {
  const userData = JSON.parse(sessionStorage.getItem('userData') || '{}');
  const Uid = userData.uid;

  const [formData, setFormData] = useState({
    uid: Uid,
    emailId: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.emailId.trim()) {
      newErrors.emailId = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailId)) {
      newErrors.emailId = 'Please enter a valid email address';
    }

    if (!formData.oldPassword) newErrors.oldPassword = 'Current password is required';
    if (!formData.newPassword) newErrors.newPassword = 'New password is required';
    else if (formData.newPassword.length < 6)
      newErrors.newPassword = 'New password must be at least 6 characters';

    if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your new password';
    else if (formData.newPassword !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';

    if (formData.oldPassword && formData.newPassword && formData.oldPassword === formData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await CallFor('/v2/account/ChangePassword', 'Post', {
        uid: Uid,
        emailId: formData.emailId,
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      }, 'Auth');

      if (response?.status === 200) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setFormData({ uid: '', emailId: '', oldPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: 'Failed to change password. Please try again.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please check your connection and try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h1>
            <p className="text-gray-600">Update your account password securely</p>
          </div>

          {message.text && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <div className="space-y-6">
            <InputField
              label="Email Address"
              icon={Mail}
              type="email"
              name="emailId"
              value={formData.emailId}
              onChange={handleInputChange}
              error={errors.emailId}
              placeholder="Enter your email address"
            />

            <PasswordField
              label="Current Password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleInputChange}
              show={showPasswords.old}
              toggle={() => togglePasswordVisibility('old')}
              error={errors.oldPassword}
              placeholder="Enter current password"
            />

            <PasswordField
              label="New Password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              show={showPasswords.new}
              toggle={() => togglePasswordVisibility('new')}
              error={errors.newPassword}
              placeholder="Enter new password"
            />

            <PasswordField
              label="Confirm New Password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              show={showPasswords.confirm}
              toggle={() => togglePasswordVisibility('confirm')}
              error={errors.confirmPassword}
              placeholder="Confirm new password"
            />

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Changing Password...
                </div>
              ) : (
                'Change Password'
              )}
            </button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">Make sure your new password is strong and unique</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const InputField = ({ label, icon: Icon, error, ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon className="h-5 w-5 text-gray-400" />
      </div>
      <input
        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
        {...props}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

const PasswordField = ({ label, name, value, onChange, show, toggle, error, placeholder }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Lock className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type={show ? 'text' : 'password'}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      />
      <button type="button" onClick={toggle} className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {show ? <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" /> : <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />}
      </button>
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

export default ChangePasswordScreen;