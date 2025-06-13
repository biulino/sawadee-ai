import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  User, 
  Coffee, 
  ShoppingCart, 
  Newspaper, 
  Play,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Star,
  Wifi,
  Car,
  Utensils,
  Sun,
  Cloud,
  CloudRain,
  Thermometer,
  Wind,
  Compass,
  Clock,
  Camera,
  Heart,
  TrendingUp,
  Globe
} from 'lucide-react';
import { LandingPageConfig, ServiceShortcut, LandingPageBanner, LandingPageConfigResponse } from '../types';
import EnhancedChatWidget from './SimplifiedEnhancedChatWidget';

interface LandingPageProps {
  hotelId?: number;
}

interface WeatherData {
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
}

interface LocalAttraction {
  name: string;
  type: string;
  distance: string;
  rating: number;
  image: string;
  description: string;
}

interface HotelStats {
  totalGuests: number;
  todayCheckins: number;
  averageRating: number;
  totalReviews: number;
}

const iconMap = {
  'calendar': Calendar,
  'user': User,
  'book': Coffee,
  'shopping-cart': ShoppingCart,
  'newspaper': Newspaper,
  'play': Play,
  'map-pin': MapPin,
  'compass': Compass,
  'camera': Camera,
  'heart': Heart,
  'globe': Globe
};

