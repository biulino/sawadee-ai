import axios, { AxiosInstance } from 'axios';
import { 
  LandingPageConfig,
  LandingPageConfigResponse,
  LandingPageBanner, 
  ServiceShortcut,
  ChatMessage,
  ChatResponse,
  TenantConfig,
  HotelInfo
} from '../types';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8090/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Tenant management for API requests
let currentTenantId: string | null = null;

export const setCurrentTenantId = (tenantId: string | null) => {
  currentTenantId = tenantId;
};

export const getCurrentTenantId = (): string | null => {
  return currentTenantId;
};

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Add tenant header if available
  if (currentTenantId) {
    config.headers['X-Tenant-ID'] = currentTenantId;
  }
  
  return config;
});

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Mock data that matches the exact type structure
const mockLandingPageConfig: LandingPageConfig = {
  id: 1,
  hotelTitle: 'SawadeeAI Hotel',
  welcomeHeading: 'Welcome to SawadeeAI Hotel',
  welcomeSubtitle: 'Experience luxury and comfort in the heart of the city',
  assistantPrompt: 'How can I help you today?',
  assistantButtonText: 'Chat with us',
  primaryColor: '#2B6CB0',
  secondaryColor: '#3182CE',
  bannerRotationInterval: 5000,
  active: true,
  banners: [
    {
      id: 1,
      title: 'Special Promotion',
      subtitle: 'Book now and save 20%',
      imageUrl: '/assets/promo-banner.jpg',
      ctaText: 'Book Now',
      ctaLink: '/booking',
      displayOrder: 1,
      active: true
    }
  ],
  serviceShortcuts: [
    {
      id: 1,
      serviceName: 'checkin',
      displayName: 'Check-in',
      description: 'Quick check-in process',
      iconName: 'check-circle',
      colorCode: '#10B981',
      linkUrl: '/checkin',
      displayOrder: 1,
      active: true
    },
    {
      id: 2,
      serviceName: 'room-service',
      displayName: 'Room Service',
      description: '24/7 room service',
      iconName: 'room-service',
      colorCode: '#F59E0B',
      linkUrl: '/room-service',
      displayOrder: 2,
      active: true
    },
    {
      id: 3,
      serviceName: 'concierge',
      displayName: 'Concierge',
      description: 'Local recommendations',
      iconName: 'concierge',
      colorCode: '#8B5CF6',
      linkUrl: '/concierge',
      displayOrder: 3,
      active: true
    }
  ]
};

// API Service Class
class ApiService {
  // Landing Page Configuration
  async getLandingPageConfig(): Promise<LandingPageConfigResponse> {
    try {
      const response = await api.get<LandingPageConfigResponse>('/landing-page/config');
      if (!response.data.config) {
        return {
          config: mockLandingPageConfig,
          banners: mockLandingPageConfig.banners,
          shortcuts: mockLandingPageConfig.serviceShortcuts
        };
      }
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch landing page config from API, using mock data:', error);
      return {
        config: mockLandingPageConfig,
        banners: mockLandingPageConfig.banners,
        shortcuts: mockLandingPageConfig.serviceShortcuts
      };
    }
  }

  async updateLandingPageConfig(config: Partial<LandingPageConfig>): Promise<LandingPageConfigResponse> {
    try {
      const response = await api.put<LandingPageConfigResponse>('/landing-page/config', config);
      if (!response.data.config) {
        const updatedConfig = { ...mockLandingPageConfig, ...config };
        return {
          config: updatedConfig,
          banners: updatedConfig.banners,
          shortcuts: updatedConfig.serviceShortcuts
        };
      }
      return response.data;
    } catch (error) {
      console.warn('Failed to update landing page config:', error);
      const updatedConfig = { ...mockLandingPageConfig, ...config };
      return {
        config: updatedConfig,
        banners: updatedConfig.banners,
        shortcuts: updatedConfig.serviceShortcuts
      };
    }
  }

  // Banner Management
  async createLandingPageBanner(banner: Partial<LandingPageBanner> | Omit<LandingPageBanner, 'id'>): Promise<LandingPageBanner> {
    try {
      const response = await api.post<LandingPageBanner>('/landing-page/banners', banner);
      return response.data;
    } catch (error) {
      console.warn('Failed to create banner:', error);
      return { 
        ...banner, 
        id: Date.now(),
        title: banner.title || 'New Banner',
        subtitle: banner.subtitle || '',
        imageUrl: banner.imageUrl || '',
        ctaText: banner.ctaText || 'Click Here',
        ctaLink: banner.ctaLink || '#',
        displayOrder: banner.displayOrder || 1,
        active: banner.active !== undefined ? banner.active : true
      } as LandingPageBanner;
    }
  }

