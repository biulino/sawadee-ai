import React from 'react';
import { useTranslation } from 'react-i18next';
import ActivityRecommendations from './ActivityRecommendations';

const ActivitiesPage: React.FC = () => {
  const { t } = useTranslation();
  
  // Mock user ID for demo - in a real app this would come from authentication
  const userId = 1;
  const hotelId = 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('activities', 'Hotel Activities')}
              </h1>
              <p className="text-gray-600 mt-1">
                {t('activitiesSubtitle', 'Discover personalized activities and experiences')}
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Sawadee Hotel</div>
              <div className="text-xs text-gray-400">Bangkok, Thailand</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <ActivityRecommendations 
          userId={userId}
          hotelId={hotelId}
          className="bg-gray-50"
        />
      </div>

      {/* Additional Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Quick Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">View All Activities</div>
                <div className="text-sm text-gray-600">Browse complete activity catalog</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">My Bookings</div>
                <div className="text-sm text-gray-600">Manage your reservations</div>
              </button>
              <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Group Activities</div>
                <div className="text-sm text-gray-600">Activities for larger groups</div>
              </button>
            </div>
          </div>

          {/* Activity Categories */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Activity Categories</h3>
            <div className="space-y-2">
              {[
                { name: 'Cultural', count: 5, color: 'bg-blue-100 text-blue-700' },
                { name: 'Culinary', count: 3, color: 'bg-orange-100 text-orange-700' },
                { name: 'Wellness', count: 4, color: 'bg-green-100 text-green-700' },
                { name: 'Adventure', count: 2, color: 'bg-red-100 text-red-700' },
                { name: 'Entertainment', count: 3, color: 'bg-purple-100 text-purple-700' }
              ].map(category => (
                <div key={category.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50">
                  <span className="text-gray-700">{category.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                    {category.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Recommendations Info */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">🤖 AI Recommendations</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium text-gray-900">Personalized for you</div>
                <div className="text-gray-600">Based on your preferences and past activities</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Real-time availability</div>
                <div className="text-gray-600">Updated slot information</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Smart matching</div>
                <div className="text-gray-600">Budget and interest considerations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitiesPage;
