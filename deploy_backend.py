#!/usr/bin/env python3
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import subprocess
import os
import tempfile

app = Flask(__name__)
CORS(app, origins="*")

# Path to the PHP backend
PHP_BACKEND_PATH = '/home/ubuntu/ctf_platform/ctf-backend'
FRONTEND_DIST_PATH = '/home/ubuntu/ctf_platform/frontend/dist'

@app.route('/api/<path:endpoint>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def proxy_to_php(endpoint):
    """Proxy API requests to PHP backend"""
    if request.method == 'OPTIONS':
        return '', 200
    
    # Create a temporary file for PHP input
    php_script = f"""<?php
// Set request method and input
$_SERVER['REQUEST_METHOD'] = '{request.method}';
$_SERVER['REQUEST_URI'] = '/api/{endpoint}';

// Set headers
"""
    
    # Add headers
    for key, value in request.headers:
        if key.lower() not in ['host', 'content-length']:
            php_script += f"$_SERVER['HTTP_{key.upper().replace('-', '_')}'] = '{value}';\n"
    
    # Add request data for POST/PUT
    if request.method in ['POST', 'PUT'] and request.data:
        php_script += f"""
// Set input data
file_put_contents('php://input', '{request.data.decode('utf-8').replace("'", "\\'")}');
"""
    
    # Include the main index.php
    php_script += f"""
// Change to backend directory
chdir('{PHP_BACKEND_PATH}');

// Include the main backend file
include '{PHP_BACKEND_PATH}/index.php';
?>"""
    
    try:
        # Execute PHP script
        result = subprocess.run(
            ['php', '-f', '-'],
            input=php_script,
            capture_output=True,
            text=True,
            cwd=PHP_BACKEND_PATH
        )
        
        if result.returncode == 0:
            # Try to parse as JSON to set proper content type
            try:
                import json
                json.loads(result.stdout)
                response = app.response_class(
                    response=result.stdout,
                    status=200,
                    mimetype='application/json'
                )
            except:
                response = app.response_class(
                    response=result.stdout,
                    status=200,
                    mimetype='text/plain'
                )
        else:
            response = jsonify({'error': 'Backend error', 'details': result.stderr}), 500
            
        return response
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

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