  async updateLandingPageBanner(id: number, banner: Partial<LandingPageBanner>): Promise<LandingPageBanner> {
    try {
      const response = await api.put<LandingPageBanner>(`/landing-page/banners/${id}`, banner);
      return response.data;
    } catch (error) {
      console.warn('Failed to update banner:', error);
      const mockBanner = mockLandingPageConfig.banners.find(b => b.id === id);
      return { ...mockBanner!, ...banner };
    }
  }

  async deleteLandingPageBanner(id: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete<{ success: boolean }>(`/landing-page/banners/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to delete banner:', error);
      return { success: true };
    }
  }

  async toggleLandingPageBanner(id: number, active: boolean): Promise<LandingPageBanner> {
    try {
      const response = await api.patch<LandingPageBanner>(`/landing-page/banners/${id}/toggle`, { active });
      return response.data;
    } catch (error) {
      console.warn('Failed to toggle banner:', error);
      const mockBanner = mockLandingPageConfig.banners.find(b => b.id === id);
      return { ...mockBanner!, active };
    }
  }

  async reorderLandingPageBanner(id: number, direction: string): Promise<LandingPageBanner[]> {
    try {
      const response = await api.patch<LandingPageBanner[]>(`/landing-page/banners/${id}/reorder`, { direction });
      return response.data;
    } catch (error) {
      console.warn('Failed to reorder banner:', error);
      return mockLandingPageConfig.banners;
    }
  }

  // Service Shortcuts Management
  async createServiceShortcut(shortcut: Partial<ServiceShortcut> | Omit<ServiceShortcut, 'id'>): Promise<ServiceShortcut> {
    try {
      const response = await api.post<ServiceShortcut>('/landing-page/shortcuts', shortcut);
      return response.data;
    } catch (error) {
      console.warn('Failed to create service shortcut:', error);
      return { 
        ...shortcut, 
        id: Date.now(),
        serviceName: shortcut.serviceName || 'new-service',
        displayName: shortcut.displayName || 'New Service',
        description: shortcut.description || '',
        iconName: shortcut.iconName || 'service',
        colorCode: shortcut.colorCode || '#6B7280',
        linkUrl: shortcut.linkUrl || '#',
        displayOrder: shortcut.displayOrder || 1,
        active: shortcut.active !== undefined ? shortcut.active : true
      } as ServiceShortcut;
    }
  }

  async updateServiceShortcut(id: number, shortcut: Partial<ServiceShortcut>): Promise<ServiceShortcut> {
    try {
      const response = await api.put<ServiceShortcut>(`/landing-page/shortcuts/${id}`, shortcut);
      return response.data;
    } catch (error) {
      console.warn('Failed to update service shortcut:', error);
      const mockShortcut = mockLandingPageConfig.serviceShortcuts.find(s => s.id === id);
      return { ...mockShortcut!, ...shortcut };
    }
  }

  async deleteServiceShortcut(id: number): Promise<{ success: boolean }> {
    try {
      const response = await api.delete<{ success: boolean }>(`/landing-page/shortcuts/${id}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to delete service shortcut:', error);
      return { success: true };
    }
  }

  async toggleServiceShortcut(id: number, active: boolean): Promise<ServiceShortcut> {
    try {
      const response = await api.patch<ServiceShortcut>(`/landing-page/shortcuts/${id}/toggle`, { active });
      return response.data;
    } catch (error) {
      console.warn('Failed to toggle service shortcut:', error);
      const mockShortcut = mockLandingPageConfig.serviceShortcuts.find(s => s.id === id);
      return { ...mockShortcut!, active };
    }
  }

  async reorderServiceShortcut(id: number, direction: string): Promise<ServiceShortcut[]> {
    try {
      const response = await api.patch<ServiceShortcut[]>(`/landing-page/shortcuts/${id}/reorder`, { direction });
      return response.data;
    } catch (error) {
      console.warn('Failed to reorder service shortcut:', error);
      return mockLandingPageConfig.serviceShortcuts;
    }
  }

