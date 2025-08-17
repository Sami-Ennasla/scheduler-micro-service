#!/bin/bash

echo "🚀 Starting Scheduler Microservice..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️  Creating .env file from template..."
    cp env.example .env
    echo "✅ .env file created. You can modify it if needed."
fi

# Build the application
echo "🔨 Building the application..."
npm run build

# Start the service
echo "🌟 Starting the service in development mode..."
echo "📚 API Documentation will be available at: http://localhost:3000/api"
echo "🏥 Health checks will be available at: http://localhost:3000/health"
echo "⏹️  Press Ctrl+C to stop the service"
echo ""

npm run start:dev
