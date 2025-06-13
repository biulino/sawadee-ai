#!/usr/bin/env python3
"""
Activity Recommendation API
Refactored from hotel comparison to activity recommendations within hotels.
This API recommends activities, spa treatments, dining experiences, and local attractions.
"""

import os
import json
import requests
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime, timedelta
from typing import List, Dict, Any
import traceback

app = Flask(__name__)
CORS(app)

# Spring Boot Backend API URL
BACKEND_API_URL = 'http://localhost:8090/api'

class ActivityRecommendationEngine:
    """
    AI-powered activity recommendation engine that suggests:
    - Hotel activities (cooking classes, tours, etc.)
    - Spa treatments
    - Dining experiences
    - Local attractions
    """
    
    def __init__(self):
        self.activity_types = {
            'CULTURAL': ['Temple Tour', 'City Tour', 'Historical Sites'],
            'CULINARY': ['Cooking Class', 'Food Tour', 'Wine Tasting'],
            'WELLNESS': ['Spa Treatment', 'Massage', 'Yoga Class'],
            'ADVENTURE': ['Muay Thai', 'Water Sports', 'Hiking'],
            'ENTERTAINMENT': ['Shows', 'Performances', 'Night Life']
        }
        
        
    def _process_user_data(self, user_data: Dict[str, Any], user_id: int) -> Dict[str, Any]:
        """Process user data from API into preferences format"""
        preferences = {
            'user_id': user_id,
            'email': user_data.get('email', ''),
            'first_name': user_data.get('firstName', ''),
            'last_name': user_data.get('lastName', ''),
            'age_group': 'adult',  # Default
            'interests': [],
            'budget_range': 'medium',
            'activity_count': 0,
            'past_activities': []
        }
        
        # Generate preferences based on user ID for consistent recommendations
        return self._enhance_user_preferences(preferences)
    
    def _enhance_user_preferences(self, preferences: Dict[str, Any]) -> Dict[str, Any]:
        """Enhance user preferences with additional data"""
        user_id = preferences.get('user_id', 1)
        
        # Add age group based on user ID pattern
        if user_id % 10 < 3:
            preferences['age_group'] = 'young'
        elif user_id % 10 < 7:
            preferences['age_group'] = 'adult'
        else:
            preferences['age_group'] = 'senior'
        
        # Ensure interests are set
        if not preferences.get('interests'):
            preferences['interests'] = ['CULTURAL', 'CULINARY']
        
        # Ensure budget range is set
        if not preferences.get('budget_range'):
            preferences['budget_range'] = 'medium'
            
        return preferences
    
    def get_user_preferences(self, user_id: int) -> Dict[str, Any]:
        """Get user preferences from Spring Boot API or mock data"""
        try:
            # Try to get user from Spring Boot API
            response = requests.get(f"{BACKEND_API_URL}/users/{user_id}", timeout=5)
            if response.status_code == 200:
                user_data = response.json()
                return self._process_user_data(user_data, user_id)
        except Exception as e:
            print(f"Error fetching user from API: {e}")
        
        # Fallback to mock preferences
        return self._get_mock_user_preferences(user_id)
    
    def _get_mock_user_preferences(self, user_id: int) -> Dict[str, Any]:
        """Fallback mock user preferences based on user ID patterns"""
        preferences = {
            'user_id': user_id,
            'age_group': 'adult',
            'interests': [],
            'budget_range': 'medium',
            'activity_count': 0,
            'past_activities': []
        }
        
        # Generate preferences based on user ID for consistent recommendations
        if user_id % 5 == 0:
            preferences['interests'] = ['CULTURAL', 'CULINARY']
            preferences['budget_range'] = 'high'
        elif user_id % 5 == 1:
            preferences['interests'] = ['WELLNESS', 'ENTERTAINMENT']
            preferences['budget_range'] = 'medium'
        elif user_id % 5 == 2:
            preferences['interests'] = ['ADVENTURE', 'CULTURAL']
            preferences['budget_range'] = 'low'
        elif user_id % 5 == 3:
            preferences['interests'] = ['CULINARY', 'WELLNESS']
            preferences['budget_range'] = 'high'
        else:
            preferences['interests'] = ['ENTERTAINMENT', 'ADVENTURE']
            preferences['budget_range'] = 'medium'
            
        return preferences
    
    def get_available_activities(self, hotel_id: int) -> List[Dict[str, Any]]:
        """Get available activities from Spring Boot API"""
        try:
            response = requests.get(f"{BACKEND_API_URL}/activities?hotelId={hotel_id}", timeout=10)
            if response.status_code == 200:
                activities = response.json()
                return activities
            else:
                print(f"Error fetching activities: {response.status_code}")
                return []
        except Exception as e:
            print(f"Error fetching activities from API: {e}")
            return []
    
    def classify_activity(self, activity_name: str, description: str) -> str:
        """Classify activity into categories using keyword matching"""
        text = f"{activity_name} {description}".lower()
        
        cultural_keywords = ['temple', 'tour', 'historical', 'culture', 'tradition', 'palace', 'floating market']
        culinary_keywords = ['cooking', 'food', 'taste', 'cuisine', 'chef', 'restaurant']
        wellness_keywords = ['massage', 'spa', 'wellness', 'relax', 'therapy', 'yoga', 'traditional thai massage']
        adventure_keywords = ['muay thai', 'boxing', 'sport', 'adventure', 'exciting', 'match']
        entertainment_keywords = ['show', 'performance', 'entertainment', 'night', 'music']
        
        if any(keyword in text for keyword in wellness_keywords):
            return 'WELLNESS'
        elif any(keyword in text for keyword in culinary_keywords):
            return 'CULINARY'
        elif any(keyword in text for keyword in adventure_keywords):
            return 'ADVENTURE'
        elif any(keyword in text for keyword in cultural_keywords):
            return 'CULTURAL'
        elif any(keyword in text for keyword in entertainment_keywords):
            return 'ENTERTAINMENT'
        else:
            return 'CULTURAL'  # Default category
    
    def calculate_activity_score(self, activity: Dict[str, Any], user_preferences: Dict[str, Any]) -> float:
        """Calculate recommendation score for an activity based on user preferences"""
        score = 0.0
        
        # Classify the activity
        activity_category = self.classify_activity(activity['name'], activity.get('description', ''))
        
        # Interest matching (40% of score)
        if activity_category in user_preferences.get('interests', []):
            score += 0.4
        
        # Budget consideration (25% of score)
        price = float(activity.get('price', 0))
        budget_range = user_preferences.get('budget_range', 'medium')
        
        if budget_range == 'low' and price <= 30:
            score += 0.25
        elif budget_range == 'medium' and 20 <= price <= 60:
            score += 0.25
        elif budget_range == 'high' and price >= 40:
            score += 0.25
        elif price == 0:  # Free activities
            score += 0.15
        
        # Availability (20% of score)
        available_slots = activity.get('availableSlots', 0)  # Fixed camelCase
        capacity = activity.get('capacity', 1)
        availability_ratio = available_slots / capacity if capacity > 0 else 0
        score += 0.2 * availability_ratio
        
        # Popularity/Past activity consideration (15% of score)
        past_activities = user_preferences.get('past_activities', [])
        if activity['name'] not in (past_activities or []):
            score += 0.15  # Bonus for new experiences
        
        return min(score, 1.0)  # Cap at 1.0
    
    def recommend_activities(self, user_id: int, hotel_id: int, top_n: int = 5) -> List[Dict[str, Any]]:
        """Generate personalized activity recommendations"""
        try:
            # Get user preferences
            user_preferences = self.get_user_preferences(user_id)
            
            # Get available activities
            activities = self.get_available_activities(hotel_id)
            
            if not activities:
                return []
            
            # Calculate scores and sort
            recommendations = []
            for activity in activities:
                score = self.calculate_activity_score(activity, user_preferences)
                activity_category = self.classify_activity(activity['name'], activity.get('description', ''))
                
                recommendation = {
                    'activity_id': activity['id'],
                    'name': activity['name'],
                    'description': activity['description'],
                    'price': float(activity['price']) if activity['price'] else 0.0,
                    'capacity': activity['capacity'],
                    'available_slots': activity.get('availableSlots', 0),  # Fixed camelCase to snake_case
                    'start_time': activity.get('startTime', ''),  # Fixed camelCase
                    'end_time': activity.get('endTime', ''),      # Fixed camelCase
                    'category': activity_category,
                    'recommendation_score': round(score, 3),
                    'hotel_id': hotel_id,
                    'hotel_name': activity.get('hotelName', ''),  # Fixed camelCase
                    'match_reasons': self._generate_match_reasons(activity, user_preferences, activity_category, score)
                }
                recommendations.append(recommendation)
            
            # Sort by score and return top N
            recommendations.sort(key=lambda x: x['recommendation_score'], reverse=True)
            return recommendations[:top_n]
            
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            traceback.print_exc()
            return []
    
    def _generate_match_reasons(self, activity: Dict[str, Any], user_preferences: Dict[str, Any], 
                               category: str, score: float) -> List[str]:
        """Generate human-readable reasons for the recommendation"""
        reasons = []
        
        if category in user_preferences.get('interests', []):
            reasons.append(f"Matches your interest in {category.lower()} activities")
        
        price = float(activity.get('price', 0))
        budget_range = user_preferences.get('budget_range', 'medium')
        
        if budget_range == 'low' and price <= 30:
            reasons.append("Fits your budget preferences")
        elif budget_range == 'high' and price >= 40:
            reasons.append("Premium experience matching your preferences")
        elif budget_range == 'medium' and 20 <= price <= 60:
            reasons.append("Good value for money")
        
        available_slots = activity.get('availableSlots', 0)  # Fixed camelCase
        if available_slots > activity.get('capacity', 1) * 0.5:
            reasons.append("Good availability")
        
        if score >= 0.8:
            reasons.append("Highly recommended based on your profile")
        elif score >= 0.6:
            reasons.append("Good match for your preferences")
        
        return reasons

