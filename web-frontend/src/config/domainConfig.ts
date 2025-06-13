/**
 * Domain and routing configuration for multi-tenant support
 */

export interface DomainConfig {
  production: {
    baseDomain: string;
    allowedSubdomains: string[];
    defaultTenant: string;
  };
  development: {
    baseDomain: string;
    allowedSubdomains: string[];
    defaultTenant: string;
    ports: {
      frontend: number;
      backend: number;
    };
  };
}

export const domainConfig: DomainConfig = {
  production: {
    baseDomain: 'hotelsaas.com',
    allowedSubdomains: ['sawadeeai', 'kapadokya', 'admin'],
    defaultTenant: 'sawadeeai'
  },
  development: {
    baseDomain: 'localhost',
    allowedSubdomains: ['sawadeeai', 'kapadokya', 'admin'],
    defaultTenant: 'sawadeeai',
    ports: {
      frontend: 3000,
      backend: 8090
    }
  }
};

/**
 * Get the current environment configuration
 */
export const getCurrentDomainConfig = () => {
  return process.env.NODE_ENV === 'production' 
    ? domainConfig.production 
    : domainConfig.development;
};

/**
 * Check if current hostname is a valid tenant subdomain
 */
export const isValidTenantDomain = (hostname: string): boolean => {
  const config = getCurrentDomainConfig();
  const subdomain = hostname.split('.')[0];
  
  // In development, localhost is always valid
  if (config.baseDomain === 'localhost') {
    return true;
  }
  
  // Check if it's the base domain
  if (hostname === config.baseDomain) {
    return true;
  }
  
  // Check if subdomain is in allowed list
  return config.allowedSubdomains.includes(subdomain);
};

/**
 * Get the base API URL for the current environment
 */
export const getAPIBaseURL = (): string => {
  const config = getCurrentDomainConfig();
  
  if (process.env.NODE_ENV === 'production') {
    return `https://api.${config.baseDomain}`;
  } else {
    // Development environment - cast to development config to access ports
    const devConfig = domainConfig.development;
    return `http://${config.baseDomain}:${devConfig.ports.backend}/api`;
  }
};

/**
 * Get the frontend URL for a specific tenant
 */
export const getTenantURL = (tenantKey: string): string => {
  const config = getCurrentDomainConfig();
  
  if (process.env.NODE_ENV === 'production') {
    return `https://${tenantKey}.${config.baseDomain}`;
  } else {
    // Development environment - cast to development config to access ports
    const devConfig = domainConfig.development;
    return `http://${tenantKey}.${config.baseDomain}:${devConfig.ports.frontend}`;
  }
};

/**
 * Redirect to a specific tenant subdomain
 */
export const redirectToTenant = (tenantKey: string): void => {
  const url = getTenantURL(tenantKey);
  window.location.href = url;
};

/**
 * Setup for development environment subdomain routing
 * This would typically be handled by nginx or a reverse proxy in production
 */
export const setupDevelopmentRouting = () => {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  // Instructions for setting up local subdomain routing
  console.log(`
🔧 Development Multi-Tenant Setup Instructions:

1. Add these entries to your /etc/hosts file:
   127.0.0.1 localhost
   127.0.0.1 sawadeeai.localhost
   127.0.0.1 kapadokya.localhost
   127.0.0.1 admin.localhost

2. Start the development servers:
   Frontend: npm start (port 3000)
   Backend: mvn spring-boot:run (port 8090)

3. Access tenants via:
   - http://sawadeeai.localhost:3000 (SawadeeAI Hotel)
   - http://kapadokya.localhost:3000 (Kapadokya Hotel)
   - http://admin.localhost:3000 (Admin Panel)
   - http://localhost:3000?tenant=sawadeeai (Alternative with parameter)

4. API requests will automatically include the X-Tenant-ID header
  `);
};

/**
 * Tenant routing middleware for React Router (if using)
 */
export const createTenantRoute = (tenantKey: string, component: React.ComponentType) => {
  return {
    path: '/',
    element: component,
    tenant: tenantKey
  };
};

/**
 * Extract and validate tenant from current URL
 */
export const validateAndExtractTenant = (): { tenantKey: string | null; isValid: boolean } => {
  const hostname = window.location.hostname;
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');
  const config = getCurrentDomainConfig();

  // Check URL parameter first
  if (tenantParam) {
    const isValid = config.allowedSubdomains.includes(tenantParam);
    return { tenantKey: isValid ? tenantParam : null, isValid };
  }

  // Check subdomain
  const subdomain = hostname.split('.')[0];
  if (subdomain && subdomain !== config.baseDomain) {
    const isValid = config.allowedSubdomains.includes(subdomain);
    return { tenantKey: isValid ? subdomain : null, isValid };
  }

  // Default to default tenant
  return { tenantKey: config.defaultTenant, isValid: true };
};
