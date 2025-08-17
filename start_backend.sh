#!/bin/bash

echo "Starting Eco CTF Backend Server..."

# Navigate to backend directory
cd /home/ubuntu/ctf_platform/ctf-backend

# Start PHP built-in server
php -S 0.0.0.0:8080 -t . index.php

echo "Backend server stopped."

