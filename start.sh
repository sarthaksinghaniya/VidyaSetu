#!/bin/bash

# Vidya Setu Startup Script
# Smart India Hackathon 2025 Project

set -e

echo "🚀 Starting Vidya Setu - AI Internship Recommendation Engine"
echo "=========================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.11+ first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   Run: mongod --fork --logpath /var/log/mongodb.log"
    read -p "Press Enter to continue anyway (or Ctrl+C to exit)..."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
fi

# Install AI service dependencies if they don't exist
if [ ! -d "ai-service/venv" ]; then
    echo "🐍 Setting up Python virtual environment..."
    cd ai-service
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    cd ..
fi

# Copy environment file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating environment file..."
    cp .env.example .env.local
    echo "⚠️  Please edit .env.local with your configuration before running the application."
fi

# Initialize database
echo "🗄️  Setting up database..."
npm run db:push

# Start services
echo "🌟 Starting services..."

# Start AI service in background
echo "🤖 Starting AI Service..."
cd ai-service
if [ -d "venv" ]; then
    source venv/bin/activate
fi
uvicorn main:app --reload --host 0.0.0.0 --port 8001 &
AI_PID=$!
cd ..

# Wait a moment for AI service to start
sleep 3

# Start main application
echo "🎯 Starting main application..."
npm run dev &
APP_PID=$!

echo ""
echo "✅ All services started successfully!"
echo ""
echo "📱 Application URLs:"
echo "   Frontend:    http://localhost:3000"
echo "   AI Service:  http://localhost:8001"
echo "   API Docs:    http://localhost:8001/docs"
echo ""
echo "🛑 To stop all services, press Ctrl+C or run: ./stop.sh"
echo ""

# Wait for user interrupt
trap 'echo ""; echo "🛑 Stopping services..."; kill $AI_PID $APP_PID 2>/dev/null; exit 0' INT

# Keep script running
wait