#!/bin/bash

# VisionSathi Development Setup Script
# Run this after cloning the repository

set -e

echo "🚀 Setting up VisionSathi development environment..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install Node.js 18+"
    exit 1
fi

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required. Please install Python 3.10+"
    exit 1
fi

echo "✅ Prerequisites checked"

# Setup mobile app
echo ""
echo "📱 Setting up mobile app..."
cd apps/mobile
npm install
echo "✅ Mobile dependencies installed"

# Setup API
echo ""
echo "🐍 Setting up API..."
cd ../api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
echo "✅ API dependencies installed"

# Create placeholder sound files
echo ""
echo "🔊 Creating placeholder assets..."
cd ../mobile/assets/sounds
touch capture.mp3 processing.mp3 success.mp3 error.mp3 listening-start.mp3 listening-end.mp3
echo "✅ Placeholder sounds created"

# Create .env file for API
cd ../../api
if [ ! -f .env ]; then
    echo "MODEL_DEVICE=cpu" > .env
    echo "DEBUG=true" >> .env
    echo "✅ Created .env file"
fi

cd ../../..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start developing:"
echo ""
echo "  Mobile app:"
echo "    cd apps/mobile && npx expo start"
echo ""
echo "  API server:"
echo "    cd apps/api && source venv/bin/activate && uvicorn main:app --reload"
echo ""
echo "Happy coding! 🚀"
