#!/usr/bin/env python3
"""
AI Agent Flask Server
Provides API endpoints for AI agent functionality
"""

from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import logging
import os
import sys

# Add the multi_tool_agent directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'multi_tool_agent'))

try:
    from multi_tool_agent.agent import root_agent
    from multi_tool_agent.functions import (
        select_city, list_hotels, set_price_range, select_hotel,
        select_room, determine_dates, complete_reservation,
        get_hotel_info, get_hotel_amenities, get_hotel_policies
    )
    AGENT_AVAILABLE = True
except ImportError as e:
    print(f"Warning: Could not import AI agent: {e}")
    AGENT_AVAILABLE = False

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint for monitoring"""
    status = {
        'status': 'healthy',
        'service': 'AI Agent',
        'port': 5050,
        'agent_available': AGENT_AVAILABLE
    }
    return jsonify(status), 200

# Chat endpoint
@app.route('/chat', methods=['POST'])
def chat():
    """Main chat endpoint for AI agent interactions"""
    try:
        if not AGENT_AVAILABLE:
            return jsonify({
                'error': 'AI Agent not available',
                'message': 'Agent dependencies not loaded'
            }), 503
            
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Message is required'}), 400
            
        user_message = data['message']
        session_id = data.get('session_id', 'default')
        
        logger.info(f"Received chat message: {user_message}")
        
        # Use the AI agent to process the message
        response = root_agent.run(user_message)
        
        return jsonify({
            'response': response.messages[-1].content if response.messages else "No response",
            'session_id': session_id,
            'status': 'success'
        })
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

# Hotel information endpoint
@app.route('/hotel-info', methods=['GET'])
def hotel_info():
    """Get hotel information"""
    try:
        if not AGENT_AVAILABLE:
            return jsonify({
                'error': 'AI Agent not available'
            }), 503
            
        tenant_key = request.headers.get('X-Tenant-Key', 'default')
        hotel_id = request.args.get('hotel_id')
        
        result = get_hotel_info(hotel_id=hotel_id, tenant_key=tenant_key)
        
        if result.get('status') == 'success':
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Hotel info error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

# Hotel amenities endpoint
@app.route('/hotel-amenities', methods=['GET'])
def hotel_amenities():
    """Get hotel amenities"""
    try:
        if not AGENT_AVAILABLE:
            return jsonify({
                'error': 'AI Agent not available'
            }), 503
            
        tenant_key = request.headers.get('X-Tenant-Key', 'default')
        
        result = get_hotel_amenities(tenant_key=tenant_key)
        
        if result.get('status') == 'success':
            return jsonify(result)
        else:
            return jsonify(result), 400
            
    except Exception as e:
        logger.error(f"Hotel amenities error: {str(e)}")
        return jsonify({
            'error': 'Internal server error',
            'message': str(e)
        }), 500

# Root endpoint
@app.route('/', methods=['GET'])
def index():
    """Root endpoint with service information"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>SawadeeAI Agent Service</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            .header { color: #333; }
            .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
            .healthy { background-color: #d4edda; color: #155724; }
            .unhealthy { background-color: #f8d7da; color: #721c24; }
        </style>
    </head>
    <body>
        <h1 class="header">🤖 SawadeeAI Agent Service</h1>
        <p>AI Agent API Server running on port 5050</p>
        
        <div class="status {{ 'healthy' if agent_available else 'unhealthy' }}">
            Agent Status: {{ 'Available' if agent_available else 'Not Available' }}
        </div>
        
        <h3>Available Endpoints:</h3>
        <ul>
            <li><strong>GET /health</strong> - Health check</li>
            <li><strong>POST /chat</strong> - Chat with AI agent</li>
            <li><strong>GET /hotel-info</strong> - Get hotel information</li>
            <li><strong>GET /hotel-amenities</strong> - Get hotel amenities</li>
        </ul>
        
        <h3>Usage Example:</h3>
        <pre>
curl -X POST http://localhost:5050/chat \\
  -H "Content-Type: application/json" \\
  -d '{"message": "I want to book a hotel in Nevşehir"}'
        </pre>
    </body>
    </html>
    """
    
    return render_template_string(html, agent_available=AGENT_AVAILABLE)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5050))
    host = os.environ.get('HOST', '0.0.0.0')
    debug = os.environ.get('DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting AI Agent server on {host}:{port}")
    logger.info(f"Agent available: {AGENT_AVAILABLE}")
    
    app.run(host=host, port=port, debug=debug)
