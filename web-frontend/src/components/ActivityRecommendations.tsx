import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Star, Users, DollarSign, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Activity {
  activity_id: number;
  name: string;
  description: string;
  price: number;
  capacity: number;
  available_slots: number;
  start_time: string;
  end_time: string;
  category: string;
  recommendation_score: number;
  hotel_id: number;
  hotel_name: string;
  match_reasons: string[];
}

interface ActivityRecommendationsProps {
  userId: number;
  hotelId?: number;
  className?: string;
}

const ActivityRecommendations: React.FC<ActivityRecommendationsProps> = ({
  userId,
  hotelId = 1,
  className = ""
}) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const AI_SERVICE_URL = 'http://localhost:5051';

  useEffect(() => {
    fetchActivityRecommendations();
  }, [userId, hotelId]);

  const fetchActivityRecommendations = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/recommendations/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          hotel_id: hotelId,
          top_n: 5
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setActivities(data.recommendations || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recommendations');
      console.error('Error fetching activity recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      CULTURAL: 'bg-blue-100 text-blue-700 border-blue-200',
      CULINARY: 'bg-orange-100 text-orange-700 border-orange-200',
      WELLNESS: 'bg-green-100 text-green-700 border-green-200',
      ADVENTURE: 'bg-red-100 text-red-700 border-red-200',
      ENTERTAINMENT: 'bg-purple-100 text-purple-700 border-purple-200'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600';
    if (score >= 0.6) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const formatTime = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    } catch {
      return timeString;
    }
  };

  const formatDate = (timeString: string) => {
    try {
      const date = new Date(timeString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'TBD';
    }
  };

  const filteredActivities = selectedCategory === 'all' 
    ? activities 
    : activities.filter(activity => activity.category === selectedCategory);

  const uniqueCategories = Array.from(new Set(activities.map(a => a.category)));

  if (loading) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-100 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs">!</span>
            </div>
            <span className="text-red-700 font-medium">Failed to load recommendations</span>
          </div>
          <p className="text-red-600 text-sm mt-2">{error}</p>
          <button 
            onClick={fetchActivityRecommendations}
            className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations available</h3>
          <p className="text-gray-600">Try adjusting your preferences or check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">Recommended Activities</h2>
        </div>
        
        {/* Category Filter */}
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          {uniqueCategories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? getCategoryColor(category)
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.charAt(0) + category.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredActivities.map((activity, index) => (
            <motion.div
              key={activity.activity_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Header */}
              <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">
                      {activity.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {activity.description}
                    </p>
                  </div>
                  <div className="ml-3 flex flex-col items-end">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(activity.category)}`}>
                      {activity.category.charAt(0) + activity.category.slice(1).toLowerCase()}
                    </span>
                    <div className={`flex items-center mt-2 ${getScoreColor(activity.recommendation_score)}`}>
                      <Star className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">
                        {(activity.recommendation_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Activity Details */}
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formatDate(activity.start_time)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{formatTime(activity.start_time)}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2 text-gray-400" />
                    <span>{activity.available_slots}/{activity.capacity}</span>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    <span>${activity.price}</span>
                  </div>
                </div>

                {/* Match Reasons */}
                {activity.match_reasons.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Why we recommend this:</h4>
                    <div className="space-y-1">
                      {activity.match_reasons.slice(0, 2).map((reason, idx) => (
                        <div key={idx} className="flex items-center text-xs text-gray-600">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                >
                  Book Activity
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredActivities.length === 0 && selectedCategory !== 'all' && (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">No activities found in this category</div>
          <button
            onClick={() => setSelectedCategory('all')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            View all activities
          </button>
        </div>
      )}
    </div>
  );
};

export default ActivityRecommendations;
