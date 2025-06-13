import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Building2, 
  Globe, 
  Palette,
  Image,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { TenantConfig } from '../types';
import { apiService } from '../services/api';
import { useTenant } from '../contexts/TenantContext';

interface TenantManagementProps {
  onClose?: () => void;
}

const TenantManagement: React.FC<TenantManagementProps> = ({ onClose }) => {
  const [tenants, setTenants] = useState<TenantConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTenant, setEditingTenant] = useState<TenantConfig | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TenantConfig>>({
    tenantKey: '',
    name: '',
    domain: '',
    primaryColor: '#2B6CB0',
    secondaryColor: '#3182CE',
    logo: '',
    active: true
  });
  const { refreshTenantConfig } = useTenant();

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const fetchedTenants = await apiService.getAllTenants();
      setTenants(fetchedTenants);
      setError(null);
    } catch (err) {
      setError('Failed to fetch tenants');
      console.error('Error fetching tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTenant = async () => {
    try {
      if (!formData.name || !formData.tenantKey || !formData.domain) {
        setError('Name, tenant key, and domain are required');
        return;
      }

      const newTenant = await apiService.createTenant(formData as Omit<TenantConfig, 'id'>);
      setTenants([...tenants, newTenant]);
      setShowCreateForm(false);
      setFormData({
        tenantKey: '',
        name: '',
        domain: '',
        primaryColor: '#2B6CB0',
        secondaryColor: '#3182CE',
        logo: '',
        active: true
      });
      setError(null);
    } catch (err) {
      setError('Failed to create tenant');
      console.error('Error creating tenant:', err);
    }
  };

  const handleUpdateTenant = async (tenant: TenantConfig) => {
    try {
      const updatedTenant = await apiService.updateTenant(tenant.id, tenant);
      setTenants(tenants.map(t => t.id === tenant.id ? updatedTenant : t));
      setEditingTenant(null);
      setError(null);
      
      // Refresh current tenant config if it was updated
      await refreshTenantConfig();
    } catch (err) {
      setError('Failed to update tenant');
      console.error('Error updating tenant:', err);
    }
  };

  const handleDeleteTenant = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return;
    }

    try {
      await apiService.deleteTenant(id);
      setTenants(tenants.filter(t => t.id !== id));
      setError(null);
    } catch (err) {
      setError('Failed to delete tenant');
      console.error('Error deleting tenant:', err);
    }
  };

  const TenantForm: React.FC<{ 
    tenant: Partial<TenantConfig>, 
    onSave: (tenant: TenantConfig) => void, 
    onCancel: () => void,
    isEditing?: boolean 
  }> = ({ tenant, onSave, onCancel, isEditing = false }) => {
    const [localTenant, setLocalTenant] = useState(tenant);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (localTenant.name && localTenant.domain) {
        onSave(localTenant as TenantConfig);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="inline w-4 h-4 mr-1" />
              Tenant Key
            </label>
            <input
              type="text"
              value={localTenant.tenantKey || ''}
              onChange={(e) => setLocalTenant({ ...localTenant, tenantKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sawadeeai, kapadokya, etc."
              pattern="[a-z0-9-]+"
              title="Only lowercase letters, numbers, and hyphens allowed"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Used in subdomain (e.g., sawadeeai.example.com)</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="inline w-4 h-4 mr-1" />
              Tenant Name
            </label>
            <input
              type="text"
              value={localTenant.name || ''}
              onChange={(e) => setLocalTenant({ ...localTenant, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hotel Name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe className="inline w-4 h-4 mr-1" />
              Domain/Subdomain
            </label>
            <input
              type="text"
              value={localTenant.domain || ''}
              onChange={(e) => setLocalTenant({ ...localTenant, domain: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="sawadeeai or sawadeeai.example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Palette className="inline w-4 h-4 mr-1" />
              Primary Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={localTenant.primaryColor || '#2B6CB0'}
                onChange={(e) => setLocalTenant({ ...localTenant, primaryColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={localTenant.primaryColor || '#2B6CB0'}
                onChange={(e) => setLocalTenant({ ...localTenant, primaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#2B6CB0"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Palette className="inline w-4 h-4 mr-1" />
              Secondary Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                value={localTenant.secondaryColor || '#3182CE'}
                onChange={(e) => setLocalTenant({ ...localTenant, secondaryColor: e.target.value })}
                className="w-12 h-10 border border-gray-300 rounded"
              />
              <input
                type="text"
                value={localTenant.secondaryColor || '#3182CE'}
                onChange={(e) => setLocalTenant({ ...localTenant, secondaryColor: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="#3182CE"
              />
            </div>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Image className="inline w-4 h-4 mr-1" />
            Logo URL (optional)
          </label>
          <input
            type="url"
            value={localTenant.logo || ''}
            onChange={(e) => setLocalTenant({ ...localTenant, logo: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://example.com/logo.png"
          />
        </div>
        
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Update' : 'Create'} Tenant
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </button>
        </div>
      </form>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenants...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Tenant Management</h1>
            <p className="text-gray-600 mt-1">Manage hotel brands and their configurations</p>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Add New Tenant Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Tenant
          </button>
        </div>

        {/* Create Form */}
        {showCreateForm && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Create New Tenant</h2>
            <TenantForm
              tenant={formData}
              onSave={handleCreateTenant}
              onCancel={() => {
                setShowCreateForm(false);
                setFormData({
                  name: '',
                  domain: '',
                  primaryColor: '#2B6CB0',
                  secondaryColor: '#3182CE',
                  logo: ''
                });
              }}
            />
          </div>
        )}

        {/* Tenants List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Existing Tenants</h2>
          
          {tenants.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No tenants found. Create your first tenant to get started.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tenants.map((tenant) => (
                <div key={tenant.id} className="bg-white rounded-lg shadow p-6">
                  {editingTenant?.id === tenant.id ? (
                    <TenantForm
                      tenant={editingTenant}
                      onSave={handleUpdateTenant}
                      onCancel={() => setEditingTenant(null)}
                      isEditing={true}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: tenant.primaryColor }}
                        >
                          {tenant.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-800">{tenant.name}</h3>
                          <p className="text-gray-600">Key: {tenant.tenantKey}</p>
                          <p className="text-gray-600">Domain: {tenant.domain}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: tenant.primaryColor }}
                              ></div>
                              <span className="text-sm text-gray-500">{tenant.primaryColor}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div 
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: tenant.secondaryColor }}
                              ></div>
                              <span className="text-sm text-gray-500">{tenant.secondaryColor}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setEditingTenant(tenant)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTenant(tenant.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantManagement;
