import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  hasRole: (role: string) => boolean;
  isAdmin: boolean;
  isHotelOwner: boolean;
  isCustomer: boolean;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'CUSTOMER' | 'HOTEL_OWNER';
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Parse JWT token to extract user info and roles
  const parseJwtToken = (token: string): User | null => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles: string[] = [];
      
      // Extract roles from Keycloak token structure
      if (payload.resource_access && payload.resource_access['hotel-client']) {
        const clientRoles = payload.resource_access['hotel-client'].roles || [];
        roles.push(...clientRoles);
      }
      
      // Also check for realm roles
      if (payload.realm_access && payload.realm_access.roles) {
        roles.push(...payload.realm_access.roles);
      }

      return {
        id: payload.sub,
        username: payload.preferred_username || payload.sub,
        email: payload.email || '',
        firstName: payload.given_name || '',
        lastName: payload.family_name || '',
        roles
      };
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      return null;
    }
  };

  // Check if token is expired
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  // Load user from stored token on app start
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('authToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');
      
      if (storedToken && !isTokenExpired(storedToken)) {
        const userData = parseJwtToken(storedToken);
        if (userData) {
          setToken(storedToken);
          setUser(userData);
        }
      } else if (storedRefreshToken) {
        // Try to refresh the token
        try {
          await refreshToken(storedRefreshToken);
        } catch (error) {
          console.error('Token refresh failed:', error);
          logout();
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8090/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const tokenData: TokenResponse = await response.json();
      const userData = parseJwtToken(tokenData.access_token);
      
      if (!userData) {
        throw new Error('Invalid token received');
      }

      // Store tokens
      localStorage.setItem('authToken', tokenData.access_token);
      localStorage.setItem('refreshToken', tokenData.refresh_token);
      
      setToken(tokenData.access_token);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8090/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Registration failed');
      }

      // After successful registration, automatically log in
      await login(userData.username, userData.password);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const refreshToken = async (refreshTokenValue: string): Promise<void> => {
    try {
      const response = await fetch('http://localhost:8090/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const tokenData: TokenResponse = await response.json();
      const userData = parseJwtToken(tokenData.access_token);
      
      if (!userData) {
        throw new Error('Invalid token received');
      }

      localStorage.setItem('authToken', tokenData.access_token);
      localStorage.setItem('refreshToken', tokenData.refresh_token);
      
      setToken(tokenData.access_token);
      setUser(userData);
    } catch (error) {
      console.error('Token refresh error:', error);
      throw error;
    }
  };

  const logout = (): void => {
    const refreshTokenValue = localStorage.getItem('refreshToken');
    
    // Call logout endpoint if refresh token exists
    if (refreshTokenValue) {
      fetch('http://localhost:8090/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshTokenValue }),
      }).catch(error => console.error('Logout API error:', error));
    }

    // Clear local state and storage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole'); // Clear old development role
    setToken(null);
    setUser(null);
  };

  const hasRole = (role: string): boolean => {
    return user?.roles.includes(role) || false;
  };

  const isAuthenticated = !!user && !!token;
  const isAdmin = hasRole('ADMIN');
  const isHotelOwner = hasRole('client_hotel_owner');
  const isCustomer = hasRole('client_customer');

  const contextValue: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    hasRole,
    isAdmin,
    isHotelOwner,
    isCustomer,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
