import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Home, 
  Settings, 
  LogIn, 
  User, 
  Calendar,
  MessageCircle,
  Phone,
  Menu,
  X,
  MapPin,
  Building,
  Shield,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminPanel from './AdminPanel';
import AICheckinFlow from './AICheckinFlow';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from './auth/UserProfile';
import AuthModal from './auth/AuthModal';

interface NavigationProps {
  currentPage?: string;
  onPageChange?: (page: string) => void;
  // Remove isAdmin prop as we'll get it from auth context
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentPage = 'home', 
  onPageChange
}) => {
  const { t } = useTranslation();
  const { isAuthenticated, isAdmin, isHotelOwner, isCustomer } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showAICheckin, setShowAICheckin] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);  const menuItems = [
    { id: 'home', label: t('home'), icon: Home },
    ...(isAuthenticated ? [
      { id: 'reservations', label: t('reservations'), icon: Calendar },
      { id: 'activities', label: t('activities'), icon: MapPin },
      { id: 'ai-checkin', label: 'AI Check-in', icon: Bot },
      { id: 'profile', label: t('profile'), icon: User },
    ] : []),
  ];

  // Add role-specific menu items
  if (isHotelOwner) {
    menuItems.push({ id: 'hotel-management', label: 'Hotel Management', icon: Building });
  }
  
  if (isAdmin) {
    menuItems.push({ id: 'admin', label: t('adminPanel'), icon: Settings });
    menuItems.push({ id: 'back-office', label: 'Back Office', icon: Shield });
  }  const handleMenuClick = (itemId: string) => {
    if (itemId === 'ai-checkin') {
      setShowAICheckin(true);
    } else if (itemId === 'admin') {
      setShowAdminPanel(true);
    } else if (itemId === 'hotel-management') {
      onPageChange?.('hotel-info-admin');
    } else if (onPageChange) {
      onPageChange(itemId);
    }
    setShowMobileMenu(false);
  };

  return (
    <>
      {/* Desktop Navigation */}
      <nav className="hidden md:flex bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="flex items-center justify-between h-16">            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold text-gray-800">SawadeeAI</span>
            </div>

            {/* Menu Items */}
            <div className="flex items-center space-x-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentPage === item.id;
                
                return (                  <button
                    key={item.id}
                    onClick={() => handleMenuClick(item.id)}                    className={`
                      flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-100 text-blue-600 shadow-sm' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                      }
                      ${item.id === 'admin' ? 'bg-purple-50 text-purple-600 hover:bg-purple-100' : ''}
                      ${item.id === 'back-office' ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : ''}
                      ${item.id === 'ai-checkin' ? 'bg-cyan-50 text-cyan-600 hover:bg-cyan-100' : ''}
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </div>            {/* User Menu */}
            <div className="flex items-center space-x-3">
              {isAuthenticated ? (
                <UserProfile />
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      <nav className="md:hidden bg-white shadow-lg border-b border-gray-200">
        <div className="px-4">
          <div className="flex items-center justify-between h-16">            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">S</span>
              </div>
              <span className="text-lg font-bold text-gray-800">SawadeeAI</span>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {showMobileMenu ? (
                <X className="w-6 h-6 text-gray-600" />
              ) : (
                <Menu className="w-6 h-6 text-gray-600" />
              )}
            </button>
          </div>

          {/* Mobile Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t border-gray-200 py-4"
              >
                <div className="grid grid-cols-2 gap-2">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentPage === item.id;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMenuClick(item.id)}                        className={`
                          flex flex-col items-center space-y-1 p-3 rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-blue-100 text-blue-600' 
                            : 'text-gray-600 hover:bg-gray-50'
                          }
                          ${item.id === 'admin' ? 'bg-purple-50 text-purple-600' : ''}
                          ${item.id === 'back-office' ? 'bg-indigo-50 text-indigo-600' : ''}
                          ${item.id === 'ai-checkin' ? 'bg-cyan-50 text-cyan-600' : ''}
                        `}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="text-xs font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-blue-100 text-blue-600' 
                    : 'text-gray-400 hover:text-gray-600'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Action Floating Button */}
      <div className="fixed bottom-20 right-4 z-50 md:bottom-4">
        <div className="flex flex-col space-y-3">
          {/* Check-in Button */}          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAICheckin(true)}
            className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            title="Quick AI Check-in"
          >
            <LogIn className="w-6 h-6" />
          </motion.button>

          {/* Chat Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleMenuClick('chat')}
            className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
            title="AI Assistant"
          >
            <MessageCircle className="w-5 h-5" />
          </motion.button>

          {/* Admin Button (only for admins) */}
          {isAdmin && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowAdminPanel(true)}
              className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
              title="Admin Panel"
            >
              <Settings className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>      {/* AI Check-in Modal */}
      {showAICheckin && (
        <div className="fixed inset-0 z-50">
          <AICheckinFlow />
          <button
            onClick={() => setShowAICheckin(false)}
            className="absolute top-4 right-4 z-60 p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      )}      {/* Admin Panel Modal */}
      {showAdminPanel && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} />
      )}

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="login"
      />
    </>
  );
};

export default Navigation;