  // Chat functionality
  async sendChatMessage(message: string, sessionId?: string, imageBase64?: string): Promise<ChatResponse> {
    try {
      const response = await api.post<ChatResponse>('/chat/send', { message, sessionId, imageBase64 });
      return response.data;
    } catch (error) {
      console.warn('Failed to send chat message:', error);
      const mockMessage: ChatMessage = {
        id: Date.now().toString(),
        sessionId: sessionId || 'mock-session',
        content: `Thank you for your message: "${message}". This is a mock response from the chat service.`,
        sender: 'AI' as any,
        timestamp: new Date().toISOString(),
        type: 'TEXT' as any
      };
      return {
        message: mockMessage
      };
    }
  }

  async getChatHistory(sessionId?: string): Promise<ChatMessage[]> {
    try {
      const response = await api.get<{ success: boolean; data: ChatMessage[] }>(`/chat/history${sessionId ? `?sessionId=${sessionId}` : ''}`);
      return response.data.data;
    } catch (error) {
      console.warn('Failed to get chat history:', error);
      return [];
    }
  }

  // Tenant Configuration
  async getTenantConfig(tenantKey: string): Promise<TenantConfig> {
    try {
      const response = await api.get<TenantConfig>(`/tenants/key/${tenantKey}`);
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch tenant config from API:', error);
      throw error;
    }
  }

  async getAllTenants(): Promise<TenantConfig[]> {
    try {
      const response = await api.get<TenantConfig[]>('/tenants');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch tenants from API:', error);
      return [];
    }
  }

  async createTenant(tenant: Omit<TenantConfig, 'id'>): Promise<TenantConfig> {
    try {
      const response = await api.post<TenantConfig>('/tenants', tenant);
      return response.data;
    } catch (error) {
      console.error('Failed to create tenant:', error);
      throw error;
    }
  }

  async updateTenant(id: string, tenant: Partial<TenantConfig>): Promise<TenantConfig> {
    try {
      const response = await api.put<TenantConfig>(`/tenants/${id}`, tenant);
      return response.data;
    } catch (error) {
      console.error('Failed to update tenant:', error);
      throw error;
    }
  }

  async deleteTenant(id: string): Promise<{ success: boolean }> {
    try {
      const response = await api.delete<{ success: boolean }>(`/tenants/${id}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete tenant:', error);
      throw error;
    }
  }

  // Authentication
  async login(email: string, password: string): Promise<{ success: boolean; token?: string; message: string }> {
    try {
      const response = await api.post<{ success: boolean; token?: string; message: string }>('/auth/login', { email, password });
      if (response.data.success && response.data.token) {
        localStorage.setItem('authToken', response.data.token);
      }
      return response.data;
    } catch (error) {
      console.warn('Failed to login:', error);
      const mockToken = 'mock-jwt-token-' + Date.now();
      localStorage.setItem('authToken', mockToken);
      return {
        success: true,
        token: mockToken,
        message: 'Mock login successful'
      };
    }
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.post<{ success: boolean; message: string }>('/auth/logout');
      localStorage.removeItem('authToken');
      return response.data;
    } catch (error) {
      console.warn('Failed to logout:', error);
      localStorage.removeItem('authToken');
      return {
        success: true,
        message: 'Mock logout successful'
      };
    }
  }

  // Hotel Information Configuration
  async getHotelInfo(): Promise<HotelInfo | null> {
    try {
      const response = await api.get<HotelInfo>('/hotel-info');
      return response.data;
    } catch (error) {
      console.warn('Failed to fetch hotel info from API:', error);
      return null;
    }
  }

  async updateHotelInfo(hotelInfo: Partial<HotelInfo>): Promise<HotelInfo> {
    try {
      const response = await api.put<HotelInfo>('/hotel-info', hotelInfo);
      return response.data;
    } catch (error) {
      console.error('Failed to update hotel info:', error);
      throw error;
    }
  }

  async createHotelInfo(hotelInfo: Omit<HotelInfo, 'id'>): Promise<HotelInfo> {
    try {
      const response = await api.post<HotelInfo>('/hotel-info', hotelInfo);
      return response.data;
    } catch (error) {
      console.error('Failed to create hotel info:', error);
      throw error;
    }
  }
}

// Export service instance and tenant management functions
export const apiService = new ApiService();
export default apiService;
