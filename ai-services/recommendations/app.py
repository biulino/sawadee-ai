from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.ensemble import RandomForestRegressor
import os
import requests
import logging
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Backend API configuration
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8080')

class RecommendationEngine:
    def __init__(self):
        self.user_preference_model = None
        self.activity_similarity_matrix = None
        self.activities_df = None
        self.vectorizer = None
        self.load_models()
    
    def load_models(self):
        """Load or initialize recommendation models"""
        try:
            # Initialize with sample data - in production, load from database
            self.activities_df = pd.DataFrame({
                'id': [1, 2, 3, 4, 5, 6, 7, 8],
                'name': [
                    'Cappadocia Hot Air Balloon',
                    'Underground City Tour',
                    'Pottery Workshop',
                    'Horseback Riding',
                    'Wine Tasting',
                    'Photography Tour',
                    'Hiking in Rose Valley',
                    'Turkish Cooking Class'
                ],
                'category': ['Adventure', 'Cultural', 'Art', 'Adventure', 'Culinary', 'Cultural', 'Adventure', 'Culinary'],
                'description': [
                    'Experience breathtaking views of Cappadocia from a hot air balloon',
                    'Explore the fascinating underground cities of Cappadocia',
                    'Learn traditional pottery making techniques',
                    'Ride horses through the unique landscape of Cappadocia',
                    'Taste local wines in historic cave cellars',
                    'Capture stunning photos of fairy chimneys and rock formations',
                    'Hike through the beautiful Rose Valley at sunset',
                    'Learn to cook authentic Turkish dishes'
                ],
                'duration': [3, 4, 2, 3, 2, 5, 4, 3],
                'price': [150, 80, 60, 100, 70, 120, 50, 90],
                'rating': [4.8, 4.5, 4.3, 4.6, 4.4, 4.7, 4.5, 4.6]
            })
            
            # Create TF-IDF vectors for content-based filtering
            self.vectorizer = TfidfVectorizer(stop_words='english')
            tfidf_matrix = self.vectorizer.fit_transform(self.activities_df['description'])
            self.activity_similarity_matrix = cosine_similarity(tfidf_matrix)
            
            logger.info("Recommendation models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading models: {e}")
    
    def get_user_preferences(self, user_id, tenant_id):
        """Fetch user preferences from backend"""
        try:
            response = requests.get(
                f"{BACKEND_URL}/api/users/{user_id}/preferences",
                headers={"X-Tenant-ID": tenant_id},
                timeout=5
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch user preferences: {e}")
        return {}
    
    def get_user_history(self, user_id, tenant_id):
        """Fetch user activity history from backend"""
        try:
            response = requests.get(
                f"{BACKEND_URL}/api/users/{user_id}/activity-history",
                headers={"X-Tenant-ID": tenant_id},
                timeout=5
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch user history: {e}")
        return []
    
    def content_based_recommendations(self, preferences, num_recommendations=5):
        """Generate content-based recommendations"""
        try:
            # Filter by preferences
            filtered_activities = self.activities_df.copy()
            
            # Apply preference filters
            if 'categories' in preferences and preferences['categories']:
                filtered_activities = filtered_activities[
                    filtered_activities['category'].isin(preferences['categories'])
                ]
            
            if 'max_price' in preferences:
                filtered_activities = filtered_activities[
                    filtered_activities['price'] <= preferences['max_price']
                ]
            
            if 'min_rating' in preferences:
                filtered_activities = filtered_activities[
                    filtered_activities['rating'] >= preferences['min_rating']
                ]
            
            # Sort by rating and return top recommendations
            recommendations = filtered_activities.nlargest(num_recommendations, 'rating')
            
            return recommendations.to_dict('records')
            
        except Exception as e:
            logger.error(f"Error in content-based recommendations: {e}")
            return []
    
    def collaborative_filtering_recommendations(self, user_history, num_recommendations=5):
        """Generate collaborative filtering recommendations"""
        try:
            # Simple collaborative filtering based on activity history
            # In production, this would use more sophisticated algorithms
            
            if not user_history:
                return self.activities_df.nlargest(num_recommendations, 'rating').to_dict('records')
            
            # Find similar activities based on user history
            user_activity_ids = [activity['id'] for activity in user_history]
            similar_activities = []
            
            for activity_id in user_activity_ids:
                if activity_id <= len(self.activity_similarity_matrix):
                    activity_index = activity_id - 1
                    similarities = self.activity_similarity_matrix[activity_index]
                    similar_indices = np.argsort(similarities)[::-1][1:num_recommendations+1]
                    
                    for idx in similar_indices:
                        if idx < len(self.activities_df):
                            similar_activities.append(self.activities_df.iloc[idx].to_dict())
            
            # Remove duplicates and return unique recommendations
            seen_ids = set()
            unique_recommendations = []
            for activity in similar_activities:
                if activity['id'] not in seen_ids:
                    seen_ids.add(activity['id'])
                    unique_recommendations.append(activity)
                    if len(unique_recommendations) >= num_recommendations:
                        break
            
            return unique_recommendations
            
        except Exception as e:
            logger.error(f"Error in collaborative filtering: {e}")
            return []
    
    def hybrid_recommendations(self, user_id, tenant_id, num_recommendations=5):
        """Generate hybrid recommendations combining multiple approaches"""
        try:
            # Get user data
            preferences = self.get_user_preferences(user_id, tenant_id)
            history = self.get_user_history(user_id, tenant_id)
            
            # Get recommendations from different approaches
            content_recs = self.content_based_recommendations(preferences, num_recommendations)
            collab_recs = self.collaborative_filtering_recommendations(history, num_recommendations)
            
            # Combine and rank recommendations
            all_recommendations = {}
            
            # Add content-based recommendations with higher weight
            for i, rec in enumerate(content_recs):
                score = (len(content_recs) - i) * 0.6  # Higher weight for content-based
                all_recommendations[rec['id']] = {
                    **rec,
                    'score': score,
                    'reason': 'Based on your preferences'
                }
            
            # Add collaborative filtering recommendations
            for i, rec in enumerate(collab_recs):
                rec_id = rec['id']
                score = (len(collab_recs) - i) * 0.4  # Lower weight for collaborative
                if rec_id in all_recommendations:
                    all_recommendations[rec_id]['score'] += score
                    all_recommendations[rec_id]['reason'] = 'Based on preferences and similar users'
                else:
                    all_recommendations[rec_id] = {
                        **rec,
                        'score': score,
                        'reason': 'Popular among similar users'
                    }
            
            # Sort by combined score and return top recommendations
            sorted_recs = sorted(
                all_recommendations.values(),
                key=lambda x: x['score'],
                reverse=True
            )[:num_recommendations]
            
            return sorted_recs
            
        except Exception as e:
            logger.error(f"Error in hybrid recommendations: {e}")
            return self.activities_df.nlargest(num_recommendations, 'rating').to_dict('records')

# Initialize recommendation engine
rec_engine = RecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "ai-recommendations"})

