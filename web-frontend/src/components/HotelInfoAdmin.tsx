import React, { useState, useEffect } from 'react';
import { HotelInfo, OperatingHours, HotelPolicies } from '../types';
import { apiService } from '../services/api';

interface HotelInfoAdminProps {
  onClose: () => void;
}

const HotelInfoAdmin: React.FC<HotelInfoAdminProps> = ({ onClose }) => {
  const [hotelInfo, setHotelInfo] = useState<HotelInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [formData, setFormData] = useState<Partial<HotelInfo>>({
    name: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
    operatingHours: {
      reception: '24/7',
      restaurant: '07:00 - 23:00',
      spa: '09:00 - 21:00',
      pool: '06:00 - 22:00',
      gym: '06:00 - 23:00',
      roomService: '24/7',
      concierge: '08:00 - 20:00'
    },
    amenities: [],
    policies: {
      checkIn: '15:00',
      checkOut: '12:00',
      cancellation: '',
      petPolicy: '',
      smokingPolicy: '',
      childrenPolicy: ''
    },
    location: {
      city: '',
      country: '',
      timezone: 'Europe/Istanbul'
    }
  });

  useEffect(() => {
    loadHotelInfo();
  }, []);

  const loadHotelInfo = async () => {
    try {
      setLoading(true);
      const data = await apiService.getHotelInfo();
      if (data) {
        setHotelInfo(data);
        setFormData(data);
      } else {
        setIsEditing(true); // No data exists, start in edit mode
      }
    } catch (err) {
      console.error('Failed to load hotel info:', err);
      setError('Failed to load hotel information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      let savedData: HotelInfo;
      if (hotelInfo) {
        // Update existing
        savedData = await apiService.updateHotelInfo(formData);
      } else {
        // Create new
        savedData = await apiService.createHotelInfo(formData as Omit<HotelInfo, 'id'>);
      }

      setHotelInfo(savedData);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save hotel info:', err);
      setError('Failed to save hotel information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hotelInfo) {
      setFormData(hotelInfo);
      setIsEditing(false);
    } else {
      onClose();
    }
  };

  const updateOperatingHours = (key: keyof OperatingHours, value: string) => {
    setFormData(prev => ({
      ...prev,
      operatingHours: {
        ...prev.operatingHours!,
        [key]: value
      }
    }));
  };

  const updatePolicies = (key: keyof HotelPolicies, value: string) => {
    setFormData(prev => ({
      ...prev,
      policies: {
        ...prev.policies!,
        [key]: value
      }
    }));
  };

  const updateAmenities = (amenities: string) => {
    const amenitiesList = amenities.split('\n').filter(a => a.trim());
    setFormData(prev => ({
      ...prev,
      amenities: amenitiesList
    }));
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span>Loading hotel information...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">
            Hotel Information Configuration
          </h2>
          <div className="flex space-x-2">
            {!isEditing && hotelInfo && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {isEditing ? (
            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hotel Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={formData.website || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  required
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  rows={2}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Operating Hours */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Operating Hours</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.operatingHours || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateOperatingHours(key as keyof OperatingHours, e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 24/7 or 09:00 - 21:00"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amenities (one per line)
                </label>
                <textarea
                  value={formData.amenities?.join('\n') || ''}
                  onChange={(e) => updateAmenities(e.target.value)}
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Free Wi-Fi&#10;Swimming Pool&#10;Spa & Wellness Center&#10;..."
                />
              </div>

              {/* Policies */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Hotel Policies</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(formData.policies || {}).map(([key, value]) => (
                    <div key={key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                      </label>
                      {key === 'cancellation' ? (
                        <textarea
                          value={value}
                          onChange={(e) => updatePolicies(key as keyof HotelPolicies, e.target.value)}
                          rows={2}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      ) : (
                        <input
                          type="text"
                          value={value}
                          onChange={(e) => updatePolicies(key as keyof HotelPolicies, e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  <span>{saving ? 'Saving...' : 'Save'}</span>
                </button>
              </div>
            </form>
          ) : hotelInfo ? (
            /* Display Mode */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900">Basic Information</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><span className="font-medium">Name:</span> {hotelInfo.name}</p>
                    <p><span className="font-medium">Email:</span> {hotelInfo.email}</p>
                    <p><span className="font-medium">Phone:</span> {hotelInfo.phone}</p>
                    {hotelInfo.website && (
                      <p><span className="font-medium">Website:</span> 
                        <a href={hotelInfo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 ml-1">
                          {hotelInfo.website}
                        </a>
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900">Location</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <p>{hotelInfo.address}</p>
                    <p><span className="font-medium">City:</span> {hotelInfo.location.city}</p>
                    <p><span className="font-medium">Country:</span> {hotelInfo.location.country}</p>
                  </div>
                </div>
              </div>

              {hotelInfo.description && (
                <div>
                  <h3 className="font-medium text-gray-900">Description</h3>
                  <p className="mt-2 text-sm text-gray-600">{hotelInfo.description}</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-gray-900">Operating Hours</h3>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(hotelInfo.operatingHours).map(([key, value]) => (
                    <p key={key}>
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {value}
                    </p>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Amenities</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {hotelInfo.amenities.map((amenity, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900">Policies</h3>
                <div className="mt-2 space-y-2 text-sm">
                  {Object.entries(hotelInfo.policies).map(([key, value]) => (
                    <p key={key}>
                      <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span> {value}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hotel information configured yet.</p>
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Hotel Information
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HotelInfoAdmin;
