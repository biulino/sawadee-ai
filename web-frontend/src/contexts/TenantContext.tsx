import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TenantConfig } from '../types';
import { apiService } from '../services/api';
import { validateAndExtractTenant } from '../config/domainConfig';

interface TenantContextType {
  tenantConfig: TenantConfig | null;
  tenantKey: string | null;
  isLoading: boolean;
  error: string | null;
  refreshTenantConfig: () => Promise<void>;
  setTenantKey: (key: string | null) => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenantConfig, setTenantConfig] = useState<TenantConfig | null>(null);
  const [tenantKey, setTenantKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract tenant key from URL using domain config
  const extractTenantKey = (): string | null => {
    const { tenantKey, isValid } = validateAndExtractTenant();
    
    if (!isValid) {
      console.warn('Invalid tenant detected, falling back to default');
      return null;
    }
    
    return tenantKey;
  };

  // Fetch tenant configuration
  const fetchTenantConfig = async (key: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const config = await apiService.getTenantConfig(key);
      setTenantConfig(config);
    } catch (err) {
      console.error('Failed to fetch tenant config:', err);
      setError('Failed to load tenant configuration');
      
      // Fallback to default config for development
      setTenantConfig({
        id: 'default',
        tenantKey: 'default',
        name: 'SawadeeAI Hotel',
        domain: 'localhost',
        primaryColor: '#2B6CB0',
        secondaryColor: '#3182CE',
        logo: undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh tenant configuration
  const refreshTenantConfig = async (): Promise<void> => {
    if (tenantKey) {
      await fetchTenantConfig(tenantKey);
    }
  };

  // Initialize tenant context on mount
  useEffect(() => {
    const key = extractTenantKey();
    setTenantKey(key);
    
    if (key) {
      fetchTenantConfig(key);
    } else {
      // Set default configuration when no tenant is specified
      setTenantConfig({
        id: 'default',
        tenantKey: 'default',
        name: 'SawadeeAI Hotel',
        domain: 'localhost',
        primaryColor: '#2B6CB0',
        secondaryColor: '#3182CE',
        logo: undefined
      });
    }
  }, []);

  // Update tenant config when tenantKey changes
  useEffect(() => {
    if (tenantKey) {
      fetchTenantConfig(tenantKey);
    }
  }, [tenantKey]);

  const value: TenantContextType = {
    tenantConfig,
    tenantKey,
    isLoading,
    error,
    refreshTenantConfig,
    setTenantKey
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

export default TenantContext;
