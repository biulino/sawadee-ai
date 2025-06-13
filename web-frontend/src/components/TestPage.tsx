import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const TestPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [selectedTenant, setSelectedTenant] = useState('default');
  const { user, isAuthenticated, isAdmin, isHotelOwner, isCustomer } = useAuth();

  const tenantOptions = [
    { key: 'default', name: 'SawadeeAI Cappadocia Hotel' },
    { key: 'cappadocia', name: 'Kapadokya Cave Resort' }
  ];

  const loadData = async () => {
    try {
      setLoading(true);
      console.log(`Starting HotelInfo API call for tenant: ${selectedTenant}...`);
      const response = await fetch('http://localhost:8090/api/hotel-info', {
        headers: {
          'X-Tenant-Key': selectedTenant
        }
      });
      const result = await response.json();
      console.log('HotelInfo API response:', result);
      setData(result);
    } catch (error) {
      console.error('API Error:', error);
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedTenant]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-4">Hotel Information Test</h1>
      
      {/* Authentication Status */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-3">Authentication Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isAuthenticated ? '✓ Authenticated' : '✗ Not Authenticated'}
            </span>
          </div>
          {isAuthenticated && user && (
            <>
              <div>
                <strong>User:</strong> {user.firstName} {user.lastName} ({user.username})
              </div>
              <div>
                <strong>Email:</strong> {user.email}
              </div>
              <div>
                <strong>Roles:</strong> {user.roles.join(', ')}
              </div>
              <div className="flex space-x-2">
                {isAdmin && <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">Admin</span>}
                {isHotelOwner && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">Hotel Owner</span>}
                {isCustomer && <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">Customer</span>}
              </div>
            </>
          )}
        </div>
      </div>
      
      {/* Tenant Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Hotel Tenant:
        </label>
        <select
          value={selectedTenant}
          onChange={(e) => setSelectedTenant(e.target.value)}
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          {tenantOptions.map((option) => (
            <option key={option.key} value={option.key}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl mb-4">Hotel Information:</h2>
        {data && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-lg">{data.name}</h3>
              <p className="text-gray-600">{data.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold">Contact Info:</h4>
                <p>Phone: {data.phone}</p>
                <p>Email: {data.email}</p>
                <p>Address: {data.address}</p>
              </div>
              <div>
                <h4 className="font-semibold">Operating Hours:</h4>
                <div>
                  {data.operatingHours && Object.entries(data.operatingHours).map(([key, value]: [string, any]) => (
                    <p key={key}>{key}: {value}</p>
                  ))}
                </div>
              </div>
            </div>
            {data.amenities && (
              <div>
                <h4 className="font-semibold">Amenities:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  {data.amenities.map((amenity: string, index: number) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {amenity}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
        <details className="mt-6">
          <summary className="cursor-pointer font-semibold">Raw API Response</summary>
          <pre className="bg-gray-100 p-4 rounded mt-2 text-sm overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
};

export default TestPage;

export {};
