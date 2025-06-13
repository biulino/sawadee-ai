import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, LogOut, Settings, Shield, Building, UserCheck, ChevronDown } from 'lucide-react';

interface UserProfileProps {
  onClose?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { user, logout, isAdmin, isHotelOwner, isCustomer } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    onClose?.();
  };

  const getRoleIcon = () => {
    if (isAdmin) return <Shield className="w-4 h-4 text-purple-600" />;
    if (isHotelOwner) return <Building className="w-4 h-4 text-blue-600" />;
    if (isCustomer) return <UserCheck className="w-4 h-4 text-green-600" />;
    return <User className="w-4 h-4 text-gray-600" />;
  };

  const getRoleLabel = () => {
    if (isAdmin) return 'Administrator';
    if (isHotelOwner) return 'Hotel Owner';
    if (isCustomer) return 'Customer';
    return 'User';
  };

  const getRoleBadgeColor = () => {
    if (isAdmin) return 'bg-purple-100 text-purple-700';
    if (isHotelOwner) return 'bg-blue-100 text-blue-700';
    if (isCustomer) return 'bg-green-100 text-green-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="relative">
      {/* User Profile Button */}
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {user.firstName ? user.firstName[0].toUpperCase() : user.username[0].toUpperCase()}
          </span>
        </div>
        <div className="hidden sm:block text-left">
          <p className="text-sm font-medium text-gray-900">
            {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
          </p>
          <div className="flex items-center space-x-1">
            {getRoleIcon()}
            <span className="text-xs text-gray-500">{getRoleLabel()}</span>
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-500" />
      </button>

      {/* Dropdown Menu */}
      {isDropdownOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsDropdownOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-lg font-medium">
                    {user.firstName ? user.firstName[0].toUpperCase() : user.username[0].toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.username}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="mt-1">
                    <span className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor()}`}>
                      {getRoleIcon()}
                      <span>{getRoleLabel()}</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <div className="mb-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Account Info
                </div>
                <div className="space-y-1 text-sm text-gray-600">
                  <div className="px-3 py-1">
                    <span className="font-medium">User ID:</span> {user.id}
                  </div>
                  <div className="px-3 py-1">
                    <span className="font-medium">Username:</span> {user.username}
                  </div>
                  <div className="px-3 py-1">
                    <span className="font-medium">Roles:</span> {user.roles.join(', ')}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default UserProfile;
