import React from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  MessageCircle,
  ExternalLink,
  Heart
} from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';

interface FooterProps {
  onContactClick?: () => void;
  onHelpClick?: () => void;
}

const Footer: React.FC<FooterProps> = ({ onContactClick, onHelpClick }) => {
  const { t } = useTranslation();
  const { tenantConfig } = useTenant();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Hotel Information */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: tenantConfig?.primaryColor || '#3B82F6' }}
              >
                {tenantConfig?.name?.charAt(0) || 'H'}
              </div>
              <span className="text-xl font-bold">{tenantConfig?.name || 'Hotel'}</span>
            </div>
            <p className="text-gray-300 text-sm">
              Experience luxury and comfort in the heart of the city. Your perfect getaway awaits.
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">{t('contact')}</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <div className="flex items-start space-x-3">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Göreme, Nevşehir, Türkiye</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+90 384 271 2525</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@{tenantConfig?.tenantKey || 'hotel'}.com</span>
              </div>
            </div>
            {onContactClick && (
              <button
                onClick={onContactClick}
                className="inline-flex items-center space-x-2 text-sm hover:text-blue-300 transition-colors"
                style={{ color: tenantConfig?.primaryColor || '#60A5FA' }}
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Full Contact Details</span>
              </button>
            )}
          </div>

          {/* Operating Hours */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">
              <Clock className="w-5 h-5 inline mr-2" />
              Operating Hours
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex justify-between">
                <span>Reception:</span>
                <span>24/7</span>
              </div>
              <div className="flex justify-between">
                <span>Restaurant:</span>
                <span>07:00 - 23:00</span>
              </div>
              <div className="flex justify-between">
                <span>Spa:</span>
                <span>09:00 - 21:00</span>
              </div>
              <div className="flex justify-between">
                <span>Pool:</span>
                <span>06:00 - 22:00</span>
              </div>
            </div>
          </div>

          {/* Quick Links & Support */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-3">
              {/* Help/Support Button */}
              {onHelpClick && (
                <button
                  onClick={onHelpClick}
                  className="flex items-center space-x-2 text-sm hover:text-blue-300 transition-colors group"
                  style={{ color: tenantConfig?.primaryColor || '#60A5FA' }}
                >
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Help & Support</span>
                </button>
              )}
              
              {/* Additional Links */}
              <div className="space-y-2 text-sm text-gray-300">
                <a href="#" className="block hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="block hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="block hover:text-white transition-colors">Booking Policy</a>
                <a href="#" className="block hover:text-white transition-colors">FAQ</a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © {currentYear} {tenantConfig?.name || 'Hotel'}. All rights reserved.
            </div>
            
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>by Hotel Management System</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