# Initialize the recommendation engine
recommendation_engine = ActivityRecommendationEngine()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "activity-recommendation-api"})

@app.route('/api/recommendations/activities', methods=['POST'])
def get_activity_recommendations():
    """Get personalized activity recommendations"""
    try:
        data = request.json
        
        if not data:
            return jsonify({"error": "Invalid JSON data"}), 400
        
        user_id = data.get("user_id")
        hotel_id = data.get("hotel_id", 1)  # Default to hotel 1
        top_n = data.get("top_n", 5)
        
        if not user_id:
            return jsonify({"error": "user_id is required"}), 400
        
        recommendations = recommendation_engine.recommend_activities(user_id, hotel_id, top_n)
        
        return jsonify({
            "user_id": user_id,
            "hotel_id": hotel_id,
            "recommendations": recommendations,
            "total_count": len(recommendations),
            "recommendation_type": "activities"
        })
        
    except Exception as e:
        print(f"Error in activity recommendations: {e}")
        traceback.print_exc()
        return jsonify({"error": "Internal server error"}), 500

@app.route('/api/activities/categories', methods=['GET'])
def get_activity_categories():
    """Get available activity categories"""
    return jsonify({
        "categories": recommendation_engine.activity_types,
        "description": "Available activity categories for recommendations"
    })

@app.route('/api/activities/hotel/<int:hotel_id>', methods=['GET'])
def get_hotel_activities(hotel_id):
    """Get all activities for a specific hotel"""
    try:
        activities = recommendation_engine.get_available_activities(hotel_id)
        
        # Add category classification to each activity
        for activity in activities:
            activity['category'] = recommendation_engine.classify_activity(
                activity['name'], 
                activity.get('description', '')
            )
        
        return jsonify({
            "hotel_id": hotel_id,
            "activities": activities,
            "total_count": len(activities)
        })
        
    except Exception as e:
        print(f"Error fetching hotel activities: {e}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    print("Starting Activity Recommendation API...")
    print("Available endpoints:")
    print("- POST /api/recommendations/activities - Get personalized activity recommendations")
    print("- GET /api/activities/categories - Get activity categories")
    print("- GET /api/activities/hotel/<hotel_id> - Get activities for a hotel")
    print("- GET /health - Health check")
    
    app.run(host='0.0.0.0', port=5051, debug=True)