@app.route('/recommendations/user/<int:user_id>', methods=['GET'])
def get_user_recommendations(user_id):
    """Get personalized recommendations for a user"""
    try:
        tenant_id = request.headers.get('X-Tenant-ID', 'default')
        num_recommendations = int(request.args.get('limit', 5))
        
        recommendations = rec_engine.hybrid_recommendations(
            user_id, tenant_id, num_recommendations
        )
        
        return jsonify({
            "recommendations": recommendations,
            "user_id": user_id,
            "tenant_id": tenant_id
        })
        
    except Exception as e:
        logger.error(f"Error getting user recommendations: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/recommendations/popular', methods=['GET'])
def get_popular_recommendations():
    """Get popular activities recommendations"""
    try:
        tenant_id = request.headers.get('X-Tenant-ID', 'default')
        num_recommendations = int(request.args.get('limit', 5))
        
        # Return top-rated activities
        popular = rec_engine.activities_df.nlargest(num_recommendations, 'rating')
        recommendations = popular.to_dict('records')
        
        for rec in recommendations:
            rec['reason'] = 'Popular activity'
            rec['score'] = rec['rating']
        
        return jsonify({
            "recommendations": recommendations,
            "type": "popular",
            "tenant_id": tenant_id
        })
        
    except Exception as e:
        logger.error(f"Error getting popular recommendations: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/recommendations/similar', methods=['POST'])
def get_similar_activities():
    """Get activities similar to a given activity"""
    try:
        data = request.get_json()
        activity_id = data.get('activity_id')
        num_recommendations = data.get('limit', 5)
        
        if not activity_id or activity_id > len(rec_engine.activities_df):
            return jsonify({"error": "Invalid activity ID"}), 400
        
        # Find similar activities
        activity_index = activity_id - 1
        similarities = rec_engine.activity_similarity_matrix[activity_index]
        similar_indices = np.argsort(similarities)[::-1][1:num_recommendations+1]
        
        similar_activities = []
        for idx in similar_indices:
            if idx < len(rec_engine.activities_df):
                activity = rec_engine.activities_df.iloc[idx].to_dict()
                activity['similarity_score'] = similarities[idx]
                activity['reason'] = 'Similar to your selected activity'
                similar_activities.append(activity)
        
        return jsonify({
            "recommendations": similar_activities,
            "base_activity_id": activity_id,
            "type": "similar"
        })
        
    except Exception as e:
        logger.error(f"Error getting similar activities: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)
