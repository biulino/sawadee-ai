import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LandingPage from './components/LandingPage';
import Navigation from './components/Navigation';
import ChatWidget from './components/ChatWidget';
import LanguageSwitcher from './components/LanguageSwitcher';
import Footer from './components/Footer';
import ActivitiesPage from './components/ActivitiesPage';
import SaaSLandingPage from './components/SaaSLandingPage';
import BackOfficeDashboard from './components/BackOfficeDashboard';
import AICheckinFlow from './components/AICheckinFlow';
import TenantManagement from './components/TenantManagement';
import HotelInfoAdmin from './components/HotelInfoAdmin';
import { TenantProvider, useTenant } from './contexts/TenantContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { setCurrentTenantId } from './services/api';
import './i18n'; // Initialize i18n

// Page Components (placeholders)
const ReservationsPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('reservations')}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">{t('loading')}...</p>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('about')}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">{t('loading')}...</p>
        </div>
      </div>
    </div>
  );
};

const ContactPage = () => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">{t('contact')}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('hotelTitle')}</h3>
              <div className="space-y-2">
                <p className="text-gray-600"><strong>Address:</strong> Göreme, Nevşehir, Türkiye</p>
                <p className="text-gray-600"><strong>Phone:</strong> +90 384 271 2525</p>                <p className="text-gray-600"><strong>Email:</strong> info@sawadeeaihotel.com</p>
                <p className="text-gray-600"><strong>Web:</strong> www.sawadeeaihotel.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3">{t('services')}</h3>
              <div className="space-y-2">
                <p className="text-gray-600"><strong>Reception:</strong> 24/7</p>
                <p className="text-gray-600"><strong>Restaurant:</strong> 07:00 - 23:00</p>
                <p className="text-gray-600"><strong>Spa:</strong> 09:00 - 21:00</p>
                <p className="text-gray-600"><strong>Pool:</strong> 06:00 - 22:00</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [showChat, setShowChat] = useState(false);
  const { tenantConfig, tenantKey, isLoading } = useTenant();
  const { isAuthenticated, isAdmin } = useAuth();

  // Update API service with current tenant ID
  useEffect(() => {
    if (tenantConfig?.id) {
      setCurrentTenantId(tenantConfig.id.toString());
    }
  }, [tenantConfig]);

  const handlePageChange = (page: string) => {
    if (page === 'chat') {
      setShowChat(true);
    } else {
      setShowChat(false);
      setCurrentPage(page);
    }
  };
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'home':
        return <LandingPage />;
      case 'saas-landing':
        return <SaaSLandingPage />;      case 'back-office':
        return <BackOfficeDashboard onNavigateToTenantManagement={() => setCurrentPage('tenant-management')} />;
      case 'ai-checkin':
        return <AICheckinFlow />;      case 'tenant-management':
        return <TenantManagement onClose={() => setCurrentPage('back-office')} />;
      case 'hotel-info-admin':
        return <HotelInfoAdmin onClose={() => setCurrentPage('back-office')} />;
      case 'reservations':
        return <ReservationsPage />;
      case 'activities':
        return <ActivitiesPage />;
      case 'profile':
        return <ProfilePage />;
      case 'contact':
        return <ContactPage />;
      default:
        return <LandingPage />;
    }
  };

  // Show loading spinner while tenant config is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tenant configuration...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">      {/* Navigation with Language Switcher */}
      <div className="relative">
        <Navigation 
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
        
        {/* Language Switcher - positioned in top right of navigation */}
        <div className="absolute top-4 right-4 z-50">
          <LanguageSwitcher />
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 md:pb-0">
        {renderCurrentPage()}
      </main>      {/* Footer */}
      <Footer 
        onContactClick={() => setCurrentPage('contact')}
        onHelpClick={() => setShowChat(true)}
      />

      {/* Chat Widget */}
      {showChat && (
        <ChatWidget 
          onClose={() => setShowChat(false)}
          primaryColor={tenantConfig?.primaryColor || "#6366f1"}
        />
      )}    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <TenantProvider>
        <AppContent />
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;
