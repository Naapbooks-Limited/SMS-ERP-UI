"use client"
import React, { useState, useEffect } from 'react';
import { Upload, X, Save, User, Image, Code, FileText, Smartphone, Monitor } from 'lucide-react';

import CallFor2 from '@/utilities/CallFor2';
import { toast as reToast } from "react-hot-toast";

const ProfileEditor = () => {
  const [profile, setProfile] = useState({
    VendorId: 0,
    Description: '',
    CustomCss: '',
    ProfilePictureId: null,
    ProfilePictureUrl: '',
    BannerPictureId: null,
    BannerPictureUrl: '',
    MobileBannerPictureId: null,
    MobileBannerPictureUrl: '',
    Locales: [{ LanguageId: 1, Description: '' }],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingType, setUploadingType] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await CallFor2('api/VendorShopAdminApi/Profile', "get", null, "Auth");
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await CallFor2(
        `api/VendorShopAdminApi/Profile`,
        "post",
        profile,
        "Auth"
      );

      if (response) {
        reToast.success('Profile saved successfully!');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      reToast.error('Error saving profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (type) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        setUploadingType(type);
        const formData = new FormData();
        formData.append('file', file);

        try {
          const response = await CallFor2('api-fe/Account/UploadPicture', "post", formData, "authWithContentTypeMultipart");

          if (response.data.Data && response.data.Data.PictureId) {
            setProfile(prev => ({
              ...prev,
              [`${type}PictureId`]: response.data.Data.PictureId,
              [`${type}PictureUrl`]: response.data.Data.PictureUrl
            }));
          } else {
            throw new Error('Invalid response from server');
          }
        } catch (error) {
          console.error('Error uploading image:', error);
          reToast.error('Error uploading image. Please try again.');
        } finally {
          setUploadingType(null);
        }
      }
    };
    input.click();
  };

  const handleImageRemove = (type) => {
    setProfile(prev => ({
      ...prev,
      [`${type}PictureId`]: null,
      [`${type}PictureUrl`]: ''
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your store profile and appearance</p>
        </div>

        <div className="space-y-8">
          {/* Description Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">Store Description</h2>
              </div>
            </div>
            <div className="p-6">
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                rows="5"
                name="Description"
                value={profile.Description || ''}
                onChange={handleInputChange}
                placeholder="Describe your store and what makes it special..."
              />
            </div>
          </div>

          {/* Images Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Image className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">Images</h2>
              </div>
            </div>
            <div className="p-6">
              {/* Profile Picture */}
              <div className="mb-8">
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
                    <div className="w-24 h-24 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
                      {profile.ProfilePictureUrl ? (
                        <img 
                          src={profile.ProfilePictureUrl} 
                          alt="Profile" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1 pt-8">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleImageUpload('Profile')}
                        disabled={uploadingType === 'Profile'}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                      >
                        {uploadingType === 'Profile' ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {uploadingType === 'Profile' ? 'Uploading...' : 'Upload'}
                      </button>
                      {profile.ProfilePictureUrl && (
                        <button
                          onClick={() => handleImageRemove('Profile')}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                        >
                          <X className="w-4 h-4" />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Banner Pictures */}
              <div className="space-y-8">
                {/* Desktop Banner */}
                <div>
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Desktop Banner</label>
                      <div className="w-48 h-24 bg-gray-100 rounded-md overflow-hidden border-2 border-gray-200">
                        {profile.BannerPictureUrl ? (
                          <img 
                            src={profile.BannerPictureUrl} 
                            alt="Banner" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Monitor className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 pt-8">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleImageUpload('Banner')}
                          disabled={uploadingType === 'Banner'}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                        >
                          {uploadingType === 'Banner' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploadingType === 'Banner' ? 'Uploading...' : 'Upload'}
                        </button>
                        {profile.BannerPictureUrl && (
                          <button
                            onClick={() => handleImageRemove('Banner')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Mobile Banner */}
                <div>
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 mb-3">Mobile Banner</label>
                      <div className="w-32 h-24 bg-gray-100 rounded-md overflow-hidden border-2 border-gray-200">
                        {profile.MobileBannerPictureUrl ? (
                          <img 
                            src={profile.MobileBannerPictureUrl} 
                            alt="Mobile Banner" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Smartphone className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 pt-8">
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleImageUpload('MobileBanner')}
                          disabled={uploadingType === 'MobileBanner'}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
                        >
                          {uploadingType === 'MobileBanner' ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-gray-600"></div>
                          ) : (
                            <Upload className="w-4 h-4" />
                          )}
                          {uploadingType === 'MobileBanner' ? 'Uploading...' : 'Upload'}
                        </button>
                        {profile.MobileBannerPictureUrl && (
                          <button
                            onClick={() => handleImageRemove('MobileBanner')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                          >
                            <X className="w-4 h-4" />
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Custom CSS Section */}
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-gray-500" />
                <h2 className="text-lg font-medium text-gray-900">Custom CSS</h2>
              </div>
            </div>
            <div className="p-6">
              <textarea
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none transition-colors"
                rows="6"
                name="CustomCss"
                value={profile.CustomCss || ''}
                onChange={handleInputChange}
                placeholder="/* Enter your custom CSS here */"
              />
              <p className="text-sm text-gray-500 mt-2">
                Add custom CSS to style your store
              </p>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEditor;