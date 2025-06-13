import { TenantConfig } from '../types';

/**
 * Utility functions for tenant-based theming and styling
 */

export const createColorStyle = (color?: string): React.CSSProperties => ({
  color: color || '#3B82F6'
});

export const createBackgroundStyle = (color?: string): React.CSSProperties => ({
  backgroundColor: color || '#3B82F6'
});

export const createBorderStyle = (color?: string): React.CSSProperties => ({
  borderColor: color || '#3B82F6'
});

export const createGradientStyle = (primaryColor?: string, secondaryColor?: string): React.CSSProperties => ({
  background: `linear-gradient(135deg, ${primaryColor || '#3B82F6'} 0%, ${secondaryColor || '#1E40AF'} 100%)`
});

export const createHoverStyle = (color?: string, opacity: number = 0.8): React.CSSProperties => ({
  backgroundColor: color ? `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}` : `#3B82F6${Math.round(opacity * 255).toString(16).padStart(2, '0')}`
});

/**
 * Generate CSS variables for tenant theming
 */
export const createTenantCSSVariables = (tenantConfig: TenantConfig | null): Record<string, string> => {
  if (!tenantConfig) {
    return {
      '--tenant-primary': '#3B82F6',
      '--tenant-secondary': '#1E40AF',
      '--tenant-primary-rgb': '59, 130, 246',
      '--tenant-secondary-rgb': '30, 64, 175'
    };
  }

  return {
    '--tenant-primary': tenantConfig.primaryColor,
    '--tenant-secondary': tenantConfig.secondaryColor,
    '--tenant-primary-rgb': hexToRgb(tenantConfig.primaryColor),
    '--tenant-secondary-rgb': hexToRgb(tenantConfig.secondaryColor)
  };
};

/**
 * Convert hex color to RGB string
 */
export const hexToRgb = (hex: string): string => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
  }
  return '59, 130, 246'; // fallback to blue
};

/**
 * Get contrasting text color for a background color
 */
export const getContrastingTextColor = (backgroundColor: string): string => {
  const rgb = hexToRgb(backgroundColor).split(', ').map(Number);
  const brightness = (rgb[0] * 299 + rgb[1] * 587 + rgb[2] * 114) / 1000;
  return brightness > 128 ? '#000000' : '#FFFFFF';
};

/**
 * Generate tenant-specific tailwind classes as style objects
 */
export const getTenantClasses = (tenantConfig: TenantConfig | null) => {
  const primary = tenantConfig?.primaryColor || '#3B82F6';
  const secondary = tenantConfig?.secondaryColor || '#1E40AF';
  
  return {
    button: {
      primary: createBackgroundStyle(primary),
      secondary: createBackgroundStyle(secondary),
      outline: {
        ...createBorderStyle(primary),
        ...createColorStyle(primary),
        backgroundColor: 'transparent'
      }
    },
    text: {
      primary: createColorStyle(primary),
      secondary: createColorStyle(secondary)
    },
    background: {
      primary: createBackgroundStyle(primary),
      secondary: createBackgroundStyle(secondary),
      gradient: createGradientStyle(primary, secondary)
    },
    border: {
      primary: createBorderStyle(primary),
      secondary: createBorderStyle(secondary)
    }
  };
};

/**
 * Extract tenant key from current URL
 */
export const extractTenantKey = (): string | null => {
  const hostname = window.location.hostname;
  const subdomain = hostname.split('.')[0];
  const urlParams = new URLSearchParams(window.location.search);
  const tenantParam = urlParams.get('tenant');

  // Priority: URL parameter > subdomain
  if (tenantParam) {
    return tenantParam;
  }

  // Check if subdomain is not localhost, www, or empty
  if (subdomain && subdomain !== 'localhost' && subdomain !== 'www' && subdomain !== hostname) {
    return subdomain;
  }

  return null;
};
