from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import openai
from dotenv import load_dotenv
import requests
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# OpenAI configuration
openai.api_key = os.getenv('OPENAI_API_KEY')

# Backend API configuration
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8080')

class HotelChatbot:
    def __init__(self):
        self.system_prompt = """
        You are SawadeeAI, a helpful AI assistant for a luxury hotel management system.
        You can help guests with:
        - Room reservations and availability
        - Hotel amenities and services
        - Local attractions and recommendations
        - Check-in/check-out procedures
        - Restaurant bookings
        - Special requests and concierge services
        
        Always be professional, friendly, and helpful. If you need specific hotel data,
        you can request it from the hotel management system.
        """
    
    def get_hotel_context(self, tenant_id):
        """Fetch hotel-specific context from the backend"""
        try:
            response = requests.get(
                f"{BACKEND_URL}/api/hotels/info",
                headers={"X-Tenant-ID": tenant_id},
                timeout=5
            )
            if response.status_code == 200:
                return response.json()
        except Exception as e:
            logger.error(f"Failed to fetch hotel context: {e}")
        return None
    
    def generate_response(self, message, tenant_id=None, user_context=None):
        """Generate AI response using OpenAI GPT"""
        try:
            # Get hotel-specific context
            hotel_context = self.get_hotel_context(tenant_id) if tenant_id else None
            
            # Build context for the AI
            context_parts = [self.system_prompt]
            
            if hotel_context:
                context_parts.append(f"Hotel Information: {hotel_context}")
            
            if user_context:
                context_parts.append(f"User Context: {user_context}")
            
            # Create chat completion
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "\n".join(context_parts)},
                    {"role": "user", "content": message}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating AI response: {e}")
            return "I apologize, but I'm having trouble processing your request right now. Please try again later or contact our front desk for immediate assistance."

# Initialize chatbot
chatbot = HotelChatbot()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "ai-chatbot"})

@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.get_json()
        
        if not data or 'message' not in data:
            return jsonify({"error": "Message is required"}), 400
        
        message = data['message']
        tenant_id = data.get('tenant_id')
        user_context = data.get('user_context')
        
        # Generate AI response
        response = chatbot.generate_response(message, tenant_id, user_context)
        
        # Save conversation to backend (optional)
        try:
            requests.post(
                f"{BACKEND_URL}/api/conversations",
                json={
                    "message": message,
                    "response": response,
                    "tenant_id": tenant_id
                },
                timeout=3
            )
        except Exception as e:
            logger.warning(f"Failed to save conversation: {e}")
        
        return jsonify({
            "response": response,
            "timestamp": "2025-06-13T10:00:00Z"
        })
        
    except Exception as e:
        logger.error(f"Chat endpoint error: {e}")
        return jsonify({"error": "Internal server error"}), 500

@app.route('/chat/suggestions', methods=['GET'])
def get_suggestions():
    """Get conversation suggestions"""
    suggestions = [
        "How can I make a reservation?",
        "What amenities do you offer?",
        "What are the check-in and check-out times?",
        "Can you recommend local attractions?",
        "How do I contact room service?",
        "What dining options are available?"
    ]
    
    return jsonify({"suggestions": suggestions})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