const LandingPage: React.FC<LandingPageProps> = ({ hotelId = 1 }) => {
  const { t } = useTranslation();
  const [config, setConfig] = useState<LandingPageConfig | null>(null);
  const [currentBannerIndex, setBannerIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [attractions, setAttractions] = useState<LocalAttraction[]>([]);
  const [hotelStats, setHotelStats] = useState<HotelStats | null>(null);  const [currentTime, setCurrentTime] = useState(new Date());
  // Consolidated data loading functions
  const loadLandingPageConfig = async () => {
    try {
      console.log('Loading landing page config...');
      
      // Mock data for immediate use
      const mockResponse: LandingPageConfigResponse = {
        config: {
          id: 1,
          hotelTitle: 'Kapadokya Resort',
          welcomeHeading: 'Welcome to Kapadokya Resort',
          welcomeSubtitle: 'Experience the magic of Cappadocia with our AI-powered hospitality',
          assistantPrompt: "Need assistance? I'm here to help!",
          assistantButtonText: 'Chat with Assistant',
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6',
          bannerRotationInterval: 5000,
          active: true,
          banners: [],
          serviceShortcuts: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        banners: [
          {
            id: 1,
            title: 'Welcome to Paradise',
            subtitle: 'Discover the magical landscapes of Cappadocia',
            imageUrl: '/images/cappadocia-banner.jpg',
            ctaText: 'Explore Now',
            ctaLink: '/explore',
            displayOrder: 1,
            active: true
          },
          {
            id: 2,
            title: 'Luxury Spa Experience',
            subtitle: 'Rejuvenate your mind and body',
            imageUrl: '/images/spa-banner.jpg',
            ctaText: 'Book Spa',
            ctaLink: '/spa',
            displayOrder: 2,
            active: true
          }
        ],
        shortcuts: [
          {
            id: 1,
            serviceName: 'restaurant',
            displayName: 'Restaurant',
            description: 'Fine dining experience',
            iconName: 'book',
            colorCode: '#f59e0b',
            linkUrl: '/restaurant',
            displayOrder: 1,
            active: true
          },
          {
            id: 2,
            serviceName: 'room_service',
            displayName: 'Room Service',
            description: 'Order to your room',
            iconName: 'shopping-cart',
            colorCode: '#ef4444',
            linkUrl: '/room-service',
            displayOrder: 2,
            active: true
          },
          {
            id: 3,
            serviceName: 'concierge',
            displayName: 'Concierge',
            description: 'Personal assistance',
            iconName: 'user',
            colorCode: '#8b5cf6',
            linkUrl: '/concierge',
            displayOrder: 3,
            active: true
          },
          {
            id: 4,
            serviceName: 'activities',
            displayName: 'Activities',
            description: 'Tours and experiences',
            iconName: 'camera',
            colorCode: '#06b6d4',
            linkUrl: '/activities',
            displayOrder: 4,
            active: true
          }
        ]
      };
      
      console.log('API: Using mock data');
      const response = mockResponse;
      
      console.log('API response received:', response);
      
      // Extract config data from the response
      const configData = response.config || getDefaultConfig();
      const banners = response.banners || [];
      const shortcuts = response.shortcuts || [];
      
      console.log('Processed config data:', configData);
      
      // Merge the data into a complete config object
      setConfig({
        ...configData,
        banners: banners,
        serviceShortcuts: shortcuts
      });
    } catch (error) {
      console.error('Error loading landing page config:', error);
      // Fallback to default config
      const defaultConfig = getDefaultConfig();
      console.log('Using default config:', defaultConfig);
      setConfig(defaultConfig);
    }
  };

  const loadWeatherData = async () => {
    try {
      // Mock weather data - in production, integrate with weather API
      const mockWeather: WeatherData = {
        temperature: 24,
        condition: 'Partly Cloudy',
        humidity: 65,
        windSpeed: 12,
        icon: 'partly-cloudy'
      };
      setWeather(mockWeather);
    } catch (error) {
      console.error('Error loading weather data:', error);
    }
  };

  const loadLocalAttractions = async () => {
    try {
      // Mock attractions data - in production, integrate with local attractions API
      const mockAttractions: LocalAttraction[] = [
        {
          name: 'Goreme Open Air Museum',
          type: 'Historical Site',
          distance: '2.5 km',
          rating: 4.8,
          image: '/images/goreme-museum.jpg',
          description: 'UNESCO World Heritage site with ancient cave churches'
        },
        {
          name: 'Hot Air Balloon Tours',
          type: 'Adventure',
          distance: '500 m',
          rating: 4.9,
          image: '/images/balloon-tours.jpg',
          description: 'Experience Cappadocia from the sky at sunrise'
        },
        {
          name: 'Uchisar Castle',
          type: 'Landmark',
          distance: '3.2 km',
          rating: 4.6,
          image: '/images/uchisar-castle.jpg',
          description: 'Highest point in Cappadocia with panoramic views'
        }
      ];
      setAttractions(mockAttractions);
    } catch (error) {
      console.error('Error loading local attractions:', error);
    }
  };

  const loadHotelStats = async () => {
    try {
      // Mock hotel stats - in production, get from analytics API
      const mockStats: HotelStats = {
        totalGuests: 1247,
        todayCheckins: 23,
        averageRating: 4.7,
        totalReviews: 389
      };
      setHotelStats(mockStats);
    } catch (error) {
      console.error('Error loading hotel stats:', error);
    }
  };

  const getDefaultConfig = (): LandingPageConfig => ({
    hotelTitle: 'Hotel California',
    welcomeHeading: 'Hello, what would you like to discover today?',
    welcomeSubtitle: 'Select an action or search for specific information.',
    assistantPrompt: "Can't find what you're looking for?",
    assistantButtonText: 'Chat with the assistant',
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    banners: [
      {
        id: 1,
        title: 'Welcome to Paradise',
        subtitle: 'Experience luxury like never before',
        imageUrl: '/images/banner1.jpg',
        ctaText: 'Book Now',
        ctaLink: '/reservations'
      },
      {
        id: 2,
        title: 'Spa & Wellness',
        subtitle: 'Rejuvenate your mind and body',
        imageUrl: '/images/banner2.jpg',
        ctaText: 'Explore Spa',
        ctaLink: '/spa'
      }
    ],
    serviceShortcuts: [
      {
        id: 1,
        serviceName: 'restaurant',
        displayName: 'Restaurant',
        description: 'Menu and opening hours',
        iconName: 'book',
        colorCode: '#fb923c',
        linkUrl: '/restaurant'
      },
      {
        id: 2,
        serviceName: 'room_service',
        displayName: 'Meals',
        description: 'Room service',
        iconName: 'shopping-cart',
        colorCode: '#f87171',
        linkUrl: '/room-service'
      },
      {
        id: 3,
        serviceName: 'reservation',
        displayName: 'Reservation',
        description: 'Stay details',
        iconName: 'calendar',
        colorCode: '#60a5fa',
        linkUrl: '/reservations'
      },
      {
        id: 4,
        serviceName: 'profile',
        displayName: 'My Profile',
        description: 'Sign in',
        iconName: 'user',
        colorCode: '#a78bfa',
        linkUrl: '/profile'
      },
      {
        id: 5,
        serviceName: 'spa',
        displayName: 'Spas',
        description: 'Wellness nearby',
        iconName: 'play',
        colorCode: '#34d399',
        linkUrl: '/spa'
      },
      {
        id: 6,
        serviceName: 'news',
        displayName: 'News',
        description: 'Local news',
        iconName: 'newspaper',
        colorCode: '#4ade80',
        linkUrl: '/news'
      }
    ]
  });

  // Auto-rotate banners
  useEffect(() => {
    if (!config?.banners || config.banners.length <= 1) return;

    const interval = setInterval(() => {
      setBannerIndex((prevIndex) => 
        (prevIndex + 1) % config.banners.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [config?.banners]);

  // Consolidated useEffect hook for all data loading
  useEffect(() => {
    const loadAllData = async () => {
      setLoading(true);
      
      try {
        // Load all data in parallel for better performance
        await Promise.all([
          loadLandingPageConfig(),
          loadWeatherData(),
          loadLocalAttractions(),
          loadHotelStats()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
        console.log('All data loading finished');
      }
    };

    loadAllData();
    
    // Update time every minute
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timeInterval);
  }, [hotelId]); // Only depend on hotelId to prevent unnecessary re-renders

  const nextBanner = () => {
    if (!config?.banners) return;
    setBannerIndex((prevIndex) => (prevIndex + 1) % config.banners.length);
  };

  const prevBanner = () => {
    if (!config?.banners) return;
    setBannerIndex((prevIndex) => 
      prevIndex === 0 ? config.banners.length - 1 : prevIndex - 1
    );
  };

  const handleServiceClick = (shortcut: ServiceShortcut) => {
    // Handle navigation based on service type
    if (shortcut.linkUrl) {
      window.location.href = shortcut.linkUrl;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  if (!config) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">{t('error')}</h2>
          <button 
            onClick={loadLandingPageConfig}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentBanner = config.banners[currentBannerIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{config.hotelTitle}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-gray-600">
              <Wifi className="w-4 h-4" />
              <Car className="w-4 h-4" />
              <Utensils className="w-4 h-4" />
            </div>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Banner Section */}
      {config.banners && config.banners.length > 0 && (
        <section className="relative h-96 overflow-hidden">
          <motion.div
            key={currentBannerIndex}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center"
            style={{
              backgroundImage: currentBanner?.imageUrl ? `url(${currentBanner.imageUrl})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-40"></div>
            <div className="relative z-10 text-center text-white px-4">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                {currentBanner?.title || 'Welcome'}
              </h2>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                {currentBanner?.subtitle || 'Experience luxury hospitality'}
              </p>
              {currentBanner?.ctaText && currentBanner?.ctaLink && (
                <motion.a
                  href={currentBanner.ctaLink}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-100 transition-colors"
                >
                  {currentBanner.ctaText}
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Banner Navigation */}
          {config.banners.length > 1 && (
            <>
              <button
                onClick={prevBanner}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextBanner}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 text-white transition-all"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Banner Indicators */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {config.banners.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setBannerIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentBannerIndex
                        ? 'bg-white'
                        : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </section>
      )}

      {/* Welcome Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {config.welcomeHeading}
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            {config.welcomeSubtitle}
          </p>
        </motion.div>

        {/* Service Shortcuts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
        >
          {config.serviceShortcuts.map((shortcut, index) => {
            const IconComponent = iconMap[shortcut.iconName as keyof typeof iconMap] || Coffee;
            
            return (
              <motion.div
                key={shortcut.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
                whileHover={{ scale: 1.05, y: -5 }}
                onClick={() => handleServiceClick(shortcut)}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-200"
                style={{ 
                  background: `linear-gradient(135deg, ${shortcut.colorCode}15 0%, ${shortcut.colorCode}05 100%)`,
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${shortcut.colorCode}20` }}
                >
                  <IconComponent 
                    className="w-8 h-8"
                    style={{ color: shortcut.colorCode }}
                  />
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">
                  {shortcut.displayName}
                </h3>
                <p className="text-gray-600 text-sm">
                  {shortcut.description}
                </p>
              </motion.div>            );
          })}
        </motion.div>

        {/* Enhanced Info Cards Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Weather Widget */}
          {weather && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="bg-gradient-to-br from-blue-400 to-blue-600 text-white p-6 rounded-2xl shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Sun className="w-6 h-6" />
                  <h3 className="font-semibold">Current Weather</h3>
                </div>
                <span className="text-sm opacity-80">
                  {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold">{weather.temperature}°C</div>
                  <div className="text-sm opacity-80">{weather.condition}</div>
                </div>
                <div className="text-right text-sm space-y-1">
                  <div className="flex items-center space-x-1">
                    <Thermometer className="w-4 h-4" />
                    <span>{weather.humidity}% humidity</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Wind className="w-4 h-4" />
                    <span>{weather.windSpeed} km/h</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Hotel Statistics */}
          {hotelStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="bg-gradient-to-br from-purple-400 to-purple-600 text-white p-6 rounded-2xl shadow-lg"
            >
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-6 h-6" />
                <h3 className="font-semibold">Hotel Statistics</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold">{hotelStats.totalGuests}</div>
                  <div className="opacity-80">Total Guests</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{hotelStats.todayCheckins}</div>
                  <div className="opacity-80">Today's Check-ins</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{hotelStats.averageRating}</div>
                  <div className="opacity-80">Avg Rating</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{hotelStats.totalReviews}</div>
                  <div className="opacity-80">Reviews</div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="bg-gradient-to-br from-green-400 to-green-600 text-white p-6 rounded-2xl shadow-lg"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Clock className="w-6 h-6" />
              <h3 className="font-semibold">Quick Actions</h3>
            </div>
              <div className="space-y-3">
              <button 
                onClick={() => window.location.href = '/ai-checkin'}
                className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all p-3 rounded-lg text-left"
              >
                <div className="font-medium">Express Check-in</div>
                <div className="text-sm opacity-80">Fast AI-powered check-in</div>
              </button>
              <button className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all p-3 rounded-lg text-left">
                <div className="font-medium">Room Service</div>
                <div className="text-sm opacity-80">Order food & amenities</div>
              </button>
            </div>
          </motion.div>
        </div>

        {/* Local Attractions Section */}
        {attractions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mb-12"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">Nearby Attractions</h3>
              <div className="flex items-center space-x-2 text-gray-600">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">Explore Cappadocia</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {attractions.map((attraction, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 * index }}
                  whileHover={{ scale: 1.02, y: -5 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer group"
                >
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
                    <div className="absolute bottom-4 left-4 z-20 text-white">
                      <div className="flex items-center space-x-1 mb-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(attraction.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm ml-1">{attraction.rating}</span>
                      </div>
                      <div className="font-semibold">{attraction.name}</div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {attraction.type}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {attraction.distance}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {attraction.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Assistant Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto"
        >
          <p className="text-gray-600 mb-4">{config.assistantPrompt}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowChat(true)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-full font-semibold flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            <MessageCircle className="w-5 h-5" />
            <span>{config.assistantButtonText}</span>
          </motion.button>
        </motion.div>
      </section>      {/* Enhanced Chat Widget */}
      {showChat && (
        <EnhancedChatWidget 
          onClose={() => setShowChat(false)}
          primaryColor={config.primaryColor}
          guestName="Guest"
          roomNumber="101"
        />
      )}
    </div>
  );
};

export default LandingPage;
