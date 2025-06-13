import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building,
  Users,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Download,
  Upload,
  Bell,
  User,
  LogOut,
  Building2
} from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { TenantConfig } from '../types';
import HotelInfoAdmin from './HotelInfoAdmin';

interface BackOfficeDashboardProps {
  onNavigateToTenantManagement?: () => void;
}

interface Hotel {
  id: number;
  name: string;
  city: string;
  address: string;
  description: string;
  tenantId: number;
  totalRooms?: number;
  availableRooms?: number;
}

interface Reservation {
  id: number;
  fullName: string;
  email: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  totalPrice: number;
  paymentStatus: string;
  reservationStatus: string;
}

interface DashboardStats {
  totalHotels: number;
  totalReservations: number;
  totalRevenue: number;
  occupancyRate: number;
}

const BackOfficeDashboard: React.FC<BackOfficeDashboardProps> = ({ onNavigateToTenantManagement }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { tenantConfig, isLoading: tenantLoading } = useTenant();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalHotels: 0,
    totalReservations: 0,
    totalRevenue: 0,
    occupancyRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Helper functions for tenant theming
  const createColorStyle = (color?: string): React.CSSProperties => ({
    color: color || '#3B82F6'
  });

  const createBackgroundStyle = (color?: string): React.CSSProperties => ({
    backgroundColor: color || '#3B82F6'
  });

  const createBorderStyle = (color?: string): React.CSSProperties => ({
    borderColor: color || '#3B82F6'
  });

  useEffect(() => {
    if (!tenantLoading && tenantConfig) {
      fetchDashboardData();
    }
  }, [tenantLoading, tenantConfig]);

  const fetchDashboardData = async () => {
    try {
      // Fetch hotels
      const hotelsResponse = await fetch('/api/hotels', {
        headers: {
          'X-Tenant-ID': tenantConfig?.id || 'default'
        }
      });
      const hotelsData = await hotelsResponse.json();
      setHotels(hotelsData);

      // Fetch reservations
      const reservationsResponse = await fetch('/api/reservations', {
        headers: {
          'X-Tenant-ID': tenantConfig?.id || 'default'
        }
      });
      const reservationsData = await reservationsResponse.json();
      setReservations(reservationsData);

      // Calculate stats
      const totalRevenue = reservationsData.reduce((sum: number, res: Reservation) => sum + res.totalPrice, 0);
      const occupancyRate = hotelsData.length > 0 
        ? reservationsData.filter((res: Reservation) => res.reservationStatus === 'CONFIRMED').length / 
          hotelsData.reduce((sum: number, hotel: Hotel) => sum + (hotel.totalRooms || 0), 0) * 100
        : 0;

      setStats({
        totalHotels: hotelsData.length,
        totalReservations: reservationsData.length,
        totalRevenue,
        occupancyRate
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(hotel =>
    hotel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hotel.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredReservations = reservations.filter(reservation =>
    reservation.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reservation.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StatCard: React.FC<{ title: string; value: string | number; icon: React.ComponentType<any>; color: string; style?: React.CSSProperties }> = 
    ({ title, value, icon: Icon, color, style }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div 
          className={`p-3 rounded-lg ${color}`}
          style={style}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </motion.div>
  );

  const Sidebar: React.FC = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {tenantConfig?.name || 'Hotel Admin'}
        </h1>
      </div>
      <nav className="mt-6">
        <div className="px-3">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'hotels', label: 'Hotels', icon: Building },
            { id: 'reservations', label: 'Reservations', icon: Calendar },
            { id: 'hotel-info', label: 'Hotel Info', icon: Settings },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'tenants', label: 'Tenant Management', icon: Building2 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center px-3 py-2 mb-1 rounded-lg text-left transition-colors ${
                activeTab === item.id 
                  ? 'text-white border-r-2' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              style={activeTab === item.id ? {
                backgroundColor: tenantConfig?.primaryColor || '#3B82F6',
                borderRightColor: tenantConfig?.secondaryColor || '#1E40AF'
              } : {}}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );

  const Header: React.FC = () => (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-semibold text-gray-900 capitalize">{activeTab}</h2>
        {(activeTab === 'hotels' || activeTab === 'reservations') && (
          <div className="relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{
                '--tw-ring-color': tenantConfig?.primaryColor || '#3B82F6'
              } as React.CSSProperties}
            />
          </div>
        )}
      </div>
      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <Bell className="h-6 w-6" />
        </button>
        <div className="flex items-center space-x-2">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={createBackgroundStyle(tenantConfig?.primaryColor)}
          >
            <User className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-medium text-gray-700">Admin User</span>
        </div>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <LogOut className="h-6 w-6" />
        </button>
      </div>
    </div>
  );

  const DashboardContent: React.FC = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Hotels"
          value={stats.totalHotels}
          icon={Building}
          color=""
          style={createBackgroundStyle(tenantConfig?.primaryColor)}
        />
        <StatCard
          title="Total Reservations"
          value={stats.totalReservations}
          icon={Calendar}
          color=""
          style={createBackgroundStyle(tenantConfig?.secondaryColor)}
        />
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          icon={BarChart3}
          color=""
          style={createBackgroundStyle(tenantConfig?.primaryColor)}
        />
        <StatCard
          title="Occupancy Rate"
          value={`${stats.occupancyRate.toFixed(1)}%`}
          icon={Users}
          color=""
          style={createBackgroundStyle(tenantConfig?.secondaryColor)}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Reservations</h3>
          <div className="space-y-3">
            {reservations.slice(0, 5).map((reservation) => (
              <div key={reservation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{reservation.fullName}</p>
                  <p className="text-sm text-gray-600">{reservation.email}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">${reservation.totalPrice}</p>
                  <p className="text-sm text-gray-600">{reservation.checkInDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Hotel Performance</h3>
          <div className="space-y-3">
            {hotels.slice(0, 5).map((hotel) => (
              <div key={hotel.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{hotel.name}</p>
                  <p className="text-sm text-gray-600">{hotel.city}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">
                    {hotel.availableRooms}/{hotel.totalRooms} rooms
                  </p>
                  <p className="text-sm text-green-600">Available</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const HotelsContent: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Hotels Management</h3>
        <button 
          className="text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          style={createBackgroundStyle(tenantConfig?.primaryColor)}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tenantConfig?.secondaryColor || '#1E40AF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = tenantConfig?.primaryColor || '#3B82F6';
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Hotel
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hotel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rooms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{hotel.name}</div>
                      <div className="text-sm text-gray-500">{hotel.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{hotel.city}</div>
                    <div className="text-gray-500">{hotel.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {hotel.totalRooms || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-white"
                      style={createBackgroundStyle(tenantConfig?.primaryColor)}
                    >
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      className="hover:opacity-80 transition-opacity"
                      style={createColorStyle(tenantConfig?.primaryColor)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const ReservationsContent: React.FC = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Reservations Management</h3>
        <div className="flex space-x-2">
          <button 
            className="border text-white px-4 py-2 rounded-lg flex items-center transition-colors hover:opacity-80"
            style={{
              backgroundColor: tenantConfig?.primaryColor || '#3B82F6',
              borderColor: tenantConfig?.primaryColor || '#3B82F6'
            }}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
          <button 
            className="border text-white px-4 py-2 rounded-lg flex items-center transition-colors hover:opacity-80"
            style={{
              backgroundColor: tenantConfig?.secondaryColor || '#1E40AF',
              borderColor: tenantConfig?.secondaryColor || '#1E40AF'
            }}
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guest</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guests</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.map((reservation) => (
                <tr key={reservation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{reservation.fullName}</div>
                      <div className="text-sm text-gray-500">{reservation.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>{reservation.checkInDate}</div>
                    <div className="text-gray-500">{reservation.checkOutDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {reservation.numberOfGuests}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${reservation.totalPrice}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        reservation.reservationStatus === 'CONFIRMED' 
                          ? 'text-white' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                      style={reservation.reservationStatus === 'CONFIRMED' 
                        ? createBackgroundStyle(tenantConfig?.primaryColor)
                        : {}
                      }
                    >
                      {reservation.reservationStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button 
                      className="hover:opacity-80 transition-opacity"
                      style={createColorStyle(tenantConfig?.primaryColor)}
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button 
                      className="hover:opacity-80 transition-opacity"
                      style={createColorStyle(tenantConfig?.secondaryColor)}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div 
          className="animate-spin rounded-full h-32 w-32 border-b-2"
          style={{
            borderBottomColor: tenantConfig?.primaryColor || '#3B82F6'
          }}
        ></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar />
      <div className="ml-64">
        <Header />
        <main className="p-6">
          {activeTab === 'dashboard' && <DashboardContent />}
          {activeTab === 'hotels' && <HotelsContent />}
          {activeTab === 'reservations' && <ReservationsContent />}
          {activeTab === 'users' && (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Users Management</h3>
              <p className="text-gray-500">User management features coming soon...</p>
            </div>
          )}
          {activeTab === 'tenants' && (
            <div className="text-center py-12">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Tenant Management</h3>
              <p className="text-gray-500 mb-6">Manage hotel brands and configurations</p>
              {onNavigateToTenantManagement && (
                <button
                  onClick={onNavigateToTenantManagement}
                  className="flex items-center mx-auto px-6 py-3 text-white rounded-lg hover:opacity-90 transition-colors"
                  style={createBackgroundStyle(tenantConfig?.primaryColor)}
                >
                  <Building2 className="w-5 h-5 mr-2" />
                  Open Tenant Management
                </button>
              )}
            </div>
          )}
          {activeTab === 'settings' && (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Settings</h3>
              <p className="text-gray-500">Settings panel coming soon...</p>
            </div>
          )}
          {activeTab === 'hotel-info' && (
            <HotelInfoAdmin onClose={() => setActiveTab('dashboard')} />
          )}
        </main>
      </div>
    </div>
  );
};

export default BackOfficeDashboard;
