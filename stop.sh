#!/bin/bash

# Vidya Setu Stop Script
# Smart India Hackathon 2025 Project

echo "🛑 Stopping Vidya Setu services..."

# Find and kill processes on ports 3000 and 8001
echo "🔍 Finding running processes..."

# Kill Node.js processes on port 3000
PIDS=$(lsof -ti:3000 2>/dev/null || true)
if [ ! -z "$PIDS" ]; then
    echo "📱 Stopping main application (PID: $PIDS)..."
    kill -9 $PIDS 2>/dev/null || true
fi

# Kill Python processes on port 8001
PIDS=$(lsof -ti:8001 2>/dev/null || true)
if [ ! -z "$PIDS" ]; then
    echo "🤖 Stopping AI service (PID: $PIDS)..."
    kill -9 $PIDS 2>/dev/null || true
fi

# Also kill by process name
echo "🔍 Killing by process name..."
pkill -f "uvicorn main:app" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
pkill -f "nodemon" 2>/dev/null || true

echo "✅ All services stopped successfully!"
echo ""
echo "💡 To start services again, run: ./start.sh"