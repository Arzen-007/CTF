#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app, origins="*")

# Path to the frontend dist
FRONTEND_DIST_PATH = '/home/ubuntu/ctf_platform/frontend/dist'

# Mock data for demo
admin_sessions = {}

@app.route('/api/public_config.php', methods=['GET', 'OPTIONS'])
def public_config():
    if request.method == 'OPTIONS':
        return '', 200
    
    config_data = {
        'platform_name': 'Green Eco CTF',
        'platform_subtitle': 'Hack for a Greener Tomorrow',
        'platform_logo': '/tree-icon.svg',
        'favicon_url': '/favicon.ico',
        'background_image': '/heromap.jpg',
        'background_opacity': '0.2',
        'background_overlay': '0.6',
        'chat_enabled': True,
        'music_enabled': True,
        'environment_globe_enabled': True,
        'platform_theme': 'eco',
        'primary_color': '#00ff88',
        'secondary_color': '#00cc66'
    }
    
    return jsonify({
        'success': True,
        'config': config_data
    })

@app.route('/api/admin_login_simple.php', methods=['POST', 'OPTIONS'])
def admin_login():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()
    username = data.get('username', '')
    password = data.get('password', '')
    
    # Simple demo authentication
    if username == 'admin' and password == 'admin123':
        session_id = 'admin_session_123'
        admin_sessions[session_id] = True
        
        return jsonify({
            'success': True,
            'message': 'Admin login successful',
            'session_id': session_id
        })
    else:
        return jsonify({
            'success': False,
            'message': 'Invalid credentials'
        }), 401

@app.route('/api/admin_auth_simple.php', methods=['POST', 'OPTIONS'])
def admin_auth():
    if request.method == 'OPTIONS':
        return '', 200
    
    data = request.get_json()
    action = data.get('action', '')
    
    if action == 'check_session':
        # For demo, always return authenticated
        return jsonify({
            'success': True,
            'authenticated': True,
            'admin': True
        })
    
    return jsonify({
        'success': False,
        'authenticated': False
    })

@app.route('/api/admin_challenges_simple.php', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def admin_challenges():
    if request.method == 'OPTIONS':
        return '', 200
    
    # Mock challenges data
    mock_challenges = [
        {
            'id': 1,
            'title': 'Web Security Basics',
            'description': 'Learn the fundamentals of web security',
            'category_id': 1,
            'category_name': 'Web Security',
            'challenge_type': 'static',
            'points': 100,
            'difficulty': 'easy',
            'enabled': True,
            'visible': True,
            'solve_count': 25,
            'solve_rate': 75.5,
            'flag': 'eco{web_security_basics_2024}',
            'created_at': '2024-01-15 10:00:00',
            'updated_at': '2024-01-15 10:00:00'
        },
        {
            'id': 2,
            'title': 'Crypto Challenge',
            'description': 'Decrypt the hidden message',
            'category_id': 2,
            'category_name': 'Cryptography',
            'challenge_type': 'static',
            'points': 200,
            'difficulty': 'medium',
            'enabled': True,
            'visible': True,
            'solve_count': 15,
            'solve_rate': 45.2,
            'flag': 'eco{crypto_master_2024}',
            'created_at': '2024-01-16 14:30:00',
            'updated_at': '2024-01-16 14:30:00'
        },
        {
            'id': 3,
            'title': 'Forensics Investigation',
            'description': 'Analyze the evidence and find the flag',
            'category_id': 3,
            'category_name': 'Forensics',
            'challenge_type': 'file',
            'points': 300,
            'difficulty': 'hard',
            'enabled': False,
            'visible': False,
            'solve_count': 5,
            'solve_rate': 15.8,
            'flag': 'eco{forensics_detective_2024}',
            'created_at': '2024-01-17 09:15:00',
            'updated_at': '2024-01-17 09:15:00'
        },
        {
            'id': 4,
            'title': 'Reverse Engineering',
            'description': 'Reverse engineer the binary to find the flag',
            'category_id': 4,
            'category_name': 'Reverse Engineering',
            'challenge_type': 'file',
            'points': 400,
            'difficulty': 'expert',
            'enabled': True,
            'visible': True,
            'solve_count': 3,
            'solve_rate': 9.1,
            'flag': 'eco{reverse_engineer_pro_2024}',
            'created_at': '2024-01-18 16:45:00',
            'updated_at': '2024-01-18 16:45:00'
        },
        {
            'id': 5,
            'title': 'Web Exploitation',
            'description': 'Find and exploit the vulnerability',
            'category_id': 1,
            'category_name': 'Web Security',
            'challenge_type': 'web',
            'points': 250,
            'difficulty': 'medium',
            'enabled': True,
            'visible': True,
            'solve_count': 12,
            'solve_rate': 36.4,
            'flag': 'eco{web_exploit_master_2024}',
            'target_url': 'https://challenge.example.com',
            'created_at': '2024-01-19 11:20:00',
            'updated_at': '2024-01-19 11:20:00'
        }
    ]
    
    if request.method == 'GET':
        return jsonify({
            'success': True,
            'challenges': mock_challenges,
            'total': len(mock_challenges)
        })
    else:
        return jsonify({
            'success': True,
            'message': 'Operation completed successfully'
        })

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    """Serve frontend files"""
    if path == '':
        path = 'index.html'
    
    try:
        return send_from_directory(FRONTEND_DIST_PATH, path)
    except:
        # For SPA routing, return index.html for non-existent files
        return send_from_directory(FRONTEND_DIST_PATH, 'index.html')

@app.route('/health')
def health_check():
    return jsonify({'status': 'healthy', 'service': 'eco-ctf-platform'})

if __name__ == '__main__':
    print("🌱 Starting Eco CTF Platform...")
    print("🚀 Server running on http://0.0.0.0:5000")
    app.run(host='0.0.0.0', port=5000, debug=False)

